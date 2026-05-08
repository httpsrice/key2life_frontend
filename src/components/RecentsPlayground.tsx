import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AsciiFlowStream, 
  AsciiCpu, 
  AsciiGlobe, 
  AsciiScanner, 
  AsciiSat,
  AsciiSpin,
  AsciiCore,
  AsciiSphere
} from "./AsciiAnimations";
import { ClusterParticleOrb } from "./ClusterParticleOrb";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";


/* ─── Shared Retro / HUD Components ─────────────────────────────── */

const Oscilloscope = ({ colorVar = "--accent", freq = 1, amp = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim() || "#ff00ff";
      ctx.lineWidth = 1.5;
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * 0.05 * freq + frame * 0.1) * 20 * amp + (Math.random() - 0.5) * 2;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      requestAnimationFrame(draw);
    };
    const anim = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(anim);
  }, [colorVar, freq, amp]);
  return <canvas ref={canvasRef} width={200} height={60} className="w-full h-full opacity-60" />;
};

const Radar = () => (
  <div className="relative w-full aspect-square max-w-[200px] mx-auto rounded-full border border-white/10 overflow-hidden flex items-center justify-center bg-black/40">
    <div className="absolute inset-0 border-[0.5px] border-white/5 rounded-full" style={{ margin: "25%" }} />
    <div className="absolute inset-0 border-[0.5px] border-white/5 rounded-full" style={{ margin: "50%" }} />
    <motion.div 
      className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent origin-center rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    />
    <div className="absolute w-1 h-1 bg-accent rounded-full shadow-[0_0_8px_var(--accent)]" style={{ top: "30%", left: "40%" }} />
    <div className="absolute w-1 h-1 bg-white/40 rounded-full" style={{ top: "60%", left: "70%" }} />
    <div className="text-[6px] font-mono opacity-40 absolute bottom-2">SCANNING_LOCAL_OPS</div>
  </div>
);








const HighResAsciiArt = ({ color = "var(--accent)", scale = 1, flashy = false }) => {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setFrame(f => (f + 1) % 4), flashy ? 100 : 200);
    return () => clearInterval(i);
  }, [flashy]);

  const frames = [
    `
    .____________________________________________________________________________________.
    |                                                                                    |
    |    ███████╗ █████╗ ███╗   ███╗               ██╗      ██╗███████╗███████╗        |
    |    ██╔════╝██╔══██╗████╗ ████║               ██║      ██║██╔════╝██╔════╝        |
    |    ███████╗███████║██╔████╔██║  ██████╗      ██║      ██║█████╗  █████╗          |
    |    ╚════██║██╔══██║██║╚██╔╝██║  ██╔══██╗     ██║      ██║██╔══╝  ██╔══╝          |
    |    ███████║██║  ██║██║ ╚═╝ ██║  ██████╔╝     ███████╗ ██║██║     ███████╗        |
    |    ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═════╝      ╚══════╝ ╚═╝╚═╝     ╚══════╝        |
    |                                                                                    |
    |    ██████╗ ██████╗ ██████╗ ██████╗           ███████╗██╗   ██╗███████╗           |
    |    ██╔══██╗██╔══██╗██╔══██╗██╔══██╗          ██╔════╝██║   ██║██╔════╝           |
    |    ██║  ██║██████╔╝██████╔╝██████╔╝          █████╗  ██║   ██║█████╗             |
    |    ██║  ██║██╔══██╗██╔═══╝ ██╔═══╝           ██╔══╝  ╚██╗ ██╔╝██╔══╝             |
    |    ██████╔╝██║  ██║██║     ██║               ███████╗ ╚████╔╝ ███████╗           |
    |    ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝               ╚══════╝  ╚═══╝  ╚══════╝           |
    |____________________________________________________________________________________|
    `,
    `
    .____________________________________________________________________________________.
    |                                                                                    |
    |    ███████╗ █████╗ ███╗   ███╗               ██╗      ██╗███████╗███████╗        |
    |    ██╔════╝██╔══██╗████╗ ████║               ██║      ██║██╔════╝██╔════╝        |
    |    ███████╗███████║██╔████╔██║  ██████╗      ██║      ██║█████╗  █████╗          |
    |    ╚════██║██╔══██║██║╚██╔╝██║  ██╔══██╗     ██║      ██║██╔══╝  ██╔══╝          |
    |    ███████║██║  ██║██║ ╚═╝ ██║  ██████╔╝     ███████╗ ██║██║     ███████╗        |
    |    ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═════╝      ╚══════╝ ╚═╝╚═╝     ╚══════╝        |
    |                                                                                    |
    |    ██████╗ ██████╗ ██████╗ ██████╗           ███████╗██╗   ██╗███████╗           |
    |    ██╔══██╗██╔══██╗██╔══██╗██╔══██╗          ██╔════╝██║   ██║██╔════╝           |
    |    ██║  ██║██████╔╝██████╔╝██████╔╝          █████╗  ██║   ██║█████╗             |
    |    ██║  ██║██╔══██╗██╔═══╝ ██╔═══╝           ██╔══╝  ╚██╗ ██╔╝██╔══╝             |
    |    ██████╔╝██║  ██║██║     ██║               ███████╗ ╚████╔╝ ███████╗           |
    |    ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝               ╚══════╝  ╚═══╝  ╚══════╝           |
    |____________________________________________________________________________________|
    `
  ];

  return (
    <div className="relative group">
      {flashy && (
        <div className="absolute inset-0 blur-[100px] opacity-10 group-hover:opacity-30 transition-opacity animate-pulse" 
             style={{ backgroundColor: color }} />
      )}
      <pre className="font-mono leading-none transition-all duration-500 relative z-10 select-none" 
           style={{ 
             color, 
             fontSize: `${4 * scale}px`, 
             textShadow: flashy ? `0 0 30px ${color}, 0 0 60px ${color}66` : `0 0 15px ${color}`,
             lineHeight: '1',
             filter: flashy ? 'contrast(1.2) brightness(1.2)' : 'none'
           }}>
        {frames[frame]}
      </pre>
    </div>
  );
};

const LiveLog = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messages = [
      "INIT_UPLINK_SEQUENCER...",
      "SHARD_SYNC_COMPLETED [0x42AF]",
      "NEURAL_LINK_ESTABLISHED",
      "MONITORING_ACTIVE_CHANNELS",
      "BIOMETRIC_DATA_STREAM_OK",
      "HEURISTIC_BUFFER_OVERFLOW_PREVENTED",
      "ROUTING_TO_STRATEGIC_VIEW",
      "CLEANING_CACHE_REGISTRY",
    ];
    const i = setInterval(() => {
      setLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${messages[Math.floor(Math.random() * messages.length)]}`]);
    }, 2000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto p-4 font-mono text-[9px] leading-relaxed bg-black/20">
      {logs.map((log, i) => (
        <div key={i} className="flex gap-2">
          <span className="opacity-30">#</span>
          <span className={log.includes("OK") || log.includes("COMPLETED") ? "text-neon-green" : "text-white/60"}>
            {log}
          </span>
        </div>
      ))}
    </div>
  );
};


/* ─── Widgets ───────────────────────────────────────────────────── */

const SignalConvergenceOrbit = ({ color = "var(--accent)" }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Orbit Path */}
        <circle cx="200" cy="200" r="140" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="10 20" className="opacity-20 animate-[spin_60s_linear_infinite]" />
        <circle cx="200" cy="200" r="100" fill="none" stroke={color} strokeWidth="1" strokeDasharray="5 15" className="opacity-10 animate-[spin_45s_linear_infinite_reverse]" />
        
        {/* Orbiting Packets */}
        {[0, 1, 2, 3].map((i) => (
          <motion.g
            key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "200px 200px" }}
          >
            <motion.circle 
              cx="200" 
              cy={200 - (100 + i * 20)} 
              r="3" 
              fill={color}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            />
            <motion.path 
              d={`M 200 ${200 - (100 + i * 20)} L 200 ${230 - (100 + i * 20)}`}
              stroke={color}
              strokeWidth="0.5"
              className="opacity-40"
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.g>
        ))}

        {/* Central Core Pulsing */}
        <motion.circle 
          cx="200" cy="200" r="40" 
          fill="none" 
          stroke={color} 
          strokeWidth="1"
          animate={{ r: [40, 45, 40], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.path
          d="M 170 200 L 230 200 M 200 170 L 200 230"
          stroke={color}
          strokeWidth="0.5"
          className="opacity-30"
        />
      </svg>
      
      {/* HUD Overlays */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-[10px] font-black tracking-[0.5em] opacity-40 uppercase mb-16">Convergence_Orbit</div>
        <div className="flex gap-12 mt-32">
          <div className="flex flex-col items-center">
             <span className="text-[7px] opacity-20 uppercase font-bold">Packets</span>
             <span className="text-[12px] font-black" style={{ color: "var(--neon-green)" }}>4,092</span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-[7px] opacity-20 uppercase font-bold">Velocity</span>
             <span className="text-[12px] font-black" style={{ color: "var(--accent-3)" }}>0.82c</span>
          </div>
        </div>
      </div>
    </div>
  );
};


const SensorFeed = ({ label, status }: { label: string; status: "ok" | "warn" | "fail" }) => (
  <div className="hud-panel p-3 flex items-center justify-between group hover:border-accent/40 transition-colors">
    <div className="flex flex-col gap-1">
      <span className="text-[7px] opacity-40 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`status-dot ${status}`} />
        <span className="text-[10px] font-bold uppercase" style={{ color: "var(--text-1)" }}>
          {status === "ok" ? "Nominal" : status === "warn" ? "Drift" : "Critical"}
        </span>
      </div>
    </div>
    <div className="w-12 h-6 opacity-20 group-hover:opacity-60 transition-opacity">
      <Oscilloscope colorVar={status === "ok" ? "--neon-green" : "--neon-amber"} freq={2} amp={0.3} />
    </div>
  </div>
);

const SysMetricsWidget = () => (
  <div className="flex flex-col gap-3">
    {[
      { label: "MEM_USAGE", val: 42, color: "var(--accent)" },
      { label: "DISK_IO", val: 18, color: "var(--accent-2)" },
      { label: "NET_LOAD", val: 64, color: "var(--accent-3)" },
    ].map(m => (
      <div key={m.label} className="flex flex-col gap-1">
        <div className="flex justify-between text-[7px] opacity-40">
          <span>{m.label}</span>
          <span>{m.val}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full" 
            style={{ background: m.color }}
            initial={{ width: 0 }}
            animate={{ width: `${m.val}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    ))}
  </div>
);

const ClockWidget = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return (
    <div className="hud-panel p-4 flex flex-col items-center justify-center text-center gap-1">
      <span className="text-[7px] opacity-40 uppercase tracking-[0.3em]">System Time</span>
      <span className="text-xl font-black tracking-tighter" style={{ fontFamily: "var(--font-hud)" }}>
        {t.toLocaleTimeString([], { hour12: false })}
      </span>
      <span className="text-[8px] opacity-40 font-mono">{t.toLocaleDateString()}</span>
    </div>
  );
};

const ThreatWidget = () => (
  <div className="hud-panel-neon p-4 flex flex-col items-center justify-center text-center gap-1 bg-black/40">
    <div className="text-[7px] opacity-40 uppercase tracking-widest">Threat Level</div>
    <div className="text-lg font-black" style={{ color: "var(--neon-amber)" }}>MINIMAL</div>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`w-2 h-1 rounded-sm ${i === 1 ? "bg-neon-amber" : "bg-white/10"}`} />
      ))}
    </div>
  </div>
);

const ShardTable = () => (
  <div className="flex-1 flex flex-col p-2 gap-1 overflow-hidden">
    {[
      { id: "A-42", type: "LOGIC", size: "12kb" },
      { id: "B-88", type: "VECT", size: "542kb" },
      { id: "C-12", type: "CORE", size: "2.1mb" },
      { id: "D-01", type: "SYNC", size: "8kb" },
    ].map(s => (
      <div key={s.id} className="flex justify-between p-2 rounded bg-white/5 border border-transparent hover:border-white/10 transition-colors text-[9px]">
        <span className="font-bold opacity-60">#{s.id}</span>
        <span className="opacity-40">{s.type}</span>
        <span style={{ color: "var(--accent)" }}>{s.size}</span>
      </div>
    ))}
  </div>
);

/* ─── Neural Link Monitor (Real Data) ─── */
const NeuralLinkStatus = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:8422/worldstate/raw");
        if (res.ok) {
          const json = await res.json();
          setData(json.state);
        }
      } catch (e) {
        console.warn("Neural Link Backend Offline");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    const i = setInterval(fetchStatus, 30000);
    return () => clearInterval(i);
  }, []);

  if (loading) return <div className="p-4 text-[8px] animate-pulse">CONNECTING_TO_BRAIN...</div>;
  if (!data) return (
    <div className="p-4 flex flex-col items-center gap-2 text-center">
      <div className="status-dot fail" />
      <span className="text-[9px] font-bold text-red-500">UPLINK_OFFLINE</span>
      <span className="text-[7px] opacity-40">Ensure SAM-OS backend is running on 8422</span>
    </div>
  );

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[7px] opacity-40 uppercase">Tick_ID</span>
          <span className="text-[10px] font-mono font-bold tracking-tight">{data.tick_id?.slice(0,12)}...</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[7px] opacity-40 uppercase">Confidence</span>
          <span className="text-[10px] font-mono font-bold" style={{ color: "var(--neon-green)" }}>
            {(data.confidence * 100).toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-white/5 rounded border border-white/5">
          <div className="text-[6px] opacity-40 uppercase">Weather</div>
          <div className="text-[10px] font-bold" style={{ color: "var(--accent-3)" }}>{data.environmental?.meteo_vibe || "UNKNOWN"}</div>
        </div>
        <div className="p-2 bg-white/5 rounded border border-white/5">
          <div className="text-[6px] opacity-40 uppercase">Biological</div>
          <div className="text-[10px] font-bold" style={{ color: "var(--accent-2)" }}>{data.personal?.biological_load || "NOMINAL"}</div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[7px] opacity-40">
           <span>HRV_RECOVERY</span>
           <span>{data.personal?.hrv_rmssd?.toFixed(1) || "42.0"} ms</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (data.personal?.hrv_rmssd || 42) / 0.8)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const TrendMonitor = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:8422/worldstate/history?limit=12");
        if (res.ok) {
          const json = await res.json();
          setHistory(json.history.map((h: any, i: number) => ({
            time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            hrv: h.hrv_rmssd,
            conf: h.confidence * 100,
            index: i
          })));
        }
      } catch (e) {}
    };
    fetchHistory();
  }, []);

  return (
    <div className="h-full w-full p-2" style={{ minHeight: 120 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history.length > 0 ? history : [
          { time: "08:00", hrv: 45, conf: 85 },
          { time: "10:00", hrv: 52, conf: 88 },
          { time: "12:00", hrv: 48, conf: 92 },
          { time: "14:00", hrv: 55, conf: 90 },
        ]}>
          <defs>
            <linearGradient id="colorHrv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', fontSize: '8px', color: 'var(--text-1)' }}
            itemStyle={{ color: 'var(--accent)' }}
          />
          <Area type="monotone" dataKey="hrv" stroke="var(--accent)" fillOpacity={1} fill="url(#colorHrv)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};


/* ─── Neural connectivity Heatmap ─── */
const NeuralHeatmap = () => {
  const [grid, setGrid] = useState(Array.from({ length: 144 }, () => Math.random()));
  useEffect(() => {
    const i = setInterval(() => {
      setGrid(prev => prev.map(v => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * 0.2))));
    }, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="grid grid-cols-12 gap-1 p-2 bg-black/20 rounded-lg">
      {grid.map((v, i) => (
        <motion.div 
          key={i}
          className="aspect-square rounded-sm"
          style={{ 
            backgroundColor: "var(--accent)",
            opacity: 0.1 + v * 0.9,
            boxShadow: v > 0.8 ? "0 0 8px var(--accent)" : "none"
          }}
          animate={{ scale: v > 0.9 ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.5 }}
        />
      ))}
    </div>
  );
};

/* ─── Neural Pulse Transmitter (Interactive) ─── */
const PulseTransmitter = () => {
  const [sending, setSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const sendPulse = async () => {
    setSending(true);
    try {
      // Simulate/Trigger backend pulse
      const res = await fetch("http://localhost:8422/pulse", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLastResponse(data.status || "PULSE_ACK");
      } else {
        setLastResponse("PULSE_FAILED");
      }
    } catch (e) {
      setLastResponse("BACKEND_OFFLINE");
    }
    setTimeout(() => {
      setSending(false);
      setTimeout(() => setLastResponse(null), 3000);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <button 
        onClick={sendPulse}
        disabled={sending}
        className={`group relative py-3 px-6 border-2 transition-all overflow-hidden ${sending ? "border-accent-2" : "border-accent hover:border-accent-2"}`}
        style={{ fontFamily: "var(--font-hud)" }}
      >
        <AnimatePresence>
          {sending && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 4, opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-accent rounded-full pointer-events-none"
            />
          )}
        </AnimatePresence>
        <span className={`relative z-10 text-[10px] font-black tracking-widest ${sending ? "text-accent-2" : "text-accent group-hover:text-accent-2"}`}>
          {sending ? "TRANSMITTING..." : "▶ EMIT_NEURAL_PULSE"}
        </span>
      </button>
      
      {lastResponse && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-[8px] font-mono opacity-60"
          style={{ color: lastResponse.includes("FAILED") || lastResponse.includes("OFFLINE") ? "var(--neon-red)" : "var(--neon-green)" }}
        >
          {lastResponse}
        </motion.div>
      )}
    </div>
  );
};
/* ─── Panel wrapper ─────────────────────────────────────────────── */
const Panel = ({
  title, tag, children, className = "", neon = false, initialCollapsed = false,
}: {
  title: string; tag?: string; children: React.ReactNode; className?: string; neon?: boolean; initialCollapsed?: boolean;
}) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  return (
    <div className={`${neon ? "hud-panel-neon" : "hud-panel"} flex flex-col overflow-hidden transition-all duration-300 ${className} ${collapsed ? "h-[28px]" : ""}`}>
      <div 
        className="win-title-bar justify-between flex-shrink-0 cursor-pointer hover:opacity-80"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px]" style={{ color: "var(--accent)" }}>{collapsed ? "▶" : "▼"}</span>
          <span style={{ fontFamily: "var(--font-hud)" }}>{title}</span>
        </div>
        {tag && <span className="opacity-60 text-[7px] font-normal tracking-normal">{tag}</span>}
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AsciiCard = ({ title, art, color }: { title: string; art: string; color: string }) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -2 }}
    className="hud-panel p-4 flex flex-col gap-3 cursor-pointer border-white/5 hover:border-accent/40 transition-all"
  >
    <div className="text-[7px] uppercase tracking-widest opacity-40 font-bold">{title}</div>
    <pre className="text-[7px] leading-none text-center py-2" style={{ color, textShadow: `0 0 8px ${color}88` }}>
      {art}
    </pre>
  </motion.div>
);

/* ─── MAIN EXPORT ───────────────────────────────────────────────── */
export const RecentsPlayground: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<"tactical" | "deep">("tactical");

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-full w-full overflow-auto" style={{ background: "var(--bg)" }}>
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-2 border-b backdrop-blur-xl shadow-lg"
           style={{ background: "var(--surface-alt)", borderColor: "var(--border)", fontFamily: "var(--font-hud)" }}>
        <div className="flex items-center gap-2">
          <div className="status-dot ok shadow-[0_0_10px_var(--neon-green)]" />
          <span className="font-bold tracking-widest" style={{ color: "var(--accent)" }}>SAM-OS :: STRATEGIC_MONITOR</span>
        </div>
        <div className="h-4 w-px bg-white/10 mx-2" />
        <span className="text-[7px] opacity-40 uppercase">Sector 7G // Uplink Active</span>
        
        <div className="ml-auto flex items-center gap-6">
          {/* View Selector */}
          <div className="flex bg-black/40 p-0.5 rounded border border-white/10 overflow-hidden">
            {["tactical", "deep"].map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m as any)}
                className={`px-3 py-1 text-[8px] font-bold uppercase transition-all relative ${viewMode === m ? "text-black" : "opacity-40 hover:opacity-100"}`}
              >
                {viewMode === m && (
                  <motion.div 
                    layoutId="view-tab"
                    className="absolute inset-0 bg-accent"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{m}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <AnimatePresence mode="wait">
        {viewMode === "tactical" ? (
          <motion.div 
            key="tactical"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-6 grid grid-cols-1 lg:grid-cols-6 gap-6"
          >
            <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4">
              <div className="relative rounded-2xl overflow-hidden border transition-all duration-500"
                   style={{ minHeight: 450, background: "var(--term-bg)", borderColor: "var(--accent)", boxShadow: "0 0 40px var(--accent-glow)" }}>
                <ClusterParticleOrb opacity={1} terrain={true} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute top-4 left-6 z-10 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <AsciiSat color="var(--accent)" fps={1} className="scale-75 origin-left" />
                    <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: "var(--accent)" }}>NEURAL.CORE_ACTIVE</span>
                  </div>
                  <span className="text-[7px] opacity-40 font-mono">UPLINK_STABLE // 51.2 TB/s</span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                   <HighResAsciiArt color="var(--accent)" scale={3} flashy />
                </div>

                <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-end">
                  <div className="flex gap-6">
                    <div className="flex flex-col">
                      <span className="text-[7px] opacity-40 uppercase">Integrity</span>
                      <span className="text-sm font-bold font-mono" style={{ color: "var(--neon-green)" }}>99.98%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] opacity-40 uppercase">Sync_Rate</span>
                      <span className="text-sm font-bold font-mono" style={{ color: "var(--accent-3)" }}>4.2ms</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[7px] opacity-40 uppercase mb-2">SCAN_PROGRESS</span>
                     <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-accent"
                          animate={{ width: ["10%", "90%", "40%", "70%"] }}
                          transition={{ duration: 10, repeat: Infinity }}
                        />
                     </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SensorFeed label="THERMAL_S" status="ok" />
                <SensorFeed label="EM_FREQ_S" status="warn" />
              </div>
            </div>

            {/* ══ Tactical Info Section ══ */}
            <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Panel title="NEURAL_UPLINK" tag="REAL_TIME" className="h-[300px]">
                   <NeuralLinkStatus />
                   <div className="flex-1 border-t border-white/5 pt-2">
                      <div className="px-4 text-[7px] opacity-40 uppercase mb-2">BIOMETRIC_TREND_24H</div>
                      <TrendMonitor />
                   </div>
                </Panel>
                <Panel title="SYSTEM_STATS" className="flex-1 h-[300px]">
                  <div className="p-4 flex flex-col gap-4 h-full">
                     <div className="flex justify-between items-center">
                       <span className="text-[8px] opacity-60 uppercase font-bold">CPU_Load</span>
                       <AsciiCpu color="var(--accent-2)" />
                     </div>
                     <div className="h-px bg-white/5" />
                     <div className="flex justify-between items-center">
                       <span className="text-[8px] opacity-60 uppercase font-bold">Flow_Rate</span>
                       <AsciiFlowStream color="var(--accent-3)" />
                     </div>
                     <div className="flex-1">
                        <SysMetricsWidget />
                     </div>
                  </div>
                </Panel>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                <Panel title="LIVE_TERMINAL" tag="STDOUT" className="md:col-span-3 min-h-[320px]">
                  <LiveLog />
                </Panel>
                <Panel title="NEURAL_HEATMAP" tag="LIVE_STREAM" className="lg:col-span-2 min-h-[180px]">
                  <NeuralHeatmap />
                </Panel>
                <Panel title="PULSE_STATION" tag="INTERACTIVE" className="lg:col-span-2">
                  <PulseTransmitter />
                </Panel>
                <Panel title="NETWORK_SHARDS" className="lg:col-span-2 min-h-[180px]">
                  <ShardTable />
                </Panel>
              </div>
            </div>

            {/* ══ Bottom Utility Bar ══ */}
            <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <ClockWidget />
              <ThreatWidget />
              <Panel title="GLOBAL_SCAN" className="md:col-span-2 h-40">
                 <div className="flex items-center justify-around h-full p-4">
                    <div className="flex flex-col items-center gap-2">
                      <AsciiGlobe color="var(--accent)" />
                      <span className="text-[7px] opacity-40">GEO_LOC_01</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <AsciiScanner color="var(--accent-3)" />
                      <span className="text-[7px] opacity-40">SCANNING...</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Radar />
                    </div>
                 </div>
               </Panel>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="deep"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center p-8 gap-24 min-h-[calc(100vh-60px)]"
          >
            <div className="relative flex flex-col items-center gap-12 w-full max-w-4xl">
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-[0_0_100px_var(--accent-glow)] flex items-center justify-center">
                 <div className="absolute inset-0 opacity-10">
                    <ClusterParticleOrb opacity={0.5} terrain={false} />
                 </div>
                 <HighResAsciiArt color="var(--accent)" scale={8} flashy />
                 
                 <div className="absolute top-8 left-8">
                    <div className="text-4xl font-black tracking-[1em] opacity-20" style={{ color: "var(--accent)" }}>DEEP_CORE</div>
                 </div>
                 
                 <div className="absolute bottom-8 right-8 text-right">
                    <div className="text-[10px] font-mono opacity-40 tracking-[0.5em] uppercase">Grounding Protocol :: ACTIVE_LINK</div>
                    <div className="text-2xl font-black mt-2" style={{ color: "var(--neon-green)" }}>0x7F_READY</div>
                 </div>
              </div>

              <div className="flex gap-24 items-center">
                <div className="flex flex-col items-center gap-4">
                  <AsciiCore color="var(--accent-2)" className="scale-150" />
                  <span className="text-[8px] opacity-40 font-mono tracking-widest uppercase">Neural_Core_01</span>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <AsciiSphere color="var(--accent)" className="scale-150" />
                  <span className="text-[8px] opacity-40 font-mono tracking-widest uppercase">Global_Sphere</span>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <AsciiCore color="var(--accent-3)" className="scale-150" />
                  <span className="text-[8px] opacity-40 font-mono tracking-widest uppercase">Neural_Core_02</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full max-w-7xl">
              <Panel title="NEURAL_TOPOLOGY" neon className="aspect-square">
                <div className="flex-1 flex items-center justify-center p-8">
                   <AsciiFlowStream color="var(--accent-2)" className="scale-[2.5]" />
                </div>
              </Panel>
              <Panel title="CONVERGENCE_ORBIT" neon className="md:col-span-2 aspect-[2/1] md:aspect-auto">
                <SignalConvergenceOrbit color="var(--accent)" />
              </Panel>
              <Panel title="GEO_POSITIONING" neon className="aspect-square">
                <div className="flex-1 flex items-center justify-center p-8">
                   <AsciiSat color="var(--accent-3)" className="scale-[3]" fps={4} />
                </div>
              </Panel>
            </div>

            <div className="hud-panel p-8 w-full max-w-5xl">
               <div className="text-[10px] font-bold mb-6 flex items-center gap-4">
                  <div className="status-dot ok animate-ping" />
                  <span className="tracking-[0.5em]">SUBSURFACE_SIGNAL_STREAM</span>
               </div>
               <div className="h-32 opacity-60">
                  <Oscilloscope colorVar="--accent" freq={0.5} amp={1.5} />
               </div>
               <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-[8px] font-mono">
                  {Array.from({length: 12}).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 group cursor-crosshair">
                      <span className="opacity-20 group-hover:opacity-100 transition-opacity">{" >> "}</span>
                      <span className="opacity-40 group-hover:opacity-100 transition-opacity">SIGNAL_CHUNK_{i.toString().padStart(2, '0')}</span>
                      <span style={{ color: "var(--neon-green)" }}>[OK]</span>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
