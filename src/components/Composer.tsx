import { useState } from "react";
import type { Lang, Vibe } from "../types";
import { EXAMPLES, t, VIBES } from "../i18n";

interface Props {
  lang: Lang;
  busy: boolean;
  error: string | null;
  onGenerate: (input: {
    pitch: string;
    url: string;
    vibe: Vibe;
  }) => void;
}

export function Composer({ lang, busy, error, onGenerate }: Props) {
  const L = t[lang];
  const [pitch, setPitch] = useState("");
  const [url, setUrl] = useState("");
  const [vibe, setVibe] = useState<Vibe>("build-in-public");

  const canGo = pitch.trim().length >= 8 && !busy;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="panel animate-riseIn p-6 sm:p-8">
        {/* Pitch */}
        <div className="mb-5">
          <label htmlFor="pitch" className="label">
            {L.pitchLabel}
          </label>
          <textarea
            id="pitch"
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder={L.pitchPlaceholder}
            rows={5}
            className="field resize-none leading-relaxed"
          />
        </div>

        {/* URL */}
        <div className="mb-6">
          <label htmlFor="url" className="label">
            {L.urlLabel}
          </label>
          <input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={L.urlPlaceholder}
            className="field"
          />
        </div>

        {/* Vibe */}
        <div className="mb-7">
          <span className="label">{L.vibeLabel}</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {VIBES.map((v) => {
              const active = vibe === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVibe(v.id)}
                  className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                    active
                      ? "border-flare bg-flare/10 shadow-pop"
                      : "border-studio-line bg-studio-card/60 hover:border-flare/50"
                  }`}
                >
                  <span
                    className={`block font-sans text-[15px] font-semibold ${active ? "text-flare-soft" : "text-bone"}`}
                  >
                    {v[lang]}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-bone-faint">
                    {v.hint[lang]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="mb-5 rounded-xl border border-flare-deep/50 bg-flare-deep/10 px-4 py-3 text-sm text-flare-soft">
            {L.errPrefix}
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={!canGo}
          onClick={() => onGenerate({ pitch: pitch.trim(), url: url.trim(), vibe })}
          className="btn-primary w-full text-base"
        >
          {busy ? (
            <>
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-studio [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-studio [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-studio [animation-delay:300ms]" />
              </span>
              {L.generating}
            </>
          ) : (
            L.generate
          )}
        </button>
      </div>

      {/* Examples */}
      <div className="mt-6">
        <span className="label ml-1">{L.examplesLabel}</span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              disabled={busy}
              onClick={() => {
                setPitch(ex.pitch[lang]);
                setUrl(ex.url);
                setVibe(ex.vibe);
              }}
              className="btn-chip"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
