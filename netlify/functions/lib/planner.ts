import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8";

type Platform = "X" | "Instagram" | "LinkedIn" | "Threads" | "TikTok";
type PostFormat = "thread" | "single" | "poll" | "carousel" | "video-script";
type Vibe =
  | "build-in-public"
  | "launch-day"
  | "quietly-proud"
  | "behind-the-scenes"
  | "teaser";
type Lang = "fr" | "en";

export interface PlanRequest {
  pitch: string;
  url?: string;
  vibe?: Vibe;
  lang?: Lang;
}

interface RawPost {
  day?: number;
  platform?: string;
  format?: string;
  hook?: string;
  body?: string;
  hashtags?: string[];
  visualBrief?: string;
}

export interface PlanResult {
  appName: string;
  tagline: string;
  posts: Array<{
    day: number;
    platform: Platform;
    format: PostFormat;
    hook: string;
    body: string;
    hashtags: string[];
    visualBrief: string;
  }>;
}

function client(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("Server missing CLAUDE_API_KEY");
  return new Anthropic({ apiKey, baseURL: "https://api.anthropic.com" });
}

const VIBE_GUIDE: Record<Vibe, { fr: string; en: string }> = {
  "build-in-public": {
    fr: "Construire au grand jour. Partage le processus, les décisions, les petites victoires et les bogues. Honnête, curieux, jamais vantard. Le fil rouge de la semaine, c'est le making-of.",
    en: "Building in public. Share the process, the decisions, the small wins and the bugs. Honest, curious, never boastful. The week's throughline is the making-of.",
  },
  "launch-day": {
    fr: "Semaine de lancement. Montée vers un moment: teasing en début de semaine, la sortie au milieu, réactions et coulisses après. De l'énergie sans hype creuse.",
    en: "Launch week. A build toward a moment: teasing early, the drop mid-week, reactions and behind-the-scenes after. Energy without empty hype.",
  },
  "quietly-proud": {
    fr: "Fier, tranquillement. Ton posé, artisanal. On laisse le travail parler. Peu de mots, beaucoup de soin. Le contraire du tapage.",
    en: "Quietly proud. Composed, craftsmanlike tone. Let the work speak. Few words, lots of care. The opposite of loud.",
  },
  "behind-the-scenes": {
    fr: "Dans les coulisses. Captures d'écran de code, croquis, faux départs, l'atelier. On montre comment la saucisse est faite, avec goût.",
    en: "Behind the scenes. Code screenshots, sketches, false starts, the workshop. Show how the sausage is made, tastefully.",
  },
  teaser: {
    fr: "Mode aguiche. Le mystère avant la révélation. On montre un détail, on garde le reste. Court, intriguant, ça donne envie de suivre.",
    en: "Teaser mode. Mystery before the reveal. Show one detail, hold the rest. Short, intriguing, makes people want to follow.",
  },
};

const SYSTEM_BASE = `You are the head of content at Le Teaser, a one-person social-media desk for a Québécois filmmaker-musician named Jac who ships small, beautiful indie apps and wants to market them WITHOUT sounding like a growth-hacker.

Your job: from a short description of ONE of his apps, produce a full SEVEN-day social content calendar — one post per day — ready to publish, each in HIS voice.

JAC'S VOICE — internalise this, it is the whole point:
- Builder-in-public, first person, dry wit. He is a craftsman, not a marketer.
- Québécois French when writing in French: natural, warm, a little "mononc'" charm is fine, but never forced joual. Real spoken-Québec cadence, not France-French stiffness.
- He is genuinely proud of his craft but allergic to hype. NO "game-changer", NO "révolutionnaire", NO "🚀🔥💯 stacks of emoji", NO "I'm thrilled to announce", NO fake urgency, NO growth-bro clichés.
- Specific over generic: he'd rather say "ça calcule la scansion d'un alexandrin en direct" than "powerful features". Concrete details, small honest confessions, the odd self-deprecating line.
- Emoji: at most ONE, only when it genuinely lands. Usually zero.
- He treats the reader like a smart friend, not a "target audience".

CALENDAR CRAFT — the week must feel like a real content strategist planned it, not seven variations of the same post:
- Vary the PLATFORM across the week (X, Instagram, LinkedIn, Threads, TikTok) — pick platforms that suit each post's format and audience. Don't put every post on X.
- Vary the FORMAT: mix thread, single, poll, carousel, video-script across the seven days. At least one thread, at least one poll, at least one carousel or video-script.
- Vary the ANGLE day to day: the origin story, a specific feature demo, a design decision, a bug/lesson, a question to the audience, a quiet "it's live" moment, a reflection. Each day earns its place.
- Match the requested VIBE as the week's emotional throughline.

PER POST, write:
- hook: the scroll-stopping first line. This is ALSO what gets set big on the visual card, so make it punchy and self-contained (ideally under ~90 characters, no hashtags in it).
- body: the full post copy, formatted for its platform & format. For a "thread", write the whole thread with numbered beats (1/ 2/ 3/ …). For a "poll", write the setup line then "Options:" with 2–4 choices. For a "video-script", write it as spoken shot-by-shot beats. For "carousel", write it as slide-by-slide copy (Slide 1: … Slide 2: …). For "single", a tight standalone post. Keep it realistic in length for the platform.
- hashtags: 2–5 genuinely useful, lowercase-ish tags (mix niche + reach). Include #buildinpublic where it fits. No hashtag salad.
- visualBrief: one art-direction line for the companion quote-card (mood, what the big type should feel like). One sentence.

Also give:
- appName: the app's name, cleaned up (e.g. "La Girouette"). Infer it from the pitch/URL if not stated explicitly.
- tagline: one sharp sentence, in Jac's voice, that captures the app's real angle (used as the campaign subtitle).

Respond ONLY by calling deliver_calendar. Produce EXACTLY 7 posts, day 1 through 7, in order.`;

const LANG_DIRECTIVE: Record<Lang, string> = {
  fr: "\n\nLANGUE DE SORTIE — écris TOUT le texte destiné à la publication en FRANÇAIS québécois naturel : `tagline`, chaque `hook`, chaque `body`, chaque `visualBrief`. Les hashtags peuvent rester en anglais s'ils sont plus utiles ainsi. N'écris PAS en anglais dans les hooks et les corps.",
  en: "\n\nOUTPUT LANGUAGE — write ALL publishable text in natural ENGLISH: `tagline`, every `hook`, every `body`, every `visualBrief`. Keep Jac's dry, builder-in-public voice. Do NOT write in French.",
};

const TOOL: Anthropic.Tool = {
  name: "deliver_calendar",
  description: "Deliver the seven-day social content calendar for the app.",
  input_schema: {
    type: "object",
    required: ["appName", "tagline", "posts"],
    properties: {
      appName: { type: "string", description: "The app's name, cleaned up." },
      tagline: {
        type: "string",
        description: "One sharp sentence in Jac's voice capturing the app's angle.",
      },
      posts: {
        type: "array",
        description: "Exactly 7 posts, day 1 through 7, in order.",
        items: {
          type: "object",
          required: [
            "day",
            "platform",
            "format",
            "hook",
            "body",
            "hashtags",
            "visualBrief",
          ],
          properties: {
            day: { type: "number", description: "1 through 7." },
            platform: {
              type: "string",
              enum: ["X", "Instagram", "LinkedIn", "Threads", "TikTok"],
            },
            format: {
              type: "string",
              enum: ["thread", "single", "poll", "carousel", "video-script"],
            },
            hook: {
              type: "string",
              description:
                "Scroll-stopping first line, also the visual card headline. Under ~90 chars, no hashtags.",
            },
            body: {
              type: "string",
              description: "Full post copy, formatted for the platform & format.",
            },
            hashtags: {
              type: "array",
              items: { type: "string" },
              description: "2–5 useful tags.",
            },
            visualBrief: {
              type: "string",
              description: "One art-direction line for the companion quote-card.",
            },
          },
        },
      },
    },
  },
};

const PLATFORMS = new Set(["X", "Instagram", "LinkedIn", "Threads", "TikTok"]);
const FORMATS = new Set([
  "thread",
  "single",
  "poll",
  "carousel",
  "video-script",
]);

function coercePlatform(v: unknown, i: number): Platform {
  const s = String(v ?? "").trim();
  if (PLATFORMS.has(s)) return s as Platform;
  const rota: Platform[] = ["X", "Instagram", "LinkedIn", "Threads", "TikTok"];
  return rota[i % rota.length];
}

function coerceFormat(v: unknown, i: number): PostFormat {
  const s = String(v ?? "").trim();
  if (FORMATS.has(s)) return s as PostFormat;
  const rota: PostFormat[] = [
    "single",
    "thread",
    "poll",
    "carousel",
    "video-script",
  ];
  return rota[i % rota.length];
}

function cleanTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t) => String(t).trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
    .slice(0, 5);
}

export function validate(
  raw: { appName?: string; tagline?: string; posts?: RawPost[] },
  lang: Lang,
): PlanResult {
  const appName =
    String(raw.appName ?? "").trim() ||
    (lang === "en" ? "Your app" : "Ton app");
  const tagline = String(raw.tagline ?? "").trim();

  const posts = (raw.posts ?? [])
    .slice(0, 7)
    .map((p, i) => {
      const hook = String(p.hook ?? "").trim();
      const body = String(p.body ?? "").trim();
      if (!hook && !body) return null;
      return {
        day: typeof p.day === "number" && p.day >= 1 && p.day <= 7 ? p.day : i + 1,
        platform: coercePlatform(p.platform, i),
        format: coerceFormat(p.format, i),
        hook: hook || body.split("\n")[0].slice(0, 90),
        body: body || hook,
        hashtags: cleanTags(p.hashtags),
        visualBrief: String(p.visualBrief ?? "").trim(),
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => a.day - b.day);

  if (!posts.length) {
    throw new Error(
      lang === "en"
        ? "The planner returned no posts. Please try again."
        : "Le planificateur n'a renvoyé aucun post. Réessaie.",
    );
  }

  return { appName, tagline, posts };
}

export async function plan(req: PlanRequest): Promise<PlanResult> {
  const lang: Lang = req.lang === "en" ? "en" : "fr";
  const vibe: Vibe =
    req.vibe && VIBE_GUIDE[req.vibe] ? req.vibe : "build-in-public";
  const guide = VIBE_GUIDE[vibe][lang];

  const userText = [
    "THE APP (Jac's own words):",
    (req.pitch ?? "").slice(0, 4000) || "(no written pitch)",
    "",
    req.url ? `LINK: ${req.url.slice(0, 300)}` : "",
    "",
    `VIBE FOR THE WEEK: ${guide}`,
    "",
    lang === "en"
      ? "Write everything in English, in Jac's dry builder-in-public voice."
      : "Écris tout en français québécois naturel, dans la voix posée et sans hype de Jac.",
    "Produce EXACTLY 7 posts (day 1–7). Respond only by calling deliver_calendar.",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 5000,
    system: SYSTEM_BASE + LANG_DIRECTIVE[lang],
    messages: [{ role: "user", content: userText }],
    tools: [TOOL],
    tool_choice: { type: "tool", name: "deliver_calendar" },
  });

  const tool = res.content.find((b) => b.type === "tool_use");
  if (!tool || tool.type !== "tool_use") {
    throw new Error(
      lang === "en"
        ? "No calendar returned by the planner."
        : "Aucun calendrier renvoyé par le planificateur.",
    );
  }
  return validate(
    tool.input as { appName?: string; tagline?: string; posts?: RawPost[] },
    lang,
  );
}
