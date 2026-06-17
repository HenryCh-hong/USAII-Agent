/**
 * Query planner — turns the user's decision and options into safe public search
 * queries. Queries are about roles, fields, programs, and decision frameworks —
 * never about identifying or looking up a private individual. Deterministic so
 * the demo is stable; a live deployment could swap in an LLM planner later.
 */
import type { FutureBranch, UserContext } from "../types";
import type { GeneratedQuery } from "./types";

/** Defensive guard: keep queries about roles/fields, not person lookups. */
function isSafeQuery(q: string): boolean {
  const lower = q.toLowerCase();
  const unsafe = [
    "who is",
    "linkedin.com/in",
    "home address",
    "phone number",
    "net worth of",
    "face",
    "photo of",
  ];
  return !unsafe.some((u) => lower.includes(u));
}

export function planQueries(ctx: UserContext, branches?: FutureBranch[]): GeneratedQuery[] {
  const out: GeneratedQuery[] = [];
  const options = branches?.length ? branches.map((b) => ({ id: b.id, label: b.track || b.title })) : ctx.options.map((o) => ({ id: undefined as string | undefined, label: o }));

  for (const opt of options) {
    out.push({
      q: `${opt.label} career path outcomes requirements evidence`,
      intent: `Public outcomes & requirements for the "${opt.label}" path`,
      branchId: opt.id,
    });
  }

  if (ctx.major) {
    out.push({
      q: `${ctx.major} graduate first-destination outcomes`,
      intent: "Field/program-level graduate outcome categories (not individual)",
    });
  }

  out.push({
    q: "decision under uncertainty validation experiment framework",
    intent: "Decision-science framing: turning uncertainty into a cheap test",
  });
  out.push({
    q: "career success stories survivorship bias caveat",
    intent: "Bias check: how public success stories distort the base rate",
  });

  return out.filter((q) => isSafeQuery(q.q)).slice(0, 8);
}
