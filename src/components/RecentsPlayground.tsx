import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Activity, Database, Zap, Cpu, Terminal, Layers } from "lucide-react";
import { cn } from "@/src/lib/utils";

const Oscilloscope = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#00FF41";
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      const midY = canvas.height / 2;
      for (let x = 0; x < canvas.width; x++) {
        const y = midY + Math.sin(x * 0.05 + t) * 15 + Math.sin(x * 0.12 - t * 0.5) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      t += 0.1;
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} width={200} height={60} className="w-full h-full opacity-60" />;
};

const NeuralMap = () => {
  return (
    <div className="relative w-full aspect-square bg-[#000800] border-2 border-win-blue/20 flex items-center justify-center overflow-hidden">
      {/* Background Grids */}
      <div className="absolute inset-0 opacity-10" style={{ 
        backgroundImage: 'radial-gradient(#00FF41 1px, transparent 1px)', 
        backgroundSize: '20px 20px' 
      }} />
      
      {/* Radar Sweeps */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-r border-[#00FF41]/40 origin-center"
        style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(0,255,65,0.1) 100%)' }}
      />
      
      {/* Biomorphic Neural Nodes */}
      <div className="relative z-10 w-[70%] h-[70%] border border-[#00FF41]/20 rounded-full flex items-center justify-center">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{ 
              duration: 2 + i, 
              repeat: Infinity, 
              delay: i * 0.5 
            }}
            className="absolute rounded-full border border-[#00FF41]/30"
            style={{ width: `${100 - i * 15}%`, height: `${100 - i * 15}%` }}
          />
        ))}
        
        {/* Core */}
        <div className="w-4 h-4 bg-[#00FF41] rounded-full shadow-[0_0_15px_#00FF41] animate-pulse" />
      </div>

      {/* Floating Meta Data */}
      <div className="absolute top-2 left-2 text-[8px] font-mono text-[#00FF41] leading-none uppercase">
        XENO_PLATE_SCAN_EX.2H<br />
        STATUS: MONITORING...
      </div>
      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-[#00FF41] leading-none text-right">
        NEURAL_DEPTH: 0.88v<br />
        SYNC: VERIFIED
      </div>
    </div>
  );
};

interface RecentItem {
  id: string;
  name: string;
  type: string;
  time: string;
  size: string;
  status: 'synced' | 'local' | 'error';
}

const RecentDataShards = () => {
  const [recents] = useState<RecentItem[]>([
    { id: '1', name: 'NEURAL_PROTO_01.DAT', type: 'MODEL', time: '2m ago', size: '12.4 MB', status: 'synced' },
    { id: '2', name: 'QEC_PAPER_V2.PDF', type: 'ARCHIVE', time: '1h ago', size: '2.1 MB', status: 'synced' },
    { id: '3', name: 'GROUNDING_LOG.EXE', type: 'SYSTEM', time: '5h ago', size: '42 KB', status: 'local' },
    { id: '4', name: 'XENO_SCAN_REF.IMG', type: 'MEDIA', time: '1d ago', size: '5.8 MB', status: 'synced' },
    { id: '5', name: 'TEMP_CACHE_88.TMP', type: 'TEMP', time: '2d ago', size: '1.2 KB', status: 'error' },
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {recents.map((item) => (
        <motion.div
          key={item.id}
          whileHover={{ x: 2, scale: 1.01 }}
          className="win-border bg-white p-2 hover:bg-[#F8F8FF] cursor-pointer group transition-all"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              "p-1 rounded-sm",
              item.status === 'synced' ? "bg-win-blue/10 text-win-blue" : 
              item.status === 'error' ? "bg-red-100 text-red-600" : "bg-win-grey text-black"
            )}>
              {item.type === 'MODEL' && <Cpu size={10} />}
              {item.type === 'ARCHIVE' && <Database size={10} />}
              {item.type === 'SYSTEM' && <Terminal size={10} />}
              {item.type === 'MEDIA' && <Zap size={10} />}
              {item.type === 'TEMP' && <Layers size={10} />}
            </div>
            <span className="text-[10px] font-black truncate">{item.name}</span>
            <span className="ml-auto text-[8px] opacity-40 font-bold">{item.time}</span>
          </div>
          <div className="flex justify-between items-center text-[8px] font-mono opacity-60">
             <span>SIZE: {item.size}</span>
             <span className={cn(
               "uppercase",
               item.status === 'error' ? "text-red-600" : "text-win-blue"
             )}>{item.status}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const TerminalLogs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      const actions = ["FETCHING", "ENCRYPTING", "GROUNDING", "SYNCING", "OPTIMIZING"];
      const files = ["SYSTEM.SYS", "CACHE.L1", "NEURAL.NET", "DATA.RAW", "ID.VER"];
      const newLog = `[${new Date().toLocaleTimeString()}] ${actions[Math.floor(Math.random() * actions.length)]} :: ${files[Math.floor(Math.random() * files.length)]} -> 0x${Math.floor(Math.random()*65536).toString(16).toUpperCase()}`;
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full font-mono text-[9px] text-[#00FF41] p-2 overflow-y-auto bg-black border border-terminal-border leading-tight">
      {logs.map((log, i) => (
        <div key={i} className={i === 0 ? "text-white animate-pulse" : "opacity-60"}>
          <span className="text-[#004411] mr-2">›</span>{log}
        </div>
      ))}
    </div>
  );
};

export const RecentsPlayground = () => {
  return (
    <div className="flex-1 flex flex-col min-w-0 p-1 gap-1 overflow-hidden">
      <div className="grid grid-cols-12 gap-1 h-full">
        
        {/* Left Column: Stats and Mini-Displays */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
          <div className="win-border bg-win-grey overflow-hidden">
            <div className="win-title-bar">SIGNAL_ALERT.DAT</div>
            <div className="p-2 h-20 bg-black flex flex-col justify-center">
              <div className="flex justify-between text-[10px] text-win-blue font-bold mb-1">
                <span>SENSOR_560</span>
                <span className="text-red-500 animate-pulse">BREACH!</span>
              </div>
              <div className="h-full">
                <Oscilloscope />
              </div>
            </div>
          </div>

          <div className="win-border bg-win-grey flex-1 overflow-hidden flex flex-col">
            <div className="win-title-bar">DIRECTORY_FINDER.SYS</div>
            <div className="p-2 flex-1 flex flex-col">
               <div className="text-[8px] font-bold text-win-blue/60 mb-2 border-b border-win-blue/10 pb-1">COMMAND_LOG [ACTIVE]</div>
               <div className="flex-1">
                 <TerminalLogs />
               </div>
            </div>
          </div>
        </div>

        {/* Center: Main Neural View */}
        <div className="col-span-12 md:col-span-6 flex flex-col gap-1 h-full">
          <div className="win-border bg-win-grey p-1 h-[60%] flex flex-col overflow-hidden">
             <div className="win-title-bar flex justify-between px-1">
               <span>REMOTE_LINK_MONITOR [v4.1]</span>
               <span className="opacity-50">THREAT_LEVEL: MINIMAL</span>
             </div>
             <div className="flex-1 overflow-hidden relative">
                <NeuralMap />
                
                {/* Floating Overlay Annotations */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-[20%] left-[10%] border-l border-t border-[#00FF41]/40 p-1">
                    <div className="text-[6px] text-[#00FF41] font-bold">BIO_MED_SENSOR_BN_4V.6SD</div>
                    <div className="w-12 h-[1px] bg-[#00FF41]/20 mt-1" />
                  </div>
                  
                  <motion.div 
                    animate={{ y: [0, -40, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute right-[15%] top-1/2 w-20 h-[1px] bg-red-500/20"
                  >
                    <div className="absolute -top-3 right-0 text-[6px] text-red-500 font-bold">THREAT_DETECTION_OXY</div>
                  </motion.div>

                  <div className="absolute bottom-[25%] left-[20%] flex gap-1">
                    {[1,0,1,1,0].map((b, i) => (
                      <div key={i} className={cn("w-1 h-3 border border-[#00FF41]/30", b ? "bg-[#00FF41]/20" : "")} />
                    ))}
                  </div>

                  <div className="absolute top-4 right-4 text-[7px] text-[#C71585] font-black italic tracking-tighter">
                    NEURAL_FLUX_STABLE
                  </div>
                </div>
             </div>
          </div>

          <div className="win-border bg-win-grey flex-1 flex flex-col overflow-hidden">
             <div className="win-title-bar">RECENT_SHARDS.EXE</div>
             <div className="p-2 flex-1 overflow-y-auto scrollbar-thin">
                <RecentDataShards />
             </div>
          </div>
        </div>

        {/* Right Column: Sub-schematics & Feed */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
          <div className="win-border bg-win-grey overflow-hidden">
            <div className="win-title-bar">SUB_SCHEMATIC.IMG</div>
            <div className="p-4 bg-black flex flex-col items-center justify-center gap-4">
               {/* Minimal Schematic Mockup */}
               <div className="w-full h-24 border border-win-blue/20 rounded-full flex items-center justify-center relative">
                  <div className="w-[80%] h-1 bg-win-blue/40" />
                  <motion.div 
                    animate={{ x: [-8, 8, -8] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute w-4 h-4 rounded-full border border-win-blue/80 bg-win-blue/20 flex items-center justify-center"
                  >
                    <div className="w-1 h-1 bg-win-blue rounded-full" />
                  </motion.div>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[7px] text-win-blue font-black uppercase">SEC_4: WEAPON_CORE</div>
               </div>
               <div className="grid grid-cols-2 gap-2 w-full">
                  {[1, 2, 3, 4].map(idx => (
                    <div key={idx} className="border border-win-blue/10 p-1">
                       <div className="text-[6px] text-win-blue/40 font-bold">MODULE_{idx}</div>
                       <div className="h-1 bg-black/50 mt-1">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.random() * 100}%` }}
                            className="h-full bg-win-blue/60" 
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="win-border bg-win-grey flex-1 overflow-hidden p-2">
            <div className="text-[8px] text-win-blue font-bold uppercase border-b border-win-blue/20 mb-2">System_Metrics</div>
            <div className="space-y-3">
               <div>
                  <div className="flex justify-between text-[8px] font-bold mb-1">
                    <span>CPU_LOAD</span>
                    <span>{Math.floor(Math.random()*40)+20}%</span>
                  </div>
                  <div className="h-1 bg-black/5 rounded-full overflow-hidden">
                    <motion.div animate={{ width: '42%' }} className="h-full bg-win-blue" />
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-[8px] font-bold mb-1">
                    <span>MEM_GROUND</span>
                    <span>1.2/4.0 GB</span>
                  </div>
                  <div className="h-1 bg-black/5 rounded-full overflow-hidden">
                    <motion.div animate={{ width: '30%' }} className="h-full bg-win-blue" />
                  </div>
               </div>
               <div className="pt-4 flex flex-col gap-1 items-center">
                  <Activity size={32} className="text-win-blue/20 animate-pulse" />
                  <span className="text-[7px] text-win-blue/40 uppercase font-black">Link_Stable</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
