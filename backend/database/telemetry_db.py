import random
import time
from typing import Dict, Any, List

class LiveTelemetryDB:
    def __init__(self):
        # Base coordinates centered on MetLife Stadium, NJ
        self.center_lat = 40.8135
        self.center_lng = -74.0743
        self.volunteers = self._generate_volunteers(25)
        self.medical_teams = self._generate_medical(5)
        self.security_teams = self._generate_security(8)
        self.incidents = []
        self.concessions = [
            {"id": "CON_01", "name": "Taco Corner", "queue_time_mins": 8, "stock_level": 75},
            {"id": "CON_02", "name": "Classic Burgers", "queue_time_mins": 14, "stock_level": 90},
            {"id": "CON_03", "name": "MatchDay Brews", "queue_time_mins": 3, "stock_level": 50},
            {"id": "CON_04", "name": "Veggie Express", "queue_time_mins": 6, "stock_level": 82}
        ]
        
    def _generate_volunteers(self, count: int) -> List[Dict[str, Any]]:
        vols = []
        statuses = ["available", "busy", "on_break"]
        languages = [["en", "es"], ["en"], ["en", "fr"], ["en", "de", "es"], ["en", "pt"]]
        for i in range(count):
            vols.append({
                "id": f"VOL_{i:03d}",
                "name": f"Volunteer {i}",
                "lat": self.center_lat + random.uniform(-0.005, 0.005),
                "lng": self.center_lng + random.uniform(-0.005, 0.005),
                "status": random.choice(statuses),
                "languages": random.choice(languages),
                "battery": random.randint(30, 100)
            })
        return vols

    def _generate_medical(self, count: int) -> List[Dict[str, Any]]:
        meds = []
        for i in range(count):
            meds.append({
                "id": f"MED_{i:03d}",
                "name": f"Medical Squad {i}",
                "lat": self.center_lat + random.uniform(-0.004, 0.004),
                "lng": self.center_lng + random.uniform(-0.004, 0.004),
                "status": "standby"
            })
        return meds

    def _generate_security(self, count: int) -> List[Dict[str, Any]]:
        sec = []
        for i in range(count):
            sec.append({
                "id": f"SEC_{i:03d}",
                "name": f"Security Sector {i}",
                "lat": self.center_lat + random.uniform(-0.004, 0.004),
                "lng": self.center_lng + random.uniform(-0.004, 0.004),
                "status": "patrolling"
            })
        return sec

    def get_state(self) -> Dict[str, Any]:
        # Mutate coordinates slightly to simulate movement
        for vol in self.volunteers:
            if vol["status"] != "on_break":
                vol["lat"] += random.uniform(-0.0001, 0.0001)
                vol["lng"] += random.uniform(-0.0001, 0.0001)
                
        # Random fluctuations in queues
        for con in self.concessions:
            con["queue_time_mins"] = max(1, con["queue_time_mins"] + random.choice([-1, 0, 1]))
            con["stock_level"] = max(10, con["stock_level"] - random.choice([0, 1]))

        # Dynamic loads
        gate_loads = {
            "Gate A (North)": {"load_percentage": random.randint(65, 80), "wait_time_mins": random.randint(5, 12)},
            "Gate B (East)": {"load_percentage": random.randint(80, 95), "wait_time_mins": random.randint(12, 22)},
            "Gate C (South)": {"load_percentage": random.randint(40, 60), "wait_time_mins": random.randint(3, 8)},
            "Gate D (West)": {"load_percentage": random.randint(55, 75), "wait_time_mins": random.randint(6, 15)}
        }
        
        avg_load = int(sum(g["load_percentage"] for g in gate_loads.values()) / 4)
        
        # Calculate health & risk scores
        health_score = 98 - (1 if avg_load > 80 else 0) - (2 * len(self.incidents))
        risk_score = 5 + (2 if avg_load > 80 else 0) + (10 * len(self.incidents))
        
        # Sustainability stats
        sustainability = {
            "carbon_saved_kg": 450 + int(time.time() / 100) % 500,
            "food_waste_saved_kg": 280 + int(time.time() / 150) % 300,
            "energy_saved_kw": 1240 + int(time.time() / 200) % 600,
            "water_saved_liters": 8500 + int(time.time() / 50) % 2000,
            "bins": [
                {"id": "BIN_01", "fill_percentage": random.randint(30, 85)},
                {"id": "BIN_02", "fill_percentage": random.randint(40, 90)},
                {"id": "BIN_03", "fill_percentage": random.randint(10, 50)}
            ]
        }

        # Transport stats
        transport = {
            "parking": {
                "total_spaces": 15000,
                "occupied_spaces": 11200 + random.randint(-100, 100),
                "occupancy_percentage": random.randint(70, 85)
            },
            "shuttles": [
                {"id": "SHUTTLE_01", "status": "active", "passengers": 45},
                {"id": "SHUTTLE_02", "status": "active", "passengers": 38},
                {"id": "SHUTTLE_03", "status": "delayed", "passengers": 52}
            ],
            "train_arrivals_mins": [4, 14, 24]
        }

        return {
            "health_score": max(50, health_score),
            "risk_score": min(95, risk_score),
            "crowd": {
                "average_load": avg_load,
                "concourse_density": "Moderate" if avg_load < 80 else "Dense",
                "gates": gate_loads
            },
            "concessions": self.concessions,
            "volunteers": self.volunteers,
            "medical_teams": self.medical_teams,
            "security_teams": self.security_teams,
            "sustainability": sustainability,
            "transport": transport,
            "incidents": self.incidents
        }

    def add_incident(self, incident: Dict[str, Any]):
        self.incidents.append(incident)
        
    def resolve_incident(self, incident_id: str):
        self.incidents = [i for i in self.incidents if i.get("id") != incident_id]

# Singleton instance
db = LiveTelemetryDB()
