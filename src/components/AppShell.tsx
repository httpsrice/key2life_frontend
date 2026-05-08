import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChatPage } from "./ChatPage";
import { RecentsPlayground } from "./RecentsPlayground";
import { SettingsPage } from "./SettingsPage";
import { MemoryPage } from "./MemoryPage";

type View = "chat" | "monitor" | "settings" | "memory";

const NAV_ITEMS: { id: View; icon: string; label: string }[] = [
  { id: "chat",     icon: "◈", label: "Chat Terminal" },
  { id: "memory",   icon: "⚄", label: "Sovereign Memory" },
  { id: "monitor",  icon: "▣", label: "Monitor & Playground" },
  { id: "settings", icon: "⚙", label: "System Settings" },
];

const viewLabel: Record<View, string> = {
  chat:     "TERMINAL.DAT",
  memory:   "SOVEREIGN_STACK",
  monitor:  "REMOTE_LINK_MONITOR",
  settings: "SYS_CONFIG.INI",
};

export const AppShell = ({ onBackToLanding }: { onBackToLanding: () => void }) => {
  const [view, setView] = useState<View>("chat");
  const [time, setTime] = useState(new Date().toUTCString());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toUTCString()), 1000);
    return () => clearInterval(t);
  }, []);

  // Sync hash
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace("#", "");
      if (h === "monitor" || h === "settings" || h === "memory") setView(h as View);
      else setView("chat");
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (v: View) => {
    setView(v);
    window.location.hash = v;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden select-none transition-colors duration-300"
         style={{ background: "var(--bg)", color: "var(--text-1)" }}>
      <div className="scanlines" />

      {/* ── TITLE BAR ── */}
      <div className="flex-shrink-0 h-6 flex items-center px-2 gap-2 z-20 relative"
           style={{ background: "var(--accent)" }}>
        {/* App icon */}
        <div className="w-4 h-4 flex items-center justify-center text-[8px] font-black win-border"
             style={{ background: "var(--win-bg)", color: "var(--accent)" }}>S</div>
        <span className="font-mono font-bold text-[10px] text-white tracking-widest uppercase">SAM.EXE</span>

        {/* Title */}
        <div className="ml-2 px-3 h-full flex items-center text-[9px] font-mono text-white/70 border-l border-white/20">
          SAM-OS HUD ACTIVE
          <div className="ml-2 w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
        </div>

        {/* Scanner pulse overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
           <div className="h-px w-full bg-white animate-scanner-line" />
        </div>

        {/* Clock */}
        <div className="ml-auto text-[8px] font-mono text-white/40 tracking-wider hidden sm:block">
          {time}
        </div>

        {/* Win controls */}
        <div className="flex items-center gap-0.5 ml-2">
          <button className="w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white win-border hover:bg-white/20 transition-colors">_</button>
          <button
            id="exit-btn"
            onClick={onBackToLanding}
            className="w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white win-border hover:bg-red-600 transition-colors">×</button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* ── PROMINENT TOP NAVIGATION ── */}
          <div className="flex-shrink-0 flex gap-2 px-4 py-2 border-b z-20 shadow-md backdrop-blur-md"
               style={{ borderColor: "var(--border)", background: "var(--surface-alt)" }}>
            {NAV_ITEMS.map(item => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => navigate(item.id)}
                  className={`cyber-btn px-4 py-2 text-[10px] sm:text-xs flex items-center gap-2 transition-all duration-200 border-b-2`}
                  style={{
                    color: active ? "var(--accent)" : "var(--text-muted)",
                    borderColor: active ? "var(--accent)" : "transparent",
                    background: active ? "var(--accent-glow2)" : "transparent"
                  }}
                >
                  <span className={active ? "" : "opacity-50"}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
            
            <div className="flex-1"></div>

            <button
              id="nav-home"
              onClick={onBackToLanding}
              title="Back to Boot"
              className="px-4 py-2 text-[10px] font-bold text-white transition-all uppercase tracking-widest cyber-btn"
              style={{ background: "var(--neon-red)" }}
            >
              ⏻ Reboot
            </button>
          </div>

          {/* Content panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {view === "chat"     && <ChatPage />}
                {view === "memory"   && <MemoryPage />}
                {view === "monitor"  && <RecentsPlayground />}
                {view === "settings" && <SettingsPage />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
