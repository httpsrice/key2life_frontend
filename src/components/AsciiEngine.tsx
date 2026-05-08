import React, { useRef, useEffect, useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   ASCII ENGINE
   Browser-native image → ASCII using Canvas sampling.
   No npm dependencies required.
   ═══════════════════════════════════════════════════════════════ */

// Character palettes ordered by density (dark → light)
const PALETTES = {
  blocks:   " ░▒▓█",
  detailed: " .`-_':,;^=+/\"|)\\<>)iv%xclrs{*}I?!][1taeo7zjLunT#JCwfy325Fp6mqSghVd4EgXPGZbYkOA&8U$@MNWQ0B%",
  minimal:  " ·:;=+xX$&@",
  matrix:   " .:!|+*#%@0",
} as const;

type Palette = keyof typeof PALETTES;

export interface AsciiEngineOptions {
  width?: number;       // characters wide (default 80)
  height?: number;      // characters tall (auto from aspect if 0)
  palette?: Palette;
  invert?: boolean;     // invert brightness
  contrast?: number;    // 1 = normal, >1 = more contrast
}

/**
 * Converts an HTMLImageElement (or URL) to ASCII art string.
 * Pure browser Canvas API — no dependencies.
 */
export async function imageToAscii(
  src: string,
  opts: AsciiEngineOptions = {}
): Promise<string> {
  const {
    width = 80,
    palette = "blocks",
    invert = false,
    contrast = 1.2,
  } = opts;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const aspect = img.height / img.width;
      // Characters are ~2x taller than wide, compensate
      const h = opts.height ?? Math.round(width * aspect * 0.45);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, h);

      const { data } = ctx.getImageData(0, 0, width, h);
      const chars = PALETTES[palette];
      const rows: string[] = [];

      for (let y = 0; y < h; y++) {
        let row = "";
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          let brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
          // apply contrast
          brightness = Math.min(1, Math.max(0, (brightness - 0.5) * contrast + 0.5));
          if (invert) brightness = 1 - brightness;
          const charIdx = Math.floor(brightness * (chars.length - 1));
          row += chars[charIdx];
        }
        rows.push(row);
      }
      resolve(rows.join("\n"));
    };
    img.onerror = reject;
    img.src = src;
  });
}

/* ═══════════════════════════════════════════════════════════════
   AsciiImageCard — Renders one image as live ASCII
   ═══════════════════════════════════════════════════════════════ */
interface AsciiImageCardProps {
  src: string;
  width?: number;
  palette?: Palette;
  invert?: boolean;
  color?: string;
  label?: string;
  className?: string;
}

export const AsciiImageCard: React.FC<AsciiImageCardProps> = ({
  src, width = 60, palette = "blocks", invert = false,
  color = "var(--accent)", label, className = "",
}) => {
  const [ascii, setAscii] = useState<string>("LOADING...");
  const [error, setError] = useState(false);

  useEffect(() => {
    setAscii("RENDERING...");
    setError(false);
    imageToAscii(src, { width, palette, invert })
      .then(setAscii)
      .catch(() => {
        setError(true);
        setAscii("[ERR] COULD_NOT_LOAD_IMAGE");
      });
  }, [src, width, palette, invert]);

  return (
    <div
      className={`flex flex-col border overflow-hidden ${className}`}
      style={{ borderColor: "var(--border)", background: "var(--win-bg)" }}
    >
      {label && (
        <div
          className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border-b flex items-center gap-1.5"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)", fontFamily: "var(--font-hud)" }}
        >
          <span style={{ color: error ? "var(--neon-amber)" : color }}>◈</span>
          {label}
        </div>
      )}
      <pre
        className="select-none leading-[1.1] font-mono text-[7px] p-1 overflow-hidden"
        style={{ color, textShadow: `0 0 8px ${color}66` }}
      >
        {ascii}
      </pre>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   AsciiGallery — Rotates through a list of images / art pieces
   Perfect for: homepage hero, sidebar cards, monitor panels
   Future: plug in Google Photos API as the `items` source
   ═══════════════════════════════════════════════════════════════ */
export interface GalleryItem {
  type: "image" | "art";
  src?: string;          // for type:"image" — URL or base64
  art?: string;          // for type:"art" — pre-crafted ASCII string
  label?: string;
}

interface AsciiGalleryProps {
  items: GalleryItem[];
  intervalMs?: number;   // rotation speed (default 6000ms)
  width?: number;
  palette?: Palette;
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export const AsciiGallery: React.FC<AsciiGalleryProps> = ({
  items,
  intervalMs = 6000,
  width = 60,
  palette = "blocks",
  color = "var(--accent)",
  className = "",
  showLabel = true,
}) => {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % items.length);
        setFade(true);
      }, 400);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  const current = items[idx];

  return (
    <div
      className={`flex flex-col border overflow-hidden transition-opacity duration-400 ${className}`}
      style={{
        borderColor: "var(--border)",
        background: "var(--win-bg)",
        opacity: fade ? 1 : 0,
      }}
    >
      {showLabel && current.label && (
        <div
          className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)", fontFamily: "var(--font-hud)", color: "var(--text-muted)" }}
        >
          <span className="flex items-center gap-1.5">
            <span style={{ color }}>◈</span>
            {current.label}
          </span>
          <span className="opacity-40">{idx + 1}/{items.length}</span>
        </div>
      )}

      {current.type === "art" ? (
        <pre
          className="select-none leading-[1.15] font-mono text-[9px] p-2"
          style={{ color, textShadow: `0 0 10px ${color}88` }}
        >
          {current.art}
        </pre>
      ) : current.src ? (
        <AsciiImageCard
          src={current.src}
          width={width}
          palette={palette}
          color={color}
        />
      ) : null}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   AsciiMarkdown — render markdown with ASCII image replacement
   Drop-in wrapper: intercepts ![...](url) and renders as ASCII
   ═══════════════════════════════════════════════════════════════ */
interface AsciiMarkdownProps {
  content: string;        // raw markdown text
  color?: string;
  imageWidth?: number;
  palette?: Palette;
}

export const AsciiMarkdown: React.FC<AsciiMarkdownProps> = ({
  content, color = "var(--accent)", imageWidth = 50, palette = "blocks",
}) => {
  // Split on markdown image syntax: ![alt](url)
  const parts = content.split(/(!\[([^\]]*)\]\(([^)]+)\))/g);
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < parts.length) {
    const part = parts[i];
    // Every 4th chunk is a full match block starting with ![
    if (part && part.startsWith("![")) {
      const alt = parts[i + 1] || "";
      const url = parts[i + 2] || "";
      elements.push(
        <AsciiImageCard
          key={key++}
          src={url}
          label={alt || "IMAGE"}
          width={imageWidth}
          palette={palette}
          color={color}
          className="my-2"
        />
      );
      i += 3;
    } else {
      if (part) {
        elements.push(
          <span
            key={key++}
            className="whitespace-pre-wrap text-xs leading-relaxed"
            style={{ fontFamily: "var(--font-hud)", color: "var(--text-1)" }}
          >
            {part}
          </span>
        );
      }
      i++;
    }
  }

  return <div className="flex flex-col gap-1">{elements}</div>;
};

/* ═══════════════════════════════════════════════════════════════
   Pre-built curated ASCII artworks for immediate use
   (No image loading needed — pure text art)
   ═══════════════════════════════════════════════════════════════ */
export const CURATED_ARTWORKS: GalleryItem[] = [
  {
    type: "art",
    label: "DEEP_SPACE :: NEBULA",
    art: [
      "  ·  · ✦ ·    ·  ✧ · ·  ·  · ✦",
      "·    ░▒▓████▓▒░  ·  ·    ✦  ·  ",
      "  · ▒████████████▒ ·  ·  ·  ·  ",
      "· ░████▓▓██▓▓████░ ·  ✦  ·  ·  ",
      " ▒████▒  ░░  ▒████▒  ·  ·  ·   ",
      "░████░  ·██·  ░████░  ·  ✦  ·  ",
      " ▒████▒  ░░  ▒████▒  ·  ·  ·   ",
      "· ░████▓▓██▓▓████░ ·  ·  ✦  ·  ",
      "  · ▒████████████▒ ·  ·  ·  ·  ",
      "·    ░▒▓████▓▒░  ·  ·    ·  ✦  ",
      "  ·  · ✦ ·    ·  ✧ · ·  ·  ·   ",
    ].join("\n"),
  },
  {
    type: "art",
    label: "CIRCUIT_BOARD :: MACRO",
    art: [
      "┌──┬────────────┬──┬──────────┐",
      "│  │            │  │  ┌──┐    │",
      "│  └────┬───────┘  │  │██│    │",
      "│  ┌────┘  ┌────┐  └──┤██├────┤",
      "├──┤       │ IC │     │██│    │",
      "│  │  ┌────┤    ├─────┴──┘    │",
      "│  └──┤    └────┘  ┌─────┐    │",
      "│     │  ┌──────┐  │ μC  │    │",
      "├─────┘  │ BIOS │  │     │    │",
      "│        └──────┘  └─────┘    │",
      "└────────────────────────────--┘",
    ].join("\n"),
  },
  {
    type: "art",
    label: "MOUNTAIN_RANGE :: DUSK",
    art: [
      "                    *           ",
      "          *    /\\  /\\\\   *      ",
      "  *   /\\  /\\  /  \\/  \\  /\\  *  ",
      "  /\\ /  \\/  \\/        \\/  \\/\\  ",
      " /  \\                      /  \\ ",
      "/    \\____________________/    \\",
      "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
      " ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ",
    ].join("\n"),
  },
  {
    type: "art",
    label: "CITY_SKYLINE :: NIGHT",
    art: [
      "             *          *       ",
      "    |  .|. | |  .|. |  |  .|.  ",
      "    |  ||| | |  ||| |  |  |||  ",
      "  | |  ||| | |  ||| |  |  ||| |",
      "  | | ||||| | | ||||| | |  |||  ",
      " _|_|_|||||_|_|_|||||_|_|__||| ",
      " |||||||||||||||||||||||||||||||",
      "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    ].join("\n"),
  },
  {
    type: "art",
    label: "DNA_HELIX :: SEQUENCE",
    art: [
      "  A─────────T   ",
      "   \\       /    ",
      "    G─────C     ",
      "   /       \\    ",
      "  T─────────A   ",
      "   \\       /    ",
      "    C─────G     ",
      "   /       \\    ",
      "  A─────────T   ",
      "   \\       /    ",
      "    G─────C     ",
    ].join("\n"),
  },
  {
    type: "art",
    label: "MANDELBROT :: FRACTAL",
    art: [
      "                ·  · · ·        ",
      "           · ░▒▓████▓▒░ · ·     ",
      "     · · ░▒▓█████████████▓▒░    ",
      "   · ░▒▓██████████████████████░ ",
      "  ·░▒▓██████████████████████▓░· ",
      "   · ░▒▓██████████████████░·    ",
      "     · · ░▒▓█████████████▓▒░    ",
      "           · ░▒▓████▓▒░ · ·     ",
      "                ·  · · ·        ",
    ].join("\n"),
  },
];
