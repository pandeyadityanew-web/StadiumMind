import unittest
import sys
import os
import asyncio

# Adjust path to import backend modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from agents.orchestrator import CrowdAgent, NavigationAgent, EmergencyAgent, StadiumMindAgentSystem

class TestStadiumMindAgents(unittest.TestCase):
    def setUp(self):
        self.orchestrator = StadiumMindAgentSystem()
        self.state = {
            "crowd": {
                "average_load": 72,
                "gates": {
                    "Gate A (North)": {"load_percentage": 70},
                    "Gate B (East)": {"load_percentage": 92} # Alert load (>85)
                }
            },
            "accessibility_profile": {
                "requires_wheelchair": True
            },
            "incident_context": {
                "category": "medical",
                "severity": "CRITICAL",
                "location": {"lat": 40.813, "lng": -74.074}
            }
        }

    def test_crowd_agent_logic(self):
        agent = CrowdAgent()
        # Run async execute using new loop or asyncio run
        loop = asyncio.new_event_loop()
        res = loop.run_until_complete(agent.execute(self.state, "Show gate loads"))
        loop.close()
        
        self.assertEqual(res["agent"], "CrowdAgent")
        self.assertEqual(res["status"], "success")
        self.assertIn("Gate B (East)", res["findings"])
        self.assertIn("Gate B (East)", res["metrics"]["alert_gates"])

    def test_navigation_agent_wheelchair_logic(self):
        agent = NavigationAgent()
        loop = asyncio.new_event_loop()
        res = loop.run_until_complete(agent.execute(self.state, "Find route to Section 112"))
        loop.close()
        
        self.assertEqual(res["agent"], "NavigationAgent")
        self.assertIn("Elevator Corridor B", res["route_steps"])
        self.assertIn("ENABLED (Step-free)", res["findings"])

    def test_orchestrator_routing_logic(self):
        loop = asyncio.new_event_loop()
        res = loop.run_until_complete(self.orchestrator.run_collaboration("medical emergency in sector 4", self.state))
        loop.close()
        
        self.assertEqual(res["query"], "medical emergency in sector 4")
        self.assertTrue(len(res["agent_responses"]) > 0)
        self.assertIn("StadiumMind AI Operating System", res["consolidated_summary"])

if __name__ == "__main__":
    unittest.main()
