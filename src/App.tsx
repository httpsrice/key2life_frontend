/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { AppShell } from "./components/AppShell";

type RootView = "landing" | "app";

const APP_HASHES = new Set(["#app", "#chat", "#intel", "#monitor", "#settings", "#memory"]);

export default function App() {
  const [view, setView] = useState<RootView>(() =>
    APP_HASHES.has(window.location.hash) ? "app" : "landing"
  );

  useEffect(() => {
    const onHash = () => {
      setView(APP_HASHES.has(window.location.hash) ? "app" : "landing");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goToApp = () => {
    window.location.hash = "chat";
    setView("app");
  };

  const goToLanding = () => {
    window.location.hash = "";
    setView("landing");
  };

  return (
    <div className="w-full h-full min-h-screen" style={{ background: "var(--bg)" }}>
      {view === "landing"
        ? <LandingPage onEnter={goToApp} />
        : <AppShell onBackToLanding={goToLanding} />
      }
    </div>
  );
}
