import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  DataStateCard, 
  NavRail, 
  UserMessage, 
  AiMessage,
  ASCIIGlobe,
  SystemWidget,
  WeatherWidget,
  StockWidget
} from "./neural-components";
import { sendMessageStream, Message } from "../services/gemini";

const ASCII3DTerrain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let tpts: any[] = [];
    let rotY = 0;
    const TILX = 0.38;

    const genT = () => {
      tpts = [];
      const W = canvas.parentElement?.clientWidth || window.innerWidth;
      const H = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = W;
      canvas.height = H;

      for (let ix = 0; ix < 52; ix++) {
        for (let iz = 0; iz < 36; iz++) {
          const x = (ix / 52 - 0.5) * 5;
          const z = (iz / 36 - 0.5) * 4;
          const h = Math.sin(x * 2.1) * 0.36 + Math.sin(z * 1.8) * 0.4 + Math.sin((x + z) * 1.4) * 0.2 + Math.sin(x * 3.7 + z * 2.1) * 0.12 + Math.sin(x * 0.8 - z * 1.1) * 0.15;
          const n = (h + 1.1) / 2.2;
          const chars = ' .·:;+=xX#@';
          const ch = chars[Math.min(10, Math.floor(n * 11))];
          let col;
          if (n < 0.14) col = '#000A02';
          else if (n < 0.55) {
            const tt = (n - 0.14) / 0.41;
            col = `rgb(${Math.round(tt * 14)},${Math.round(138 + tt * 70)},${Math.round(118 + tt * 42)})`;
          } else {
            const tt = (n - 0.55) / 0.45;
            col = `rgb(${Math.round(158 + tt * 52)},${Math.round(112 - tt * 62)},${Math.round(42 - tt * 32)})`;
          }
          tpts.push({ ox: x, oy: h * 0.72, oz: z, n, ch, col });
        }
      }
    };

    let animationId: number;
    const renderT = (t: number) => {
      const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, FOV = 520;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#000800';
      ctx.fillRect(0, 0, W, H);
      
      rotY += 0.005;
      const cY = Math.cos(rotY), sY = Math.sin(rotY), cX = Math.cos(TILX), sX = Math.sin(TILX);
      
      const proj = tpts.map(p => {
        const x1 = p.ox * cY - p.oz * sY, z1 = p.ox * sY + p.oz * cY, y1 = p.oy * cX - z1 * sX, z2 = p.oy * sX + z1 * cX, sc = FOV / (FOV + z2 * 88);
        return { sx: x1 * sc * 88 + cx, sy: y1 * sc * 88 + cy, z: z2, ch: p.ch, col: p.col, sc };
      }).sort((a, b) => b.z - a.z);
      
      ctx.font = '11px "IBM Plex Mono", monospace';
      for (const p of proj) {
        if (p.ch === ' ') continue;
        ctx.globalAlpha = Math.max(0, Math.min(1, 0.18 + p.sc * 0.82));
        ctx.fillStyle = p.col;
        ctx.fillText(p.ch, p.sx, p.sy);
      }
      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(renderT);
    };

    genT();
    animationId = requestAnimationFrame(renderT);
    window.addEventListener("resize", genT);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", genT);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" />;
};

export const AppShell = ({ onBackToLanding }: { onBackToLanding: () => void }) => {
  const [currentView, setCurrentView] = useState("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "user",
      parts: [{ text: "Summarize findings from the uploaded paper. Cross-reference with recent QEC literature from the past 6 months." }]
    },
    {
      role: "model",
      parts: [{ text: "Three core findings: (1) surface code threshold improved to ~1.2% under realistic noise; (2) lattice surgery overhead reduced 34% via ancilla recycling; (3) hybrid stabilizer architecture showing 12× improvement in logical qubit lifetime." }],
      thinkingTrace: [
        "Indexed Sec 2, 4, 5 from Paper.pdf",
        "Queried web: 'quantum error correction 2025–2026'",
        "Filtered 4 preprints by citation depth",
        "Memory node #847 referenced"
      ],
      asciiCard: `
+------------------------------------------+
|  FT-QC HARDWARE IMPLICATIONS (v0.9.2)    |
+------------------------------------------+
|  ARCH         | PHYS/LOG  | FIDELITY     |
|---------------|-----------|--------------|
|  SUPERCOND.   | 800-2500  | 99.2%        |
|  TRAPPED-ION  | 100-400   | 99.9%        |
|  PHOTONIC     | 10000+    | 98.2%        |
+------------------------------------------+
|  ESTIMATED DEMO: 2028 - 2031             |
+------------------------------------------+
      `
    }
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString());

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toUTCString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMsg: Message = { role: "user", parts: [{ text: input }] };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsStreaming(true);
    setStreamingText("");

    try {
      const stream = sendMessageStream(messages, currentInput);
      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk;
        setStreamingText(fullResponse);
      }
      
      // Simulate adding an ASCII card for specific keywords or periodically
      const card = currentInput.toLowerCase().includes('data') || currentInput.toLowerCase().includes('state') ? `
+------------------------------------------+
|  ANALYSIS STATE: GROUNDED DATA           |
+------------------------------------------+
|  - SOURCE: ARCHIVE_FETCH                 |
|  - LATENCY: 22ms                         |
|  - STATUS: COMPLETED                     |
+------------------------------------------+` : undefined;

      setMessages(prev => [...prev, { 
        role: "model", 
        parts: [{ text: fullResponse }],
        asciiCard: card
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  };

  const handleNavChange = (view: string) => {
    if (view === "home") {
      onBackToLanding();
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="h-screen w-full bg-win-teal flex items-center justify-center overflow-hidden font-mono select-none relative p-1">
      <div className="scanlines z-0 opacity-5" />
      
      <div className="flex-1 flex flex-col h-full max-w-6xl mx-auto border border-terminal-border bg-win-grey relative z-10 shadow-2xl overflow-hidden">
        {/* System Bar / Title Bar */}
        <header className="win-title-bar shrink-0 h-4">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-white win-border flex items-center justify-center text-[6px] text-win-blue font-black">S</div>
            <span className="font-bold text-[8px] tracking-wider truncate">SAM.EXE</span>
          </div>
          
          <div className="flex-1 flex justify-center">
            <div className="text-[7px] opacity-40 uppercase hidden sm:block tracking-[0.4em]">GROUNDED_STATE_v1.0</div>
          </div>

          <div className="flex items-center gap-0.5 ml-auto">
            <div className="w-3 h-2.5 win-border bg-win-grey flex items-center justify-center text-[7px] font-bold text-black cursor-pointer leading-none">_</div>
            <div className="w-3 h-2.5 win-border bg-win-grey flex items-center justify-center text-[7px] font-bold text-black cursor-pointer bg-red-800/10 hover:bg-red-600 hover:text-white leading-none px-0.5" onClick={onBackToLanding}>×</div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden p-0.5 gap-0.5">
          <NavRail currentView={currentView} onViewChange={handleNavChange} />
          
          <div className="flex-1 flex flex-col min-w-0 border border-terminal-border bg-black shadow-2xl relative overflow-hidden">
             <div className="h-4 bg-win-grey border-b border-terminal-border px-1 flex items-center gap-0.5 shrink-0 z-20">
                <div className="h-full px-2 flex items-center bg-black border-x border-terminal-border z-30">
                   <span className="text-[8px] font-bold text-[#00FF41]">TERMINAL.DAT</span>
                </div>
                <div className="ml-auto flex gap-1 pr-1">
                    {["Grounded", "Ready"].map(tag => (
                      <span key={tag} className="text-[6px] border border-terminal-border px-1 text-win-blue font-bold uppercase">{tag}</span>
                    ))}
                </div>
             </div>

             <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth relative z-10 bg-black">
                {/* ASCII Watermark / Background Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none text-center select-none whitespace-pre font-mono text-[8px] text-[#00FF41]">
{`
   _____          __  __          ____   _____ 
  / ____|   /\\   |  \\/  |        / __ \\ / ____|
 | (___    /  \\  | \\  / |  ____ | |  | | (___  
  \\___ \\  / /\\ \\ | |\\/| | |____|| |  | |\\___ \\ 
  ____) |/ ____ \\| |  | |       | |__| |____) |
 |_____//_/    \\_\\_|  |_|        \\____/|_____/ 
                                               
     [ MULTIMODAL GROUNDED TERMINAL ]
`}
                </div>

                <div className="border border-[#00FF41]/20 bg-[#00FF41]/5 p-2 mb-8 text-[9px] font-mono flex items-center gap-3 text-[#00FF41]/80">
                   <div className="animate-pulse w-1.5 h-1.5 rounded-full bg-[#00FF41]" />
                   SYSTEM_ESTABLISHED :: GROUNDED_STATE_ACTIVE
                </div>

                {messages.map((msg, i) => (
                  msg.role === "user" ? (
                    <UserMessage key={i} content={msg.parts[0].text} time="" />
                  ) : (
                    <AiMessage 
                      key={i} 
                      content={msg.parts[0].text} 
                      thinking={msg.thinkingTrace?.join('\n')} 
                      asciiCard={msg.asciiCard}
                    />
                  )
                ))}
                {isStreaming && (
                  <AiMessage content={streamingText} isStreaming={true} />
                )}
             </div>

             {/* Input Zone */}
             <div className="p-2 bg-win-grey border-t border-terminal-border">
                <div className="flex items-center gap-2 p-1 bg-black win-border shadow-inner">
                  <span className="text-[#00FF41] font-bold pl-1 font-mono">›</span>
                  <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="ENTER COMMAND..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-[11px] text-[#00FF41] h-8 resize-none py-1 placeholder:text-[#00FF41]/20 font-mono"
                  />
                  <button 
                    onClick={handleSend}
                    className="h-8 px-4 win-border bg-win-grey text-black text-[10px] font-bold hover:bg-white active:shadow-inner transition-all uppercase"
                  >
                    SEND.EXE
                  </button>
                </div>
                <div className="flex gap-4 mt-1 px-1 justify-center">
                  {["SRC", "VOX", "IMG", "WEB", "MEM"].map(tool => (
                    <span key={tool} className="text-[8px] text-win-blue hover:underline cursor-pointer font-bold opacity-60">
                       {tool}.sys
                    </span>
                  ))}
                </div>
             </div>
          </div>

          {/* Context Drawer */}
          <aside className="w-[180px] bg-win-grey border-l border-terminal-border overflow-y-auto p-2 space-y-4 hidden lg:block shrink-0">
            <section>
              <div className="text-[8px] text-win-blue font-bold border-b border-terminal-border mb-2 opacity-70">
                PLAYGROUND.EXE
              </div>
              <div className="win-border overflow-hidden bg-black flex items-center justify-center mb-1">
                 <ASCIIGlobe />
              </div>
            </section>

            <section>
              <div className="text-[8px] text-win-blue font-bold border-b border-terminal-border mb-2 opacity-70">
                ACTIVE_GROUNDING
              </div>
              <div className="space-y-1">
                {[
                  { label: "arxiv:2603.11283", relevance: 82, color: "#000080" },
                  { label: "QEC_paper.pdf", relevance: 94, color: "#804000" },
                ].map(s => (
                  <div key={s.label} className="win-border bg-white p-1 text-[8px]">
                    <div className="truncate text-win-blue mb-0.5">{s.label}</div>
                    <div className="h-1 bg-black/10">
                      <div className="h-full" style={{ width: `${s.relevance}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="text-[8px] text-win-blue font-bold border-b border-terminal-border mb-2 opacity-70">
                LTM_SEGMENTS
              </div>
              <div className="space-y-1">
                {[
                  { id: "0x391", text: "FT-QC Timelines" },
                  { id: "0x34F", text: "Surface Code Pref" },
                ].map(m => (
                  <div key={m.id} className="text-[8px] text-terminal-dim hover:bg-win-blue hover:text-white cursor-pointer px-1 flex gap-1 border border-transparent hover:border-win-blue/20">
                     <span className="font-bold">{m.id}</span>
                     <span className="truncate">{m.text}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <SystemWidget title="Environment" defaultOpen={true}>
                <WeatherWidget />
              </SystemWidget>
              
              <SystemWidget title="Neural Markets" defaultOpen={false}>
                <StockWidget />
              </SystemWidget>
            </section>

            <div className="mt-8 text-[8px] text-win-blue/30 leading-tight font-mono text-center pt-8 border-t border-terminal-border/10">
              © 2026 SAM-CORP<br />
              [ ALPHA_REL ]
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
