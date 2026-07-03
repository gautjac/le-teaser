import type { Platform } from "../types";

const ICON: Record<Platform, string> = {
  X: "𝕏",
  Instagram: "◎",
  LinkedIn: "in",
  Threads: "@",
  TikTok: "♪",
};

const CLR: Record<Platform, string> = {
  X: "text-chan-x",
  Instagram: "text-chan-instagram",
  LinkedIn: "text-chan-linkedin",
  Threads: "text-chan-threads",
  TikTok: "text-chan-tiktok",
};

export function PlatformBadge({
  platform,
  className = "",
}: {
  platform: Platform;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] ${CLR[platform]} ${className}`}
    >
      <span className="grid h-5 w-5 place-items-center rounded-md border border-current/30 text-[12px] leading-none">
        {ICON[platform]}
      </span>
      {platform}
    </span>
  );
}
