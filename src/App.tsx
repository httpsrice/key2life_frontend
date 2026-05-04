/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { AppShell } from "./components/AppShell";

export default function App() {
  const [view, setView] = useState<"landing" | "app" | "recents">("landing");

  // Handle URL hash routing
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#app") {
        setView("app");
      } else if (window.location.hash === "#recents") {
        setView("recents");
      } else {
        setView("landing");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const navigateToApp = () => {
    window.location.hash = "app";
    setView("app");
  };

  const navigateToLanding = () => {
    window.location.hash = "";
    setView("landing");
  };

  return (
    <div className="w-full h-full min-h-screen">
      {view === "landing" ? (
        <LandingPage onEnter={navigateToApp} />
      ) : (
        <AppShell onBackToLanding={navigateToLanding} />
      )}
    </div>
  );
}
