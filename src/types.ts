// Shared domain types for Le Teaser.

export type Platform = "X" | "Instagram" | "LinkedIn" | "Threads" | "TikTok";

export type PostFormat =
  | "thread"
  | "single"
  | "poll"
  | "carousel"
  | "video-script";

export type Vibe =
  | "build-in-public"
  | "launch-day"
  | "quietly-proud"
  | "behind-the-scenes"
  | "teaser";

export type Lang = "fr" | "en";

/** One day's post as returned by the planner and stored locally. */
export interface Post {
  id: string;
  day: number; // 1..7
  platform: Platform;
  format: PostFormat;
  hook: string; // the scroll-stopping opener; also the visual headline
  body: string; // full copy of the post
  hashtags: string[];
  visualBrief: string; // one-line art-direction note
  paletteId: string; // which card palette is auto-assigned
  edited?: boolean; // user has hand-edited this post
}

export interface Campaign {
  id: string; // slug of the app name (one campaign per app)
  appName: string;
  pitch: string;
  url?: string;
  vibe: Vibe;
  lang: Lang;
  tagline: string; // planner's one-line read of the app's angle
  posts: Post[];
  createdAt: number;
  updatedAt: number;
}

/** The raw structured payload the /api/plan function returns. */
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

export interface PlanRequest {
  pitch: string;
  url?: string;
  vibe: Vibe;
  lang: Lang;
}
