import { z } from "zod";
import { retrieve } from "@/lib/retrieve";
import { triage, TriageError } from "@/lib/triage";
import { mockTriage } from "@/lib/mock";

const Body = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Describe the problem in at least a few words.")
    .max(1500, "Keep the description under 1,500 characters."),
});

// Best-effort rate limit per server instance, so a public demo can't run up
// the API bill. Pair it with a monthly spend limit in the Claude Console.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function error(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return error("You've sent a lot of tickets in a short time. Wait a few minutes and try again.", 429);
  }

  let parsed;
  try {
    parsed = Body.safeParse(await request.json());
  } catch {
    return error("The request wasn't valid JSON.", 400);
  }
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid request.", 400);
  }

  const { description } = parsed.data;
  const matched = retrieve(description).map((m) => m.article);

  const useMock = process.env.MOCK_TRIAGE === "1";
  if (!useMock && !process.env.ANTHROPIC_API_KEY) {
    return error("The assistant isn't configured yet: ANTHROPIC_API_KEY is missing on the server.", 503);
  }

  try {
    const ticket = useMock ? mockTriage(description, matched) : await triage(description, matched);
    const used = matched.filter((a) => ticket.sources.includes(a.id));
    return Response.json({
      ticket,
      sources: used.map((a) => ({ id: a.id, title: a.title })),
      mode: useMock ? "mock" : "live",
    });
  } catch (e) {
    console.error("triage failed", e);
    const status = e instanceof Error && "status" in e ? Number((e as { status: number }).status) : 0;
    if (status === 429 || status === 529) {
      return error("The AI service is busy right now. Try again in a minute.", 503);
    }
    return error(e instanceof TriageError ? e.message : "Triage failed. Try again in a moment.", 502);
  }
}
