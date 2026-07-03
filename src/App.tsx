import { useCallback, useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Campaign, Lang, Post, Vibe } from "./types";
import { requestPlan } from "./api";
import { db, deleteCampaign, saveCampaign, slugify } from "./db";
import { paletteForDay } from "./palettes";
import { t, VIBES } from "./i18n";
import { Onboarding } from "./components/Onboarding";
import { Composer } from "./components/Composer";
import { Board } from "./components/Board";
import { PostDetail } from "./components/PostDetail";

const LANG_KEY = "le-teaser:lang";
const ONBOARD_KEY = "le-teaser:onboarded";

function initialLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === "fr" || saved === "en") return saved;
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "fr";
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [onboard, setOnboard] = useState(
    () => localStorage.getItem(ONBOARD_KEY) !== "1",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [view, setView] = useState<"compose" | "campaign">("compose");

  const L = t[lang];

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const campaigns = useLiveQuery(
    () => db.campaigns.orderBy("updatedAt").reverse().toArray(),
    [],
    [] as Campaign[],
  );

  const active = useMemo(
    () => campaigns?.find((c) => c.id === activeId) ?? null,
    [campaigns, activeId],
  );

  const openPost = useMemo(
    () => active?.posts.find((p) => p.id === openPostId) ?? null,
    [active, openPostId],
  );

  const vibeLabel = useCallback(
    (v: Vibe) => VIBES.find((x) => x.id === v)?.[lang] ?? "",
    [lang],
  );

  const generate = useCallback(
    async (input: { pitch: string; url: string; vibe: Vibe }) => {
      setBusy(true);
      setError(null);
      try {
        const result = await requestPlan({
          pitch: input.pitch,
          url: input.url || undefined,
          vibe: input.vibe,
          lang,
        });

        const id = slugify(result.appName);
        const now = Date.now();
        const posts: Post[] = result.posts.map((p, i) => ({
          id: `${id}-d${p.day}-${i}`,
          day: p.day,
          platform: p.platform,
          format: p.format,
          hook: p.hook,
          body: p.body,
          hashtags: p.hashtags,
          visualBrief: p.visualBrief,
          paletteId: paletteForDay(p.day).id,
        }));

        const campaign: Campaign = {
          id,
          appName: result.appName,
          pitch: input.pitch,
          url: input.url || undefined,
          vibe: input.vibe,
          lang,
          tagline: result.tagline,
          posts,
          createdAt: now,
          updatedAt: now,
        };

        await saveCampaign(campaign);
        setActiveId(id);
        setView("campaign");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    },
    [lang],
  );

  const patchPost = useCallback(
    async (postId: string, patch: Partial<Post>) => {
      if (!active) return;
      const updated: Campaign = {
        ...active,
        posts: active.posts.map((p) =>
          p.id === postId ? { ...p, ...patch } : p,
        ),
        updatedAt: Date.now(),
      };
      await saveCampaign(updated);
    },
    [active],
  );

  const removeCampaign = useCallback(
    async (id: string) => {
      if (!confirm(L.deleteConfirm)) return;
      await deleteCampaign(id);
      if (activeId === id) {
        setActiveId(null);
        setView("compose");
      }
    },
    [L.deleteConfirm, activeId],
  );

  const goCompose = () => {
    setView("compose");
    setActiveId(null);
    setError(null);
  };

  return (
    <div className="min-h-full">
      {onboard && (
        <Onboarding
          lang={lang}
          onDone={() => {
            localStorage.setItem(ONBOARD_KEY, "1");
            setOnboard(false);
          }}
        />
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-studio-line bg-studio/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
          <button
            onClick={goCompose}
            className="flex items-center gap-2.5"
            aria-label="Le Teaser — accueil"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-flare font-display text-xl font-extrabold text-studio">
              T
            </span>
            <span className="flex flex-col text-left leading-none">
              <span className="font-display text-lg font-extrabold tracking-tight text-bone">
                Le Teaser
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-faint">
                {L.tagline}
              </span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            {view === "campaign" && (
              <button onClick={goCompose} className="btn-chip">
                {L.newCampaign}
              </button>
            )}
            <button
              onClick={() => setLang((v) => (v === "fr" ? "en" : "fr"))}
              className="btn-chip !px-3 font-mono"
              aria-label="Language"
            >
              {L.langToggle}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
        {view === "compose" ? (
          <>
            {/* Hero */}
            <div className="mx-auto mb-9 max-w-2xl text-center">
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-bone sm:text-5xl">
                Une semaine de contenu,{" "}
                <span className="text-flare">dans ta voix</span>.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-bone-dim">
                {L.lede}
              </p>
            </div>

            <Composer
              lang={lang}
              busy={busy}
              error={error}
              onGenerate={generate}
            />

            {/* Past campaigns */}
            {campaigns && campaigns.length > 0 && (
              <section className="mx-auto mt-14 max-w-4xl">
                <h2 className="label ml-1">{L.yourCampaigns}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {campaigns.map((c) => (
                    <div
                      key={c.id}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-studio-line bg-studio-card/60 px-4 py-3.5 transition-colors hover:border-flare/50"
                    >
                      <button
                        className="min-w-0 flex-1 text-left"
                        onClick={() => {
                          setActiveId(c.id);
                          setView("campaign");
                        }}
                      >
                        <span className="block truncate font-display text-lg font-bold text-bone">
                          {c.appName}
                        </span>
                        <span className="block truncate font-serif text-[13px] italic text-bone-faint">
                          {c.tagline || vibeLabel(c.vibe)}
                        </span>
                      </button>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-bone-faint">
                          {c.posts.length} {L.posts}
                        </span>
                        <button
                          onClick={() => removeCampaign(c.id)}
                          className="text-bone-faint opacity-0 transition-opacity hover:text-flare group-hover:opacity-100"
                          aria-label={L.delete}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : active ? (
          <div className="animate-riseIn">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <button
                  onClick={goCompose}
                  className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-bone-faint hover:text-flare"
                >
                  {L.back}
                </button>
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-bone">
                  {active.appName}
                </h1>
                <p className="mt-1.5 max-w-2xl font-serif text-lg italic leading-snug text-flare-soft">
                  {active.tagline || vibeLabel(active.vibe)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-violet/40 bg-violet/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-violet">
                  {vibeLabel(active.vibe)}
                </span>
                <button
                  onClick={() => removeCampaign(active.id)}
                  className="btn-ghost !px-3"
                  aria-label={L.delete}
                >
                  ✕
                </button>
              </div>
            </div>

            <Board
              lang={lang}
              posts={active.posts}
              onOpen={(p) => setOpenPostId(p.id)}
            />

            <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-bone-faint">
              ✓ {L.saved}
            </p>
          </div>
        ) : null}
      </main>

      {openPost && active && (
        <PostDetail
          lang={lang}
          appName={active.appName}
          vibeLabel={vibeLabel(active.vibe)}
          post={openPost}
          onChange={(patch) => patchPost(openPost.id, patch)}
          onClose={() => setOpenPostId(null)}
        />
      )}
    </div>
  );
}
