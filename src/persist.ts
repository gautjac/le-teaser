// Ask the browser to keep this app's local data (IndexedDB) durable so it
// can't be silently evicted. Best-effort: never throws, never blocks startup.
export async function ensurePersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted?.()) return true;
    const granted = await navigator.storage.persist();
    if (!granted) {
      console.info(
        "[storage] Persistent storage not granted yet — local data is best-effort. " +
          "Ajoute l'app à ton écran d'accueil ou mets-la en signet pour la rendre durable.",
      );
    }
    return granted;
  } catch {
    return false;
  }
}
