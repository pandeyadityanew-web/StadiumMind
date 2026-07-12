# StadiumMind

## Overview

StadiumMind is an intelligent stadium operations platform designed to improve decision-making for venue operators, security personnel, volunteers, medical teams, and visitors. The platform combines real-time operational data with AI-powered insights to support crowd management, emergency response, navigation, accessibility, and resource optimization.

The project demonstrates how artificial intelligence can enhance operational efficiency while improving the overall stadium experience.

---

## Features

- Real-time operations dashboard
- AI-powered operational insights
- Digital Twin visualization
- Predictive crowd monitoring
- Emergency response coordination
- Fan navigation assistance
- Accessibility support
- Scenario simulation and decision support
- Operational reporting
- Responsive user interface for desktop and mobile devices

---

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend

- FastAPI
- Python

### AI

- Gemini API (optional)
- Multi-Agent orchestration
- Rule-based fallback engine

### Infrastructure

- Docker
- WebSockets

---

## Project Structure

```text
StadiumMind/
│
├── backend/
│   ├── agents/
│   ├── database/
│   ├── static/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/pandeyadityanew-web/StadiumMind.git
cd StadiumMind
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend

Open a new terminal.

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the `backend` directory if AI-powered responses are required.

```env
GEMINI_API_KEY=your_api_key_here
```

If no API key is provided, the application runs using its built-in demo logic.

---

## Running with Docker

```bash
docker-compose up --build
```

---

## How It Works

StadiumMind continuously processes operational information and presents actionable recommendations through a unified dashboard.

The platform includes modules for:

- Crowd monitoring
- Emergency coordination
- Fan assistance
- Accessibility
- Predictive analytics
- Scenario simulation
- Operational reporting

Each module contributes to a single operational view, allowing users to make informed decisions in real time.

---

## Assumptions

- Operational telemetry is simulated for demonstration purposes.
- AI responses use mock data when external services are unavailable.
- Indoor mapping and crowd information represent a demonstration environment.
- Emergency workflows are designed for simulation purposes.

---

## Future Enhancements

- Integration with IoT sensors
- Live CCTV analytics
- Indoor positioning systems
- Public transportation integration
- Advanced predictive analytics
- Native mobile application
- Cloud deployment

---

## License

This project was developed for educational and hackathon purposes.
