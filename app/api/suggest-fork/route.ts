import { NextResponse } from "next/server";
import { runSuggestFork } from "@/lib/ai/pipeline";

export const runtime = "nodejs";

/**
 * Stage 2 — "Suggest my fork". Takes a messy free-text situation and returns one
 * plausible decision fork (decision + routes + value conflict + a question) the
 * user then edits. Optional live model; mock fallback with no key. No env vars
 * required; never affects /api/questions, /api/simulate, or /api/research.
 */
export async function POST(req: Request) {
  let situation = "";
  try {
    const body = await req.json();
    situation = String(body?.situation ?? "").slice(0, 2000);
  } catch {
    situation = "";
  }
  const result = await runSuggestFork(situation);
  return NextResponse.json(result);
}
