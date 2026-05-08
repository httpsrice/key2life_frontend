/**
 * ClusterParticleOrb — canvas animation used on landing + monitoring
 * Draws a rotating 3-D particle sphere with orbiting rings and
 * ASCII terrain beneath it. Theme-aware (reads CSS vars at paint time).
 */
import React, { useRef, useEffect } from "react";

interface Props {
  /** 0–1 opacity of the canvas element. Default 0.85 */
  opacity?: number;
  /** Render ASCII terrain beneath the orb. Default true */
  terrain?: boolean;
  /** Override radius of the orb sphere (px). Default 0.28 * min(W,H) */
  radius?: number;
  className?: string;
}

export const ClusterParticleOrb: React.FC<Props> = ({
  opacity = 0.85,
  terrain = true,
  className = "",
}) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    /* ── Helpers ──────────────────────────────────────────────── */
    const css = (v: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(v).trim();

    // Particle in spherical coords
    interface Particle { theta: number; phi: number; r: number; speed: number; size: number; trail: [number, number][] }

    let W = 0, H = 0;
    let particles: Particle[] = [];
    let angle = 0;  // global rotation
    let raf: number;

    /* ── Build ──────────────────────────────────────────────── */
    const build = () => {
      W = canvas.parentElement?.clientWidth  || window.innerWidth;
      H = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width  = W;
      canvas.height = H;

      const N = Math.min(260, Math.floor(W * 0.22));
      particles = Array.from({ length: N }, () => ({
        theta: Math.random() * Math.PI * 2,
        phi:   Math.acos(2 * Math.random() - 1),
        r:     0.88 + Math.random() * 0.24,
        speed: (Math.random() - 0.5) * 0.008,
        size:  0.8 + Math.random() * 2.2,
        trail: [] as [number, number][],
      }));
    };

    /* ── ASCII terrain grid ─────────────────────────────────── */
    const CHARS = " .·:+*#@";
    const drawTerrain = (rotY: number) => {
      const cx = W / 2, cy = H / 2, FOV = 480;
      const cY = Math.cos(rotY * 0.3), sY = Math.sin(rotY * 0.3);
      const cX = Math.cos(0.35),       sX = Math.sin(0.35);
      
      const isDark = document.documentElement.classList.contains("dark");
      
      ctx.font = `9px "IBM Plex Mono", monospace`;
      ctx.globalAlpha = isDark ? 0.08 : 0.04;
      ctx.fillStyle = css("--accent");
      for (let ix = 0; ix < 44; ix++) {
        for (let iz = 0; iz < 28; iz++) {
          const x = (ix / 44 - 0.5) * 5;
          const z = (iz / 28 - 0.5) * 4;
          const h =
            Math.sin(x * 2.1 + rotY * 0.1) * 0.36 +
            Math.sin(z * 1.8 - rotY * 0.07) * 0.4 +
            Math.sin((x + z) * 1.4) * 0.2;
          const n = (h + 1) / 2;
          const ch = CHARS[Math.min(7, Math.floor(n * 8))];
          if (ch === " ") continue;
          const x1 = x * cY - z * sY, z1 = x * sY + z * cY;
          const y1 = h * 0.7 * cX - z1 * sX, z2 = h * 0.7 * sX + z1 * cX;
          const sc = FOV / (FOV + z2 * 70);
          ctx.fillText(ch, x1 * sc * 70 + cx, y1 * sc * 70 + cy);
        }
      }
      ctx.globalAlpha = 1;
    };

    /* ── Draw ──────────────────────────────────────────────── */
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      angle += 0.004;

      const cx = W / 2, cy = H / 2;
      const R  = Math.min(W, H) * 0.24;

      if (terrain) drawTerrain(angle);

      /* Outer ring */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.5);
      const ringGrad = ctx.createLinearGradient(-R - 20, 0, R + 20, 0);
      ringGrad.addColorStop(0,   "transparent");
      ringGrad.addColorStop(0.3, css("--accent") + "44");
      ringGrad.addColorStop(0.5, css("--accent"));
      ringGrad.addColorStop(0.7, css("--accent-2") + "88");
      ringGrad.addColorStop(1,   "transparent");
      ctx.beginPath();
      ctx.ellipse(0, 0, R + 18, (R + 18) * 0.28, 0, 0, Math.PI * 2);
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = css("--accent");
      ctx.stroke();
      ctx.restore();

      /* Inner ring – opposite tilt */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angle * 0.8);
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 0.82, R * 0.82 * 0.22, Math.PI / 5, 0, Math.PI * 2);
      ctx.strokeStyle = css("--accent-2") + "66";
      ctx.lineWidth = 1;
      ctx.shadowBlur = 8;
      ctx.shadowColor = css("--accent-2");
      ctx.stroke();
      ctx.restore();

      /* Core glow */
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.4);
      coreGrad.addColorStop(0, css("--accent") + "55");
      coreGrad.addColorStop(0.5, css("--accent") + "11");
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.4, 0, Math.PI * 2);
      ctx.fill();

      /* Particles */
      for (const p of particles) {
        p.theta += p.speed;
        // Project onto screen with rotation
        const cosA = Math.cos(angle), sinA = Math.sin(angle);
        const cosP = Math.cos(p.phi),   sinP = Math.sin(p.phi);
        const cosT = Math.cos(p.theta), sinT = Math.sin(p.theta);
        const r = R * p.r;
        const x0 = r * sinP * cosT;
        const y0 = r * cosP;
        const z0 = r * sinP * sinT;
        // rotate around Y
        const sx = x0 * cosA - z0 * sinA;
        const sz = x0 * sinA + z0 * cosA;
        const sy = y0;
        // perspective
        const depth = (sz + R * 2) / (R * 3);
        const px = cx + sx;
        const py = cy + sy * 0.8; // flatten a bit
        const bright = 0.2 + depth * 0.8;
        const size   = p.size * depth;

        // trail
        p.trail.push([px, py]);
        if (p.trail.length > 5) p.trail.shift();

        if (p.trail.length > 1) {
          ctx.save();
          ctx.globalAlpha = bright * 0.25;
          ctx.strokeStyle = sz > 0 ? css("--accent") : css("--accent-2");
          ctx.lineWidth = size * 0.6;
          ctx.beginPath();
          ctx.moveTo(p.trail[0][0], p.trail[0][1]);
          for (const [tx, ty] of p.trail) ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.globalAlpha = bright;
        const col = sz > 0 ? css("--accent") : css("--accent-2");
        const grd = ctx.createRadialGradient(px, py, 0, px, py, size + 2);
        grd.addColorStop(0, "#fff");
        grd.addColorStop(0.3, col);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.shadowBlur = 6;
        ctx.shadowColor = col;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      /* Equatorial glow line */
      ctx.save();
      ctx.translate(cx, cy);
      const eqGrd = ctx.createLinearGradient(-R, 0, R, 0);
      eqGrd.addColorStop(0, "transparent");
      eqGrd.addColorStop(0.5, css("--accent-3") + "33");
      eqGrd.addColorStop(1, "transparent");
      ctx.fillStyle = eqGrd;
      ctx.fillRect(-R, -1, R * 2, 2);
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    build();
    draw();
    window.addEventListener("resize", build);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", build); };
  }, [terrain]);

  return (
    <canvas
      ref={ref}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity }}
    />
  );
};
