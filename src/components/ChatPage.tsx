import React, { useState, useEffect, useRef, useCallback } from "react";
import { sendMessageStream, Message } from "../services/gemini";
import { MatrixRain } from "./MatrixRain";
import { NeuralStatusWidget, ClockWidget } from "./Widgets";
import { motion, AnimatePresence } from "motion/react";
import { AsciiMarkdown, AsciiGallery, CURATED_ARTWORKS } from "./AsciiEngine";

/* ─── Types ─────────────────────────────────────────────────────── */
interface ChatMessage extends Message {
  id: string;
  asciiCard?: string;
  streaming?: boolean;
  imageDataUrl?: string;
  latency?: number;
}

/* ─── HUD Metadata ──────────────────────────────────────────────── */
const HudMetadata = ({ model, tokens, latency }: { model: string, tokens?: number, latency?: number }) => (
  <div className="flex items-center gap-3 text-[7px] tracking-[0.2em] font-bold opacity-40 uppercase mb-1 px-1">
    <span>MDL: {model}</span>
    {tokens && <span>TOK: {tokens}</span>}
    {latency && <span>LAT: {latency}ms</span>}
    <div className="flex-1 h-px bg-current opacity-20" />
  </div>
);

/* ─── Bubble: User ───────────────────────────────────────────────── */
const UserBubble = ({ msg }: { msg: ChatMessage }) => (
  <div className="flex justify-end mb-6 group">
    <div className="max-w-[80%] flex flex-col gap-2 items-end">
      <HudMetadata model="LOCAL_UPLINK" />
      {msg.imageDataUrl && (
        <div className="relative p-1 border rounded" style={{ borderColor: "var(--accent-2)", background: "rgba(0,0,0,0.3)" }}>
          <img src={msg.imageDataUrl} alt="attached" className="rounded max-h-48 shadow-lg" />
          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/80 text-[7px] border border-white/20 rounded">IMG_UPLINK_STABLE</div>
        </div>
      )}
      <div
        className="px-4 py-3 text-[11px] leading-relaxed relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(var(--accent-rgb), 0.1), rgba(var(--accent-rgb), 0.02))",
          border: "1px solid var(--accent)",
          color: "var(--text-1)",
          borderRadius: "8px 0 8px 8px",
          fontFamily: "var(--font-hud)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 0 10px rgba(var(--accent-rgb), 0.1)",
        }}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-20" />
        <span className="mr-2 text-accent opacity-80">❱</span>
        {msg.parts[0].text}
      </div>
    </div>
  </div>
);

/* ─── Bubble: AI ─────────────────────────────────────────────────── */
const AiBubble = ({ msg }: { msg: ChatMessage }) => {
  const { thinking, text } = parseThinking(msg.parts[0].text);
  const [showThinking, setShowThinking] = useState(false);

  return (
    <div className="pr-12 mb-8 group">
      <HudMetadata model="GEMINI-2.0-FLASH" latency={msg.latency} />
      
      {/* Thinking Process HUD */}
      {thinking && (
        <div className="mb-3">
          <button
            onClick={() => setShowThinking(s => !s)}
            className="group/btn relative px-3 py-1 flex items-center gap-2 overflow-hidden transition-all hover:pr-5"
            style={{ 
              fontFamily: "var(--font-hud)", 
              color: "var(--accent-2)",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(var(--accent-2-rgb), 0.2)",
              borderRadius: "2px"
            }}
          >
            <div className={`status-dot ${showThinking ? "ok" : "idle"}`} style={{ width: 5, height: 5 }} />
            <span className="text-[8px] uppercase tracking-[0.3em] font-black">
              {showThinking ? "CLOSE_NEURAL_LOG" : "VIEW_THOUGHT_ARCHITECTURE"}
            </span>
            <div className="absolute right-2 text-[10px] opacity-0 group-hover/btn:opacity-100 transition-opacity">
              {showThinking ? "▲" : "▼"}
            </div>
          </button>
          
          <AnimatePresence>
            {showThinking && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-1 p-3 text-[9px] leading-relaxed border-l-2 border-dashed border-accent-2/30"
                     style={{
                       color: "var(--text-muted)",
                       fontFamily: "var(--font-mono)",
                       background: "linear-gradient(90deg, rgba(0,0,0,0.4), transparent)",
                     }}>
                  <div className="mb-2 text-[7px] text-accent-2/50 font-bold uppercase tracking-widest">{">>"} ANALYZING_CONTEXT_NODES...</div>
                  {thinking.split("\n").map((l, i) => (
                    <div key={i} className="flex gap-3 mb-0.5 group/line">
                      <span className="opacity-10 select-none group-hover/line:opacity-40 transition-opacity w-6">0{i + 1}</span>
                      <span className="opacity-70 group-hover/line:opacity-100 transition-opacity">{l}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main Neural Response Window */}
      <div className="relative group/win">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-accent/50 via-accent-2/30 to-accent/50 rounded-sm opacity-20 blur-[2px] group-hover/win:opacity-40 transition-opacity" />
        <div className="win-border relative overflow-hidden"
             style={{
               background: "var(--win-bg)",
               boxShadow: msg.streaming ? "0 0 30px rgba(var(--accent-rgb), 0.15)" : "0 4px 30px rgba(0,0,0,0.5)",
               borderRadius: "2px"
             }}>
          
          {/* Title Bar with Neural Activity */}
          <div className="win-title-bar px-4 justify-between h-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-2.5 h-2.5 rounded-full ${msg.streaming ? "animate-pulse" : ""}`}
                     style={{
                       background: msg.streaming ? "var(--neon-amber)" : "var(--neon-green)",
                       boxShadow: `0 0 8px ${msg.streaming ? "var(--neon-amber)" : "var(--neon-green)"}`,
                     }} />
                {msg.streaming && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping bg-amber-400 opacity-40" />}
              </div>
              <span className="text-[10px] tracking-widest font-black uppercase italic">SAM_CORE // RESPONSE</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1 opacity-40">
                <div className="w-1 h-3 bg-current" />
                <div className="w-1 h-2 bg-current" />
                <div className="w-1 h-4 bg-current" />
                <div className="w-1 h-1 bg-current" />
              </div>
              {msg.streaming ? (
                <span className="text-[8px] font-black italic text-amber-400 tracking-tighter">DECODING_STREAM...</span>
              ) : (
                <span className="text-[8px] opacity-30 font-bold uppercase tracking-widest">PROTO_STABLE</span>
              )}
            </div>
          </div>

          <div className="p-5 text-[12px] leading-[1.7] min-h-[60px]"
               style={{ color: "var(--text-1)", fontFamily: "var(--font-hud)" }}>
            <AsciiMarkdown
              content={text || msg.parts[0].text}
              color="var(--accent)"
              imageWidth={40}
            />
            {msg.streaming && <span className="inline-block w-1.5 h-4 bg-accent ml-1 animate-pulse align-middle" />}
          </div>

          {msg.asciiCard && (
            <div className="px-5 pb-5">
              <div className="ascii-card bg-black/40 p-3 border border-white/5 shadow-inner">
                {msg.asciiCard}
              </div>
            </div>
          )}

          {/* Action Footer */}
          {!msg.streaming && (
            <div className="flex items-center gap-px border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {["ARCHIVE", "SYNC_MEMORY", "REGENERATE"].map(label => (
                <button
                  key={label}
                  className="flex-1 py-2 text-[8px] font-black uppercase tracking-widest transition-all border-r last:border-r-0"
                  style={{ 
                    background: "rgba(255,255,255,0.02)", 
                    color: "var(--text-muted)", 
                    fontFamily: "var(--font-hud)",
                    borderColor: "rgba(255,255,255,0.05)"
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(var(--accent-rgb), 0.1)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.02)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                  }}
                >
                  [{label}]
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Chat Page ─────────────────────────────────────────────── */
export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("SAM_CHAT_HISTORY");
    return saved ? JSON.parse(saved) : [
      {
        id: "init",
        role: "model",
        parts: [{ text: "SAM-OS Neural Cockpit online.\n\nAll cognitive relays active. Hybrid Sovereign Memory stack initialized. Connection to local vector graph established.\n\nHow shall we proceed?" }],
        asciiCard: `
╔══════════════════════════════════╗
║  PROTO_INITIALIZED               ║
╠══════════════════════════════════╣
║  MDL: GEMINI-2.0-FLASH           ║
║  MEM: 1,429 RELATIONS            ║
║  SEC: LOCAL_ONLY                 ║
╚══════════════════════════════════╝`.trim(),
      }
    ];
  });

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingImg, setPendingImg] = useState<{ dataUrl: string; mimeType: string } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem("SAM_CHAT_HISTORY", JSON.stringify(messages));
  }, [messages]);

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      scrollRef.current.scrollTo({ top: scrollHeight - clientHeight, behavior: "smooth" });
    }
  }, [messages]);

  const apiKey = localStorage.getItem("SAM_API_GEMINI") || "";

  const handleSend = useCallback(async () => {
    const query = input.trim();
    if ((!query && !pendingImg) || isStreaming) return;

    if (!apiKey) {
      setApiError("⚠ NO_API_KEY :: Establish uplink in System Configuration.");
      return;
    }

    setApiError(null);
    const start = Date.now();
    const id = Date.now().toString();
    const userMsg: ChatMessage = {
      id,
      role: "user",
      parts: [{ text: query || "[UPLINK_IMAGE_PACKET]" }],
      imageDataUrl: pendingImg?.dataUrl,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setPendingImg(null);
    setIsStreaming(true);
    textareaRef.current?.focus();

    const streamId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: streamId,
      role: "model",
      parts: [{ text: "" }],
      streaming: true,
    }]);

    try {
      const history: Message[] = messages.map(m => ({ role: m.role, parts: m.parts }));
      const stream = sendMessageStream(history, query || "[Describe provided visual input]");
      let full = "";
      for await (const chunk of stream) {
        full += chunk;
        setMessages(prev =>
          prev.map(m =>
            m.id === streamId ? { ...m, parts: [{ text: full }] } : m
          )
        );
      }
      
      const latency = Date.now() - start;
      const card = /data|result|analys|scan|report|memory/i.test(query)
        ? `
┌──────────────────────────────┐
│ ANALYTIC_SYNC_COMPLETE       │
├──────────────────────────────┤
│ LATENCY: ${latency}ms         │
│ NODES: 124                   │
│ REL: STABLE                  │
└──────────────────────────────┘`.trim()
        : undefined;

      setMessages(prev =>
        prev.map(m =>
          m.id === streamId
            ? { ...m, streaming: false, asciiCard: card, latency }
            : m
        )
      );
    } catch (err: any) {
      console.error(err);
      let errorMsg = err.message || "UPLINK_FAILURE";
      
      // Specifically handle the "leaked" error
      if (errorMsg.toLowerCase().includes("leaked") || errorMsg.toLowerCase().includes("api key")) {
        errorMsg = "SECURITY_BREACH :: Your API Key has been flagged as LEAKED by the provider. It must be rotated immediately.";
        setApiError("LEAKED_KEY_ERROR");
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === streamId
            ? { ...m, parts: [{ text: `[CRITICAL_FAILURE] ${errorMsg}` }], streaming: false }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [input, pendingImg, isStreaming, messages, apiKey]);

  const updateKeyInline = (newKey: string) => {
    localStorage.setItem("SAM_API_GEMINI", newKey);
    setApiError(null);
    window.location.reload(); // Quick reset
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <MatrixRain opacity={0.06} density={0.25} speed={0.4} color="var(--accent)" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 overflow-hidden backdrop-blur-[2px]">
        
        {/* Advanced Error/Security Banner */}
        <AnimatePresence>
          {apiError === "LEAKED_KEY_ERROR" && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-950/40 border-b border-red-500/50 p-6 flex flex-col gap-4 overflow-hidden"
              style={{ fontFamily: "var(--font-hud)" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 border-red-500 animate-pulse text-red-500 font-black text-2xl">
                  !
                </div>
                <div className="flex-1">
                  <div className="text-red-500 font-black text-[12px] tracking-[0.3em] uppercase">Security Breach Detected</div>
                  <div className="text-[10px] text-red-200/60 leading-relaxed max-w-xl">
                    Google has revoked your API Key because it was found in a public data leak or repository.
                    SAM-OS grounding protocols have been disabled for safety. Please enter a newly generated key below to restore the neural link.
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input 
                  type="password"
                  placeholder="ENTER NEW API KEY..."
                  className="bg-black/50 border border-red-500/30 px-3 py-2 text-[10px] w-80 outline-none focus:border-red-500 transition-colors text-red-100 font-mono"
                  onKeyDown={e => {
                    if (e.key === "Enter") updateKeyInline(e.currentTarget.value);
                  }}
                />
                <button 
                  onClick={() => {
                    const val = (document.querySelector('input[placeholder="ENTER NEW API KEY..."]') as HTMLInputElement)?.value;
                    if (val) updateKeyInline(val);
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                >
                  RESTORE_UPLINK
                </button>
                <button 
                  onClick={() => setApiError(null)}
                  className="px-4 py-2 text-[9px] opacity-40 hover:opacity-100 uppercase font-bold"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Neural Cockpit Status Header */}
        <div className="flex-shrink-0 px-6 py-3 flex items-center gap-8 border-b"
             style={{ background: "rgba(0,0,0,0.6)", borderColor: "rgba(255,255,255,0.05)", fontFamily: "var(--font-hud)" }}>
          <div className="flex items-center gap-2.5">
            <div className={`status-dot ${apiKey ? "ok" : "warn"} w-2 h-2`} />
            <div className="flex flex-col">
              <span className="text-[9px] font-black tracking-widest leading-none" style={{ color: "var(--accent)" }}>SAM_NEURAL_LINK</span>
              <span className="text-[7px] opacity-40 leading-none mt-0.5">{apiKey ? "SECURE_PROTOCOL_V4" : "LINK_OFFLINE"}</span>
            </div>
          </div>
          
          <div className="hidden md:flex gap-10">
            <div className="flex flex-col">
              <span className="text-[7px] font-bold opacity-30 uppercase">Grounding_Engine</span>
              <span className="text-[8px] font-black text-accent-2 tracking-widest">BGE-M3_HYBRID</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[7px] font-bold opacity-30 uppercase">Cognitive_Depth</span>
              <span className="text-[8px] font-black text-accent-3 tracking-widest">FLASH_EXTERN</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-bold opacity-30 uppercase">Memory_Relay</span>
              <span className="text-[8px] font-black tracking-widest uppercase">1,429_Nodes</span>
            </div>
            <button className="p-2 border border-white/5 hover:border-accent/30 transition-colors bg-white/5">
              <div className="grid grid-cols-2 gap-0.5">
                {[0,1,2,3].map(i => <div key={i} className="w-1 h-1 bg-accent opacity-50" />)}
              </div>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 sm:px-12 scrollbar-cyber"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="max-w-4xl mx-auto py-8">
            {messages.map(m =>
              m.role === "user"
                ? <UserBubble key={m.id} msg={m} />
                : <AiBubble key={m.id} msg={m} />
            )}
            {isStreaming && (
              <div className="mt-4 flex gap-2 items-center text-[8px] text-accent animate-pulse font-black uppercase tracking-[0.4em]">
                <div className="w-1 h-1 bg-accent rounded-full" />
                Processing_Neural_Weights...
              </div>
            )}
          </div>
        </div>

        {/* Image upload preview */}
        <AnimatePresence>
          {pendingImg && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="mx-6 sm:mx-12 p-3 bg-black/80 border border-accent/40 rounded-t flex items-center gap-4 shadow-2xl"
            >
              <div className="relative group/thumb">
                <img src={pendingImg.dataUrl} alt="pending" className="h-16 w-16 object-cover rounded border border-white/10" />
                <button 
                  onClick={() => setPendingImg(null)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] text-white shadow-lg"
                >✕</button>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-accent tracking-widest uppercase">Visual Payload Ready</div>
                <div className="text-[8px] opacity-40 uppercase tracking-tighter">MIME: {pendingImg.mimeType} // READY_FOR_UPLINK</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tactical Input Area */}
        <div className="p-6 pt-2 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="relative group/input">
              <div className="absolute -inset-1 bg-accent/20 blur opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
              <div className="relative border border-white/10 bg-black/60 focus-within:border-accent/60 transition-all p-3 pl-12 flex items-end gap-3 rounded-sm shadow-2xl">
                
                {/* Input Prefix HUD */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-center justify-center border-r border-white/5 opacity-40">
                  <div className="text-[8px] font-black -rotate-90 origin-center text-accent tracking-widest">CMD_IN</div>
                  <div className="w-px flex-1 bg-white/10 my-2" />
                  <div className="w-1.5 h-1.5 border border-accent rounded-full animate-ping" />
                </div>

                <textarea
                  ref={textareaRef}
                  id="chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={pendingImg ? "ANALYZE_IMAGE..." : "COMMAND_HERE..."}
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-[13px] py-1 placeholder:opacity-20 scrollbar-none"
                  style={{ color: "var(--text-1)", fontFamily: "var(--font-hud)", lineHeight: "1.5" }}
                />

                <div className="flex gap-2 pb-0.5">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="p-2 hover:bg-white/5 transition-colors text-white/40 hover:text-accent"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={isStreaming || (!input.trim() && !pendingImg)}
                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden ${
                      isStreaming || (!input.trim() && !pendingImg) 
                        ? "bg-white/5 text-white/20 border-white/10" 
                        : "bg-accent/10 text-accent border-accent/40 hover:bg-accent hover:text-black shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]"
                    } border`}
                  >
                    {isStreaming ? "PROCESS..." : "EXECUTE"}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Input Footer Metadata */}
            <div className="flex justify-between items-center mt-3 px-1">
              <div className="flex gap-6">
                {[
                  { label: "SYS_HEALTH", value: "OPTIMAL", color: "var(--neon-green)" },
                  { label: "MEM_CACHE", value: "HIT", color: "var(--accent-2)" },
                  { label: "GROUNDING", value: "LOCAL_ONLY", color: "var(--accent-3)" },
                ].map(item => (
                  <div key={item.label} className="flex gap-2 items-center">
                    <span className="text-[7px] font-bold opacity-30 uppercase">{item.label}</span>
                    <span className="text-[7px] font-black tracking-widest" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="text-[7px] opacity-20 font-bold uppercase italic tracking-tighter">Shift+Enter for multi-line command protocol</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setShowSidebar(s => !s)}
        className="absolute top-1/2 -translate-y-1/2 right-0 z-30 w-4 h-16 flex items-center justify-center border-l border-y transition-all hover:w-6 hover:bg-accent/10 group backdrop-blur-md"
        style={{ borderColor: "rgba(255,255,255,0.05)", color: "var(--accent)" }}
      >
        <span className="text-[10px] transition-transform group-hover:scale-125">{showSidebar ? "▶" : "◀"}</span>
      </button>

      {/* Context sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: showSidebar ? 240 : 0, opacity: showSidebar ? 1 : 0 }}
        className="flex-shrink-0 flex flex-col border-l overflow-hidden bg-black/40 backdrop-blur-md"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="win-title-bar px-4 h-10 border-b border-white/5 bg-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest">Context_Manager_v1</span>
        </div>

        <div className="p-5 space-y-8 flex-1 overflow-y-auto scrollbar-none">
          <ClockWidget />
          <NeuralStatusWidget />

          {/* Visual Cache */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-0.5 bg-accent-2" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Visual_Buffer</span>
            </div>
            <div className="bg-black/20 p-2 border border-white/5">
              <AsciiGallery
                items={CURATED_ARTWORKS}
                intervalMs={8000}
                color="var(--accent-2)"
                width={32}
              />
            </div>
          </div>

          {/* Neural Grounding Targets */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-0.5 bg-accent" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Grounding_Targets</span>
            </div>
            <div className="space-y-3">
              {[{ label: "arxiv:2603.11283", rel: 82 }, { label: "QEC_paper.pdf", rel: 94 }].map(s => (
                <div key={s.label} className="group/target">
                  <div className="flex justify-between text-[9px] mb-1.5 font-bold uppercase tracking-tighter group-hover/target:text-accent transition-colors">
                    <span className="truncate opacity-50">{s.label}</span>
                    <span className="text-accent">{s.rel}%</span>
                  </div>
                  <div className="h-1 bg-white/5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.rel}%` }}
                      className="h-full bg-accent relative"
                    >
                      <div className="absolute inset-0 bg-white/40 animate-pulse" />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Memory Cluster Sidebar */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-0.5 bg-accent-3" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Cognitive_Cluster</span>
            </div>
            <div className="space-y-2">
              {[
                { id: "0x391", text: "FT-QC Timelines", icon: "⚄" },
                { id: "0x34F", text: "Surface Code Pref", icon: "⚅" },
                { id: "0x2A1", text: "Personality_Core", icon: "⚃" }
              ].map(m => (
                <div key={m.id}
                     className="text-[9px] py-2 px-3 border border-white/5 hover:border-accent-2/30 hover:bg-white/5 transition-all cursor-pointer flex items-center gap-3 group"
                     style={{ fontFamily: "var(--font-hud)" }}>
                  <span className="text-accent-2 group-hover:scale-125 transition-transform">{m.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-[7px] opacity-30 font-bold uppercase">{m.id}</span>
                    <span className="text-white/70 group-hover:text-white truncate">{m.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/40">
          <div className="text-[8px] font-black uppercase tracking-[0.3em] opacity-20 text-center">
            SAM-OS // COGNITIVE_UPLINK
          </div>
        </div>
      </motion.aside>

      {/* Invisible file input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = ev => setPendingImg({ dataUrl: ev.target?.result as string, mimeType: file.type });
          reader.readAsDataURL(file);
        }
        e.target.value = "";
      }} />
    </div>
  );
};

/* ─── Thinking trace parser ──────────────────────────────────────── */
const parseThinking = (raw: string): { thinking: string | null; text: string } => {
  const match = raw.match(/<thinking>([\s\S]*?)<\/thinking>/i);
  if (!match) return { thinking: null, text: raw };
  return {
    thinking: match[1].trim(),
    text: raw.replace(match[0], "").trim(),
  };
};
