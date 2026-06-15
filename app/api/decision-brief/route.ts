import { NextResponse } from "next/server";
import { briefRequestSchema } from "@/lib/schemas";
import { runBrief } from "@/lib/ai/pipeline";
import { DEMO_BRIEF, DEMO_CONTEXT, DEMO_BRANCHES } from "@/lib/mock";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = briefRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ brief: DEMO_BRIEF, mocked: true });
  }
  const { context, branches } = parsed.data;
  const result = await runBrief(
    context ?? DEMO_CONTEXT,
    branches?.length ? branches : DEMO_BRANCHES,
  );
  return NextResponse.json(result);
}
