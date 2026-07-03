import type { Lang, Platform, PostFormat, Vibe } from "./types";

export const VIBES: { id: Vibe; fr: string; en: string; hint: { fr: string; en: string } }[] = [
  {
    id: "build-in-public",
    fr: "Construire au grand jour",
    en: "Build in public",
    hint: { fr: "Le processus, les décisions, les bogues.", en: "The process, the decisions, the bugs." },
  },
  {
    id: "launch-day",
    fr: "Jour de lancement",
    en: "Launch day",
    hint: { fr: "Montée vers la sortie, puis coulisses.", en: "Build toward the drop, then the aftermath." },
  },
  {
    id: "quietly-proud",
    fr: "Fier, tranquillement",
    en: "Quietly proud",
    hint: { fr: "On laisse le travail parler.", en: "Let the work speak." },
  },
  {
    id: "behind-the-scenes",
    fr: "Dans les coulisses",
    en: "Behind the scenes",
    hint: { fr: "L'atelier, les croquis, le code.", en: "The workshop, sketches, code." },
  },
  {
    id: "teaser",
    fr: "Mode aguiche",
    en: "Teaser mode",
    hint: { fr: "Le mystère avant la révélation.", en: "Mystery before the reveal." },
  },
];

export const PLATFORM_LABEL: Record<Platform, string> = {
  X: "X",
  Instagram: "Instagram",
  LinkedIn: "LinkedIn",
  Threads: "Threads",
  TikTok: "TikTok",
};

export function formatLabel(f: PostFormat, lang: Lang): string {
  const map: Record<PostFormat, { fr: string; en: string }> = {
    thread: { fr: "Fil", en: "Thread" },
    single: { fr: "Post simple", en: "Single post" },
    poll: { fr: "Sondage", en: "Poll" },
    carousel: { fr: "Carrousel", en: "Carousel" },
    "video-script": { fr: "Script vidéo", en: "Video script" },
  };
  return map[f][lang];
}

export const DAY_LABEL: Record<Lang, string[]> = {
  fr: ["Jour 1", "Jour 2", "Jour 3", "Jour 4", "Jour 5", "Jour 6", "Jour 7"],
  en: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
};

export const t = {
  fr: {
    tagline: "Ton desk de contenu indé",
    lede: "Colle le pitch d'une de tes apps. Je te sors une semaine de contenu prêt à publier — dans ta voix — chaque post avec son visuel à télécharger.",
    pitchLabel: "Le pitch de l'app",
    pitchPlaceholder:
      "Ex. La Girouette — une app météo avec de l'attitude. Elle te dit le temps qu'il fait en chiac, avec un brin d'insolence. PWA, voix locale, une pointe de mauvaise foi.",
    urlLabel: "Lien (optionnel)",
    urlPlaceholder: "App Store, Netlify, TestFlight…",
    vibeLabel: "L'ambiance de la semaine",
    examplesLabel: "Ou pars d'un exemple",
    generate: "Générer la semaine",
    generating: "Je planifie la semaine…",
    regenerate: "Regénérer",
    back: "← Mes campagnes",
    newCampaign: "Nouvelle campagne",
    yourCampaigns: "Tes campagnes",
    noCampaigns: "Aucune campagne encore. Commence par un pitch.",
    posts: "posts",
    copyText: "Copier le texte",
    copied: "Copié !",
    downloadImage: "Télécharger l'image",
    editCopy: "Modifier le texte",
    done: "Terminé",
    hook: "Accroche",
    body: "Le texte",
    hashtags: "Mots-clics",
    visualBrief: "Direction visuelle",
    cardStyle: "Style de la carte",
    delete: "Supprimer",
    deleteConfirm: "Supprimer cette campagne ?",
    saved: "Enregistré localement",
    onboardTitle: "Le Teaser",
    onboardLede: "Un desk de contenu pour tes propres apps.",
    onboardSteps: [
      "Colle le pitch d'une app que t'as bâtie (ou un lien).",
      "Je te compose 7 jours de posts dans TA voix — pas de hype, du vrai.",
      "Chaque post vient avec une carte visuelle à télécharger, prête à publier.",
    ],
    onboardCta: "C'est parti",
    langToggle: "EN",
    errPrefix: "Aïe — ",
    editedBadge: "modifié",
    save: "Enregistrer",
  },
  en: {
    tagline: "Your indie content desk",
    lede: "Paste the pitch for one of your apps. I'll write a week of ready-to-post content — in your voice — each post with a downloadable visual.",
    pitchLabel: "The app pitch",
    pitchPlaceholder:
      "e.g. La Girouette — a weather app with attitude. It tells you the forecast with a bit of cheek. PWA, local voice, a pinch of bad faith.",
    urlLabel: "Link (optional)",
    urlPlaceholder: "App Store, Netlify, TestFlight…",
    vibeLabel: "The week's vibe",
    examplesLabel: "Or start from an example",
    generate: "Generate the week",
    generating: "Planning the week…",
    regenerate: "Regenerate",
    back: "← My campaigns",
    newCampaign: "New campaign",
    yourCampaigns: "Your campaigns",
    noCampaigns: "No campaigns yet. Start with a pitch.",
    posts: "posts",
    copyText: "Copy text",
    copied: "Copied!",
    downloadImage: "Download image",
    editCopy: "Edit text",
    done: "Done",
    hook: "Hook",
    body: "Body",
    hashtags: "Hashtags",
    visualBrief: "Visual direction",
    cardStyle: "Card style",
    delete: "Delete",
    deleteConfirm: "Delete this campaign?",
    saved: "Saved locally",
    onboardTitle: "Le Teaser",
    onboardLede: "A content desk for your own apps.",
    onboardSteps: [
      "Paste the pitch for an app you built (or a link).",
      "I compose 7 days of posts in YOUR voice — no hype, the real thing.",
      "Every post comes with a downloadable visual card, ready to publish.",
    ],
    onboardCta: "Let's go",
    langToggle: "FR",
    errPrefix: "Ouch — ",
    editedBadge: "edited",
    save: "Save",
  },
} as const;

export interface Example {
  label: string;
  pitch: { fr: string; en: string };
  url: string;
  vibe: Vibe;
}

export const EXAMPLES: Example[] = [
  {
    label: "La Girouette",
    url: "https://la-girouette.netlify.app",
    vibe: "quietly-proud",
    pitch: {
      fr: "La Girouette — une app météo avec de l'attitude. Elle te donne le temps qu'il fait, mais avec une voix, une personnalité, un brin d'insolence en chiac. PWA qui vise le natif iOS, avec un widget qui te lance une pointe chaque matin. La clé météo vit dans une fonction Netlify.",
      en: "La Girouette — a weather app with attitude. It gives you the forecast, but with a voice, a personality, a bit of Chiac cheek. A PWA aiming for native iOS, with a widget that throws you a quip every morning. The weather key lives in a Netlify function.",
    },
  },
  {
    label: "La Sténo",
    url: "https://la-steno.netlify.app",
    vibe: "build-in-public",
    pitch: {
      fr: "La Sténo — transcription audio/vidéo FR/EN directement dans le fureteur, sans envoyer tes fichiers nulle part. Whisper via transformers.js, tout en local. Export SRT, VTT, Markdown. Pensé pour le montage documentaire.",
      en: "La Sténo — in-browser FR/EN audio/video transcription that never uploads your files anywhere. Whisper via transformers.js, all local. Exports SRT, VTT, Markdown. Built for documentary editing.",
    },
  },
  {
    label: "Les Ondes",
    url: "https://les-ondes.netlify.app",
    vibe: "behind-the-scenes",
    pitch: {
      fr: "Les Ondes — un lecteur de radio internet avec un vrai VU-mètre qui danse. Des milliers de stations via Radio-Browser. Simple, chaleureux, ça tourne dans un onglet toute la journée.",
      en: "Les Ondes — an internet-radio player with a real dancing VU meter. Thousands of stations via Radio-Browser. Simple, warm, runs in a tab all day long.",
    },
  },
];
