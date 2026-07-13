"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Home, 
  BarChart2, 
  MessageSquare, 
  Map, 
  AlertTriangle, 
  FileText, 
  Play, 
  Settings, 
  ShieldAlert, 
  Activity, 
  Users, 
  Camera, 
  Volume2, 
  Sparkles,
  Zap,
  Droplet,
  Trash2,
  Lock,
  Globe,
  Plus,
  Bell,
  Navigation,
  Clock,
  Flame,
  UserCheck,
  Megaphone,
  CheckCircle,
  HelpCircle,
  Eye,
  VolumeX,
  Volume1,
  Cpu,
  LogOut,
  Info,
  Search,
  Accessibility
} from "lucide-react";

import { getEmergencyMockData, EmergencyResponse } from "@/services/emergencyMock";


// Telemetry types
interface GateData {
  load_percentage: number;
  wait_time_mins: number;
}
interface ConcessionData {
  id: string;
  name: string;
  queue_time_mins: number;
  stock_level: number;
}
interface VolunteerData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
  languages: string[];
  battery: number;
}
interface TeamData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
}
interface IncidentData {
  id: string;
  category: string;
  description: string;
  location: string;
  severity: string;
  timestamp: number;
}
interface TelemetryState {
  health_score: number;
  risk_score: number;
  crowd: {
    average_load: number;
    concourse_density: string;
    gates: Record<string, GateData>;
  };
  concessions: ConcessionData[];
  volunteers: VolunteerData[];
  medical_teams: TeamData[];
  security_teams: TeamData[];
  sustainability: {
    carbon_saved_kg: number;
    food_waste_saved_kg: number;
    energy_saved_kw: number;
    water_saved_liters: number;
    bins: { id: string; fill_percentage: number }[];
  };
  transport: {
    parking: {
      total_spaces: number;
      occupied_spaces: number;
      occupancy_percentage: number;
    };
    shuttles: { id: string; status: string; passengers: number }[];
    train_arrivals_mins: number[];
  };
  incidents: IncidentData[];
}

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<string>("landing");
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    health_score: 95,
    risk_score: 12,
    crowd: { 
      average_load: 65, 
      concourse_density: "Moderate", 
      gates: {
        "Gate A (North)": { load_percentage: 70, wait_time_mins: 8 },
        "Gate B (East)": { load_percentage: 85, wait_time_mins: 14 },
        "Gate C (South)": { load_percentage: 45, wait_time_mins: 4 },
        "Gate D (West)": { load_percentage: 60, wait_time_mins: 6 }
      } 
    },
    concessions: [
      { id: "CON_01", name: "Taco Corner", queue_time_mins: 8, stock_level: 75 },
      { id: "CON_02", name: "Classic Burgers", queue_time_mins: 14, stock_level: 90 },
      { id: "CON_03", name: "MatchDay Brews", queue_time_mins: 3, stock_level: 50 },
      { id: "CON_04", name: "Veggie Express", queue_time_mins: 6, stock_level: 82 }
    ],
    volunteers: [
      { id: "VOL_001", name: "Alex J.", lat: 40.8135 + 0.001, lng: -74.0743 - 0.002, status: "available", languages: ["en", "es"], battery: 94 },
      { id: "VOL_002", name: "Maria L.", lat: 40.8135 - 0.002, lng: -74.0743 + 0.001, status: "busy", languages: ["en", "fr"], battery: 85 },
      { id: "VOL_003", name: "David K.", lat: 40.8135 + 0.003, lng: -74.0743 - 0.001, status: "available", languages: ["en"], battery: 72 },
      { id: "VOL_004", name: "Sarah H.", lat: 40.8135 - 0.001, lng: -74.0743 - 0.003, status: "available", languages: ["en", "de"], battery: 99 },
      { id: "VOL_005", name: "John M.", lat: 40.8135 + 0.002, lng: -74.0743 + 0.002, status: "on_break", languages: ["en", "es"], battery: 60 }
    ],
    medical_teams: [
      { id: "MED_001", name: "Medical Unit Alpha", lat: 40.8135 + 0.002, lng: -74.0743 - 0.003, status: "standby" },
      { id: "MED_002", name: "Medical Unit Beta", lat: 40.8135 - 0.003, lng: -74.0743 + 0.002, status: "busy" }
    ],
    security_teams: [
      { id: "SEC_001", name: "Security Patrol 1", lat: 40.8135 - 0.001, lng: -74.0743 + 0.003, status: "patrolling" },
      { id: "SEC_002", name: "Security Patrol 2", lat: 40.8135 + 0.003, lng: -74.0743 - 0.002, status: "patrolling" },
      { id: "SEC_003", name: "Security Patrol 3", lat: 40.8135 - 0.002, lng: -74.0743 - 0.001, status: "standby" }
    ],
    sustainability: { 
      carbon_saved_kg: 840, 
      food_waste_saved_kg: 320, 
      energy_saved_kw: 1450, 
      water_saved_liters: 9400, 
      bins: [
        { id: "BIN_01", fill_percentage: 65 },
        { id: "BIN_02", fill_percentage: 82 },
        { id: "BIN_03", fill_percentage: 40 }
      ] 
    },
    transport: { 
      parking: { occupied_spaces: 11420, total_spaces: 15000, occupancy_percentage: 76 }, 
      shuttles: [
        { id: "SHUTTLE_01", status: "active", passengers: 42 },
        { id: "SHUTTLE_02", status: "active", passengers: 35 },
        { id: "SHUTTLE_03", status: "delayed", passengers: 50 }
      ], 
      train_arrivals_mins: [5, 15, 25] 
    },
    incidents: []
  });

  // Client settings
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16);
  const [screenReader, setScreenReader] = useState<boolean>(false);

  // Copilot Chat
  const [userMessage, setUserMessage] = useState<string>("Where is Section 112?");
  const [fanLanguage, setFanLanguage] = useState<string>("en");
  const [fanAccessibility, setFanAccessibility] = useState<boolean>(false);
  const [chatLogs, setChatLogs] = useState<{ id: number; sender: string; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [agentLoaderSteps, setAgentLoaderSteps] = useState([
    { name: "Initializing Core Orchestrator...", done: false },
    { name: "Retrieving Crowd density load...", done: false },
    { name: "Querying Navigation routing nodes...", done: false },
    { name: "Compiling structured map route...", done: false }
  ]);
  const chatFeedRef = useRef<HTMLDivElement>(null);

  // Digital Twin filters & paths
  const [twinFilters, setTwinFilters] = useState({
    volunteers: true,
    medical: true,
    security: true,
    incidents: true
  });
  const [selectedTwinElement, setSelectedTwinElement] = useState<any>(null);
  const [activeMapRoute, setActiveMapRoute] = useState<boolean>(false);
  const [totalAttendeeScans, setTotalAttendeeScans] = useState<number>(62410);

  // Simulator
  const [simQuery, setSimQuery] = useState<string>("");
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simResult, setSimResult] = useState<any>(null);

  // Notification Toaster
  const [notifications, setNotifications] = useState<{ id: number; title: string; message: string; type: string }[]>([]);
  const [activeEmergencyDetail, setActiveEmergencyDetail] = useState<EmergencyResponse | null>(null);
  const [lastCopilotResult, setLastCopilotResult] = useState<any>(null);

  // Dropdown / panel states
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  
  interface SystemNotification {
    id: number;
    title: string;
    message: string;
    type: "info" | "warning" | "danger" | "success";
    time: string;
    read: boolean;
  }

  const [panelNotifications, setPanelNotifications] = useState<SystemNotification[]>([
    { id: 1, title: "Gate B Ingress Spike", message: "Concourse traffic bottleneck detected at Gate B East.", type: "warning", time: "2 mins ago", read: false },
    { id: 2, title: "Medical dispatch", message: "First aid responders deployed to Section 112.", type: "danger", time: "5 mins ago", read: false },
    { id: 3, title: "Transit Queue clearance", message: "Queue wait times reduced near North Food Court.", type: "success", time: "10 mins ago", read: true },
    { id: 4, title: "Parking Lot C capacity", message: "Parking Lot C spaces occupancy at 96%.", type: "warning", time: "15 mins ago", read: true },
    { id: 5, title: "Shuttle bus update", message: "Shuttle Route 4 is reporting minor 5m delays.", type: "info", time: "25 mins ago", read: true }
  ]);

  // Click outside and Esc key listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#profile-container")) {
        setProfileOpen(false);
      }
      if (!target.closest("#notifications-container")) {
        setNotificationsOpen(false);
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
        setMobileNavOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Briefing Summary text
  const [liveBriefingText, setLiveBriefingText] = useState<string>("Stadium Operating System online. Ingress checkpoints reporting nominal wait lines.");

  // WebSocket initialization
  useEffect(() => {
    const wsUrl = `ws://localhost:8000/ws/telemetry`;
    let socket: WebSocket;

    function connect() {
      socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        setWsConnected(true);
        addNotification("System Link established", "Secure WebSocket connection to StadiumMind OS Core compiled.", "info");
      };
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setTelemetry(data);
        generateBriefing(data);
      };
      socket.onclose = () => {
        setWsConnected(false);
        setTimeout(connect, 5000);
      };
    }
    
    connect();
    return () => socket?.close();
  }, []);

  // Telemetry Mock simulator interval (Updates every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalAttendeeScans(prev => prev + Math.floor(Math.random() * 5));
      
      setTelemetry(prev => {
        // Drift volunteers slightly to create moving markers on Digital Twin
        const driftedVols = prev.volunteers.map(v => ({
          ...v,
          lat: v.lat + (Math.random() - 0.5) * 0.00015,
          lng: v.lng + (Math.random() - 0.5) * 0.00015
        }));
        const driftedMeds = prev.medical_teams.map(m => ({
          ...m,
          lat: m.lat + (Math.random() - 0.5) * 0.0001,
          lng: m.lng + (Math.random() - 0.5) * 0.0001
        }));
        const driftedSec = prev.security_teams.map(s => ({
          ...s,
          lat: s.lat + (Math.random() - 0.5) * 0.0001,
          lng: s.lng + (Math.random() - 0.5) * 0.0001
        }));

        // Adjust gate loads slightly
        const updatedGates = { ...prev.crowd.gates };
        Object.keys(updatedGates).forEach(name => {
          const deltaLoad = Math.floor(Math.random() * 5) - 2;
          updatedGates[name].load_percentage = Math.max(30, Math.min(99, updatedGates[name].load_percentage + deltaLoad));
          updatedGates[name].wait_time_mins = Math.max(2, Math.min(30, Math.round(updatedGates[name].load_percentage * 0.15)));
        });

        // Concessions queue drift
        const updatedCons = prev.concessions.map(c => ({
          ...c,
          queue_time_mins: Math.max(1, Math.min(30, c.queue_time_mins + (Math.random() > 0.5 ? 1 : -1)))
        }));

        // Health score drift
        const healthChange = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newHealth = Math.max(80, Math.min(100, prev.health_score + healthChange));

        // Sustainability accumulators
        const sustain = {
          ...prev.sustainability,
          carbon_saved_kg: prev.sustainability.carbon_saved_kg + 1,
          energy_saved_kw: prev.sustainability.energy_saved_kw + 2,
          water_saved_liters: prev.sustainability.water_saved_liters + 5
        };

        // Parking spots drift
        const pOccupied = Math.max(10000, Math.min(14500, prev.transport.parking.occupied_spaces + Math.floor(Math.random() * 20) - 10));
        const pPct = Math.round((pOccupied / prev.transport.parking.total_spaces) * 100);

        return {
          ...prev,
          health_score: newHealth,
          crowd: {
            ...prev.crowd,
            gates: updatedGates
          },
          concessions: updatedCons,
          volunteers: driftedVols,
          medical_teams: driftedMeds,
          security_teams: driftedSec,
          sustainability: sustain,
          transport: {
            ...prev.transport,
            parking: {
              ...prev.transport.parking,
              occupied_spaces: pOccupied,
              occupancy_percentage: pPct
            }
          }
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Background Particles canvas setup
  useEffect(() => {
    const canvas = document.getElementById("particles-canvas-next") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let particles: any[] = [];
    const count = 40;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
    
    let animationId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Scroll chat feed
  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [chatLogs, chatLoading]);

  // Briefing compiler
  const generateBriefing = (state: TelemetryState) => {
    const incs = state.incidents.length;
    if (incs > 0) {
      setLiveBriefingText(`CRITICAL: ${incs} active emergency dispatches logged. Emergency Agent has computed evacuation paths. Volunteer dispatches visible on Digital Twin.`);
    } else {
      setLiveBriefingText(`Stadium Health is stable at ${state.health_score}%. Concourse concessions wait times: Burger line is 12m, Taco line is 8m. Smart bins reporting 45% occupancy levels.`);
    }
  };

  // Notification toaster utility
  const addNotification = (title: string, message: string, type = "info") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, message, type }]);
    
    if (screenReader && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`${title}. ${message}`);
      window.speechSynthesis.speak(utterance);
    }
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Preset queries connected triggers
  const triggerPresetCopilotQuery = async (query: string) => {
    if (query === "OCR_where_am_i") {
      await runAgentChatLoadingSequence("OCR visual sign parsing...");
      setLastCopilotResult({
        navigation: "Identified Gate 3 Entrance Concourse adjacent to escalator.",
        eta: "5 mins to seat",
        crowdLevel: "Moderate",
        suggestedRoute: ["Gate 3 Escalator B", "Level 2 Concourse Area", "Sector 4 Corridor", "Section 112A Ingress"],
        food: "Taco Corner nearby is reporting a low wait queue (under 6m).",
        accessibility: "Elevator access is fully active at Aisle B.",
        warnings: ["Section 112 ingress queue is building up."],
        sources: "Vision OCR Sign Recognition + Operations Database"
      });
      setActiveMapRoute(true);
      addNotification("Navigation Sync", "Route map overlay synchronized to Digital Twin.", "info");
      return;
    }

    setUserMessage(query);
    await sendChatMessage(query);
  };

  // Chat Submission handler
  const sendChatMessage = async (presetQuery?: string) => {
    const queryToSubmit = presetQuery || userMessage;
    if (!queryToSubmit.trim()) return;
    setUserMessage("");
    await runAgentChatLoadingSequence();

    const isFood = queryToSubmit.toLowerCase().includes("food") || queryToSubmit.toLowerCase().includes("concession") || queryToSubmit.toLowerCase().includes("line");
    const isWheelchair = queryToSubmit.toLowerCase().includes("wheelchair") || queryToSubmit.toLowerCase().includes("accessibility");
    
    // Set structured mock copilot card output
    setLastCopilotResult({
      navigation: isWheelchair 
        ? "Access route set via Elevator B directly to Section 112 Disabled Seating Corridor."
        : "Standard seat route via Escalator 4 East to Section 112, Row 14, Seat 5.",
      eta: isWheelchair ? "6 mins" : "4 mins",
      crowdLevel: "Moderate",
      suggestedRoute: isWheelchair 
        ? ["Gate 3 South Entrance", "Elevator B Lobby", "Level 2 Concourse West", "Disabled Aisle access"]
        : ["Gate 3 Entrance", "Escalator 4 East", "Concourse Section 100", "Row 14, Seat 5"],
      food: isFood 
        ? "🍔 Concession Recommendation: Taco Corner (queue: 6m wait, stock: 82% capacity)."
        : "MatchDay Brews and Classic Burgers are the closest options with low wait times.",
      accessibility: isWheelchair 
        ? "♿ Step-free wheelchair pathing is forced. Elevator B is designated active path."
        : "Standard stairs routing enabled. Ramps available at all gate entry corridors.",
      warnings: ["Lounges near Sec 100 concourse are highly crowded. Maintain safe movement paths."],
      sources: "Stadium Database + Crowd Density Cameras"
    });

    addNotification("Operations Search Compile", "Structured parameters rendered below.", "info");
  };

  const runAgentChatLoadingSequence = async (customText: string | null = null) => {
    setChatLoading(true);
    setAgentLoaderSteps(prev => prev.map(s => ({ ...s, done: false })));
    if (customText) {
      setAgentLoaderSteps(prev => prev.map((s, i) => i === 1 ? { ...s, name: customText } : s));
    }

    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 600));
      setAgentLoaderSteps(prev => prev.map((s, idx) => idx === i ? { ...s, done: true } : s));
    }
    await new Promise(r => setTimeout(r, 200));
    setChatLoading(false);
  };

  // Simulator handler
  const triggerSimulatorSequence = async () => {
    if (!simQuery.trim()) return;
    setSimLoading(true);
    setSimProgress(10);
    
    let interval = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          fetchSimulatorResult();
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  const fetchSimulatorResult = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: simQuery })
      });
      const data = await res.json();
      setSimResult(data);
      addNotification("Simulation Completed", `Forecasting parameters processed for scenario: "${simQuery}"`, "warning");
    } catch (e) {
      alert("Simulator API failure.");
    } finally {
      setSimLoading(false);
    }
  };

  // Emergency triggers
  const dispatchIncidentSequence = async (category: string, desc: string) => {
    try {
      const data = await getEmergencyMockData(category);
      setActiveEmergencyDetail(data);
      
      // Update local incidents telemetry log
      const newIncident: IncidentData = {
        id: data.incidentId,
        category: data.category,
        description: data.responsePlan,
        location: "Section 112 Ingress Corridor B",
        severity: data.severity,
        timestamp: Date.now()
      };
      
      setTelemetry(prev => ({
        ...prev,
        incidents: [newIncident, ...prev.incidents.filter(i => i.category !== category)]
      }));

      addNotification(`DISPATCH ACTIVE: ${data.incidentId}`, `Category ${category.toUpperCase()} logged. Responders deployed via exit lanes.`, "danger");
      setActiveMapRoute(true);
      // Stay on emergency tab to display the new cards!
      setCurrentPage("emergency");
    } catch (e) {
      console.error("Local mock dispatch failure", e);
    }
  };

  const clearIncident = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/emergency/resolve/${id}`, { method: "POST" });
      setActiveMapRoute(false);
      addNotification("Incident Resolved", "Active dispatch logs cleared.", "success");
    } catch (e) {
      alert("API clear failure.");
    }
  };

  const navigationLinks = [
    { id: "landing", name: "Home Landing", icon: <Home className="w-4 h-4" /> },
    { id: "dashboard", name: "Command Center", icon: <BarChart2 className="w-4 h-4" /> },
    { id: "copilot", name: "Fan Copilot", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "digital_twin", name: "Digital Twin", icon: <Map className="w-4 h-4" /> },
    { id: "emergency", name: "Emergency", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "reports", name: "AI Reports", icon: <FileText className="w-4 h-4" /> },
    { id: "simulator", name: "AI Simulator", icon: <Play className="w-4 h-4" /> },
    { id: "settings", name: "Settings", icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div 
      className={`min-h-screen flex flex-col bg-[#050505] text-[#F0F6FC] relative ${highContrast ? "contrast-125 saturate-150" : ""}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      
      {/* Background Particles layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <canvas id="particles-canvas-next" className="absolute inset-0 w-full h-full opacity-40"></canvas>
      </div>

      {/* Notification Toast Stack */}
      <div className="fixed top-6 right-6 z-50 space-y-3 w-80">
        {notifications.map(toast => (
          <div 
            key={toast.id}
            className={`glass-card p-4 rounded-2xl flex items-start gap-3 border-l-4 transition-all duration-300 ${
              toast.type === "danger" ? "border-neonRed glow-red" : (toast.type === "warning" ? "border-neonYellow" : "border-neonCyan")
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${toast.type === "danger" ? "bg-neonRed animate-pulse" : (toast.type === "warning" ? "bg-neonYellow" : "bg-neonCyan")}`}></div>
            <div className="flex-1">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-outfit">{toast.title}</h5>
              <p className="text-xs text-neutral-300 mt-1 font-light leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => dismissNotification(toast.id)} className="text-neutral-500 hover:text-white">&times;</button>
          </div>
        ))}
      </div>

      {/* FIXED Sticky Header */}
      <header className="sticky top-0 w-full glass-card border-b border-white/8 z-40 px-6 py-3.5 flex justify-between items-center rounded-b-3xl">
        <div className="flex items-center gap-2 cursor-pointer transition-opacity duration-200 hover:opacity-90" onClick={() => setCurrentPage("landing")}>
          <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center transition-transform duration-300 hover:scale-105 group">
            <div className="relative w-5 h-5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-neonCyan/40 animate-pulse"></div>
              <div className="absolute w-3.5 h-3.5 rounded-full border border-white/20"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-neonCyan"></div>
            </div>
          </div>
          <div>
            <h1 className="font-outfit font-bold tracking-tight text-white leading-none text-sm">StadiumMind</h1>
            <span className="text-[9px] text-neutral-400 font-medium tracking-wide uppercase leading-none block mt-1">Operational Intelligence</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-xl">
          {navigationLinks.map(page => (
            <button 
              key={page.id}
              onClick={() => setCurrentPage(page.id)} 
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium font-outfit transition-all duration-300 ${
                currentPage === page.id ? "bg-white/10 text-white shadow-sm" : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {page.name}
            </button>
          ))}
        </nav>

        {/* Right Controls Container */}
        <div className="flex items-center gap-4">
          
          {/* Notification Button & Interactive Panel */}
          <div className="relative" id="notifications-container">
            <button 
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false); // Close other dropdown
              }}
              className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-neutral-400 hover:text-white transition-all relative"
              aria-label="Toggle notifications panel"
            >
              <Bell className="w-5 h-5" />
              {panelNotifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neonCyan animate-ping"></span>
              )}
            </button>

            {/* Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 glass-card rounded-2xl border border-white/10 shadow-2xl p-4 space-y-3 z-50 animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-outfit flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-neonCyan" /> Notifications
                  </h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setPanelNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        addNotification("Notifications", "All marked as read.", "info");
                      }} 
                      className="text-[9px] text-neonCyan hover:underline font-mono uppercase font-bold"
                    >
                      Mark all read
                    </button>
                    <button 
                      onClick={() => {
                        setPanelNotifications([]);
                        addNotification("Notifications", "Cleared all notifications.", "info");
                      }} 
                      className="text-[9px] text-neonRed hover:underline font-mono uppercase font-bold"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {panelNotifications.length === 0 ? (
                    <div className="text-center py-6 text-[10px] text-neutral-500 font-mono">No active notifications.</div>
                  ) : (
                    panelNotifications.map(item => (
                      <div 
                        key={item.id}
                        className={`p-2.5 rounded-xl border transition-all flex items-start gap-2 ${
                          item.read ? "bg-white/[0.02] border-white/5" : "bg-neonCyan/5 border-neonCyan/20"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          item.type === "danger" ? "bg-neonRed" : (item.type === "warning" ? "bg-neonYellow" : (item.type === "success" ? "bg-neonGreen" : "bg-neonCyan"))
                        }`}></div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wide">{item.title}</span>
                            <span className="text-[8px] text-neutral-500 shrink-0 font-mono">{item.time}</span>
                          </div>
                          <p className="text-[10px] text-neutral-300 font-light leading-relaxed">{item.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Button & Interactive Dropdown */}
          <div className="relative" id="profile-container">
            <button 
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false); // Close other dropdown
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-xs text-white border border-white/10 transition-all cursor-pointer focus:ring-2 focus:ring-neonCyan"
              aria-label="User Profile Dropdown"
            >
              JD
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-3 w-48 glass-card rounded-2xl border border-white/10 shadow-2xl p-2.5 space-y-1.5 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-white/5 space-y-0.5">
                  <div className="text-xs font-bold text-white">John Doe</div>
                  <div className="text-[9px] text-neonCyan font-mono">OPERATIONS_ADMIN</div>
                </div>
                
                <button 
                  onClick={() => { setCurrentPage("settings"); setProfileOpen(false); }} 
                  className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-outfit"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => { setCurrentPage("settings"); setProfileOpen(false); }} 
                  className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-outfit"
                >
                  Settings
                </button>
                <button 
                  onClick={() => { setCurrentPage("settings"); setProfileOpen(false); }} 
                  className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-outfit"
                >
                  Preferences
                </button>
                <button 
                  onClick={() => { addNotification("Help desk info", "Operations support line: ext. 9012", "info"); setProfileOpen(false); }} 
                  className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-outfit"
                >
                  Help & Support
                </button>
                
                <div className="border-t border-white/5 my-1"></div>
                
                <button 
                  onClick={() => { addNotification("Platform link shutdown", "Lead Admin session ended.", "warning"); setProfileOpen(false); }} 
                  className="w-full text-left px-3 py-2 text-xs text-neonRed hover:bg-neonRed/10 rounded-xl transition-all font-outfit font-semibold"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setMobileNavOpen(!mobileNavOpen)} 
            className="md:hidden p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-neutral-400 hover:text-white transition-all"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden glass-card mx-6 mt-2 p-3 rounded-2xl border border-white/8 space-y-1 z-30 relative animate-fade-in">
          {navigationLinks.map(page => (
            <button 
              key={page.id}
              onClick={() => {
                setCurrentPage(page.id);
                setMobileNavOpen(false); // Close automatically after selecting a page
              }} 
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-outfit font-semibold transition-all duration-200 ${
                currentPage === page.id ? "bg-neonCyan/15 text-neonCyan shadow-inner" : "text-neutral-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {page.name}
            </button>
          ))}
        </div>
      )}

      {/* Pages Router View */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6 z-10 relative">

        {/* 1. LANDING PAGE */}
        {currentPage === "landing" && (
          <div className="space-y-16 py-12 text-center">
            <div className="space-y-6 max-w-4xl mx-auto">
              <span className="px-4 py-1.5 rounded-full bg-neonCyan/10 border border-neonCyan/20 text-neonCyan font-bold text-xs uppercase tracking-widest font-outfit inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> High-Fidelity OS MVP
              </span>
              <h2 className="text-5xl md:text-8xl font-outfit font-black tracking-tight leading-none bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                The AI Operating System <br/>for Stadium Operations
              </h2>
              <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
                Autonomous agent coordination, predictive crowd forecasting, and visual localization—engineered for modern stadium operations.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button onClick={() => setCurrentPage("dashboard")} className="px-8 py-4 bg-neonCyan hover:bg-cyan-400 text-obsidian font-extrabold rounded-2xl text-sm transition-all font-outfit shadow-lg shadow-cyan-500/10">
                  Launch Dashboard
                </button>
                <button onClick={() => setCurrentPage("copilot")} className="px-8 py-4 glass-card hover:bg-white/5 rounded-2xl text-sm font-extrabold transition-all font-outfit">
                  Fan Copilot
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { val: "80,000+", label: "Expected Stadium Ingress" },
                { val: "120+", label: "Agentic Workflows" },
                { val: "24/7", label: "Telemetry Monitoring" },
                { val: "99.2%", label: "Prediction Accuracy" }
              ].map(stat => (
                <div key={stat.label} className="glass-card p-6 rounded-3xl text-center space-y-1">
                  <div className="text-3xl md:text-5xl font-outfit font-black text-white">{stat.val}</div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. COMMAND CENTER (DASHBOARD) */}
        {currentPage === "dashboard" && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border-l-4 border-neonCyan flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-neonCyan/10 text-neonCyan text-[10px] font-bold uppercase tracking-wider font-mono">Live Briefing</span>
                  <span className="text-[9px] text-neutral-500 font-mono">Updated: Just Now</span>
                </div>
                <p className="text-sm text-neutral-200 font-light leading-relaxed">{liveBriefingText}</p>
              </div>
              <div>
                <button onClick={() => addNotification("Gate Overflow Warning", "Heavy concourse flow recorded near Gate B East.", "warning")} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl text-xs text-white font-semibold transition-all">
                  Simulate Gate Ingress Spike
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Stadium Health Score Gauge */}
              <div className="glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono">Stadium Health Index</h4>
                    <span className="text-xs text-neutral-500">Telemetry safety ratio</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-neonGreen/10 text-neonGreen font-mono font-bold">STABLE</span>
                </div>
                <div className="flex items-center justify-center py-6">
                  <div className="relative w-36 h-36 flex items-center justify-center rounded-full border border-white/5">
                    <div className="absolute inset-2 rounded-full border-4 border-dashed border-white/10 animate-spin" style={{ animationDuration: "15s" }}></div>
                    <div className="text-center z-10">
                      <span className="text-4xl font-outfit font-black text-white">{telemetry.health_score}%</span>
                      <span className="block text-[9px] text-neutral-400 uppercase tracking-wider mt-1">Operational</span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-neonCyan to-neonGreen transition-all duration-500" style={{ width: `${telemetry.health_score}%` }}></div>
                </div>
              </div>

              {/* Gate queue lists */}
              <div className="glass-card p-6 rounded-3xl space-y-4 col-span-1 md:col-span-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono">Gate Ingress load / Wait Times</h4>
                    <span className="text-xs text-neutral-500">Live scanning checkpoints</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">Total Scans: {totalAttendeeScans}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(telemetry.crowd.gates).map(gateName => {
                    const gData = telemetry.crowd.gates[gateName];
                    return (
                      <div key={gateName} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white font-bold font-outfit">{gateName}</span>
                          <span className={gData.load_percentage > 85 ? "text-neonRed font-black" : "text-neutral-400"}>
                            {gData.load_percentage}% load
                          </span>
                        </div>
                        <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-500 ${gData.load_percentage > 85 ? "bg-neonRed" : "bg-neonCyan"}`} style={{ width: `${gData.load_percentage}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-neutral-500">
                          <span>Wait: <span className="font-bold text-white">{gData.wait_time_mins}m</span></span>
                          <span>Throughput: <span className="font-bold text-white">{Math.round(gData.load_percentage * 1.5)}/m</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. STADIUMMIND ASSISTANT */}
        {currentPage === "copilot" && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Top Control Bar Input */}
            <div className="glass-card p-6 rounded-3xl space-y-4 glow-cyan">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neonCyan to-green-500 flex items-center justify-center font-bold text-obsidian text-sm font-outfit">S</div>
                  <div>
                    <h3 className="font-outfit font-bold text-white text-sm">StadiumMind Assistant</h3>
                    <span className="text-[9px] text-neonCyan uppercase tracking-widest font-mono">Operations Engine Hub Online</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setFanAccessibility(!fanAccessibility)} 
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-extrabold uppercase border transition-all duration-200 flex items-center gap-1.5 ${
                      fanAccessibility ? "bg-neonCyan/20 text-neonCyan border-neonCyan" : "border-white/10 text-neutral-400"
                    }`}
                  >
                    <Accessibility className="w-3.5 h-3.5" /> Wheelchair path
                  </button>
                  
                  <div className="flex items-center gap-1.5 bg-neutral-900 border border-white/10 rounded-xl px-2.5 py-1">
                    <Globe className="w-3.5 h-3.5 text-neutral-400" />
                    <select 
                      value={fanLanguage}
                      onChange={(e) => setFanLanguage(e.target.value)}
                      className="bg-transparent text-white text-[10px] py-0.5 focus:outline-none border-none cursor-pointer"
                    >
                      <option value="en" className="bg-neutral-950">English</option>
                      <option value="es" className="bg-neutral-950">Español</option>
                      <option value="fr" className="bg-neutral-950">Français</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <button 
                  onClick={() => triggerPresetCopilotQuery("OCR_where_am_i")}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-neonCyan transition-all flex items-center justify-center active:scale-95 duration-200"
                  title="Scan Location Photo"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Query navigation routing, nearest concession lines, or restroom locations..." 
                  className="flex-1 bg-neutral-900 border border-white/10 rounded-2xl px-4 text-xs text-white focus:outline-none focus:border-neonCyan transition-all"
                />
                <button 
                  onClick={() => sendChatMessage()} 
                  className="px-6 bg-neonCyan hover:bg-cyan-400 text-obsidian font-extrabold rounded-2xl text-xs transition-all font-outfit flex items-center gap-1.5 active:scale-95 duration-200"
                >
                  <Search className="w-3.5 h-3.5" /> Execute Search
                </button>
              </div>

              {/* Quick Search Preset Tags Header & Chips */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-neonCyan animate-pulse" /> Quick Search Presets
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  <button onClick={() => triggerPresetCopilotQuery("Closest concession with no line?")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 border border-white/5 rounded-xl text-[10px] text-neutral-300 transition-all duration-200 shrink-0">
                    🍔 concession wait times
                  </button>
                  <button onClick={() => triggerPresetCopilotQuery("Seat Sec 112A wheelchair route?")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 border border-white/5 rounded-xl text-[10px] text-neutral-300 transition-all duration-200 shrink-0">
                    ♿ Wheelchair stepless route
                  </button>
                  <button onClick={() => triggerPresetCopilotQuery("OCR_where_am_i")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 border border-white/5 rounded-xl text-[10px] text-neutral-300 transition-all duration-200 shrink-0">
                    📷 OCR Camera guide
                  </button>
                </div>
              </div>
            </div>

            {/* Loading checklists */}
            {chatLoading && (
              <div className="glass-card p-6 rounded-3xl space-y-3">
                <div className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase animate-pulse">Running multi-agent routing queries...</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {agentLoaderSteps.map(step => (
                    <div key={step.name} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs font-mono">
                      <span className={step.done ? "text-white" : "text-neutral-500"}>{step.name.split(" ")[0]} Agent</span>
                      <span className={step.done ? "text-neonGreen" : "text-neutral-600 animate-pulse"} x-text="step.done ? '✓' : '...' ">
                        {step.done ? "✓" : "..."}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Response Area Rendered as Structured Cards */}
            {lastCopilotResult ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Navigation Route Details */}
                <div className="glass-card p-5 rounded-3xl space-y-3">
                  <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-neonCyan" /> Navigation Route
                  </h4>
                  <p className="text-xs text-white leading-relaxed font-light" x-text="lastCopilotResult.navigation">
                    {lastCopilotResult.navigation}
                  </p>
                </div>

                {/* 2. ETA & Time Details */}
                <div className="glass-card p-5 rounded-3xl space-y-3">
                  <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neonCyan" /> Estimated Duration
                  </h4>
                  <div className="text-2xl font-black font-outfit text-white" x-text="lastCopilotResult.eta">
                    {lastCopilotResult.eta}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">Adjusted for crowd densities</span>
                </div>

                {/* 3. Concourse Crowd Levels */}
                <div className="glass-card p-5 rounded-3xl space-y-3">
                  <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neonCyan" /> Crowd Level Index
                  </h4>
                  <div className="text-xl font-bold font-outfit text-neonYellow" x-text="lastCopilotResult.crowdLevel">
                    {lastCopilotResult.crowdLevel}
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">Moderate ingress velocities</span>
                </div>

                {/* 4. Suggested Path Nodes (Step-by-step list) */}
                <div className="glass-card p-5 rounded-3xl space-y-3 col-span-1 md:col-span-2">
                  <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono">Suggested Path Nodes</h4>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {lastCopilotResult.suggestedRoute.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-mono text-white">
                          {step}
                        </span>
                        {idx < lastCopilotResult.suggestedRoute.length - 1 && <span className="text-neutral-600 text-xs">&rarr;</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Food Concessions status */}
                <div className="glass-card p-5 rounded-3xl space-y-3">
                  <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono">Nearby Concessionaires</h4>
                  <p className="text-xs text-neutral-300 font-light leading-relaxed">
                    {lastCopilotResult.food}
                  </p>
                </div>

                {/* 6. Accessibility Details */}
                <div className="glass-card p-5 rounded-3xl space-y-3 col-span-1 md:col-span-2">
                  <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono">Accessibility Accommodation</h4>
                  <p className="text-xs text-neutral-300 font-light leading-relaxed">
                    {lastCopilotResult.accessibility}
                  </p>
                </div>

                {/* 7. Safety Warnings */}
                <div className="glass-card p-5 rounded-3xl space-y-3">
                  <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-1.5 text-neonYellow">
                    <AlertTriangle className="w-3.5 h-3.5" /> Safety Warnings
                  </h4>
                  <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside font-light">
                    {lastCopilotResult.warnings.map((w: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{w}</li>
                    ))}
                  </ul>
                </div>

                {/* 8. Sources & Grounding */}
                <div className="glass-card p-5 rounded-3xl space-y-2 col-span-1 md:col-span-3 border-t border-white/10 bg-white/[0.02]">
                  <span className="text-[9px] text-neutral-500 uppercase tracking-wider block font-mono">Information Sources and Grounding Log</span>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    Grounding matrix verified: {lastCopilotResult.sources}
                  </div>
                </div>

              </div>
            ) : (
              <div className="glass-card p-12 rounded-3xl text-center flex flex-col items-center justify-center text-neutral-500 text-xs min-h-[260px] space-y-3">
                <Search className="w-8 h-8 text-neutral-600 animate-pulse" />
                <h4 className="font-outfit font-bold text-white text-sm">No search performed yet</h4>
                <p className="max-w-md mx-auto text-neutral-400 font-light leading-relaxed">
                  Search for a seat, gate, restroom, concession stand, or accessibility route to view AI-powered guidance.
                </p>
              </div>
            )}

          </div>
        )}

        {/* 4. DIGITAL TWIN */}
        {currentPage === "digital_twin" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-3xl space-y-4 h-fit">
                <h3 className="text-sm font-outfit font-extrabold text-white">Live Twin Console</h3>
                <p className="text-xs text-neutral-400 font-light">Toggle coordinate layers and live route configurations.</p>
                
                <div className="space-y-2 pt-2 border-t border-white/5">
                  {Object.keys(twinFilters).map(key => (
                    <label key={key} className="flex items-center gap-3 text-xs text-neutral-300 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={(twinFilters as any)[key]} 
                        onChange={() => setTwinFilters(prev => ({ ...prev, [key]: !(prev as any)[key] }))}
                        className="rounded border-white/8 text-neonCyan bg-neutral-900 focus:ring-0"
                      />
                      <span className="capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="glass-card p-4 rounded-3xl col-span-1 md:col-span-3 h-[520px] relative overflow-hidden bg-black/50">
                <svg className="w-full h-full" viewBox="0 0 800 500">
                  <defs>
                    <radialGradient id="heatmap-gradient-1" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="heatmap-gradient-2" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Pulsing Heatmap Zones */}
                  <circle cx="360" cy="210" r="140" fill="url(#heatmap-gradient-1)" className="animate-pulse" />
                  <circle cx="580" cy="300" r="100" fill="url(#heatmap-gradient-2)" className="animate-pulse" style={{ animationDuration: "4s" }} />

                  {/* Stadium Boundaries and rings */}
                  <ellipse cx="400" cy="250" rx="350" ry="210" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  
                  {/* Concentric Crowd Pulse rings */}
                  <ellipse cx="400" cy="250" rx="280" ry="160" fill="none" stroke="rgba(0, 229, 255, 0.1)" strokeWidth="1.5" className="animate-ping" style={{ animationDuration: "5s" }} />
                  <ellipse cx="400" cy="250" rx="220" ry="120" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                  <rect x="300" y="170" width="200" height="160" fill="rgba(0, 229, 255, 0.03)" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="2" rx="4" />
                  <circle cx="400" cy="250" r="30" fill="none" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="2" />

                  {/* Clickable Sector Divisions (Hover overlay sectors) */}
                  <g className="opacity-0 hover:opacity-20 cursor-pointer transition-all">
                    {/* Sector A North */}
                    <path d="M 200,80 L 600,80 L 400,250 Z" fill="#00E5FF" onClick={() => setSelectedTwinElement({ id: "SEC_NORTH", name: "Sector A (North Entrance)", status: "High ingress flow - 12m wait", languages: ["en", "es"] })} />
                    {/* Sector B East */}
                    <path d="M 600,80 L 600,420 L 400,250 Z" fill="#00E5FF" onClick={() => setSelectedTwinElement({ id: "SEC_EAST", name: "Sector B (East Concourse)", status: "Moderate wait lines - 8m wait", languages: ["en", "fr"] })} />
                    {/* Sector C South */}
                    <path d="M 200,420 L 600,420 L 400,250 Z" fill="#00E5FF" onClick={() => setSelectedTwinElement({ id: "SEC_SOUTH", name: "Sector C (South Entrance)", status: "Empty lines - under 4m wait", languages: ["en", "es", "pt"] })} />
                    {/* Sector D West */}
                    <path d="M 200,80 L 200,420 L 400,250 Z" fill="#00E5FF" onClick={() => setSelectedTwinElement({ id: "SEC_WEST", name: "Sector D (West Concourse)", status: "High density - 10m wait", languages: ["en", "de"] })} />
                  </g>

                  {/* Label tags for sectors */}
                  <text x="400" y="70" fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="middle" fontStyle="mono">SECTOR A (NORTH)</text>
                  <text x="710" y="255" fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="middle" fontStyle="mono">SECTOR B (EAST)</text>
                  <text x="400" y="445" fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="middle" fontStyle="mono">SECTOR C (SOUTH)</text>
                  <text x="90" y="255" fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="middle" fontStyle="mono">SECTOR D (WEST)</text>

                  {activeMapRoute && (
                    <path d="M 350,225 L 380,240 L 400,250 L 450,260 L 500,270" fill="none" stroke="#FF4136" strokeWidth="4" stroke-dasharray="8,8" className="animate-dash" />
                  )}

                  {twinFilters.volunteers && telemetry.volunteers.map(vol => (
                    <circle 
                      key={vol.id}
                      cx={400 + ((vol.lng - (-74.0743)) * 55000)} 
                      cy={250 - ((vol.lat - 40.8135) * 55000)} 
                      r="6" 
                      fill="#00E5FF" 
                      className="cursor-pointer hover:r-9 transition-all"
                      onClick={() => setSelectedTwinElement(vol)}
                    />
                  ))}

                  {twinFilters.medical && telemetry.medical_teams.map(med => (
                    <circle 
                      key={med.id}
                      cx={400 + ((med.lng - (-74.0743)) * 55000)} 
                      cy={250 - ((med.lat - 40.8135) * 55000)} 
                      r="8" 
                      fill="#22C55E" 
                      className="cursor-pointer hover:r-10 transition-all"
                      onClick={() => setSelectedTwinElement(med)}
                    />
                  ))}

                  {twinFilters.security && telemetry.security_teams.map(sec => (
                    <circle 
                      key={sec.id}
                      cx={400 + ((sec.lng - (-74.0743)) * 55000)} 
                      cy={250 - ((sec.lat - 40.8135) * 55000)} 
                      r="7" 
                      fill="#F59E0B" 
                      className="cursor-pointer hover:r-9 transition-all"
                      onClick={() => setSelectedTwinElement(sec)}
                    />
                  ))}
                </svg>

                {selectedTwinElement && (
                  <div className="absolute bottom-4 left-4 glass-card p-4 rounded-2xl max-w-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-outfit font-extrabold text-xs text-white">{selectedTwinElement.name || selectedTwinElement.category}</h4>
                      <button onClick={() => setSelectedTwinElement(null)} className="text-xs text-neutral-400 hover:text-white">&times;</button>
                    </div>
                    <div className="text-xs text-neutral-300 space-y-1 font-mono">
                      <p>ID: <span className="text-neonCyan">{selectedTwinElement.id}</span></p>
                      <p>Status: <span className="text-white">{selectedTwinElement.status || "Active Dispatch"}</span></p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. EMERGENCY */}
        {currentPage === "emergency" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Trigger Buttons panel */}
              <div className="glass-card p-6 rounded-3xl space-y-4 h-fit">
                <h3 className="text-sm font-outfit font-extrabold text-white uppercase tracking-widest font-mono">Trigger Override Alerts</h3>
                <div className="space-y-3">
                  <button onClick={() => dispatchIncidentSequence("medical", "Medical distress call Section 112")} className="w-full p-4 bg-neonRed/10 hover:bg-neonRed/20 border border-neonRed/20 hover:border-neonRed text-neonRed rounded-2xl text-left transition-all space-y-1">
                    <span className="block font-outfit font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> Medical Alert</span>
                    <span className="text-[10px] text-neutral-400">Deploy closest First-Aid</span>
                  </button>
                  <button onClick={() => dispatchIncidentSequence("security", "Suspicious activity reported Sector 4 Gate A")} className="w-full p-4 bg-neonYellow/10 hover:bg-neonYellow/20 border border-neonYellow/20 hover:border-neonYellow text-neonYellow rounded-2xl text-left transition-all space-y-1">
                    <span className="block font-outfit font-bold flex items-center gap-1.5"><ShieldAlert className="w-4 h-4"/> Security Patrol</span>
                    <span className="text-[10px] text-neutral-400">Deploy backup unit</span>
                  </button>
                  <button onClick={() => dispatchIncidentSequence("fire", "Smoke alarm Section 202 corridor")} className="w-full p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500 text-orange-400 rounded-2xl text-left transition-all space-y-1">
                    <span className="block font-outfit font-bold flex items-center gap-1.5"><Flame className="w-4 h-4"/> Fire Alarm</span>
                    <span className="text-[10px] text-neutral-400">Deploy fire marshal</span>
                  </button>
                  <button onClick={() => dispatchIncidentSequence("lost_child", "Lost child reported Gate D")} className="w-full p-4 bg-neonCyan/10 hover:bg-neonCyan/20 border border-neonCyan/20 hover:border-neonCyan text-neonCyan rounded-2xl text-left transition-all space-y-1">
                    <span className="block font-outfit font-bold flex items-center gap-1.5"><Users className="w-4 h-4"/> Lost Child search</span>
                    <span className="text-[10px] text-neutral-400">Lock down checkouts</span>
                  </button>
                </div>
              </div>

              {/* Active Incident Detail Panel (Structured Cards Grid) */}
              <div className="col-span-1 md:col-span-2 space-y-6">
                {activeEmergencyDetail ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Card 1: Incident Summary */}
                    <div className="glass-card p-5 rounded-3xl space-y-2 col-span-1 md:col-span-2 border-l-4 border-neonRed">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-neonRed/20 text-neonRed uppercase">Active Dispatch: {activeEmergencyDetail.incidentId}</span>
                        <button onClick={() => { setActiveEmergencyDetail(null); setActiveMapRoute(false); }} className="text-xs text-neutral-500 hover:text-white">Clear</button>
                      </div>
                      <h4 className="font-outfit font-bold text-white text-base capitalize">{activeEmergencyDetail.category} Emergency</h4>
                      <p className="text-xs text-neutral-300 font-light leading-relaxed">{activeEmergencyDetail.responsePlan}</p>
                    </div>

                    {/* Card 2: Risk Level */}
                    <div className="glass-card p-5 rounded-3xl space-y-2">
                      <h5 className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Operations Risk Rating</h5>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black font-outfit text-neonRed">{activeEmergencyDetail.severity}</span>
                      </div>
                      <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-neonRed animate-pulse" style={{ width: activeEmergencyDetail.severity === "CRITICAL" ? "100%" : "80%" }}></div>
                      </div>
                    </div>

                    {/* Card 3: ETA Details */}
                    <div className="glass-card p-5 rounded-3xl space-y-2">
                      <h5 className="text-xs text-neutral-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neonRed" /> Responder ETA
                      </h5>
                      <div className="text-3xl font-black font-outfit text-white">
                        {Math.floor(activeEmergencyDetail.etaSeconds / 60)}m {activeEmergencyDetail.etaSeconds % 60}s
                      </div>
                      <span className="text-[9px] text-neutral-500 font-mono">Optimized stepless dispatch route</span>
                    </div>

                    {/* Card 4: Dispatched Responders */}
                    <div className="glass-card p-5 rounded-3xl space-y-3 col-span-1 md:col-span-2">
                      <h5 className="text-xs text-neutral-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-neonGreen" /> Dispatched Responders
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeEmergencyDetail.responders.map((resp: string, idx: number) => (
                          <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-neonGreen animate-ping"></span>
                            <span className="text-xs text-white font-mono">{resp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card 5: Interactive Route */}
                    <div className="glass-card p-5 rounded-3xl space-y-3 col-span-1 md:col-span-2">
                      <h5 className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Interactive Map Route Nodes</h5>
                      <div className="flex flex-wrap gap-2">
                        {["Gate Ingress Checkpoint", "Elevator B Corridor", "Sector 4 Lobby", "Section 112 Corridor"].map((node, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[10px] text-white font-mono">
                              {node}
                            </span>
                            {idx < 3 && <span className="text-neutral-600">&rarr;</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card 6: Timeline History */}
                    <div className="glass-card p-5 rounded-3xl space-y-3">
                      <h5 className="text-xs text-neutral-400 uppercase tracking-wider font-mono">Response Timeline</h5>
                      <div className="space-y-2">
                        {activeEmergencyDetail.timeline.map((line: string, idx: number) => (
                          <div key={idx} className="text-[10px] text-neutral-300 font-mono border-l border-white/10 pl-2 leading-relaxed">
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card 7: Recommended Announcements */}
                    <div className="glass-card p-5 rounded-3xl space-y-3">
                      <h5 className="text-xs text-neutral-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Megaphone className="w-3.5 h-3.5 text-neonCyan" /> Public Address Broadcasts
                      </h5>
                      <p className="text-[10px] text-neutral-300 italic leading-relaxed">
                        &quot;{activeEmergencyDetail.announcementDraft}&quot;
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="glass-card p-12 rounded-3xl text-center text-neutral-500 text-xs flex flex-col items-center justify-center h-full min-h-[300px]">
                    <AlertTriangle className="w-8 h-8 text-neutral-600 mb-2 animate-bounce" />
                    <span>Select an emergency override alert trigger on the left to verify tactical dispatch monitoring.</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* 6. REPORTS */}
        {currentPage === "reports" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-3xl space-y-3">
              <h4 className="font-outfit font-extrabold text-sm text-white uppercase tracking-wider font-mono">Ingress Flow Report</h4>
              <div className="p-4 bg-white/5 rounded-2xl space-y-2 text-xs font-light text-neutral-300 leading-relaxed">
                <p>- Average gate wait times recorded: 12 minutes.</p>
                <p>- Ingress peaks matched expectations within 2% margin.</p>
              </div>
            </div>
            <div className="glass-card p-6 rounded-3xl space-y-3">
              <h4 className="font-outfit font-extrabold text-sm text-white uppercase tracking-wider font-mono font-outfit">Sustainability Report</h4>
              <div className="p-4 bg-white/5 rounded-2xl space-y-2 text-xs font-light text-neutral-300 leading-relaxed font-mono">
                <p>- Carbon Offsets: {telemetry.sustainability.carbon_saved_kg} kg CO2</p>
                <p>- HVAC staging reduced power grid spikes by 12%.</p>
              </div>
            </div>
          </div>
        )}

        {/* 7. SCENARIO SIMULATOR */}
        {currentPage === "simulator" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-outfit font-extrabold text-white uppercase tracking-widest font-mono">AI Scenario Simulator</h3>
              <p className="text-xs text-neutral-400">Run predictions for unexpected stadium events.</p>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={simQuery} 
                  onChange={(e) => setSimQuery(e.target.value)}
                  placeholder="What happens if Gate 5 closes due to a power outage?"
                  className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-neonCyan"
                />
                <button onClick={triggerSimulatorSequence} className="px-6 py-3 bg-neonCyan hover:bg-cyan-400 text-obsidian font-extrabold rounded-xl text-xs transition-all font-outfit">
                  Simulate
                </button>
              </div>
            </div>

            {simLoading && (
              <div className="glass-card p-6 rounded-3xl space-y-3">
                <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono animate-pulse">Running Monte Carlo simulation models...</h4>
                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-neonCyan transition-all duration-300" style={{ width: `${simProgress}%` }}></div>
                </div>
              </div>
            )}

            {simResult && !simLoading && (
              <div className="glass-card p-6 rounded-3xl space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h4 className="font-outfit font-extrabold text-sm text-white">{simResult.scenario}</h4>
                  <span className="px-2.5 py-1 bg-neonRed/10 text-neonRed rounded-lg text-[10px] font-mono font-bold border border-neonRed/20">
                    Risk Rating: {simResult.risk_level}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <span className="text-[9px] text-neutral-400 block uppercase font-mono">Health Score Impact</span>
                    <span className="text-xl font-bold font-outfit text-neonRed">{simResult.stadium_health_impact_delta}%</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <span className="text-[9px] text-neutral-400 block uppercase font-mono">Prediction Confidence</span>
                    <span className="text-xl font-bold font-outfit text-neonGreen">99.2%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-neutral-400 block font-mono">Predicted consequences:</span>
                  <ul className="text-xs space-y-1.5 list-disc list-inside text-neutral-300 font-light">
                    {simResult.consequences.map((con: string) => (
                      <li key={con}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. SETTINGS */}
        {currentPage === "settings" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Appearance */}
              <div className="glass-card p-5 rounded-3xl space-y-4">
                <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono">Appearance & Theme</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="text-xs font-bold text-white">High Contrast UI</h5>
                      <span className="text-[9px] text-neutral-400">Enhance visual accessibility</span>
                    </div>
                    <button onClick={() => setHighContrast(!highContrast)} className={`w-10 h-5 rounded-full p-0.5 transition-all ${highContrast ? "bg-neonCyan flex justify-end" : "bg-neutral-800 flex justify-start"}`}>
                      <span className="w-4 h-4 bg-white rounded-full"></span>
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="text-xs font-bold text-white">Interface Scale</h5>
                      <span className="text-[9px] text-neutral-400">Adjust overall viewport zoom</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setFontSize(prev => Math.max(12, prev - 1))} className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-xs font-mono">-</button>
                      <span className="text-xs font-mono text-white">{fontSize}px</span>
                      <button onClick={() => setFontSize(prev => Math.min(22, prev + 1))} className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-xs font-mono">+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="glass-card p-5 rounded-3xl space-y-4">
                <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono">Operations Alerts</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="text-xs font-bold text-white">Audio Narration Alerts</h5>
                      <span className="text-[9px] text-neutral-400">Synthesize audio voice summaries</span>
                    </div>
                    <button onClick={() => setScreenReader(!screenReader)} className={`w-10 h-5 rounded-full p-0.5 transition-all ${screenReader ? "bg-neonCyan flex justify-end" : "bg-neutral-800 flex justify-start"}`}>
                      <span className="w-4 h-4 bg-white rounded-full"></span>
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="text-xs font-bold text-white">Desktop Push</h5>
                      <span className="text-[9px] text-neutral-400">Receive alerts in background</span>
                    </div>
                    <span className="text-[9px] text-neonGreen font-mono uppercase font-bold bg-neonGreen/10 px-2 py-0.5 rounded">Active</span>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div className="glass-card p-5 rounded-3xl space-y-4">
                <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono">Platform Language</h4>
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-white">Select Default Locale</h5>
                  <select 
                    value={fanLanguage}
                    onChange={(e) => setFanLanguage(e.target.value)}
                    className="w-full bg-neutral-900 text-xs text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-neonCyan"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español (ES)</option>
                    <option value="fr">Français (FR)</option>
                  </select>
                </div>
              </div>

              {/* Accessibility Profile */}
              <div className="glass-card p-5 rounded-3xl space-y-4">
                <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono">Accessibility Profiles</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="text-xs font-bold text-white">Stepless wheelchair route pathing</h5>
                      <span className="text-[9px] text-neutral-400">Force elevator-only routes</span>
                    </div>
                    <button onClick={() => setFanAccessibility(!fanAccessibility)} className={`w-10 h-5 rounded-full p-0.5 transition-all ${fanAccessibility ? "bg-neonCyan flex justify-end" : "bg-neutral-800 flex justify-start"}`}>
                      <span className="w-4 h-4 bg-white rounded-full"></span>
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Hub Configuration */}
              <div className="glass-card p-5 rounded-3xl space-y-4 col-span-1 md:col-span-2">
                <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5"/> AI Swarm Engine</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-white">Operational Intelligence Model</h5>
                    <span className="text-[9px] text-neutral-400 block mb-2">Configure core agent routing LLM</span>
                    <select className="w-full bg-neutral-900 text-xs text-white p-2.5 rounded-xl border border-white/10 focus:outline-none">
                      <option>Operations-Pro-1.0 (Low-Latency)</option>
                      <option>Operations-Ultra-2.0 (High-Reasoning)</option>
                    </select>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">API Strategy Override</h5>
                    <span className="text-[9px] text-neutral-400 block mb-2">Toggle local simulator fallback</span>
                    <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-xs font-mono text-neutral-300">
                      Fallback Mode: <span className="text-neonCyan">Active (Simulator)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account profile */}
              <div className="glass-card p-5 rounded-3xl space-y-4 col-span-1 md:col-span-2">
                <h4 className="text-xs text-neutral-400 uppercase tracking-widest font-mono">User Profile & Authority</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-neonCyan/20 text-neonCyan border border-neonCyan/30 flex items-center justify-center font-bold text-lg">JD</div>
                  <div className="flex-1 space-y-1">
                    <h5 className="text-xs font-bold text-white">John Doe</h5>
                    <p className="text-[9px] text-neutral-400 font-mono">Authority: <span className="text-neonCyan">OPERATIONS_LEAD_ADMIN</span></p>
                  </div>
                  <button onClick={() => addNotification("Profile Updated", "Changes to John Doe logged successfully.", "success")} className="px-4 py-2 bg-neonCyan hover:bg-cyan-400 text-obsidian font-extrabold rounded-xl text-xs font-outfit transition-all">
                    Save Configuration
                  </button>
                </div>
              </div>

              {/* About specifications */}
              <div className="glass-card p-5 rounded-3xl space-y-2 col-span-1 md:col-span-2 bg-white/[0.02] border border-white/5">
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest block font-mono">Platform Specifications</span>
                <div className="text-[10px] text-neutral-400 font-mono space-y-1">
                  <p>StadiumMind Platform version: <span className="text-white">v1.0.0-MVP</span></p>
                  <p>Engine Core: <span className="text-white">FastAPI + React/Next.js 15</span></p>
                  <p>Grounding Engine: <span className="text-white">Mock Resolution Telemetry (Safety Override Enabled)</span></p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      <footer className="p-6 text-center text-xs text-neutral-500 border-t border-white/8 z-10 relative">
        &copy; 2026 StadiumMind. AI Stadium Operations Platform.
      </footer>
    </div>
  );
}
