import { NextResponse } from "next/server";
import { simulateRequestSchema } from "@/lib/schemas";
import { runSimulation } from "@/lib/ai/pipeline";
import { DEMO_SIMULATION } from "@/lib/mock";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = simulateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(DEMO_SIMULATION);
  }
  const result = await runSimulation(parsed.data.context, parsed.data.answers);
  return NextResponse.json(result);
}
