"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Sparkles, Map, Cpu, ShieldCheck } from "lucide-react";

export default function HomeLanding() {
  
  // Background particles canvas setup
  useEffect(() => {
    const canvas = document.getElementById("landing-particles") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let particles: any[] = [];
    const count = 30;
    
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
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.1
      });
    }
    
    let animId: number;
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
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F0F6FC] font-sans flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Spotlight and Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute w-[800px] h-[800px] rounded-full blur-3xl opacity-30 top-0 left-0 bg-gradient-to-br from-neonCyan/10 to-transparent"></div>
        <canvas id="landing-particles" className="absolute inset-0 w-full h-full"></canvas>
      </div>

      {/* Header */}
      <header className="p-6 glass-card border-b border-white/8 flex justify-between items-center max-w-7xl w-full mx-auto rounded-b-3xl z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neonCyan to-green-500 flex items-center justify-center font-bold text-obsidian text-lg font-outfit shadow-lg shadow-cyan-500/20">
            SM
          </div>
          <div>
            <h1 className="font-outfit font-black tracking-tight text-white leading-none text-base">StadiumMind</h1>
            <span className="text-[9px] text-neonCyan uppercase tracking-widest font-mono font-bold">AI Stadium Operations Platform</span>
          </div>
        </div>
        <Link 
          href="/dashboard" 
          className="px-5 py-2.5 bg-[#00E5FF] hover:bg-cyan-400 text-obsidian font-extrabold rounded-2xl text-xs transition-all font-outfit shadow-lg shadow-cyan-500/10"
        >
          Launch Console
        </Link>
      </header>

      {/* Hero section */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center text-center space-y-12 z-10 relative">
        <div className="space-y-6">
          <span className="px-4 py-1.5 rounded-full bg-neonCyan/10 border border-neonCyan/20 text-[#00E5FF] font-bold text-xs uppercase tracking-widest font-outfit inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> High-Fidelity OS MVP
          </span>
          <h2 className="text-5xl md:text-8xl font-outfit font-black tracking-tight leading-none bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            The AI Operating System <br/>for Stadium Operations
          </h2>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
            AI-powered operational intelligence for fans, organizers, volunteers, and emergency responders.
          </p>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          <div className="glass-card p-6 rounded-3xl text-left border border-white/5 space-y-3 hover:border-neonCyan/30 transition-all group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-neonCyan/10 text-neonCyan flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-outfit font-bold text-white text-base">Command Center Dashboard</h4>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Monitor real-time telemetry, queue wait levels, sustainability impact ratios, and automated volunteer task dispatches.
            </p>
            <Link href="/dashboard" className="text-xs text-neonCyan font-semibold group-hover:underline block pt-1">
              Launch Dashboard Console &rarr;
            </Link>
          </div>

          <div className="glass-card p-6 rounded-3xl text-left border border-white/5 space-y-3 hover:border-green-500/30 transition-all group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-neonGreen/10 text-neonGreen flex items-center justify-center">
              <Map className="w-5 h-5" />
            </div>
            <h4 className="font-outfit font-bold text-white text-base">Interactive Digital Twin</h4>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Live coordinate map tracking responder coordinates, volunteer shifts, medical standby feeds, and crowd density indexes.
            </p>
            <Link href="/dashboard" className="text-xs text-neonGreen font-semibold group-hover:underline block pt-1">
              Explore Live Map layers &rarr;
            </Link>
          </div>
        </div>

        {/* Matrix display */}
        <div className="w-full max-w-3xl glass-card p-6 rounded-3xl text-left border border-white/5 space-y-4">
          <h4 className="font-outfit font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neonGreen" /> System Architecture Matrix
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[9px] text-neutral-400 block uppercase font-mono">Frontend</span>
              <span className="text-xs text-white font-bold block mt-1">Next.js 15 App</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[9px] text-neutral-400 block uppercase font-mono">Backend API</span>
              <span className="text-xs text-white font-bold block mt-1">FastAPI Python</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[9px] text-neutral-400 block uppercase font-mono">Sockets</span>
              <span className="text-xs text-white font-bold block mt-1">WS Telemetry</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[9px] text-neutral-400 block uppercase font-mono">Agent Swarm</span>
              <span className="text-xs text-white font-bold block mt-1">Operations Hub</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="p-6 text-center text-xs text-neutral-500 border-t border-white/8 z-10 relative">
        &copy; 2026 StadiumMind. AI Stadium Operations Platform. Built on Google Cloud Platform.
      </footer>

    </div>
  );
}
