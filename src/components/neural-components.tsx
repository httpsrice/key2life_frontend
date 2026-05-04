import React from "react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Cloud, TrendingUp, ChevronDown, ChevronUp, Sun, Wind, Apple } from "lucide-react";

interface DataStateProps {
  icon: any;
  label: string;
  type: string;
  relevance: number;
  timestamp: string;
}

export const DataStateCard: React.FC<DataStateProps> = ({ icon: Icon, label, type, relevance, timestamp }) => {
  return (
    <motion.div 
      whileHover={{ y: -2, borderColor: "#00FF41" }}
      className="bg-[#000F00] border border-[#003A14] p-3 border-l-4 border-l-[#00FF41] rounded-sm flex flex-col gap-2 min-w-[240px]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-[#C8FFC8] truncate">{label}</span>
      </div>
      
      <div className="h-[2px] bg-[#001A06] relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${relevance}%` }}
          className="h-full bg-[#00FF41] shadow-[0_0_5px_rgba(0,255,65,0.5)]"
        />
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-[#004A1A] uppercase">{type}</span>
        <span className="text-[10px] font-mono text-[#004A1A]">{relevance}% CONF</span>
      </div>
    </motion.div>
  );
};

interface UserMessageProps {
  content: string;
  time?: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ content }) => (
  <div className="flex justify-end pl-12 mb-4">
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-[85%] bg-[#002A10] border border-[#00FF41]/30 p-2 px-3 rounded-sm text-xs text-[#00FF41] leading-relaxed font-mono shadow-[0_0_10px_rgba(0,255,65,0.1)]"
    >
      <span className="opacity-50 mr-2">›</span>{content}
    </motion.div>
  </div>
);

interface AiMessageProps {
  content: string;
  thinking?: string;
  isStreaming?: boolean;
  asciiCard?: string;
}

export const AiMessage: React.FC<AiMessageProps> = ({ content, thinking, isStreaming = false, asciiCard }) => {
  return (
    <div className="w-full pr-12 group mb-6">
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="win-border bg-win-grey overflow-hidden transition-all shadow-lg"
      >
        <div className="win-title-bar">
           <span className="flex-1 px-1">SAM · SYSTEM_OUTPUT.DAT</span>
           {isStreaming && <span className="w-1 h-1 bg-white rounded-full animate-pulse mx-2" />}
           <div className="flex gap-0.5 ml-auto">
             <div className="w-3 h-3 win-border bg-win-grey flex items-center justify-center text-[7px] font-bold">_</div>
             <div className="w-3 h-3 win-border bg-win-grey flex items-center justify-center text-[7px] font-bold">×</div>
           </div>
        </div>

        <div className="p-3 bg-white">
          {thinking && (
            <div className="mb-3">
               <div className="text-[8px] font-mono text-win-blue uppercase mb-1 font-bold opacity-60">
                 [LOG_TRACE_INIT...]
               </div>
               <div className="bg-black text-[9px] font-mono text-[#00FF41] p-2 leading-tight border border-win-blue/10">
                {thinking.split('\n').map((line, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="opacity-30">#</span> {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="font-mono text-black">
            <p className="text-xs leading-[1.5] whitespace-pre-wrap">
              {content}
              {isStreaming && <span className="inline-block w-2 h-3.5 ml-1 bg-win-blue align-middle animate-pulse" />}
            </p>
          </div>

          {asciiCard && (
            <div className="mt-3">
               <div className="text-[8px] font-mono text-win-blue mb-1 uppercase font-bold opacity-50 underline">multimodal_render:</div>
               <div className="ascii-card text-win-blue bg-white border-win-blue/20">
                 {asciiCard}
               </div>
            </div>
          )}

          {!isStreaming && (
            <div className="flex items-center gap-2 mt-4">
              <button className="win-border bg-win-grey px-2 py-0.5 text-[8px] font-bold hover:bg-white active:shadow-inner">SAVE</button>
              <button className="win-border bg-win-grey px-2 py-0.5 text-[8px] font-bold hover:bg-white active:shadow-inner">PIN</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

interface NavRailProps {
  currentView: string;
  onViewChange: (v: string) => void;
}

export const ASCIIGlobe = () => {
  const [frame, setFrame] = React.useState("");
  
  React.useEffect(() => {
    let t = 0;
    const chars = " .:-=+*#%@";
    const width = 45;
    const height = 22;
    
    const interval = setInterval(() => {
      let output = "";
      t += 0.05;
      
      for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
          const x = (i / width) * 2 - 1;
          const y = (j / height) * 2 - 1;
          const dist = Math.sqrt(x * x + y * y);
          
          if (dist < 0.8) {
            const z = Math.sqrt(0.64 - dist * dist);
            // Simple rotation
            const xRot = x * Math.cos(t) - z * Math.sin(t);
            const zRot = x * Math.sin(t) + z * Math.cos(t);
            
            // Map to characters based on "shading" or position
            const shade = Math.floor((zRot + 0.8) * 5);
            output += chars[Math.max(0, Math.min(chars.length - 1, shade))];
          } else {
            output += " ";
          }
        }
        output += "\n";
      }
      setFrame(output);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-[8px] leading-none whitespace-pre text-[#00FF41] bg-black p-4 border border-[#00FF41]/20 shadow-[0_0_20px_rgba(0,255,65,0.1)]">
      {frame}
    </div>
  );
};

export const SystemWidget = ({ 
  title, 
  children, 
  icon: Icon, 
  defaultOpen = true 
}: { 
  title: string; 
  children: React.ReactNode; 
  icon?: any;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="win-border bg-win-grey overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="win-title-bar w-full cursor-pointer flex items-center justify-between hover:brightness-110"
      >
        <div className="flex items-center gap-1.5 px-0.5">
          {Icon && <Icon size={10} className="text-white" />}
          <span className="font-bold text-[8px] uppercase tracking-wider">{title}</span>
        </div>
        <div className="pr-1">
          {isOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-2 bg-white">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const WeatherWidget = () => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <div className="flex flex-col">
        <span className="text-[14px] font-black leading-tight text-win-blue">21°C</span>
        <span className="text-[7px] text-win-blue/60 font-bold uppercase">Mostly Sunny</span>
      </div>
      <Sun size={18} className="text-amber-500" />
    </div>
    
    <div className="flex gap-1.5 mt-1 overflow-x-auto pb-1 scrollbar-hide">
      {[
        { time: "14:00", temp: 22, icon: Sun },
        { time: "16:00", temp: 21, icon: Sun },
        { time: "18:00", temp: 19, icon: Cloud },
        { time: "20:00", temp: 17, icon: Wind },
      ].map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 min-w-[24px]">
          <span className="text-[6px] text-win-blue/40 font-bold">{h.time}</span>
          <h.icon size={10} className="text-win-blue/60" />
          <span className="text-[7px] text-win-blue font-bold">{h.temp}°</span>
        </div>
      ))}
    </div>
  </div>
);

export const StockWidget = () => (
  <div className="space-y-1.5">
    {[
      { symbol: "AAPL", price: "221.55", change: "+0.85%", up: true },
      { symbol: "GOOGL", price: "184.22", change: "-0.12%", up: false },
      { symbol: "NVDA", price: "128.90", change: "+1.22%", up: true },
    ].map((s) => (
      <div key={s.symbol} className="flex items-center justify-between group">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-win-blue leading-none">{s.symbol}</span>
          <span className="text-[6px] text-win-blue/40 font-bold uppercase">NASDAQ</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold text-black leading-none">{s.price}</span>
          <span className={cn(
            "text-[7px] font-black flex items-center",
            s.up ? "text-emerald-600" : "text-rose-600"
          )}>
            {s.up ? "▲" : "▼"} {s.change}
          </span>
        </div>
      </div>
    ))}
    <div className="pt-1.5 border-t border-win-blue/10 flex justify-between items-center opacity-40">
       <span className="text-[6px] font-bold">MARKET OPEN</span>
       <TrendingUp size={8} />
    </div>
  </div>
);

export const NavRail: React.FC<NavRailProps> = ({ currentView, onViewChange }) => {
  const items = [
    { id: "home", icon: "⊕", label: "Exit to System" },
    { id: "chat", icon: "◈", label: "Multimodal Terminal" },
    { id: "recents", icon: "▤", label: "Recent Shards & Playground" },
  ];

  return (
    <nav className="w-10 bg-win-grey border-r border-terminal-border h-full flex flex-col items-center py-4 gap-4 z-50">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={cn(
            "relative w-7 h-7 win-border flex items-center justify-center text-sm transition-all duration-200 group cursor-pointer",
            currentView === item.id 
              ? "bg-white text-win-blue shadow-inner" 
              : "bg-win-grey text-terminal-dim hover:bg-white/50"
          )}
          title={item.label}
        >
          <span className="relative z-10 transition-all font-bold">
            {item.icon}
          </span>
        </button>
      ))}
    </nav>
  );
};
