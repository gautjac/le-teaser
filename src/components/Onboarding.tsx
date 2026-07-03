import type { Lang } from "../types";
import { t } from "../i18n";

export function Onboarding({
  lang,
  onDone,
}: {
  lang: Lang;
  onDone: () => void;
}) {
  const L = t[lang];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-studio/85 p-5 backdrop-blur-md">
      <div className="panel w-full max-w-lg animate-popIn p-8 sm:p-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-flare font-display text-2xl font-extrabold text-studio">
            T
          </span>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-bone">
              {L.onboardTitle}
            </h1>
            <p className="font-serif text-lg italic text-flare-soft">
              {L.onboardLede}
            </p>
          </div>
        </div>

        <ol className="mb-8 space-y-4">
          {L.onboardSteps.map((step, i) => (
            <li key={i} className="flex gap-3.5">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-flare/40 font-mono text-sm font-bold text-flare">
                {i + 1}
              </span>
              <span className="text-[15px] leading-relaxed text-bone-dim">
                {step}
              </span>
            </li>
          ))}
        </ol>

        <button onClick={onDone} className="btn-primary w-full text-base">
          {L.onboardCta}
        </button>
      </div>
    </div>
  );
}
