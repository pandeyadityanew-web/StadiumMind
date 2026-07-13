import unittest
import sys
import os

# Adjust path to import backend modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from database.telemetry_db import LiveTelemetryDB
from agents.orchestrator import StadiumMindAgentSystem

class TestStadiumMindBackend(unittest.TestCase):
    def setUp(self):
        self.db = LiveTelemetryDB()

    def test_database_initialization(self):
        self.assertEqual(len(self.db.volunteers), 25)
        self.assertEqual(len(self.db.medical_teams), 5)
        self.assertEqual(len(self.db.security_teams), 8)
        self.assertEqual(len(self.db.incidents), 0)

    def test_state_generation(self):
        state = self.db.get_state()
        self.assertIn("health_score", state)
        self.assertIn("risk_score", state)
        self.assertIn("crowd", state)
        self.assertIn("sustainability", state)
        self.assertIn("transport", state)
        self.assertGreater(state["health_score"], 50)
        self.assertLess(state["risk_score"], 100)

    def test_incident_simulation(self):
        initial_state = self.db.get_state()
        
        # Inject incident
        self.db.incidents.append({
            "id": "INC_TEST_001",
            "category": "security",
            "description": "Test override drill active.",
            "location": "Sector 4 Corridor C",
            "severity": "CRITICAL"
        })
        
        new_state = self.db.get_state()
        self.assertLess(new_state["health_score"], initial_state["health_score"])
        self.assertGreater(new_state["risk_score"], initial_state["risk_score"])

if __name__ == "__main__":
    unittest.main()
