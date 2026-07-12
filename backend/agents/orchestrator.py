import os
import json
import logging
from typing import Dict, List, Any, Optional
import google.generativeai as genai

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("StadiumMindAgents")

# Initialize models if API key is present
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("StadiumMind Agent System initialized with real API Key.")
else:
    logger.warning("No GEMINI_API_KEY found. Running in high-fidelity Simulated Agent Mode.")

class BaseAgent:
    def __init__(self, name: str, responsibility: str):
        self.name = name
        self.responsibility = responsibility

    async def execute(self, state: Dict[str, Any], query: str) -> Dict[str, Any]:
        """Executes agent logic based on the state and query."""
        raise NotImplementedError("Agents must implement the execute method")

class CrowdAgent(BaseAgent):
    def __init__(self):
        super().__init__("CrowdAgent", "Monitors crowd density, gate ingress/egress rates, and concourse bottlenecks.")

    async def execute(self, state: Dict[str, Any], query: str) -> Dict[str, Any]:
        crowd_telemetry = state.get("crowd", {})
        gates = crowd_telemetry.get("gates", {})
        
        # Analyze gate congestion
        alert_gates = []
        for gate_name, gate_data in gates.items():
            if gate_data.get("load_percentage", 0) > 85:
                alert_gates.append(gate_name)
        
        analysis = f"Crowd Agent Analysis: Gates are overall at {crowd_telemetry.get('average_load', 50)}% capacity. "
        if alert_gates:
            analysis += f"CRITICAL: Gates {', '.join(alert_gates)} are experiencing heavy congestion (>85%). Ingress throttling is advised."
        else:
            analysis += "All gate ingress velocities are within normal limits."
            
        return {
            "agent": self.name,
            "status": "success",
            "findings": analysis,
            "metrics": {
                "alert_gates": alert_gates,
                "concourse_density": crowd_telemetry.get("concourse_density", "Normal")
            }
        }

class NavigationAgent(BaseAgent):
    def __init__(self):
        super().__init__("NavigationAgent", "Computes seat paths, gate coordinates, and handles image-based visual guidance.")

    async def execute(self, state: Dict[str, Any], query: str) -> Dict[str, Any]:
        is_wheelchair = state.get("accessibility_profile", {}).get("requires_wheelchair", False)
        
        # Simulating map node mapping
        path = ["Perimeter Ingress", "Gate 3 Entrance", "Concourse Section 100", "Elevator Corridor B" if is_wheelchair else "Stairs 4B", "Row 14, Seat 5"]
        
        return {
            "agent": self.name,
            "status": "success",
            "findings": f"Navigation Route mapped. Path elements: {' -> '.join(path)}. Accessibility Routing: {'ENABLED (Step-free)' if is_wheelchair else 'Standard'}.",
            "route_steps": path
        }

class EmergencyAgent(BaseAgent):
    def __init__(self):
        super().__init__("EmergencyAgent", "Dispatches medical/security units, maps emergency escape lanes, and creates multilingual alerts.")

    async def execute(self, state: Dict[str, Any], query: str) -> Dict[str, Any]:
        incident_type = state.get("incident_context", {}).get("category", "general")
        severity = state.get("incident_context", {}).get("severity", "LOW")
        
        # Determine responders based on location
        location = state.get("incident_context", {}).get("location", {"lat": 40.813, "lng": -74.074})
        
        action_plan = f"EMERGENCY PLAN [{severity} - {incident_type.upper()}]: "
        if severity in ["HIGH", "CRITICAL"]:
            action_plan += f"Deploying closest responder Team (First-Aid Unit 3 & Security Sector 2). Rerouting crowd away from coordinates {location.get('lat')}, {location.get('lng')}."
        else:
            action_plan += "Log incident in tracker. Monitor nearby volunteer feeds."
            
        return {
            "agent": self.name,
            "status": "success",
            "findings": action_plan,
            "responder_unit": "Medical Squad 4" if incident_type == "medical" else "Security Squad 2",
            "evacuation_routes_active": severity in ["HIGH", "CRITICAL"]
        }

class SustainabilityAgent(BaseAgent):
    def __init__(self):
        super().__init__("SustainabilityAgent", "Controls Building Management (HVAC/Lights) and trash fill levels to save carbon.")

    async def execute(self, state: Dict[str, Any], query: str) -> Dict[str, Any]:
        sustainability_telemetry = state.get("sustainability", {})
        bins = sustainability_telemetry.get("bins", [])
        
        full_bins = [b["id"] for b in bins if b.get("fill_percentage", 0) > 80]
        
        analysis = f"Sustainability Agent: Energy saving matches target at {sustainability_telemetry.get('energy_saved_kw', 120)} kW. "
        if full_bins:
            analysis += f"Action required: Waste bins {', '.join(full_bins)} have exceeded 80% capacity. Volunteer dispatch scheduled for collection."
        else:
            analysis += "Waste collection levels are within nominal parameters."
            
        return {
            "agent": self.name,
            "status": "success",
            "findings": analysis,
            "carbon_offset_kg": sustainability_telemetry.get("carbon_saved_kg", 450),
            "actions_triggered": ["bin_collection_dispatch"] if full_bins else []
        }

class OperationsAgent(BaseAgent):
    def __init__(self):
        super().__init__("OperationsAgent", "Orchestrates volunteer staffing, shifts, and concession logistics.")

    async def execute(self, state: Dict[str, Any], query: str) -> Dict[str, Any]:
        volunteers = state.get("volunteers", [])
        active_tasks = state.get("active_tasks", [])
        
        available_vols = [v for v in volunteers if v.get("status") == "available"]
        
        analysis = f"Operations Agent: {len(available_vols)} volunteers available out of {len(volunteers)} total. Concession logistics are running smoothly."
        
        return {
            "agent": self.name,
            "status": "success",
            "findings": analysis,
            "available_staff_count": len(available_vols)
        }

class AccessibilityAgent(BaseAgent):
    def __init__(self):
        super().__init__("AccessibilityAgent", "Provides translation support, auditory alerts, and wheelchair accommodations.")

    async def execute(self, state: Dict[str, Any], query: str) -> Dict[str, Any]:
        lang = state.get("language", "en")
        needs_wheelchair = state.get("accessibility_profile", {}).get("requires_wheelchair", False)
        
        analysis = f"Accessibility Agent: Translating interface prompts to code '{lang}'. "
        if needs_wheelchair:
            analysis += "Ensuring all suggested routes utilize elevators and ramps. Triggering elevator check sensors."
        else:
            analysis += "Standard routing profile applied."
            
        return {
            "agent": self.name,
            "status": "success",
            "findings": analysis,
            "wheelchair_routing_forced": needs_wheelchair
        }

class TransportAgent(BaseAgent):
    def __init__(self):
        super().__init__("TransportAgent", "Monitors parking spaces, shuttle services, and public train flows.")

    async def execute(self, state: Dict[str, Any], query: str) -> Dict[str, Any]:
        transport_telemetry = state.get("transport", {})
        parking = transport_telemetry.get("parking", {})
        
        analysis = f"Transport Agent: Parking is at {parking.get('occupancy_percentage', 60)}% occupancy. "
        shuttles = transport_telemetry.get("shuttles", [])
        delayed_shuttles = [s["id"] for s in shuttles if s.get("status") == "delayed"]
        
        if delayed_shuttles:
            analysis += f"Alert: Shuttles {', '.join(delayed_shuttles)} are currently delayed. Adjusting transport queues at gate terminal."
        else:
            analysis += "Shuttle loops are running on schedule."
            
        return {
            "agent": self.name,
            "status": "success",
            "findings": analysis,
            "parking_full": parking.get("occupancy_percentage", 60) > 90
        }

class StadiumMindAgentSystem:
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {
            "crowd": CrowdAgent(),
            "navigation": NavigationAgent(),
            "emergency": EmergencyAgent(),
            "sustainability": SustainabilityAgent(),
            "operations": OperationsAgent(),
            "accessibility": AccessibilityAgent(),
            "transport": TransportAgent()
        }

    async def run_collaboration(self, query: str, state: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the collaborative multi-agent simulation workflow."""
        results = {}
        
        # 1. Routing decision: which agents need to react?
        # A true LLM will dynamically select, but we can do a smart semantic check or ask Gemini
        activated_agents = []
        q_lower = query.lower()
        
        if "emergency" in q_lower or "medical" in q_lower or "fire" in q_lower or "security" in q_lower or "panic" in q_lower or "lost" in q_lower:
            activated_agents = ["emergency", "crowd", "operations", "accessibility"]
        elif "navigate" in q_lower or "seat" in q_lower or "walk" in q_lower or "where" in q_lower or "map" in q_lower:
            activated_agents = ["navigation", "accessibility", "crowd"]
        elif "sustain" in q_lower or "waste" in q_lower or "carbon" in q_lower or "recycle" in q_lower:
            activated_agents = ["sustainability", "operations"]
        elif "parking" in q_lower or "shuttle" in q_lower or "train" in q_lower or "transit" in q_lower:
            activated_agents = ["transport", "crowd"]
        else:
            # General operational query - trigger all standard operations
            activated_agents = ["crowd", "operations", "sustainability", "transport"]

        # Run activated agents
        agent_outputs = []
        for agent_key in activated_agents:
            agent = self.agents[agent_key]
            res = await agent.execute(state, query)
            agent_outputs.append(res)
            
        # 2. Consolidate results using Gemini (if available) or our high-fidelity compiler
        summary = ""
        if GEMINI_API_KEY:
            try:
                # Call Gemini to synthesize agent findings
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = f"""
                You are the StadiumMind AI Orchestrator.
                Consolidate the findings from our specialized agents into a unified, actionable response for stadium management or fans.
                
                USER QUERY: {query}
                
                AGENT FINDINGS:
                {json.dumps(agent_outputs, indent=2)}
                
                Provide a structured, clean briefing. Keep it concise, professional, and focus heavily on safety and efficiency.
                """
                response = model.generate_content(prompt)
                summary = response.text.strip()
            except Exception as e:
                logger.error(f"Gemini translation error: {e}. Falling back to rule engine compiler.")
                summary = self._rule_based_consolidation(query, agent_outputs)
        else:
            summary = self._rule_based_consolidation(query, agent_outputs)

        return {
            "query": query,
            "agent_responses": agent_outputs,
            "consolidated_summary": summary,
            "health_score_delta": -10 if "emergency" in activated_agents else 0
        }

    def _rule_based_consolidation(self, query: str, agent_outputs: List[Dict[str, Any]]) -> str:
        """Fallback natural-language compiler to summarize agent outputs."""
        lines = ["**StadiumMind AI Operating System - Swarm Report**\n"]
        for out in agent_outputs:
            lines.append(f"- **{out['agent']}**: {out['findings']}")
        lines.append("\n*Action Plan: Automatic routing parameters set. Volunteers dispatched accordingly.*")
        return "\n".join(lines)
