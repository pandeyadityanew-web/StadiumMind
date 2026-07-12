export interface EmergencyResponse {
  incidentId: string;
  category: string;
  severity: string;
  etaSeconds: number;
  responsePlan: string;
  responders: string[];
  recommendations: string[];
  timeline: string[];
  announcementDraft: string;
}

export const getEmergencyMockData = (category: string): Promise<EmergencyResponse> => {
  const id = `INC_${Math.floor(100000 + Math.random() * 900000)}`;
  
  const mockDatabase: Record<string, Partial<EmergencyResponse>> = {
    medical: {
      severity: "CRITICAL",
      etaSeconds: 120,
      responsePlan: "Deploying First-Aid Unit 3 and Security Sector 2 immediately. Clearing evacuation lanes along Section 112 corridors for emergency stretcher access.",
      responders: ["Medical Squad M-03 (Sector B)", "Volunteer V-114 (Section 112 Aisle)"],
      recommendations: ["Clear Aisle 112 immediately for stretcher teams", "Keep nearby fans seated to prevent stampede dynamics"],
      timeline: ["12:01:05 - Panic alert triggered from Section 112", "12:01:15 - AI routing engine calculated fastest stepless responder route", "12:01:30 - Medical Unit M-03 dispatched with ETA of 2 minutes"],
      announcementDraft: "Attention fans near Section 112. Please clear egress aisle B for responder personnel access. We appreciate your cooperation."
    },
    fire: {
      severity: "HIGH",
      etaSeconds: 180,
      responsePlan: "Triggering automatic fire suppression checks in Sector 2. Routing on-site volunteer crew with fire extinguishers to investigate containment zone.",
      responders: ["Fire Marshal Sector 2", "Volunteer Team V-08 (Outer Concourse)"],
      recommendations: ["Prepare Section 202 local evacuation gates", "Bypass main elevator corridor to avoid ventilation drafts"],
      timeline: ["12:02:10 - Fire alarm trigger registered in Sector 2 corridor", "12:02:20 - Operations center dispatched Fire Marshal on-duty"],
      announcementDraft: "Emergency personnel are investigating an alert in concourse sector 2. Please remain calm and wait for further instructions."
    },
    lost_child: {
      severity: "MEDIUM",
      etaSeconds: 90,
      responsePlan: "Initiating missing person search protocol. Broadcasting description to all on-duty volunteer terminals near Gate D checkpoints.",
      responders: ["Gate D Supervisor", "Volunteer Security Unit S-09"],
      recommendations: ["Lock down checkout turnstiles at Gate D temporarily", "Check nearby restroom facility and family suites"],
      timeline: ["12:03:00 - Lost child report filed by parent at Gate D booth", "12:03:10 - Child description broadcast to all security personnel terminals"],
      announcementDraft: "Stadium services are looking for a lost child. If you have any information, please report to the nearest volunteer checkpoint."
    },
    security: {
      severity: "HIGH",
      etaSeconds: 150,
      responsePlan: "Deploying Security Response Sector 4. Setting camera target OCR tracking on identified sector grid map to verify perimeter parameters.",
      responders: ["Security Unit S-12 (North Sector)", "Volunteer Team V-25 (Corridor 4)"],
      recommendations: ["Enforce localized bag scan checks at main corridors", "Isolate suspicious package zone using barrier tapes"],
      timeline: ["12:04:15 - Suspicious activity ticket created by Sector 4 operator", "12:04:30 - Security response team S-12 dispatched to coordinates"],
      announcementDraft: "Security teams are performing routine checks near Gate A. Please proceed to your seats as directed."
    }
  };

  const defaultDetails = {
    incidentId: id,
    category: category,
    severity: "MEDIUM",
    etaSeconds: 300,
    responsePlan: "AI Routing dispatch initiated. Deploying closest available volunteer units to verify situation details.",
    responders: ["Volunteer Unit V-01"],
    recommendations: ["Monitor local security camera feeds", "Hold standby teams"],
    timeline: ["12:05:00 - General operational alert logged in terminal"],
    announcementDraft: "Stadium operations are checking an alert. Please proceed normally."
  };

  const data = { ...defaultDetails, ...mockDatabase[category.toLowerCase()] } as EmergencyResponse;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 400); // Realistic slight delay
  });
};
