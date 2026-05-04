import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { SystemWidget, WeatherWidget, StockWidget } from "./neural-components";

const ds = ['✧', '·', '◦', '･', 'ﾟ', '✧', '☆', '₊', '˚', 'ଘ', 'ᙏ', 'ଓ', '✿'];
const pc = ['#FFC0CB', '#FFD1DC', '#FFF0F5', '#FFB6C1', '#FF69B4', '#FFFFFF'];

export const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sceneInfo, setSceneInfo] = useState({ name: "AESTHETIC", index: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lps: any[] = [];
    
    const initL = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      lps = [];
      for (let i = 0; i < 250; i++) {
        lps.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          ch: ds[Math.floor(Math.random() * ds.length)],
          col: pc[Math.floor(Math.random() * pc.length)],
          sz: 6 + Math.random() * 18,
          al: 0.1 + Math.random() * 0.7,
          ph: Math.random() * Math.PI * 2,
          fr: 0.5 + Math.random() * 1.5,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
        });
      }
    };

    let animationId: number;
    let lastTime = 0;
    const drawL = (t: number) => {
      const W = canvas.width;
      const H = canvas.height;
      const dt = t - lastTime;
      lastTime = t;

      // Subtle background fade for trail effect
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(0, 0, W, H);
      
      const mode = Math.floor(t / 4000) % 4; // Rotate every 4 seconds

      if (mode === 0) {
        // CHAOTIC PARTICLES
        for (const p of lps) {
          p.x += p.vx * (1 + Math.sin(t * 0.001) * 0.5);
          p.y += p.vy * (1 + Math.cos(t * 0.001) * 0.5);
          
          if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

          ctx.globalAlpha = p.al * (0.4 + Math.sin(t * 0.002 + p.ph) * 0.6);
          ctx.fillStyle = p.col;
          ctx.font = `${p.sz}px "DM Sans", serif`;
          ctx.fillText(p.ch, p.x, p.y);
          
          // Occasional lines
          if (Math.random() > 0.99) {
            ctx.strokeStyle = p.col;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + (Math.random() - 0.5) * 100, p.y + (Math.random() - 0.5) * 100);
            ctx.stroke();
          }
        }
      } else if (mode === 1) {
        // GLITCH GRID
        const gridSize = 40;
        for (let x = 0; x < W; x += gridSize) {
          for (let y = 0; y < H; y += gridSize) {
            if (Math.random() > 0.92) {
              ctx.fillStyle = pc[Math.floor(Math.random() * pc.length)];
              ctx.globalAlpha = 0.1;
              ctx.fillRect(x, y, gridSize - 2, gridSize - 2);
            }
          }
        }
        for (const p of lps.slice(0, 50)) {
           p.y += 5;
           if (p.y > H) p.y = 0;
           ctx.globalAlpha = 0.3;
           ctx.fillStyle = "#FF69B4";
           ctx.font = `${p.sz * 2}px monospace`;
           ctx.fillText(p.ch, p.x, p.y);
        }
      } else if (mode === 2) {
        // COLLAGE / RETRO VHS
        for (let i = 0; i < 5; i++) {
           const x = Math.random() * W;
           const y = Math.random() * H;
           const w = 50 + Math.random() * 200;
           const h = 5 + Math.random() * 40;
           ctx.fillStyle = pc[Math.floor(Math.random() * pc.length)];
           ctx.globalAlpha = 0.1;
           ctx.fillRect(x, y, w, h);
        }
        for (const p of lps) {
          const r = 100 + Math.sin(t * 0.0005) * 80;
          const px = W/2 + Math.cos(p.ph + t * 0.0005) * r * p.fr;
          const py = H/2 + Math.sin(p.ph + t * 0.0005) * r * p.fr;
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = p.col;
          ctx.font = `${p.sz}px serif`;
          ctx.fillText(p.ch, px, py);
        }
      } else {
        // STATIC NOISE BURST
        for (let i = 0; i < 1000; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? "#FFB3D9" : "#FFFFFF";
          ctx.globalAlpha = 0.05;
          ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
        }
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "#FF69B4";
        ctx.font = "italic 40px serif";
        ctx.fillText("LOADING...", W-300, H-100);
      }
      
      // Global scanline glitch
      if (Math.random() > 0.98) {
        ctx.fillStyle = "rgba(255, 105, 180, 0.05)";
        ctx.fillRect(0, Math.random() * H, W, 2);
      }
      
      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(drawL);
    };

    window.addEventListener("resize", initL);
    initL();
    animationId = requestAnimationFrame(drawL);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", initL);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#FFFFFF] overflow-hidden flex items-center justify-center font-mono select-none text-[#FF69B4]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* HUD Widgets Overlay */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-6 right-6 w-48 space-y-3 z-20 pointer-events-auto hidden md:block"
      >
        <SystemWidget title="Neural Environment" defaultOpen={true}>
          <WeatherWidget />
        </SystemWidget>
        
        <SystemWidget title="Market Flux" defaultOpen={true}>
          <StockWidget />
        </SystemWidget>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center p-8 border border-white/40 bg-white/10 backdrop-blur-md max-w-sm w-full shadow-[0_20px_50px_rgba(255,182,193,0.3)] rounded-[2.5rem] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="font-display text-7xl font-black italic text-[#33001A] leading-none tracking-tighter mb-8 drop-shadow-sm">
            SAM<span className="text-[#FF66B2] font-light">.OS</span>
          </h1>
          
          <button 
            onClick={onEnter}
            className="bg-white/60 border border-[#FF69B4]/20 text-[#FF69B4] text-[10px] tracking-[0.4em] font-black py-3.5 px-10 hover:bg-[#FF69B4] hover:text-white transition-all duration-500 uppercase rounded-full shadow-sm group relative overflow-hidden"
          >
            <span className="relative z-10">Initialize</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 transition-opacity" />
          </button>
        </div>
      </motion.div>
      
      <div className="absolute bottom-4 right-6 text-[8px] text-[#A64D79] opacity-30 tracking-[0.15em] uppercase">
        Scene {sceneInfo.index + 1}/7 · {sceneInfo.name}
      </div>
    </div>
  );
};
