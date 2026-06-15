import { NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/schemas";
import { runChat } from "@/lib/ai/pipeline";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        reply:
          "I can only speak from inside a specific simulated branch. Open a branch first, then ask me what I underestimated, what would make this fail, or what to test this week.",
        mocked: true,
      },
      { status: 200 },
    );
  }
  const { context, branch, history, message } = parsed.data;
  const result = await runChat(context, branch, history, message);
  return NextResponse.json(result);
}
