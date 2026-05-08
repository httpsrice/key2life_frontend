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
  imageDataUrl?: string;  // for multimodal user messages
}

/* ─── ASCII card builder ─────────────────────────────────────────── */
const buildAsciiCard = (type: string): string => `
╔══════════════════════════════════╗
║  GRND_RESULT :: ${type.padEnd(16)} ║
╠══════════════════════════════════╣
║  SRC  ARCHIVE_FETCH              ║
║  MDL  GEMINI-2.0-FLASH           ║
║  LAT  <40ms   STATUS  ✓ OK       ║
╚══════════════════════════════════╝`.trim();

/* ─── Thinking trace parser ──────────────────────────────────────── */
const parseThinking = (raw: string): { thinking: string | null; text: string } => {
  const match = raw.match(/<thinking>([\s\S]*?)<\/thinking>/i);
  if (!match) return { thinking: null, text: raw };
  return {
    thinking: match[1].trim(),
    text: raw.replace(match[0], "").trim(),
  };
};

/* ─── Bubble: User ───────────────────────────────────────────────── */
const UserBubble = ({
  msg,
}: { msg: ChatMessage }) => (
  <div className="flex justify-end mb-4">
    <div className="max-w-[72%] flex flex-col gap-1.5 items-end">
      {msg.imageDataUrl && (
        <img
          src={msg.imageDataUrl}
          alt="attached"
          className="rounded max-h-40 border"
          style={{ borderColor: "var(--accent-2)", boxShadow: "0 0 10px var(--accent-glow2)" }}
        />
      )}
      <div
        className="px-3 py-2 text-xs leading-relaxed"
        style={{
          background: "var(--accent-glow)",
          border: "1px solid var(--accent)",
          color: "var(--text-1)",
          borderRadius: "2px 0 2px 2px",
          fontFamily: "var(--font-hud)",
          boxShadow: "0 0 12px var(--accent-glow)",
        }}
      >
        <span className="mr-2 opacity-60" style={{ color: "var(--accent)" }}>›</span>
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
    <div className="pr-8 mb-5">
      {/* Thinking trace */}
      {thinking && (
        <div className="mb-2">
          <button
            onClick={() => setShowThinking(s => !s)}
            className="text-[8px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-hud)", color: "var(--accent-2)" }}
          >
            <div className={`status-dot ${showThinking ? "ok" : "idle"}`} style={{ width: 4, height: 4 }} />
            {showThinking ? "[-] COLLAPSE_TRACE" : "[+] EXPAND_THOUGHT_PROCESS"}
          </button>
          <AnimatePresence>
            {showThinking && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-1 p-2 text-[9px] leading-relaxed border border-dashed rounded"
                     style={{
                       borderColor: "var(--accent-glow)",
                       color: "var(--text-muted)",
                       fontFamily: "var(--font-mono)",
                       background: "var(--bg)",
                       boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
                     }}>
                  {thinking.split("\n").map((l, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="opacity-20 select-none">L{i + 1}</span>
                      <span className="opacity-70">{l}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main window */}
      <div className="win-border overflow-hidden"
           style={{
             background: "var(--win-bg)",
             boxShadow: msg.streaming ? "0 0 16px var(--accent-glow)" : "none",
           }}>
        <div className="win-title-bar justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full"
                 style={{
                   background: msg.streaming ? "var(--neon-amber)" : "var(--neon-green)",
                   boxShadow: `0 0 4px ${msg.streaming ? "var(--neon-amber)" : "var(--neon-green)"}`,
                 }} />
            SAM · SYSTEM_OUTPUT
          </div>
          {msg.streaming && (
            <span className="text-[7px] animate-pulse" style={{ color: "var(--neon-amber)" }}>
              STREAMING…
            </span>
          )}
        </div>

        <div className="p-3 text-xs leading-relaxed"
             style={{ color: "var(--text-1)", fontFamily: "var(--font-hud)" }}>
          <AsciiMarkdown
            content={text || msg.parts[0].text}
            color="var(--accent)"
            imageWidth={40}
          />
          {msg.streaming && <span className="cursor-blink" />}
        </div>

        {msg.asciiCard && (
          <div className="ascii-card mx-3 mb-3">{msg.asciiCard}</div>
        )}

        {!msg.streaming && (
          <div className="flex items-center gap-1 px-3 pb-2">
            {["SAVE", "COPY", "PIN"].map(label => (
              <button
                key={label}
                className="px-2 py-0.5 text-[8px] font-bold uppercase transition-all win-border"
                style={{ background: "var(--win-grey)", color: "var(--text-2)", fontFamily: "var(--font-hud)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--win-grey)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)";
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main Chat Page ─────────────────────────────────────────────── */
export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "model",
      parts: [{ text: "SAM-OS online. Neural grounding protocols active. Multimodal perception loaded.\n\nReady to assist. You can type, paste images, or attach files." }],
      asciiCard: buildAsciiCard("INIT"),
    },
  ]);
  const [input, setInput]       = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingImg, setPendingImg]  = useState<{ dataUrl: string; mimeType: string } | null>(null);
  const [apiError, setApiError]      = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const scrollRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);

  /* Auto-scroll */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  /* ── API key guard ── */
  const apiKey = localStorage.getItem("SAM_API_GEMINI") || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "";

  /* ── Handle image paste ── */
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (!file) return;
          const reader = new FileReader();
          reader.onload = ev => {
            setPendingImg({ dataUrl: ev.target?.result as string, mimeType: item.type });
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          break;
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  /* ── Send message ── */
  const handleSend = useCallback(async () => {
    const query = input.trim();
    if ((!query && !pendingImg) || isStreaming) return;

    if (!apiKey) {
      setApiError("⚠ GEMINI_API_KEY not set. Go to Settings and add your API Key.");
      return;
    }

    setApiError(null);
    const id = Date.now().toString();
    const userMsg: ChatMessage = {
      id,
      role: "user",
      parts: [{ text: query || "[Image attached]" }],
      imageDataUrl: pendingImg?.dataUrl,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setPendingImg(null);
    setIsStreaming(true);
    textareaRef.current?.focus();

    const streamId = (Date.now() + 1).toString();
    // Add streaming placeholder
    setMessages(prev => [...prev, {
      id: streamId,
      role: "model",
      parts: [{ text: "" }],
      streaming: true,
    }]);

    try {
      // Build history without the placeholder
      const history: Message[] = messages.map(m => ({ role: m.role, parts: m.parts }));
      const stream = sendMessageStream(history, query || "[Describe the attached image]");
      let full = "";
      for await (const chunk of stream) {
        full += chunk;
        setMessages(prev =>
          prev.map(m =>
            m.id === streamId ? { ...m, parts: [{ text: full }] } : m
          )
        );
      }
      // Finalize
      const card = /data|result|analys|scan|report/i.test(query)
        ? buildAsciiCard("ANALYSIS")
        : undefined;
      setMessages(prev =>
        prev.map(m =>
          m.id === streamId
            ? { ...m, streaming: false, asciiCard: card }
            : m
        )
      );
    } catch (err: any) {
      console.error(err);
      setMessages(prev =>
        prev.map(m =>
          m.id === streamId
            ? { ...m, parts: [{ text: `[ERROR] ${err.message || "Stream failed. Check your API key."}` }], streaming: false }
            : m
        )
      );
      setApiError(err.message || "Unknown error");
    } finally {
      setIsStreaming(false);
    }
  }, [input, pendingImg, isStreaming, messages, apiKey]);

  /* ── Handle file input ── */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPendingImg({ dataUrl: ev.target?.result as string, mimeType: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--bg)" }}>

      {/* ── Matrix rain background (subtle) ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <MatrixRain opacity={0.04} density={0.3} speed={0.5} />
      </div>

      {/* ── Chat column ── */}
      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">

        {/* API Key warning banner */}
        {(!apiKey || apiError) && (
          <div className="flex-shrink-0 px-4 py-2 text-[9px] border-b animate-pulse"
               style={{
                 background: "rgba(123,0,255,0.12)",
                 borderColor: "var(--text-1)",
                 color: "var(--text-1)",
                 fontFamily: "var(--font-hud)",
               }}>
            {!apiKey
              ? "⚠ API KEY MISSING — Navigate to the Settings tab to enter your Gemini API Key."
              : `⚠ ${apiError}`}
          </div>
        )}

        {/* Status bar */}
        <div className="flex-shrink-0 px-4 py-1.5 flex items-center gap-4 text-[8px] border-b"
             style={{ background: "var(--surface)", borderColor: "var(--border)", fontFamily: "var(--font-hud)" }}>
          <div className="flex items-center gap-1.5">
            <div className={`status-dot ${apiKey ? "ok" : "warn"}`} />
            <span style={{ color: "var(--accent)" }}>{apiKey ? "GROUNDED" : "NO KEY"}</span>
          </div>
          <span style={{ color: "var(--text-muted)" }}>MODEL: GEMINI-2.0-FLASH</span>
          <span style={{ color: "var(--text-muted)" }}>MULTIMODAL: ACTIVE</span>
          <div className="ml-auto flex gap-3" style={{ color: "var(--text-muted)" }}>
            <span>CTX: ACTIVE</span>
            <span>MEM: 1247 NODES</span>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 scrollbar-cyber"
          style={{ scrollbarWidth: "thin" }}
        >
          {messages.map(m =>
            m.role === "user"
              ? <UserBubble key={m.id} msg={m} />
              : <AiBubble key={m.id} msg={m} />
          )}
        </div>

        {/* Image preview */}
        <AnimatePresence>
          {pendingImg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex-shrink-0 px-4 py-2 border-t flex items-center gap-3"
              style={{ borderColor: "var(--accent)", background: "var(--surface)" }}
            >
              <img src={pendingImg.dataUrl} alt="pending" className="h-12 rounded" />
              <span className="text-[9px] flex-1" style={{ fontFamily: "var(--font-hud)", color: "var(--accent)" }}>
                IMAGE QUEUED — will be sent with your next message
              </span>
              <button
                onClick={() => setPendingImg(null)}
                className="text-[9px] opacity-60 hover:opacity-100"
                style={{ color: "var(--text-1)", fontFamily: "var(--font-hud)" }}
              >
                ✕ REMOVE
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input zone */}
        <div className="flex-shrink-0 p-3 border-t"
             style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-end gap-2 p-2 border"
               style={{
                 background: "var(--term-bg)",
                 borderColor: "var(--accent)",
                 boxShadow: isStreaming ? "0 0 12px var(--accent-glow)" : "none",
               }}>
            <span className="text-lg mb-0.5 flex-shrink-0" style={{ color: "var(--accent)" }}>›</span>
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={pendingImg ? "Add a question about the image…  (Enter to send)" : "Enter command…  (Shift+Enter = newline)"}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-xs py-0.5 placeholder:opacity-30"
              style={{ color: "var(--term-text)", fontFamily: "var(--font-hud)", lineHeight: "1.6" }}
            />
            <button
              id="send-btn"
              onClick={handleSend}
              disabled={isStreaming || (!input.trim() && !pendingImg)}
              className="flex-shrink-0 px-4 py-1 text-[9px] font-bold uppercase tracking-widest border transition-all disabled:opacity-30"
              style={{
                background: "var(--win-grey)",
                color: "var(--accent)",
                borderColor: "var(--accent)",
                fontFamily: "var(--font-hud)",
              }}
              onMouseEnter={e => {
                if (!isStreaming) {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#000";
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--win-grey)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
              }}
            >
              {isStreaming ? "…" : "SEND"}
            </button>
          </div>

          {/* Tool shortcuts */}
          <div className="flex items-center gap-4 mt-2 px-1">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {[
              { code: "IMG", label: "Attach Image", action: () => fileRef.current?.click() },
              { code: "WEB", label: "Web Grounding", action: () => {} },
              { code: "MEM", label: "Long-term Memory", action: () => {} },
              { code: "VOX", label: "Voice Input", action: () => {} },
              { code: "SRC", label: "Search Sources", action: () => {} },
            ].map(t => (
              <button
                key={t.code}
                title={t.label}
                onClick={t.action}
                className="text-[8px] font-bold uppercase opacity-40 hover:opacity-100 transition-opacity"
                style={{ color: "var(--accent-2)", fontFamily: "var(--font-hud)" }}
              >
                {t.code}
              </button>
            ))}
            <span className="ml-auto text-[7px] opacity-25"
                  style={{ fontFamily: "var(--font-hud)", color: "var(--text-muted)" }}>
              CTRL+ENTER = FORCE SEND
            </span>
          </div>
        </div>
      </div>

      {/* ── Sidebar Toggle Button ── */}
      <button
        onClick={() => setShowSidebar(s => !s)}
        className="absolute top-1/2 -translate-y-1/2 right-0 z-30 w-3 h-12 flex items-center justify-center border-l border-y transition-all hover:w-5 group"
        style={{
          background: "var(--win-bg)",
          borderColor: "var(--border)",
          color: "var(--accent)",
          fontFamily: "var(--font-hud)",
          borderRadius: "4px 0 0 4px"
        }}
      >
        <span className="text-[10px] scale-y-150 transition-transform group-hover:scale-110">
          {showSidebar ? "▶" : "◀"}
        </span>
      </button>

      {/* ── Context sidebar ── */}
      <motion.aside
        initial={false}
        animate={{ width: showSidebar ? 208 : 0, opacity: showSidebar ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-shrink-0 flex flex-col border-l overflow-hidden scrollbar-cyber whitespace-nowrap"
        style={{ background: "var(--win-grey)", borderColor: "var(--border)" }}
      >
        <div className="win-title-bar flex-shrink-0">CONTEXT.SYS</div>

        <div className="p-2 space-y-4 flex-1 overflow-y-auto">
          <ClockWidget />
          <NeuralStatusWidget />

          {/* ASCII Art Gallery */}
          <div>
            <div className="text-[7px] font-bold uppercase tracking-widest mb-2 opacity-50"
                 style={{ fontFamily: "var(--font-hud)", color: "var(--text-2)" }}>
              Visual_Cache
            </div>
            <AsciiGallery
              items={CURATED_ARTWORKS}
              intervalMs={7000}
              color="var(--accent-2)"
              width={28}
              showLabel
            />
          </div>

          {/* Grounding sources */}
          <div>
            <div className="text-[7px] font-bold uppercase tracking-widest mb-2 opacity-50"
                 style={{ fontFamily: "var(--font-hud)", color: "var(--text-2)" }}>
              Active Grounding
            </div>
            {[{ label: "arxiv:2603.11283", rel: 82 }, { label: "QEC_paper.pdf", rel: 94 }].map(s => (
              <div key={s.label} className="mb-2">
                <div className="flex justify-between text-[8px] mb-0.5"
                     style={{ fontFamily: "var(--font-hud)" }}>
                  <span className="truncate opacity-70" style={{ color: "var(--text-2)" }}>{s.label}</span>
                  <span style={{ color: "var(--accent)" }}>{s.rel}%</span>
                </div>
                <div className="h-0.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full" style={{ width: `${s.rel}%`, background: "var(--accent)", boxShadow: "0 0 4px var(--accent)" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Memory nodes */}
          <div>
            <div className="text-[7px] font-bold uppercase tracking-widest mb-1.5 opacity-50"
                 style={{ fontFamily: "var(--font-hud)", color: "var(--text-2)" }}>
              LTM Segments
            </div>
            {[{ id: "0x391", text: "FT-QC Timelines" }, { id: "0x34F", text: "Surface Code Pref" }, { id: "0x2A1", text: "SAM Personality Core" }].map(m => (
              <div key={m.id}
                   className="text-[8px] py-0.5 px-1 cursor-pointer hover:opacity-100 transition-opacity opacity-60 flex gap-1.5"
                   style={{ fontFamily: "var(--font-hud)", color: "var(--text-2)" }}>
                <span className="font-bold" style={{ color: "var(--accent-2)" }}>{m.id}</span>
                <span className="truncate">{m.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-2 text-[7px] text-center opacity-20 border-t"
             style={{ borderColor: "var(--border)", fontFamily: "var(--font-hud)" }}>
          © 2026 SAM-CORP · α BUILD
        </div>
      </motion.aside>
    </div>
  );
};
