import { NextResponse } from "next/server";
import { journeyRevealRequestSchema } from "@/lib/journey/schema";
import { runJourneyReveal } from "@/lib/journey/agent";
import { buildMockJourneyReveal } from "@/lib/journey/mock";
import { emptyJourneyState } from "@/lib/journey/types";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = journeyRevealRequestSchema.safeParse(body);
  if (!parsed.success) {
    // Degrade gracefully rather than 400-ing the demo.
    return NextResponse.json(buildMockJourneyReveal("", [], emptyJourneyState()));
  }
  const { situation, answers, journeyState } = parsed.data;
  const result = await runJourneyReveal(situation, answers, journeyState);
  return NextResponse.json(result);
}
