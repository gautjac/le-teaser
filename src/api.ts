import type { PlanRequest, PlanResult } from "./types";

/**
 * Call the NDJSON keepalive planner endpoint. The function streams `\n`
 * heartbeats while Opus works, then a final `{"result"|"error"}` line.
 * We read to end-of-stream and parse the last non-empty JSON line.
 */
export async function requestPlan(req: PlanRequest): Promise<PlanResult> {
  const res = await fetch("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  // A non-streaming error (e.g. 400 with plain JSON) — surface it directly.
  const contentType = res.headers.get("Content-Type") ?? "";
  if (!res.ok && !contentType.includes("x-ndjson")) {
    const data = await res.json().catch(() => ({}) as { error?: string });
    throw new Error(
      (data as { error?: string }).error || `Erreur ${res.status}`,
    );
  }

  if (!res.body) throw new Error("Réponse vide du serveur.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let lastJson: { result?: PlanResult; error?: string } | null = null;

  const consume = (chunk: string) => {
    buffer += chunk;
    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue; // heartbeat
      try {
        lastJson = JSON.parse(line);
      } catch {
        /* partial/garbage line — ignore */
      }
    }
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    consume(decoder.decode(value, { stream: true }));
  }
  consume(decoder.decode()); // flush
  if (buffer.trim()) {
    try {
      lastJson = JSON.parse(buffer.trim());
    } catch {
      /* ignore */
    }
  }

  if (!lastJson) throw new Error("Le serveur n'a rien renvoyé.");
  if (lastJson.error) throw new Error(lastJson.error);
  if (!lastJson.result) throw new Error("Réponse malformée du serveur.");
  return lastJson.result;
}
