import React, { useRef, useEffect } from "react";

/**
 * TerrainCanvas — 3D ASCII topography background.
 * Reads CSS variables so terrain color matches light/dark theme.
 */
export const TerrainCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let points: { ox: number; oy: number; oz: number; n: number; ch: string }[] = [];
    let rotY = 0;
    const TILX = 0.38;
    const chars = " .·:;+=xX#@";

    const build = () => {
      points = [];
      canvas.width  = canvas.parentElement?.clientWidth  || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      for (let ix = 0; ix < 52; ix++) {
        for (let iz = 0; iz < 36; iz++) {
          const x = (ix / 52 - 0.5) * 5;
          const z = (iz / 36 - 0.5) * 4;
          const h = Math.sin(x * 2.1) * 0.36 + Math.sin(z * 1.8) * 0.4 +
                    Math.sin((x + z) * 1.4) * 0.2 + Math.sin(x * 3.7 + z * 2.1) * 0.12 +
                    Math.sin(x * 0.8 - z * 1.1) * 0.15;
          const n = (h + 1.1) / 2.2;
          const ch = chars[Math.min(10, Math.floor(n * 11))];
          points.push({ ox: x, oy: h * 0.72, oz: z, n, ch });
        }
      }
    };

    // Resolve a CSS variable to a string at paint time
    const cssVar = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    let raf: number;
    const paint = () => {
      const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, FOV = 520;
      ctx.clearRect(0, 0, W, H);
      rotY += 0.005;
      const cY = Math.cos(rotY), sY = Math.sin(rotY), cX = Math.cos(TILX), sX = Math.sin(TILX);

      const proj = points.map(p => {
        const x1 = p.ox * cY - p.oz * sY, z1 = p.ox * sY + p.oz * cY;
        const y1 = p.oy * cX - z1 * sX,  z2 = p.oy * sX + z1 * cX;
        const sc = FOV / (FOV + z2 * 88);
        return { sx: x1 * sc * 88 + cx, sy: y1 * sc * 88 + cy, z: z2, ch: p.ch, sc, n: p.n };
      }).sort((a, b) => b.z - a.z);

      const hi  = cssVar("--accent");
      const dim = cssVar("--term-dim") || "#001A08";

      ctx.font = '10px "IBM Plex Mono", monospace';
      for (const p of proj) {
        if (p.ch === " ") continue;
        ctx.globalAlpha = Math.max(0, Math.min(1, 0.1 + p.sc * 0.9));
        ctx.fillStyle = p.n > 0.5 ? hi : dim;
        ctx.fillText(p.ch, p.sx, p.sy);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(paint);
    };

    build();
    raf = requestAnimationFrame(paint);
    window.addEventListener("resize", build);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", build); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ opacity: 0.18, zIndex: 0 }}
    />
  );
};
