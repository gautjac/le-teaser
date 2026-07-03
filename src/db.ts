import Dexie, { type Table } from "dexie";
import type { Campaign } from "./types";

// Le Teaser keeps every generated campaign locally. One campaign per app,
// keyed by the app's slug id. This IndexedDB is the ONLY copy of the data —
// migrations here must never clear or drop user rows (house data-durability rule).
class TeaserDB extends Dexie {
  campaigns!: Table<Campaign, string>;

  constructor() {
    super("le-teaser");
    // v1 — initial schema. Index by id (primary), updatedAt for recency sort.
    this.version(1).stores({
      campaigns: "id, updatedAt, appName",
    });
  }
}

export const db = new TeaserDB();

/** Slugify an app name into a stable campaign id (one campaign per app). */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // strip combining accents
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `app-${Date.now()}`
  );
}

export async function saveCampaign(c: Campaign): Promise<void> {
  await db.campaigns.put({ ...c, updatedAt: Date.now() });
}

export async function deleteCampaign(id: string): Promise<void> {
  await db.campaigns.delete(id);
}

export async function getCampaign(id: string): Promise<Campaign | undefined> {
  return db.campaigns.get(id);
}
