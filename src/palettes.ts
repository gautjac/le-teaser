import type { Platform } from "./types";

/** A card palette: two-stop gradient background + type/accent colours. */
export interface Palette {
  id: string;
  name: string;
  bgA: string;
  bgB: string;
  ink: string; // headline colour
  sub: string; // secondary text
  accent: string; // rule / dot / app-name chip
  grain: number; // 0..1 grain strength
  dark: boolean; // whether background is dark (affects chip contrast)
}

export const PALETTES: Palette[] = [
  {
    id: "ember",
    name: "Ember",
    bgA: "#1a0e0a",
    bgB: "#3a140c",
    ink: "#ffe9dd",
    sub: "#f0a488",
    accent: "#ff5a3c",
    grain: 0.06,
    dark: true,
  },
  {
    id: "lime-noir",
    name: "Lime Noir",
    bgA: "#0d0f08",
    bgB: "#1c2410",
    ink: "#f4ffe0",
    sub: "#b9d97a",
    accent: "#c8ff4d",
    grain: 0.05,
    dark: true,
  },
  {
    id: "violet-dusk",
    name: "Violet Dusk",
    bgA: "#120c22",
    bgB: "#2a1a4d",
    ink: "#f0eaff",
    sub: "#b7a5f0",
    accent: "#9a7bff",
    grain: 0.05,
    dark: true,
  },
  {
    id: "bone",
    name: "Bone Press",
    bgA: "#f6f0e6",
    bgB: "#e6ddcb",
    ink: "#1a1520",
    sub: "#6b6154",
    accent: "#e0421f",
    grain: 0.04,
    dark: false,
  },
  {
    id: "sky-ink",
    name: "Sky Ink",
    bgA: "#08131c",
    bgB: "#0f2a3d",
    ink: "#e4f6ff",
    sub: "#8fc7e6",
    accent: "#4dd0ff",
    grain: 0.05,
    dark: true,
  },
  {
    id: "clementine",
    name: "Clémentine",
    bgA: "#ff5a3c",
    bgB: "#e0421f",
    ink: "#fff4ee",
    sub: "#ffd8c9",
    accent: "#0d0b12",
    grain: 0.06,
    dark: true,
  },
  {
    id: "acid",
    name: "Acid",
    bgA: "#c8ff4d",
    bgB: "#a9e02b",
    ink: "#141a06",
    sub: "#4c5a1e",
    accent: "#0d0b12",
    grain: 0.05,
    dark: false,
  },
];

const BY_ID = new Map(PALETTES.map((p) => [p.id, p]));

export function paletteById(id: string): Palette {
  return BY_ID.get(id) ?? PALETTES[0];
}

/** Deterministically assign a distinct palette per day so the week reads varied. */
export function paletteForDay(day: number): Palette {
  // offset so day 1 isn't always ember; spread across the set
  return PALETTES[(day + 2) % PALETTES.length];
}

/** Platform-appropriate canvas dimensions. */
export interface CardSize {
  w: number;
  h: number;
  label: string;
  ratio: string;
}

export function sizeForPlatform(platform: Platform): CardSize {
  switch (platform) {
    case "Instagram":
      return { w: 1080, h: 1350, label: "Portrait 4:5", ratio: "4/5" };
    case "TikTok":
      return { w: 1080, h: 1350, label: "Portrait 4:5", ratio: "4/5" };
    case "X":
      return { w: 1600, h: 900, label: "Paysage 16:9", ratio: "16/9" };
    case "LinkedIn":
      return { w: 1200, h: 1200, label: "Carré 1:1", ratio: "1/1" };
    case "Threads":
      return { w: 1080, h: 1080, label: "Carré 1:1", ratio: "1/1" };
    default:
      return { w: 1080, h: 1080, label: "Carré 1:1", ratio: "1/1" };
  }
}
