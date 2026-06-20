import { NextResponse } from "next/server";
import { journeyNextRequestSchema } from "@/lib/journey/schema";
import { runJourneyNext } from "@/lib/journey/agent";
import { buildMockJourneyNext } from "@/lib/journey/mock";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = journeyNextRequestSchema.safeParse(body);
  if (!parsed.success) {
    // Degrade gracefully rather than 400-ing the demo: return the first question.
    return NextResponse.json(buildMockJourneyNext("", []));
  }
  const { situation, previousQuestions, journeyState } = parsed.data;
  const result = await runJourneyNext(situation, previousQuestions, journeyState);
  return NextResponse.json(result);
}
