/**
 * Anthropic client wrapper. The whole live path is optional — every route
 * falls back to mock data when there's no key or a call fails. This module
 * isolates the SDK and provides JSON generation with one validation retry.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { ZodType } from "zod";

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

let cached: Anthropic | null = null;
function getClient(): Anthropic {
  if (!cached) cached = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return cached;
}

export async function generateText(
  system: string,
  user: string,
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.6,
    system,
    messages: [{ role: "user", content: user }],
  });
  return res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n");
}

function extractJSON(text: string): string {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first >= 0 && last > first) t = t.slice(first, last + 1);
  return t;
}

/**
 * Generate JSON validated against a Zod schema. Retries once with an explicit
 * "your output failed validation" nudge before throwing (the caller then falls
 * back to mock). This is the contract that keeps malformed AI off the UI.
 */
export async function generateJSON<T>(
  schema: ZodType<T>,
  system: string,
  user: string,
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const nudge =
      attempt === 0
        ? ""
        : "\n\nIMPORTANT: your previous response failed schema validation. Return ONLY a single valid JSON object, no prose, no markdown fences, matching every required field exactly.";
    try {
      const raw = await generateText(system, user + nudge, opts);
      const parsed = JSON.parse(extractJSON(raw));
      return schema.parse(parsed);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}
