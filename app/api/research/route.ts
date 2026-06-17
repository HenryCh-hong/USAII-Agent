import { NextResponse } from "next/server";
import { z } from "zod";
import { userContextSchema, futureBranchSchema } from "@/lib/schemas";
import { runResearch } from "@/lib/research/researchAgent";
import { DEMO_CONTEXT, DEMO_BRANCHES } from "@/lib/mock";

export const runtime = "nodejs";
export const maxDuration = 30;

const requestSchema = z.object({
  context: userContextSchema,
  branches: z.array(futureBranchSchema).optional(),
  mode: z.enum(["auto", "mock", "live"]).optional(),
});

function summarize(dossier: Awaited<ReturnType<typeof runResearch>>) {
  return {
    dossier,
    mocked: dossier.mocked,
    provider: dossier.provider,
    queryCount: dossier.generatedQueries.length,
    sourceCount: dossier.sourcesFound.length,
    usedCount: dossier.sourcesUsed.length,
    rejectedCount: dossier.sourcesRejected.length,
    warnings: dossier.survivorshipBiasWarnings.slice(0, 2),
  };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = requestSchema.safeParse(body);
  const ctx = parsed.success ? parsed.data.context : DEMO_CONTEXT;
  const branches = parsed.success ? parsed.data.branches ?? DEMO_BRANCHES : DEMO_BRANCHES;

  try {
    const dossier = await runResearch(ctx, branches);
    return NextResponse.json(summarize(dossier));
  } catch {
    // Never hard-fail the demo — fall back to the curated Alex dossier.
    const dossier = await runResearch(DEMO_CONTEXT, DEMO_BRANCHES);
    return NextResponse.json(summarize(dossier));
  }
}
