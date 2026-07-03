import { useCallback, useRef, useState } from "react";
import type { Lang, Post } from "../types";
import { formatLabel, t } from "../i18n";
import { PALETTES, paletteById } from "../palettes";
import { CardCanvas } from "./CardCanvas";
import { PlatformBadge } from "./PlatformBadge";
import { downloadCard } from "../card";
import { slugify } from "../db";

interface Props {
  lang: Lang;
  appName: string;
  vibeLabel: string;
  post: Post;
  onChange: (patch: Partial<Post>) => void;
  onClose: () => void;
}

export function PostDetail({
  lang,
  appName,
  vibeLabel,
  post,
  onChange,
  onClose,
}: Props) {
  const L = t[lang];
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const palette = paletteById(post.paletteId);

  const onReady = useCallback((c: HTMLCanvasElement) => {
    canvasRef.current = c;
  }, []);

  const fullText = [post.body, post.hashtags.join(" ")]
    .filter(Boolean)
    .join("\n\n");

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const download = () => {
    if (!canvasRef.current) return;
    downloadCard(
      canvasRef.current,
      `${slugify(appName)}-jour-${post.day}-${post.platform.toLowerCase()}.png`,
    );
  };

  const markEdited = (patch: Partial<Post>) => onChange({ ...patch, edited: true });

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-studio/70 backdrop-blur-sm">
      {/* click-away */}
      <button
        aria-label="Fermer"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-full w-full max-w-3xl animate-riseIn flex-col overflow-y-auto border-l border-studio-line bg-studio-raise/95 shadow-lift">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-studio-line bg-studio-raise/90 px-5 py-4 backdrop-blur-md sm:px-7">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-flare/15 font-mono text-sm font-bold text-flare">
              {post.day}
            </span>
            <div className="flex flex-col">
              <PlatformBadge platform={post.platform} />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone-faint">
                {formatLabel(post.format, lang)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost !px-3 !py-2">
            {L.done}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-7 px-5 py-6 sm:px-7 lg:grid-cols-[1fr_360px]">
          {/* LEFT: copy */}
          <div className="order-2 lg:order-1">
            {/* Hook */}
            <label className="label">{L.hook}</label>
            {editing ? (
              <textarea
                value={post.hook}
                rows={2}
                onChange={(e) => markEdited({ hook: e.target.value })}
                className="field mb-5 resize-none font-display text-lg font-bold leading-snug"
              />
            ) : (
              <p className="mb-5 font-display text-2xl font-extrabold leading-tight text-bone">
                {post.hook}
              </p>
            )}

            {/* Body */}
            <label className="label">{L.body}</label>
            {editing ? (
              <textarea
                value={post.body}
                rows={12}
                onChange={(e) => markEdited({ body: e.target.value })}
                className="field mb-5 resize-y font-sans text-[15px] leading-relaxed"
              />
            ) : (
              <pre className="mb-5 whitespace-pre-wrap break-words rounded-2xl border border-studio-line bg-studio-card/50 p-4 font-sans text-[15px] leading-relaxed text-bone-dim">
                {post.body}
              </pre>
            )}

            {/* Hashtags */}
            <label className="label">{L.hashtags}</label>
            {editing ? (
              <input
                value={post.hashtags.join(" ")}
                onChange={(e) =>
                  markEdited({
                    hashtags: e.target.value
                      .split(/\s+/)
                      .map((h) => h.trim())
                      .filter(Boolean),
                  })
                }
                className="field mb-5 font-mono text-sm"
              />
            ) : (
              <div className="mb-5 flex flex-wrap gap-2">
                {post.hashtags.map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-lime/30 bg-lime/5 px-2.5 py-1 font-mono text-[12px] text-lime"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}

            {/* Visual brief */}
            <label className="label">{L.visualBrief}</label>
            <p className="mb-6 font-serif text-[15px] italic leading-relaxed text-violet">
              {post.visualBrief}
            </p>

            {/* actions */}
            <div className="flex flex-wrap gap-2">
              <button onClick={copyText} className="btn-ghost">
                {copied ? L.copied : L.copyText}
              </button>
              <button
                onClick={() => setEditing((v) => !v)}
                className="btn-ghost"
              >
                {editing ? L.save : L.editCopy}
              </button>
            </div>
          </div>

          {/* RIGHT: card + card style + download */}
          <div className="order-1 lg:order-2">
            <CardCanvas
              hook={post.hook}
              appName={appName}
              platform={post.platform}
              day={post.day}
              vibeLabel={vibeLabel}
              palette={palette}
              onReady={onReady}
            />

            <label className="label mt-5">{L.cardStyle}</label>
            <div className="mb-5 flex flex-wrap gap-2">
              {PALETTES.map((p) => {
                const active = p.id === post.paletteId;
                return (
                  <button
                    key={p.id}
                    title={p.name}
                    onClick={() => onChange({ paletteId: p.id })}
                    className={`h-8 w-8 rounded-full transition-transform ${active ? "scale-110 ring-2 ring-bone" : "ring-1 ring-studio-line hover:scale-105"}`}
                    style={{
                      background: `linear-gradient(135deg, ${p.bgA}, ${p.bgB})`,
                    }}
                    aria-label={p.name}
                  />
                );
              })}
            </div>

            <button onClick={download} className="btn-primary w-full">
              {L.downloadImage}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
