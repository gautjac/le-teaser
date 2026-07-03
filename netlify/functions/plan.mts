import type { Context } from "@netlify/functions";
import { plan, type PlanRequest } from "./lib/planner.ts";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: PlanRequest;
  try {
    body = (await req.json()) as PlanRequest;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const lang = body.lang === "en" ? "en" : "fr";
  const pitch = (body.pitch ?? "").trim();
  if (pitch.length < 8) {
    return json(
      {
        error:
          lang === "en"
            ? "Describe the app in a sentence or two so I have something to work with."
            : "Décris l'app en une phrase ou deux pour que j'aie de quoi travailler.",
      },
      400,
    );
  }

  // The Opus planning call can run ~30–55s. We stream NDJSON: a heartbeat
  // every 3s keeps the connection live, then a final {result|error} line
  // carries the payload. The client reads to end-of-stream and parses the
  // last non-empty JSON line.
  const enc = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let done = false;
      const beat = setInterval(() => {
        if (!done) {
          try {
            controller.enqueue(enc.encode("\n"));
          } catch {
            /* closed */
          }
        }
      }, 3000);

      try {
        const result = await plan({
          pitch,
          url: (body.url ?? "").trim() || undefined,
          vibe: body.vibe,
          lang,
        });
        done = true;
        clearInterval(beat);
        controller.enqueue(enc.encode(JSON.stringify({ result }) + "\n"));
      } catch (err) {
        done = true;
        clearInterval(beat);
        const message =
          err instanceof Error
            ? err.message
            : lang === "en"
              ? "Unknown error"
              : "Erreur inconnue";
        controller.enqueue(enc.encode(JSON.stringify({ error: message }) + "\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
};
