import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClusterParticleOrb } from "./ClusterParticleOrb";
import { MatrixRain } from "./MatrixRain";
import { WidgetLayer } from "./Widgets";
import { AsciiGallery, CURATED_ARTWORKS } from "./AsciiEngine";

/* ─── Boot sequence lines ─────────────────────────────────────── */
const BOOT_SEQUENCE = [
  { delay: 0,    text: "SAM-OS v1.0.42 NEURAL KERNEL INITIALIZING...",       color: "var(--accent)" },
  { delay: 300,  text: "[BIOS] POST check OK — memory 32GB / 32GB detected", color: "var(--text-2)" },
  { delay: 700,  text: "[INIT] Mounting grounding layer... DONE",             color: "var(--neon-green)" },
  { delay: 1100, text: "[INIT] Loading multimodal perception stack...",       color: "var(--text-2)" },
  { delay: 1500, text: "[INIT] Syncing long-term memory nodes: 1,247 loaded", color: "var(--neon-green)" },
  { delay: 1900, text: "[WARN] ZeroClaw offline — fallback active",           color: "var(--neon-amber)" },
  { delay: 2300, text: "[INIT] Gemini 2.0 Flash endpoint: CONNECTED",        color: "var(--neon-green)" },
  { delay: 2700, text: "[INIT] Activating encryption protocols (AES-256)...", color: "var(--text-2)" },
  { delay: 3100, text: "[INIT] Neural interface calibration: 94.2% accuracy", color: "var(--neon-green)" },
  { delay: 3500, text: "[BOOT] All systems nominal — awaiting operator...",  color: "var(--accent)" },
  { delay: 4000, text: "▶  PRESS ENTER OR CLICK TO INITIALIZE",              color: "var(--accent-2)" },
];

/* ─── Hex corner decoration ───────────────────────────────────── */
const Corner = ({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) => {
  const map = {
    tl: "top-3 left-3",
    tr: "top-3 right-3",
    bl: "bottom-3 left-3",
    br: "bottom-3 right-3",
  };
  const flip = pos.includes("r") ? "scaleX(-1)" : "none";
  const vFlip = pos.includes("b") ? "scaleY(-1)" : "none";
  return (
    <div className={`absolute ${map[pos]} pointer-events-none`}
         style={{ transform: `${flip} ${vFlip}`, transformOrigin: "center" }}>
      <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
        <path d="M0 0 H20 V4 H4 V20 H0 Z" fill="var(--accent)" opacity="0.8" />
        <path d="M8 8 H14 V14 H8 Z" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.5" />
      </svg>
    </div>
  );
};

/* ─── Scan line animation ─────────────────────────────────────── */
const ScanBeam: React.FC = () => (
  <motion.div
    className="absolute left-0 right-0 h-px pointer-events-none z-20"
    style={{
      background: "linear-gradient(90deg, transparent, var(--accent), var(--accent-2), var(--accent), transparent)",
      boxShadow: "0 0 12px var(--accent)",
    }}
    animate={{ top: ["5%", "95%", "5%"] }}
    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
  />
);

/* ─── LANDING PAGE ────────────────────────────────────────────── */
interface Props { onEnter: () => void; }

export const LandingPage: React.FC<Props> = ({ onEnter }) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);

  /* Progress bar tied to boot sequence */
  const progress = Math.min(100, Math.round((visibleLines / (BOOT_SEQUENCE.length - 1)) * 100));

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    BOOT_SEQUENCE.forEach((line, i) => {
      timers.push(setTimeout(() => {
        setVisibleLines(i + 1);
        if (i === BOOT_SEQUENCE.length - 1) setReady(true);
      }, line.delay));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleEnter = useCallback(() => {
    if (!ready) return;
    setEntered(true);
    setTimeout(onEnter, 600);
  }, [ready, onEnter]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleEnter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleEnter]);

  return (
    <AnimatePresence>
      {!entered ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-full overflow-hidden flex flex-col"
          style={{ background: "var(--bg)" }}
          onClick={handleEnter}
        >
          {/* ── Background layers ── */}
          <MatrixRain opacity={0.18} speed={0.7} density={0.5} />
          {/* ── Global Background Layers ── */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <ClusterParticleOrb opacity={0.6} terrain />
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, var(--accent-glow) 0%, transparent 70%)`
            }} />
            {/* Scanlines / Neural Fabric */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
              backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))`,
              backgroundSize: "100% 2px, 3px 100%"
            }} />
          </div>

          <div className="relative z-10 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            {/* Content Container */}
            <div className="max-w-[1800px] mx-auto w-full px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column: Core HUD (7/12) */}
              <div className="lg:col-span-7 flex flex-col gap-10">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-[2px] bg-accent" />
                    <span className="text-[10px] font-bold tracking-[0.8em] text-accent-2 uppercase">System_Initialize</span>
                  </div>
                  <h1 className="text-7xl lg:text-9xl font-black tracking-tighter text-white leading-[0.85] drop-shadow-2xl">
                    SAM<span className="text-accent">_</span>OS<br/>
                    <span className="text-4xl lg:text-5xl opacity-40 font-light tracking-widest uppercase">Proprioceptive_V1</span>
                  </h1>
                </motion.div>

                {/* Status Pills */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-6 p-4 win-border bg-white/5 backdrop-blur-md"
                >
                   <div className="flex flex-col px-4">
                      <span className="text-[8px] opacity-40 uppercase tracking-widest">Grounding</span>
                      <span className="text-sm font-bold text-neon-green">STABLE</span>
                   </div>
                   <div className="w-px h-10 bg-white/10" />
                   <div className="flex flex-col px-4">
                      <span className="text-[8px] opacity-40 uppercase tracking-widest">Model_Core</span>
                      <span className="text-sm font-bold text-accent-2">GEMINI_2.0</span>
                   </div>
                   <div className="w-px h-10 bg-white/10" />
                   <div className="flex flex-col px-4">
                      <span className="text-[8px] opacity-40 uppercase tracking-widest">Latency</span>
                      <span className="text-sm font-bold text-accent-3">14MS</span>
                   </div>
                </motion.div>

                {/* Boot terminal - Shifted & Scaled */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full max-w-3xl"
                >
                  <div className="win-border" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)" }}>
                    <div className="win-title-bar justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                         <span className="text-[10px] font-bold tracking-widest">SAM_KERNEL_v0.3.0.LOG</span>
                      </div>
                      <span className="opacity-50 text-[8px]">ROOT_INIT</span>
                    </div>

                    <div className="p-6 space-y-2 min-h-[320px] font-mono text-[11px] overflow-hidden">
                      {BOOT_SEQUENCE.slice(0, visibleLines).map((line, i) => (
                        <div key={i} className="flex gap-4">
                          <span className="opacity-20 text-[9px] w-6">{i}</span>
                          <span style={{ color: line.color }}>{line.text}</span>
                        </div>
                      ))}
                      {visibleLines < BOOT_SEQUENCE.length && <div className="cursor-blink" />}
                    </div>

                    <div className="px-6 pb-6">
                      <div className="h-1 bg-white/5 w-full mb-2">
                        <motion.div 
                          className="h-full bg-accent shadow-[0_0_15px_var(--accent)]"
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] opacity-40 tracking-widest">
                        <span>SYS_ALLOCATION</span>
                        <span>{progress}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Action Area */}
                <AnimatePresence>
                  {ready && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-8 mt-4"
                    >
                      <button
                        onClick={handleEnter}
                        className="group relative px-20 py-6 text-xl font-black tracking-[0.4em] uppercase border-2 transition-all"
                        style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                      >
                        <div className="absolute inset-0 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                        <span className="relative z-10 group-hover:text-black">▶ INITIALIZE_LINK</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: ASCII Gallery (5/12) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center min-h-[400px] relative gap-4">
                <AsciiGallery
                  items={CURATED_ARTWORKS}
                  intervalMs={5000}
                  color="var(--accent)"
                  className="w-full"
                  showLabel
                />
                <div className="text-center mt-2">
                  <div className="text-[10px] font-mono opacity-40 tracking-[0.6em] uppercase" style={{ fontFamily: "var(--font-hud)" }}>ASCII_GALLERY :: ROTATING</div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Bottom HUD bar ── */}
          <div className="relative z-30 flex items-center gap-6 px-5 py-2 text-[8px] border-t"
               style={{
                 fontFamily: "var(--font-hud)",
                 borderColor: "var(--border)",
                 background: "rgba(0,0,0,0.35)",
                 color: "var(--text-muted)",
               }}>
            <span>◈ NEURAL COCKPIT</span>
            <span className="opacity-40">|</span>
            <span>GND: <span style={{ color: "var(--neon-green)" }}>ACTIVE</span></span>
            <span className="opacity-40">|</span>
            <span>MODEL: GEMINI-2.0-FLASH</span>
            <span className="ml-auto">
              SAM-CORP © 2026
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
