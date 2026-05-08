import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

/* ════════════════════════════════════════════════════════════
   MOCK DATA FOR VISUALIZATION
   ════════════════════════════════════════════════════════════ */
const MOCK_TRIPLES = [
  { sub: "USER", pred: "PREFERS", obj: "LOCAL_MODELS", time: "2 min ago" },
  { sub: "SYSTEM", pred: "RUNNING", obj: "QWEN3-8B", time: "5 min ago" },
  { sub: "GRAPHITI", pred: "DEPRECATES", obj: "FLAT_MARKDOWN", time: "1 day ago" },
  { sub: "SQLITE-VEC", pred: "ENABLES", obj: "ZERO_OPS_SEARCH", time: "2 days ago" },
];

const MOCK_EPISODES = [
  { id: 1, text: "Analyzed Sovereign AI memory report", type: "consolidated", importance: 0.9 },
  { id: 2, text: "Generated layout strategy for MemoryPage", type: "working", importance: 0.6 },
  { id: 3, text: "User changed CSS theme to dark mode", type: "decaying", importance: 0.2 },
];

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════════ */

const SovereignStatus = () => (
  <div className="grid grid-cols-3 gap-4 mb-4">
    <div className="hud-panel p-3 flex flex-col justify-between h-24">
      <div className="flex justify-between items-center text-[10px] text-muted">
        <span>STORAGE ENGINE</span>
        <div className="status-dot ok" />
      </div>
      <div className="text-sm font-bold text-accent">SQLite-vec + FTS5</div>
      <div className="text-[9px] text-muted">Size: 42MB | Zero-Ops</div>
    </div>
    
    <div className="hud-panel p-3 flex flex-col justify-between h-24">
      <div className="flex justify-between items-center text-[10px] text-muted">
        <span>EMBEDDING MODEL</span>
        <div className="status-dot ok" />
      </div>
      <div className="text-sm font-bold text-accent-3">BGE-M3 (ONNX)</div>
      <div className="text-[9px] text-muted">VRAM: 1.2GB | Dim: 1024</div>
    </div>

    <div className="hud-panel p-3 flex flex-col justify-between h-24">
      <div className="flex justify-between items-center text-[10px] text-muted">
        <span>TRIPLE EXTRACTOR</span>
        <div className="status-dot warn" />
      </div>
      <div className="text-sm font-bold text-accent-2">Qwen3-8B (Q4)</div>
      <div className="text-[9px] text-muted">Latency: ~240ms | Queue: 1</div>
    </div>
  </div>
);

const MemoryGraph = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    
    let w = canvas.parentElement?.clientWidth || 400;
    let h = canvas.parentElement?.clientHeight || 300;
    canvas.width = w;
    canvas.height = h;

    const nodes = [
      { x: w*0.5, y: h*0.5, label: "USER", r: 15, color: "var(--accent)" },
      { x: w*0.3, y: h*0.3, label: "LOCAL_AI", r: 10, color: "var(--accent-3)" },
      { x: w*0.7, y: h*0.4, label: "SQLITE", r: 10, color: "var(--accent-2)" },
      { x: w*0.4, y: h*0.8, label: "VITE", r: 8, color: "var(--text-muted)" },
    ];

    let frame: number;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      const accent3 = getComputedStyle(document.documentElement).getPropertyValue('--accent-3').trim();
      
      // Draw grid
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let i=0; i<w; i+=20) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
      for (let j=0; j<h; j+=20) { ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(w,j); ctx.stroke(); }

      // Wobble nodes slightly
      t += 0.02;
      const currentNodes = nodes.map((n, i) => ({
        ...n,
        x: n.x + Math.sin(t + i) * 2,
        y: n.y + Math.cos(t + i*2) * 2
      }));

      // Draw edges
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.moveTo(currentNodes[0].x, currentNodes[0].y);
      ctx.lineTo(currentNodes[1].x, currentNodes[1].y);
      ctx.moveTo(currentNodes[0].x, currentNodes[0].y);
      ctx.lineTo(currentNodes[2].x, currentNodes[2].y);
      ctx.stroke();

      // Draw nodes
      currentNodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
        ctx.fillStyle = n.color || accent;
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = n.color || accent;
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.font = "10px var(--font-hud)";
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y - n.r - 5);
      });

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex-1 hud-panel relative overflow-hidden flex flex-col min-h-[250px]">
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-[9px] border border-white/10 z-10">
        TEMPORAL_GRAPH_VIEW // LIVE
      </div>
      <canvas ref={canvasRef} className="w-full h-full block absolute inset-0" />
    </div>
  );
};

const EpisodicTimeline = () => (
  <div className="flex-1 hud-panel p-3 flex flex-col overflow-hidden">
    <div className="text-[10px] text-muted mb-2 uppercase border-b border-white/10 pb-1">
      Episodic Consolidation Loop
    </div>
    <div className="flex-1 overflow-y-auto pr-2 scrollbar-cyber flex flex-col gap-2">
      {MOCK_EPISODES.map(ep => (
        <div key={ep.id} className="p-2 border border-white/5 bg-white/5 text-[11px] relative">
          <div className="absolute right-2 top-2 w-2 h-2 rounded-full" style={{
            background: ep.importance > 0.8 ? 'var(--neon-green)' : ep.importance > 0.5 ? 'var(--neon-amber)' : 'var(--text-muted)',
            boxShadow: ep.importance > 0.8 ? '0 0 5px var(--neon-green)' : 'none'
          }} />
          <div className="text-muted text-[8px] uppercase mb-1">State: {ep.type}</div>
          <div>{ep.text}</div>
          <div className="w-full bg-black h-1 mt-2 overflow-hidden">
             <div className="h-full bg-accent" style={{ width: `${ep.importance * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TripleStream = () => (
  <div className="h-32 hud-panel p-2 flex flex-col">
    <div className="text-[10px] text-accent mb-1 px-1 flex justify-between">
      <span>RAW_TRIPLE_EXTRACTION_FEED</span>
      <span className="animate-pulse">● REC</span>
    </div>
    <div className="flex-1 bg-black/40 font-mono text-[10px] p-2 overflow-y-auto border inset-0 border-white/5">
      {MOCK_TRIPLES.map((t, i) => (
        <div key={i} className="flex gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <span className="text-muted w-16 text-right">[{t.time}]</span>
          <span className="text-accent-3">{t.sub}</span>
          <span className="text-white/50">--[</span>
          <span className="text-accent-2">{t.pred}</span>
          <span className="text-white/50">{"]-->"}</span>
          <span className="text-white">{t.obj}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */

export const MemoryPage = () => {
  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-hidden relative">
      {/* Background elements */}
      <div className="matrix-bg" />
      
      {/* Header */}
      <div className="flex-shrink-0 flex justify-between items-end border-b border-white/10 pb-2">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-widest uppercase flex items-center gap-2">
            Sovereign Memory Stack <span className="cursor-blink" />
          </h1>
          <div className="text-[10px] font-mono text-accent-3 tracking-widest mt-1">
            LOCAL_GRAPH_RAG // EPISODIC_STORE // ZERO_CLOUD
          </div>
        </div>
        
        {/* Sovereignty Score */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-muted">DATA SOVEREIGNTY</div>
            <div className="text-lg font-bold text-neon-green">100%</div>
          </div>
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--neon-green)" strokeWidth="4" strokeDasharray="100 100" />
          </svg>
        </div>
      </div>

      <SovereignStatus />

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* Left Col: Graph Visualizer */}
        <div className="flex-[2] flex flex-col gap-4">
          <MemoryGraph />
          <TripleStream />
        </div>

        {/* Right Col: Timeline & Search */}
        <div className="flex-1 flex flex-col gap-4">
          <EpisodicTimeline />
          
          <div className="h-40 hud-panel p-3 flex flex-col">
            <div className="text-[10px] text-muted mb-2 uppercase border-b border-white/10 pb-1 flex justify-between">
              <span>Hybrid Search</span>
              <span className="text-accent">VEC + FTS5</span>
            </div>
            <input 
              type="text" 
              placeholder="Query local graph..." 
              className="w-full bg-black/50 border border-white/20 text-white text-[11px] p-2 outline-none focus:border-accent font-mono mb-2"
            />
            <div className="flex-1 flex items-center justify-center text-[10px] text-white/30 italic">
              Awaiting query input...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
