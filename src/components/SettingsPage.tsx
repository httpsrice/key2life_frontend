import React, { useState } from "react";

export const SettingsPage: React.FC = () => {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );
  
  const [keys, setKeys] = useState(() => ({
    gemini: localStorage.getItem("SAM_API_GEMINI") || "",
    anthropic: localStorage.getItem("SAM_API_ANTHROPIC") || "",
    openai: localStorage.getItem("SAM_API_OPENAI") || "",
  }));

  const updateKey = (provider: keyof typeof keys, value: string) => {
    setKeys(prev => ({ ...prev, [provider]: value }));
    localStorage.setItem(`SAM_API_${provider.toUpperCase()}`, value);
  };

  const [proxy, setProxy] = useState("http://localhost:3100");

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between border-b py-3 gap-4"
         style={{ borderColor: "var(--border)" }}>
      <div className="text-[11px] font-mono uppercase tracking-widest" style={{ color: "var(--text-2)" }}>
        {label}
      </div>
      <div>{children}</div>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-8">
      <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-3 pb-2 border-b"
           style={{ color: "var(--accent)", borderColor: "var(--border)" }}>
        {title}
      </div>
      {children}
    </section>
  );

  return (
    <div className="h-full overflow-y-auto p-8 font-mono"
         style={{ background: "var(--term-bg)", color: "var(--text-1)" }}>
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-bold uppercase tracking-widest mb-8"
            style={{ color: "var(--term-text)" }}>
          System Configuration
        </h1>

        <Section title="Display">
          <Row label="Theme">
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              className="px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest border-2 transition-all"
              style={{
                borderColor: "var(--accent)",
                color: isDark ? "var(--term-bg)" : "var(--accent)",
                background: isDark ? "var(--accent)" : "transparent",
              }}
            >
              {isDark ? "● Dark Mode" : "○ Light Mode"}
            </button>
          </Row>
        </Section>

        <Section title="Network">
          <Row label="Paperclip Proxy URL">
            <input
              id="proxy-url"
              type="text"
              value={proxy}
              onChange={e => setProxy(e.target.value)}
              className="bg-transparent border text-[11px] px-2 py-1 font-mono w-56 outline-none"
              style={{ borderColor: "var(--border)", color: "var(--term-text)" }}
            />
          </Row>
          <Row label="ZeroClaw">
            <span className="text-[10px] opacity-40 uppercase tracking-widest">
              On Hold
            </span>
          </Row>
        </Section>

        <Section title="API Configuration">
          <Row label="Google Gemini Key">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keys.gemini}
              onChange={e => updateKey("gemini", e.target.value)}
              className="bg-transparent border text-[11px] px-2 py-1 font-mono w-56 outline-none focus:border-[var(--accent)] transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--term-text)" }}
            />
          </Row>
          <Row label="Anthropic Key">
            <input
              type="password"
              placeholder="sk-ant-..."
              value={keys.anthropic}
              onChange={e => updateKey("anthropic", e.target.value)}
              className="bg-transparent border text-[11px] px-2 py-1 font-mono w-56 outline-none focus:border-[var(--accent)] transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--term-text)" }}
            />
          </Row>
          <Row label="OpenAI Key">
            <input
              type="password"
              placeholder="sk-proj-..."
              value={keys.openai}
              onChange={e => updateKey("openai", e.target.value)}
              className="bg-transparent border text-[11px] px-2 py-1 font-mono w-56 outline-none focus:border-[var(--accent)] transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--term-text)" }}
            />
          </Row>
        </Section>

        <Section title="About">
          <Row label="Version"><span className="opacity-50">1.0.0-alpha</span></Row>
          <Row label="Kernel"><span className="opacity-50">SAM-OS 1.0.42</span></Row>
          <Row label="Model"><span className="opacity-50">Gemini 2.0 Flash</span></Row>
        </Section>
      </div>
    </div>
  );
};
