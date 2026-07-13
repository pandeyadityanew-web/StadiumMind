import os
import json
import asyncio
import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Import database and agent system
from database.telemetry_db import db
from agents.orchestrator import StadiumMindAgentSystem

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("StadiumMindBackend")

app = FastAPI(
    title="StadiumMind API",
    description="The AI Operating System API for Stadium Operations",
    version="1.0.0"
)

# Enable CORS for Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agent system
agent_system = StadiumMindAgentSystem()

def sanitize_input(text: str, max_length: int = 500) -> str:
    if not text:
        return ""
    text = text.strip()
    if len(text) > max_length:
        text = text[:max_length]
    # Prevent XSS and code injection
    return text.replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&#x27;")

# Schemas
class CopilotRequest(BaseModel):
    query: str
    image_data: Optional[str] = None # Base64 image upload fallback
    language: Optional[str] = "en"
    accessibility_profile: Optional[Dict[str, Any]] = None

class SimulationRequest(BaseModel):
    scenario: str

class EmergencyTrigger(BaseModel):
    category: str
    description: str
    location_label: str
    severity: str

class VisionRequest(BaseModel):
    camera_id: str
    image_base64: Optional[str] = None

# Active WebSocket connections tracker
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")

manager = ConnectionManager()

# Background task to stream live telemetry updates every 5 seconds
async def broadcast_telemetry_loop():
    logger.info("Starting background telemetry loop...")
    while True:
        try:
            state = db.get_state()
            await manager.broadcast(json.dumps(state))
        except Exception as e:
            logger.error(f"Error in telemetry loop: {e}")
        await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    # Start telemetry loop in background
    asyncio.create_task(broadcast_telemetry_loop())

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "service": "StadiumMind AI Core"}

@app.get("/api/v1/telemetry")
def get_telemetry():
    return db.get_state()

@app.post("/api/v1/copilot")
async def run_copilot(req: CopilotRequest):
    state = db.get_state()
    state["language"] = sanitize_input(req.language, 10)
    if req.accessibility_profile:
        state["accessibility_profile"] = req.accessibility_profile
        
    query = sanitize_input(req.query, 1000)
    
    # Check if there is an image ("Where am I?" OCR request)
    if req.image_data:
        query = f"[Multimodal OCR Photo Request]: Based on photo metadata, user is near Section 112, entrance sign. Context query: {query}"
        
    res = await agent_system.run_collaboration(query, state)
    return res

@app.post("/api/v1/simulator")
async def run_simulator(req: SimulationRequest):
    state = db.get_state()
    sanitized_scenario = sanitize_input(req.scenario, 1000)
    query = f"SIMULATION CHECK: {sanitized_scenario}"
    
    # Run the collaborative multi-agent simulation
    res = await agent_system.run_collaboration(query, state)
    
    # Process simulation delta changes
    simulated_consequences = []
    q_lower = sanitized_scenario.lower()
    
    if "gate 5" in q_lower or "gate b" in q_lower:
        simulated_consequences = [
            "Concourse East crowd density rises to CRITICAL (96%).",
            "Wait times at remaining Gates increase by an average of 14 minutes.",
            "Gate 4 queues spill into outer security boundaries."
        ]
    elif "rain" in q_lower or "storm" in q_lower:
        simulated_consequences = [
            "Inner concourses experience immediate 40% surge in density.",
            "Restroom cleaning schedules accelerated to 10-minute intervals.",
            "Shuttle services operate at 50% velocity due to visibility constraints."
        ]
    elif "10,000" in q_lower or "15,000" in q_lower or "crowd arrive" in q_lower:
        simulated_consequences = [
            "Transit arrival queues peak, causing ingress gates to hit maximum capacity.",
            "Volunteers require immediate redeployment to ticketing checking booths."
        ]
    else:
        simulated_consequences = [
            "Minor flow deviations observed in outer sectors.",
            "Local queue timings fluctuate within 3-minute bounds."
        ]

    return {
        "scenario": req.scenario,
        "stadium_health_impact_delta": res.get("health_score_delta", -10),
        "consequences": simulated_consequences,
        "response_actions": res.get("consolidated_summary", "Deploy reserve volunteers."),
        "risk_level": "HIGH" if "gate" in q_lower or "rain" in q_lower else "MEDIUM"
    }

@app.post("/api/v1/emergency/trigger")
def trigger_emergency(req: EmergencyTrigger):
    import uuid
    incident_id = f"INC_{uuid.uuid4().hex[:6].upper()}"
    
    cat = sanitize_input(req.category, 50)
    desc = sanitize_input(req.description, 300)
    loc = sanitize_input(req.location_label, 100)
    sev = sanitize_input(req.severity, 30)
    
    incident = {
        "id": incident_id,
        "category": cat,
        "description": desc,
        "location": loc,
        "severity": sev,
        "timestamp": int(asyncio.get_event_loop().time())
    }
    db.add_incident(incident)
    
    # Dispatch route planning mock
    routes = ["Medical Suite A", "Elevator B Corridor", "Section 112 Ingress Route"]
    
    return {
        "status": "dispatched",
        "incident_id": incident_id,
        "dispatch_route": routes,
        "recommended_responders": ["Volunteer V_012", "Emergency Unit M_03"],
        "announcement_draft": f"Attention fans near {loc}. Please keep clear for responder personnel. Thank you."
    }

@app.post("/api/v1/emergency/resolve/{incident_id}")
def resolve_emergency(incident_id: str):
    sanitized_id = sanitize_input(incident_id, 50)
    db.resolve_incident(sanitized_id)
    return {"status": "resolved", "incident_id": sanitized_id}

@app.post("/api/v1/vision/queue-detection")
def run_vision_queue(req: VisionRequest):
    # Simulated OpenCV/YOLO queue length analyzer
    detected_count = int(12 + (asyncio.get_event_loop().time() % 15))
    wait_time = int(detected_count * 0.5) # 30s per person
    
    return {
        "camera_id": req.camera_id,
        "people_detected": detected_count,
        "estimated_wait_time_seconds": wait_time * 60,
        "status": "normal" if wait_time < 10 else "congested"
    }

@app.post("/api/v1/reports/generate")
def generate_reports():
    state = db.get_state()
    
    # Generate reports mock markdown
    reports = {
        "crowd_report": f"**Ingress rates:** Normal. Peak load at Gate B. Average wait: 12 minutes.",
        "volunteer_report": f"**Volunteers Active:** {len(state['volunteers'])}. Efficiency score: 94%.",
        "security_report": f"**Active incidents:** {len(state['incidents'])}. Security sectors on active standby.",
        "sustainability_report": f"**Total Carbon Saved:** {state['sustainability']['carbon_saved_kg']} kg CO2. Smart bins at average 55% fill level.",
        "organizer_report": f"**Stadium Health Score:** {state['health_score']}%. Operations are running efficiently."
    }
    
    return reports

# WebSocket Endpoint for streaming telemetry
@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial state on connection
        initial_state = db.get_state()
        await websocket.send_text(json.dumps(initial_state))
        while True:
            # Keep connection alive (heartbeat)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Mount static files (this serves our single-page static UI for offline/local run)
static_path = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_path):
    app.mount("/", StaticFiles(directory=static_path, html=True), name="static")
else:
    logger.warning(f"Static files directory not found at {static_path}. Serve Next.js from frontend folder instead.")

if __name__ == "__main__":
    import uvicorn
    # Allow running directly via python main.py
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
