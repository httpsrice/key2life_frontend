import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ─── Base Collapsible Widget ──────────────────────────────────── */
const CollapsibleWidget = ({ title, children, width = "w-48", color="var(--accent-2)" }: { title: string, children: React.ReactNode, width?: string, color?: string }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`glass-panel neon-backlight p-3 ${width} flex flex-col rounded-lg overflow-hidden transition-all duration-300`}>
      <div 
        className="flex justify-between items-center cursor-pointer hover:bg-white/5 p-1 -mx-1 rounded transition-colors select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <motion.div 
            animate={{ rotate: isOpen ? 0 : -90 }}
            className="text-[8px] opacity-60"
            style={{ color }}
          >
            ▼
          </motion.div>
          <div className="text-[8px] font-bold uppercase tracking-[0.25em]"
               style={{ color, fontFamily: "var(--font-hud)" }}>
            {title}
          </div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 12 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Clock Widget ─────────────────────────────────────────────── */
export const ClockWidget: React.FC = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);

  const hh = String(t.getHours()).padStart(2, "0");
  const mm = String(t.getMinutes()).padStart(2, "0");
  const ss = String(t.getSeconds()).padStart(2, "0");
  const day = t.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <CollapsibleWidget title="SYS_TIME.CLK" color="var(--accent)">
      <div className="font-display text-3xl font-black tracking-tight"
           style={{ color: "var(--accent)", textShadow: "0 0 20px var(--accent)", fontFamily: "var(--font-display)" }}>
        {hh}:{mm}
        <span className="text-lg opacity-50">:{ss}</span>
      </div>
      <div className="text-[10px] mt-1 opacity-50"
           style={{ color: "var(--text-2)", fontFamily: "var(--font-hud)" }}>
        {day.toUpperCase()}
      </div>
      {/* Progress arc representing seconds */}
      <div className="mt-2 h-0.5 rounded-full overflow-hidden"
           style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full transition-all duration-1000"
             style={{ width: `${(t.getSeconds() / 60) * 100}%`, background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }} />
      </div>
    </CollapsibleWidget>
  );
};

/* ─── Neural Status Widget ─────────────────────────────────────── */
export const NeuralStatusWidget: React.FC = () => {
  const [synapses, setSynapses] = useState(71);

  useEffect(() => {
    const i = setInterval(() => {
      setSynapses(prev => Math.max(55, Math.min(99, prev + (Math.random() - 0.48) * 3)));
    }, 200);
    return () => clearInterval(i);
  }, []);

  const color = synapses > 80 ? "var(--accent)" : synapses > 65 ? "var(--accent-2)" : "var(--text-1)";

  return (
    <CollapsibleWidget title="NEURAL.NODE" color="var(--accent-2)">
      {/* ASCII brain-like display */}
      <div className="text-[8px] leading-[1.2] my-1 opacity-80"
           style={{ color: color, fontFamily: "var(--font-hud)" }}>
        {["┌─◈─┬─◉─┐", "│ SAM-OS  │", "╞══ AI ══╡", "│ ACTIVE  │", "└─────────┘"]
          .map((row, i) => (
            <div key={i} style={{ opacity: 0.6 + (i === 2 ? 0.4 : 0), fontWeight: i === 2 ? "bold" : "normal" }}>
              {row}
            </div>
          ))}
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px]"
           style={{ fontFamily: "var(--font-hud)" }}>
        <span style={{ color: "var(--text-muted)" }}>SYNAPSE</span>
        <span style={{ color }}>{synapses.toFixed(0)}%</span>
      </div>
      <div className="h-0.5 mt-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full transition-all duration-200"
             style={{ width: `${synapses}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
    </CollapsibleWidget>
  );
};

/* ─── System Metrics Widget ─────────────────────────────────────── */
export const SysMetricsWidget: React.FC = () => {
  const [cpu, setCpu] = useState(44);
  const [mem, setMem] = useState(67);
  const [net, setNet] = useState(280);

  useEffect(() => {
    const i = setInterval(() => {
      setCpu(p => Math.max(10, Math.min(95, p + (Math.random() - 0.47) * 8)));
      setMem(p => Math.max(40, Math.min(90, p + (Math.random() - 0.5) * 4)));
      setNet(p => Math.max(20, Math.min(980, p + (Math.random() - 0.5) * 60)));
    }, 800);
    return () => clearInterval(i);
  }, []);

  const MiniBar = ({ val, max, color }: { val: number; max: number; color: string }) => (
    <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
      <div className="h-full rounded-full transition-all duration-700"
           style={{ width: `${(val / max) * 100}%`, background: color, boxShadow: `0 0 4px ${color}` }} />
    </div>
  );

  const cpuColor = cpu > 80 ? "var(--text-1)" : cpu > 60 ? "var(--accent-2)" : "var(--accent)";

  return (
    <CollapsibleWidget title="SYS_METRICS" color="var(--accent-3)">
      <div className="space-y-2">
        {[
          { label: "CPU", val: cpu, max: 100, unit: "%", color: cpuColor },
          { label: "MEM", val: mem, max: 100, unit: "%", color: "var(--accent)" },
          { label: "NET", val: net, max: 1000, unit: "M", color: "var(--accent-2)" },
        ].map(r => (
          <div key={r.label}>
            <div className="flex justify-between text-[9px] mb-0.5"
                 style={{ fontFamily: "var(--font-hud)" }}>
              <span style={{ color: "var(--text-muted)" }}>{r.label}</span>
              <span style={{ color: r.color }}>{r.val.toFixed(0)}{r.unit}</span>
            </div>
            <MiniBar val={r.val} max={r.max} color={r.color} />
          </div>
        ))}
      </div>
    </CollapsibleWidget>
  );
};

/* ─── Threat Intel Widget ───────────────────────────────────────── */
export const ThreatWidget: React.FC = () => {
  const events = [
    { ts: "14:39:02", msg: "SCAN ATTEMPT — BLOCKED", lvl: "warn" },
    { ts: "14:38:44", msg: "AUTH TOKEN RENEWED",      lvl: "ok"   },
    { ts: "14:38:11", msg: "FEED 560 BREACH DETECT",  lvl: "alert"},
    { ts: "14:37:55", msg: "CACHE FLUSHED OK",        lvl: "ok"   },
  ];

  const col = { ok: "var(--accent-2)", warn: "var(--accent)", alert: "var(--text-1)" } as const;

  return (
    <CollapsibleWidget title="THREAT.INTEL" width="w-52" color="var(--text-1)">
      <div className="space-y-1.5">
        {events.map((e, i) => (
          <div key={i} className="flex gap-2 text-[8px]"
               style={{ fontFamily: "var(--font-hud)", color: col[e.lvl as keyof typeof col] }}>
            <span className="opacity-40 flex-shrink-0">{e.ts}</span>
            <span className="opacity-80 truncate">{e.msg}</span>
          </div>
        ))}
      </div>
    </CollapsibleWidget>
  );
};

/* ─── ASCII Animation Player ─────────────────────────────────────── */
const AsciiPlayer = ({ frames, fps = 4, color = "var(--accent)" }: { frames: string[][], fps?: number, color?: string }) => {
  const [frameIdx, setFrameIdx] = useState(0);
  
  useEffect(() => {
    const i = setInterval(() => setFrameIdx(f => (f + 1) % frames.length), 1000 / fps);
    return () => clearInterval(i);
  }, [frames, fps]);

  return (
    <pre className="text-[9px] leading-[1.1] select-none text-center flex justify-center"
         style={{ fontFamily: "var(--font-hud)", color, textShadow: `0 0 8px ${color}88` }}>
      {frames[frameIdx].join("\n")}
    </pre>
  );
};

/* ─── ASCII Art Widget ──────────────────────────────────────────── */
export const AsciiArtWidget: React.FC = () => {
  // Simple rotating radar/satellite dish animation
  const radarFrames = [
    [
      "   . * .   ",
      " *   /   * ",
      "   . * .   "
    ],
    [
      "   . * .   ",
      " *   -   * ",
      "   . * .   "
    ],
    [
      "   . * .   ",
      " *   \\   * ",
      "   . * .   "
    ],
    [
      "   . * .   ",
      " *   |   * ",
      "   . * .   "
    ]
  ];

  const dnaFrames = [
    [
      "  \\  /  ",
      "  -||-  ",
      "  /  \\  ",
      " /    \\ ",
      " \\    / ",
      "  \\  /  ",
      "  -||-  "
    ],
    [
      "   ||   ",
      "  /  \\  ",
      " /    \\ ",
      " \\    / ",
      "  \\  /  ",
      "  -||-  ",
      "  /  \\  "
    ],
    [
      "  /  \\  ",
      " /    \\ ",
      " \\    / ",
      "  \\  /  ",
      "  -||-  ",
      "  /  \\  ",
      " /    \\ "
    ],
    [
      " /    \\ ",
      " \\    / ",
      "  \\  /  ",
      "  -||-  ",
      "  /  \\  ",
      " /    \\ ",
      " \\    / "
    ],
    [
      " \\    / ",
      "  \\  /  ",
      "  -||-  ",
      "  /  \\  ",
      " /    \\ ",
      " \\    / ",
      "  \\  /  "
    ]
  ];

  const waveFrames = [
    [
      "  _.-'-._  ",
      " '-._.-'-. ",
      " ._.-'-._. "
    ],
    [
      " '-._.-'-. ",
      " ._.-'-._. ",
      "  _.-'-._  "
    ],
    [
      " ._.-'-._. ",
      "  _.-'-._  ",
      " '-._.-'-. "
    ]
  ];

  return (
    <CollapsibleWidget title="SYS.ASCII_LINK" color="var(--accent-2)">
      <div className="flex gap-3 justify-between items-center mb-2">
        <div className="flex flex-col items-center gap-1">
          <AsciiPlayer frames={radarFrames} fps={6} color="var(--accent)" />
          <span className="text-[6px] opacity-40 font-mono" style={{ color: "var(--accent)" }}>RADAR.01</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <AsciiPlayer frames={dnaFrames} fps={8} color="var(--text-1)" />
          <span className="text-[6px] opacity-40 font-mono" style={{ color: "var(--text-1)" }}>DNA_SEQ</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <AsciiPlayer frames={waveFrames} fps={4} color="var(--accent-2)" />
          <span className="text-[6px] opacity-40 font-mono" style={{ color: "var(--accent-2)" }}>FREQ.WV</span>
        </div>
      </div>
      <div className="mt-2 text-center text-[7px] uppercase tracking-widest opacity-50" style={{ color: "var(--text-2)", fontFamily: "var(--font-hud)" }}>
        Visual Link Active
      </div>
    </CollapsibleWidget>
  );
};

/* ─── View Changer Widget ───────────────────────────────────────── */
export const ViewChangerWidget: React.FC = () => {
  const currentHash = window.location.hash || "#landing";
  
  const views = [
    { id: "#chat", label: "Neural_Chat", icon: "◈" },
    { id: "#monitor", label: "Sys_Monitor", icon: "▣" },
    { id: "#settings", label: "Core_Config", icon: "⚙" },
  ];

  const navigate = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <CollapsibleWidget title="GLOBAL_NAV" color="var(--accent-3)">
      <div className="flex flex-col gap-1.5">
        {views.map(v => (
          <button
            key={v.id}
            onClick={() => navigate(v.id)}
            className={`flex items-center justify-between px-2 py-1.5 rounded text-[9px] font-mono uppercase tracking-wider transition-all
              ${currentHash === v.id 
                ? "bg-accent/20 text-accent border border-accent/30 shadow-[0_0_10px_rgba(244,143,177,0.2)]" 
                : "text-text-muted hover:text-text-1 hover:bg-white/5 border border-transparent"}`}
          >
            <span>{v.icon} {v.label}</span>
            {currentHash === v.id && (
              <motion.div 
                layoutId="nav-indicator"
                className="w-1 h-1 rounded-full bg-accent animate-pulse" 
              />
            )}
          </button>
        ))}
      </div>
    </CollapsibleWidget>
  );
};

/* ─── Widget Layer — positioned overlay ──────────────────────────── */
interface WidgetLayerProps { visible?: boolean; isLanding?: boolean; }

export const WidgetLayer: React.FC<WidgetLayerProps> = ({ visible = true, isLanding = false }) => {
  if (!visible) return null;
  
  const scale = isLanding ? 1.25 : 1;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* Top-right cluster */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute top-8 right-8 flex flex-col gap-4 pointer-events-auto"
        style={{ transform: `scale(${scale})`, transformOrigin: "top right" }}
      >
        <ClockWidget />
        <NeuralStatusWidget />
      </motion.div>

      {/* Bottom-right cluster (Replaces center-right to keep core clear) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-8 right-8 flex flex-col gap-4 pointer-events-auto"
        style={{ transform: `scale(${scale})`, transformOrigin: "bottom right" }}
      >
        <ThreatWidget />
        <ViewChangerWidget />
        <AsciiArtWidget />
      </motion.div>

      {/* Top-left HUD elements (Relocated from bottom-left to avoid intertwining) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="absolute top-8 left-8 flex flex-col gap-4 pointer-events-auto"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <SysMetricsWidget />
        
        {/* Additional decorative element */}
        <div className="widget-card p-3 w-48 bg-black/40 backdrop-blur-md border border-white/5">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[7px] font-mono opacity-50 uppercase">Subsurface_Stream</span>
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
           </div>
           <div className="h-8 flex items-end gap-1 px-1">
              {Array.from({length: 12}).map((_, i) => (
                <motion.div 
                  key={i}
                  className="flex-1 bg-accent-3/40 rounded-t-sm"
                  animate={{ height: `${20 + Math.random() * 80}%` }}
                  transition={{ repeat: Infinity, duration: 0.5 + Math.random(), repeatType: "reverse" }}
                />
              ))}
           </div>
        </div>
      </motion.div>
    </div>
  );
};
