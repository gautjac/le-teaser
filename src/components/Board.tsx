import type { Lang, Post } from "../types";
import { DAY_LABEL, formatLabel, t } from "../i18n";
import { paletteById } from "../palettes";
import { PlatformBadge } from "./PlatformBadge";

interface Props {
  lang: Lang;
  posts: Post[];
  onOpen: (post: Post) => void;
}

const DOW: Record<Lang, string[]> = {
  fr: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export function Board({ lang, posts, onOpen }: Props) {
  const L = t[lang];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {posts.map((post, i) => {
        const pal = paletteById(post.paletteId);
        return (
          <button
            key={post.id}
            onClick={() => onOpen(post)}
            style={{ animationDelay: `${i * 45}ms` }}
            className="group animate-riseIn overflow-hidden rounded-3xl border border-studio-line bg-studio-card/70 text-left transition-all hover:-translate-y-1 hover:border-flare/50 hover:shadow-pop"
          >
            {/* mini visual band */}
            <div
              className="relative flex h-32 flex-col justify-end p-4"
              style={{
                background: `linear-gradient(135deg, ${pal.bgA}, ${pal.bgB})`,
              }}
            >
              <span
                className="absolute right-3 top-3 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                style={{ background: pal.accent, color: pal.dark ? "#0d0b12" : "#0d0b12" }}
              >
                {DOW[lang][i % 7]}
              </span>
              <p
                className="line-clamp-3 font-display text-[15px] font-extrabold leading-tight"
                style={{ color: pal.ink }}
              >
                {post.hook}
              </p>
            </div>

            {/* meta */}
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-faint">
                  {DAY_LABEL[lang][i]} · {formatLabel(post.format, lang)}
                </span>
                <PlatformBadge platform={post.platform} />
              </div>
              <div className="flex items-center gap-2">
                {post.edited && (
                  <span className="rounded-full bg-lime/15 px-2 py-0.5 font-mono text-[10px] text-lime">
                    {L.editedBadge}
                  </span>
                )}
                <span className="text-flare opacity-0 transition-opacity group-hover:opacity-100">
                  →
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
