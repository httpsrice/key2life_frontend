/**
 * MatrixRain — vertical cascading character rain (Matrix-style).
 * Uses Katakana + Latin + digits. Theme-aware.
 */
import React, { useRef, useEffect } from "react";

interface Props { opacity?: number; speed?: number; density?: number; className?: string; }

export const MatrixRain: React.FC<Props> = ({
  opacity = 0.35, speed = 1, density = 0.7, className = ""
}) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const css = (v: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(v).trim();

    // Katakana + ASCII + digits
    const CHARS =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
      "0123456789ABCDEF!@#$%^&*()_+-=[]{}|;:,.<>?/~`" +
      "SAM-OS//GROUND//NEURAL//CIPHER";

    const FONT_SIZE = 13;
    let columns = 0;
    let drops: number[] = [];
    let W = 0, H = 0;

    const build = () => {
      W = canvas.parentElement?.clientWidth  || window.innerWidth;
      H = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
      columns = Math.floor(W / FONT_SIZE * density);
      drops = Array.from({ length: columns }, () => Math.random() * -H / FONT_SIZE);
    };

    let raf: number;
    let frame = 0;

    const draw = () => {
      frame++;
      // Throttle to ~30 fps at speed=1
      if (frame % Math.max(1, Math.round(2 / speed)) !== 0) {
        raf = requestAnimationFrame(draw);
        return;
      }

      // Detect theme
      const isDark = document.documentElement.classList.contains("dark");
      
      // In light mode, we fade with white, in dark mode with black.
      ctx.fillStyle = isDark ? "rgba(0,0,0,0.045)" : "rgba(250,250,250,0.08)";
      ctx.fillRect(0, 0, W, H);

      ctx.font = `${FONT_SIZE}px "IBM Plex Mono", monospace`;

      const accent   = css("--accent");
      const accent2  = css("--accent-2");
      const accent3  = css("--accent-3");

      for (let i = 0; i < columns; i++) {
        const x = (i / columns) * W;
        const y = drops[i] * FONT_SIZE;
        if (y < 0) { drops[i]++; continue; }

        // Leading char: bright white/accent
        ctx.fillStyle = isDark ? "#FFFFFF" : accent;
        ctx.shadowBlur = isDark ? 8 : 2;
        ctx.shadowColor = accent;
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y);

        // Column shade: cycle between accent colors based on column
        const col = i % 3 === 0 ? accent3 : i % 3 === 1 ? accent : accent2;
        ctx.fillStyle = isDark ? col + "BB" : col + "88";
        ctx.shadowBlur = isDark ? 4 : 0;
        ctx.shadowColor = col;
        const prev = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(prev, x, y - FONT_SIZE);

        // Reset
        if (y > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }

      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };

    build();
    draw();
    window.addEventListener("resize", build);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", build); };
  }, [speed, density]);

  return (
    <canvas
      ref={ref}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity, mixBlendMode: "screen" }}
    />
  );
};
