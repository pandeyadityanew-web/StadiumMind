# StadiumMind AI: The GenAI Operating System for FIFA World Cup 2026

StadiumMind AI is an advanced, production-quality Multi-Agent Operating System designed to optimize stadium operations, volunteer tasks, medical/security dispatches, and fan navigation at the FIFA World Cup 2026.

---

## ⚡ Zero-Configuration Quick Start (FastAPI Serving Mode)
Because local machines might not have Node.js/npm installed by default, the FastAPI backend comes pre-configured with a **served high-fidelity fallback UI** directly at port `8000`. You can launch and test all features instantly using only Python!

### Step 1: Install Python Dependencies
Ensure Python 3.11+ is installed. Navigate to the `backend` folder and install requirements:
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Set Environment Variables (Optional)
To use the live Gemini LLM agent analysis, create a `.env` file or export your key:
*   On Windows (PowerShell):
    ```powershell
    $env:GEMINI_API_KEY="your_actual_key_here"
    ```
*   On Linux/macOS:
    ```bash
    export GEMINI_API_KEY="your_actual_key_here"
    ```
*(If no API key is specified, StadiumMind AI falls back to its built-in high-fidelity rule-based Agent Compiler so you can run the entire demo offline or keyless).*

### Step 3: Run the Backend Server
Start the Uvicorn FastAPI server:
```bash
python main.py
```
Open your browser and navigate to:
👉 **[http://localhost:8000/](http://localhost:8000/)**

The system will connect over local WebSockets, feed telemetry updates every 5 seconds, and support all screens:
*   **Landing Page & Features**
*   **Command Center Panel:** Live alerts, Health score gauge, dynamic wait time graphs.
*   **Fan Copilot Chat:** With language routing, accessibility wheelchair pathing, and visual OCR image matching mock.
*   **Live Digital Twin Map:** Pulse-animating dots mapping volunteer GPS coordinates, medical crews, and security teams.
*   **Emergency Dispatch System:** Real-time action plan generation, dispatch paths, and public broadcast drafts.
*   **Scenario Simulator (WOW Feature):** Input "What if Gate 5 closes due to a power outage?" to trigger Monte Carlo forecast consequences.

---

## 🚀 Running the Production Next.js App (Requires Node.js)
If you have Node.js and npm installed, you can launch the React/Next.js frontend independently:

1.  Make sure the FastAPI backend is running at `http://localhost:8000`.
2.  Navigate to the `frontend` folder:
    ```bash
    cd ../frontend
    npm install --legacy-peer-deps
    npm run dev
    ```
3.  Navigate to:
    👉 **[http://localhost:3000/](http://localhost:3000/)**

---

## 🐳 Docker Container Orchestration
To deploy the entire stack using Docker:
```bash
docker-compose up --build
```
*   FastAPI Backend URL: `http://localhost:8000`
*   Next.js Frontend URL: `http://localhost:3000`

---

## 📁 Repository Directory Architecture
```text
stadiummind-ai/
├── docker-compose.yml       # Docker compose multi-service orchestration
├── README.md                # Installation and walkthrough guide
├── .env.example             # Template for API keys
│
├── backend/                 # FastAPI Python backend engine
│   ├── Dockerfile
│   ├── main.py              # Main router & WebSocket broadcaster
│   ├── requirements.txt     # Python libraries list
│   ├── agents/              # Multi-Agent LangGraph-like swarm
│   │   └── orchestrator.js
│   ├── database/            # Telemetry state database mock
│   │   └── telemetry_db.py
│   └── static/              # Served high-fidelity dashboard (HTML/AlpineJS)
│       └── index.html
│
└── frontend/                # Production Next.js React frontend
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.js
    └── src/
        └── app/
            ├── globals.css
            ├── layout.tsx   # Fonts & metadata wrapper
            ├── page.tsx     # Modern Landing Page
            └── dashboard/
                └── page.tsx # Full React Telemetry dashboard
```
