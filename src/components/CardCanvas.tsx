import { useEffect, useRef } from "react";
import type { Platform } from "../types";
import { type Palette, sizeForPlatform } from "../palettes";
import { renderCard } from "../card";

interface Props {
  hook: string;
  appName: string;
  platform: Platform;
  day: number;
  vibeLabel: string;
  palette: Palette;
  /** Expose the canvas element to the parent (for PNG download). */
  onReady?: (canvas: HTMLCanvasElement) => void;
  className?: string;
}

/**
 * Renders the branded quote-card to a hidden full-resolution canvas and
 * displays it responsively. Re-renders whenever the content or palette changes.
 */
export function CardCanvas({
  hook,
  appName,
  platform,
  day,
  vibeLabel,
  palette,
  onReady,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = sizeForPlatform(platform);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    void renderCard(
      canvas,
      { hook, appName, platform, day, vibeLabel },
      palette,
    ).then(() => {
      if (!cancelled) onReady?.(canvas);
    });
    return () => {
      cancelled = true;
    };
  }, [hook, appName, platform, day, vibeLabel, palette, onReady]);

  return (
    <div
      className={`overflow-hidden rounded-2xl shadow-lift ring-1 ring-studio-line ${className}`}
      style={{ aspectRatio: size.ratio }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-label={`Carte visuelle : ${hook}`}
      />
    </div>
  );
}
