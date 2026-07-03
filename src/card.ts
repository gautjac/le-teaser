import type { Platform } from "./types";
import { type Palette, sizeForPlatform } from "./palettes";

export interface CardContent {
  hook: string;
  appName: string;
  platform: Platform;
  day: number;
  vibeLabel: string;
}

const PLATFORM_TAG: Record<Platform, string> = {
  X: "X / TWITTER",
  Instagram: "INSTAGRAM",
  LinkedIn: "LINKEDIN",
  Threads: "THREADS",
  TikTok: "TIKTOK",
};

/** Fonts must be ready before we measure/draw, or the first render mis-wraps. */
export async function ensureFonts(): Promise<void> {
  try {
    const set = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (!set) return;
    await Promise.all([
      set.load('700 96px "Bricolage Grotesque"'),
      set.load('800 96px "Bricolage Grotesque"'),
      set.load('500 32px "Space Grotesk"'),
      set.load('700 32px "JetBrains Mono"'),
    ]);
    await set.ready;
  } catch {
    /* best effort */
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Wrap text into lines that fit `maxWidth` at the given font. */
function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Draw subtle film-grain noise over the whole card. */
function drawGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  strength: number,
) {
  if (strength <= 0) return;
  const cell = 3;
  ctx.save();
  for (let y = 0; y < h; y += cell) {
    for (let x = 0; x < w; x += cell) {
      const n = Math.random();
      if (n > 0.55) {
        ctx.fillStyle = `rgba(255,255,255,${(n - 0.55) * strength})`;
        ctx.fillRect(x, y, cell, cell);
      } else if (n < 0.12) {
        ctx.fillStyle = `rgba(0,0,0,${(0.12 - n) * strength * 1.4})`;
        ctx.fillRect(x, y, cell, cell);
      }
    }
  }
  ctx.restore();
}

/**
 * Render the branded quote-card onto a canvas at full platform resolution.
 * Pure typographic — gradients, big type, app-name chip, rule, subtle grain.
 */
export async function renderCard(
  canvas: HTMLCanvasElement,
  content: CardContent,
  palette: Palette,
): Promise<void> {
  await ensureFonts();
  const { w, h } = sizeForPlatform(content.platform);
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const pad = Math.round(w * 0.075);
  const isLandscape = w > h;

  // --- Background: diagonal gradient ---
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, palette.bgA);
  grad.addColorStop(1, palette.bgB);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // --- Soft accent glow blob, corner ---
  const glow = ctx.createRadialGradient(
    w * 0.88,
    h * 0.1,
    0,
    w * 0.88,
    h * 0.1,
    w * 0.7,
  );
  glow.addColorStop(0, hexToRgba(palette.accent, palette.dark ? 0.22 : 0.18));
  glow.addColorStop(1, hexToRgba(palette.accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // --- Faint dot grid for texture ---
  ctx.save();
  ctx.fillStyle = hexToRgba(palette.ink, 0.05);
  const step = Math.round(w * 0.045);
  const dot = Math.max(1.5, w * 0.0016);
  for (let y = pad; y < h - pad; y += step) {
    for (let x = pad; x < w - pad; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, dot, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // --- Top meta row: DAY chip + platform tag ---
  const metaY = pad;
  const metaFont = Math.round(w * 0.021);
  ctx.font = `700 ${metaFont}px "JetBrains Mono", monospace`;
  ctx.textBaseline = "middle";

  // day chip
  const dayText = `JOUR ${content.day}`;
  const chipPadX = metaFont * 0.8;
  const chipH = metaFont * 1.9;
  const dayW = ctx.measureText(dayText).width + chipPadX * 2;
  ctx.fillStyle = palette.accent;
  roundRect(ctx, pad, metaY, dayW, chipH, chipH / 2);
  ctx.fill();
  ctx.fillStyle = palette.dark && palette.accent !== "#0d0b12" ? "#0d0b12" : contrastInk(palette.accent);
  ctx.textAlign = "left";
  ctx.fillText(dayText, pad + chipPadX, metaY + chipH / 2 + metaFont * 0.04);

  // platform tag (right)
  ctx.fillStyle = palette.sub;
  ctx.textAlign = "right";
  ctx.fillText(
    PLATFORM_TAG[content.platform],
    w - pad,
    metaY + chipH / 2 + metaFont * 0.04,
  );
  ctx.textAlign = "left";

  // --- Headline: the hook, set big, wrapped, vertically centred-ish ---
  const maxTextW = w - pad * 2;
  const hook = content.hook.trim() || content.appName;

  // Fit the font size so the hook lands in a good number of lines.
  let fontSize = Math.round(w * (isLandscape ? 0.072 : 0.092));
  const minFont = Math.round(w * 0.04);
  let lines: string[] = [];
  const maxLines = isLandscape ? 4 : 6;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    ctx.font = `800 ${fontSize}px "Bricolage Grotesque", sans-serif`;
    lines = wrapLines(ctx, hook, maxTextW);
    if (lines.length <= maxLines || fontSize <= minFont) break;
    fontSize -= Math.max(2, Math.round(fontSize * 0.05));
  }

  const lineH = fontSize * 1.06;
  const blockH = lines.length * lineH;
  // place block: below meta, in the upper-middle band
  const topBound = metaY + chipH + w * 0.06;
  const bottomBound = h - pad - w * 0.11; // leave room for footer
  const avail = bottomBound - topBound;
  let startY = topBound + Math.max(0, (avail - blockH) / 2);
  if (startY < topBound) startY = topBound;

  ctx.textBaseline = "top";
  ctx.font = `800 ${fontSize}px "Bricolage Grotesque", sans-serif`;
  ctx.fillStyle = palette.ink;
  lines.forEach((ln, i) => {
    ctx.fillText(ln, pad, startY + i * lineH);
  });

  // --- Accent rule under headline ---
  const ruleY = startY + blockH + fontSize * 0.35;
  ctx.fillStyle = palette.accent;
  const ruleW = Math.min(maxTextW, fontSize * 2.6);
  roundRect(ctx, pad, ruleY, ruleW, Math.max(4, w * 0.006), w * 0.003);
  ctx.fill();

  // --- Footer: app name (serif) + Le Teaser mark ---
  const footY = h - pad - w * 0.02;
  const appFont = Math.round(w * 0.04);
  ctx.font = `400 ${appFont}px "Instrument Serif", Georgia, serif`;
  ctx.fillStyle = palette.ink;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(content.appName, pad, footY);

  const markFont = Math.round(w * 0.019);
  ctx.font = `500 ${markFont}px "JetBrains Mono", monospace`;
  ctx.fillStyle = palette.sub;
  ctx.textAlign = "right";
  ctx.fillText("· le teaser", w - pad, footY);
  ctx.textAlign = "left";

  // --- Grain on top ---
  drawGrain(ctx, w, h, palette.grain * 255);
}

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

/** Pick black or white ink that contrasts with a solid colour. */
function contrastInk(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#0d0b12" : "#f6f0e6";
}

/** Trigger a PNG download of the current card. */
export function downloadCard(canvas: HTMLCanvasElement, filename: string) {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
