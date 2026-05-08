import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClusterParticleOrb } from "./ClusterParticleOrb";

// --- Types ---
interface IntelEvent {
  id: string;
  type: "X" | "REDDIT" | "RSS" | "MARKET";
  impact: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  title: string;
  summary: string;
  timestamp: string;
  source: string;
  link?: string;
  metadata?: {
    relevance?: number;
    price?: string;
    change?: string;
  };
}

interface MarketTicker {
  symbol: string;
  price: string;
  change: string;
  isUp: boolean;
}

// --- Mock Data Generators ---
const MOCK_EVENTS: IntelEvent[] = [
  {
    id: "e1",
    type: "X",
    impact: "CRITICAL",
    title: "Global Supply Chain Disruptions Detected",
    summary: "Large-scale logistics anomalies reported across major ports in SE Asia. AI models flagging potential trade ripple effects.",
    timestamp: new Date().toISOString(),
    source: "@LogisticsIntel",
    metadata: { relevance: 0.94 }
  },
  {
    id: "e2",
    type: "MARKET",
    impact: "HIGH",
    title: "BTC Breakout",
    summary: "Bitcoin surges past previous resistance levels. High volume accumulation noted by top 10 whale addresses.",
    timestamp: new Date().toISOString(),
    source: "MarketWatch",
    metadata: { price: "$94,200", change: "+5.2%" }
  },
  {
    id: "e3",
    type: "RSS",
    impact: "MEDIUM",
    title: "Quantum Supremacy Breakthrough",
    summary: "New research paper suggests a 1000-qubit stable system. Cryptographic implications being assessed.",
    timestamp: new Date().toISOString(),
    source: "ScienceDaily"
  },
  {
    id: "e4",
    type: "REDDIT",
    impact: "LOW",
    title: "r/Tech Speculation",
    summary: "Community discussion regarding upcoming 'Neural Link' hardware leaks. Sentiment: Bullish.",
    timestamp: new Date().toISOString(),
    source: "r/technology"
  }
];

const MOCK_TICKER: MarketTicker[] = [
  { symbol: "BTC/USD", price: "94,200", change: "+5.2%", isUp: true },
  { symbol: "ETH/USD", price: "4,120", change: "+2.1%", isUp: true },
  { symbol: "SOL/USD", price: "245", change: "-1.2%", isUp: false },
  { symbol: "NVDA", price: "920", change: "+0.8%", isUp: true },
  { symbol: "TSLA", price: "185", change: "-3.4%", isUp: false },
];

// --- Sub-components ---

const TickerTape = () => (
  <div className="h-8 border-b flex items-center overflow-hidden bg-black/40 backdrop-blur-sm z-10"
       style={{ borderColor: "var(--border)" }}>
    <div className="flex-shrink-0 px-3 bg-red-600 text-white font-hud text-[10px] font-bold h-full flex items-center animate-pulse">
      LIVE FEED
    </div>
    <div className="flex-1 overflow-hidden relative">
      <motion.div 
        className="flex whitespace-nowrap gap-12 items-center h-full"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...MOCK_TICKER, ...MOCK_TICKER].map((item, idx) => (
          <div key={idx} className="flex gap-2 font-hud text-[11px] items-center">
            <span className="text-white/40">[{item.symbol}]</span>
            <span style={{ color: "var(--text-1)" }}>{item.price}</span>
            <span className={item.isUp ? "text-green-400" : "text-red-400"}>
              {item.isUp ? "▲" : "▼"} {item.change}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  </div>
);

const ImpactBadge = ({ impact }: { impact: IntelEvent["impact"] }) => {
  const colors = {
    CRITICAL: "var(--neon-red)",
    HIGH: "var(--neon-amber)",
    MEDIUM: "var(--accent-3)",
    LOW: "var(--text-muted)"
  };
  return (
    <div className="px-1.5 py-0.5 rounded-sm text-[8px] font-bold text-white uppercase"
         style={{ background: colors[impact] }}>
      {impact}
    </div>
  );
};

export const IntelTerminal = () => {
  const [events, setEvents] = useState<IntelEvent[]>(MOCK_EVENTS);
  const [filter, setFilter] = useState<string>("ALL");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Real-time mock logic
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent: IntelEvent = {
        id: Math.random().toString(),
        type: ["X", "REDDIT", "RSS", "MARKET"][Math.floor(Math.random() * 4)] as any,
        impact: ["LOW", "MEDIUM", "HIGH", "CRITICAL"][Math.floor(Math.random() * 4)] as any,
        title: `PULSE_${Math.floor(Math.random() * 1000)} DETECTED`,
        summary: "Anomaly detected in global data stream. Analysis in progress...",
        timestamp: new Date().toISOString(),
        source: "SAM-ORACLE-1",
        metadata: { relevance: Math.random() }
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = filter === "ALL" ? events : events.filter(e => e.type === filter);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-black relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="grid-bg h-full w-full" style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <TickerTape />

      <div className="flex-1 flex overflow-hidden z-10">
        
        {/* --- LEFT SIDEBAR: CATEGORIES --- */}
        <div className="w-16 sm:w-48 border-r flex flex-col p-2 gap-2"
             style={{ borderColor: "var(--border)", background: "rgba(0,0,0,0.3)" }}>
          <div className="text-[10px] font-hud text-white/30 px-2 mb-2 uppercase tracking-tighter">Event Streams</div>
          {["ALL", "X", "REDDIT", "RSS", "MARKET"].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-left px-3 py-2 font-hud text-xs transition-all border-l-2 ${filter === cat ? 'bg-white/5 border-pink-500 text-pink-500' : 'border-transparent text-white/40 hover:text-white/70'}`}
            >
              {cat === "ALL" ? "◈ GLOBAL_HUB" : `${cat === "X" ? "𝕏" : cat === "REDDIT" ? "👽" : cat === "RSS" ? "📰" : "📈"} ${cat}`}
            </button>
          ))}
          
          <div className="mt-auto p-3 ascii-card opacity-50 text-[7px]">
{`[SYS_STATE]
LOAD: 24%
LINK: NOMINAL
VOID: STABLE`}
          </div>
        </div>

        {/* --- CENTER: TACTICAL VISUALIZATION --- */}
        <div className="flex-1 relative flex items-center justify-center border-r overflow-hidden"
             style={{ borderColor: "var(--border)" }}>
          
          {/* Tactical Overlay */}
          <div className="absolute top-4 left-4 font-hud text-[9px] text-pink-500/60 uppercase">
            Sovereign Intelligence Mapping // Node 8422
          </div>
          <div className="absolute top-4 right-4 font-hud text-[9px] text-white/20">
            LOC: 37.7749° N, 122.4194° W
          </div>
          
          {/* Main Visualizer */}
          <div className="w-full h-full max-w-4xl max-h-4xl scale-125 opacity-60">
            <ClusterParticleOrb />
          </div>

          {/* Data Pulse Rings */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div 
              className="w-64 h-64 border border-pink-500/20 rounded-full"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div 
              className="w-64 h-64 border border-cyan-500/10 rounded-full"
              animate={{ scale: [1, 2], opacity: [0.3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeOut", delay: 2 }}
            />
          </div>

          <div className="absolute bottom-4 flex gap-4 font-hud text-[8px] text-white/40 uppercase">
             <span>Signals Processed: {events.length * 1234}</span>
             <span>|</span>
             <span>Network Health: 99.9%</span>
          </div>
        </div>

        {/* --- RIGHT SIDEBAR: FEED --- */}
        <div className="w-80 sm:w-96 flex flex-col bg-black/40 backdrop-blur-xl">
          <div className="h-10 px-4 border-b flex items-center justify-between"
               style={{ borderColor: "var(--border)" }}>
            <span className="font-hud text-[11px] font-bold text-white tracking-widest uppercase">Tactical Feed</span>
            <div className="flex gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[9px] font-mono text-green-500">REALTIME</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-cyber p-4 flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-sm hover:border-pink-500/50 transition-colors group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-pink-500">{event.type}</span>
                       <span className="text-[8px] text-white/20">/</span>
                       <span className="text-[8px] text-white/40 font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <ImpactBadge impact={event.impact} />
                  </div>
                  
                  <h4 className="text-xs font-bold text-white/90 mb-1 group-hover:text-pink-400 transition-colors">{event.title}</h4>
                  <p className="text-[10px] text-white/50 leading-relaxed">{event.summary}</p>
                  
                  {event.metadata && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex gap-4">
                      {event.metadata.price && (
                        <div className="text-[9px]">
                           <span className="text-white/20 mr-1 uppercase font-bold">Price</span>
                           <span className="text-white/80">{event.metadata.price}</span>
                           <span className="ml-2 text-green-400">{event.metadata.change}</span>
                        </div>
                      )}
                      {event.metadata.relevance && (
                        <div className="text-[9px]">
                           <span className="text-white/20 mr-1 uppercase font-bold">Rel.</span>
                           <span className="text-white/80">{(event.metadata.relevance * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] text-white/30">{event.source}</span>
                    <span className="text-[8px] text-pink-500 uppercase font-bold">Inspect Details →</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
