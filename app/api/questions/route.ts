import { NextResponse } from "next/server";
import { questionsRequestSchema } from "@/lib/schemas";
import { runQuestions } from "@/lib/ai/pipeline";
import { buildMockQuestions } from "@/lib/mock";
import { DEMO_CONTEXT } from "@/lib/mock/demoContext";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = questionsRequestSchema.safeParse(body);
  if (!parsed.success) {
    // Degrade gracefully rather than 400-ing the demo.
    return NextResponse.json({
      questions: buildMockQuestions(DEMO_CONTEXT),
      mocked: true,
      note: "Invalid input; returned demo clarifying questions.",
    });
  }
  const result = await runQuestions(parsed.data.context);
  return NextResponse.json(result);
}
