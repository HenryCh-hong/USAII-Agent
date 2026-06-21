/**
 * Shared value-signal model for the guided journey.
 *
 * Extracted so both the question/next mock (lib/journey/mock) and the route
 * universe builder (lib/journey/routeUniverse) can read the same value tags
 * without a circular import. Everything here is a soft, inferred signal folded
 * from the user's own answers — never a verdict, prediction, or recommendation.
 */
import type { JourneyState, QuestionAnswer } from "./types";
import { emptyJourneyState } from "./types";

export type ValueTag =
  | "growth"
  | "freedom"
  | "security"
  | "identity"
  | "opportunity"
  | "open";

// Prefix (stem) matching: a leading word-boundary then the stem, with NO trailing
// boundary — so "secur" matches "security/secure", "opportun" matches
// "opportunity", etc. A trailing \b would (wrongly) require a whole word.
export const VALUE_KEYWORDS: [ValueTag, RegExp][] = [
  ["freedom", /\b(freedom|ownership|own|autonom|independ|control|build|founder)/],
  ["security", /\b(secur|stable|stabil|safe|income|salary|money|steady|certain|reliab)/],
  ["growth", /\b(growth|momentum|fast|acceler|ambit|level up|skill|compound|learn)/],
  ["identity", /\b(identity|meaning|purpose|who i am|fit|alive|energiz|matter|fulfil)/],
  ["opportunity", /\b(opportun|rare|once|window|miss out|upside|bet|big swing|variance)/],
];

/** Human phrasing for a value tag, used to make follow-ups visibly causal. */
export const VALUE_PHRASE: Record<ValueTag, string> = {
  growth: "fast growth and momentum",
  freedom: "freedom and ownership",
  security: "security and a clear footing",
  identity: "identity and meaning",
  opportunity: "not missing a rare opportunity",
  open: "clarity about what you actually want",
};

export function classify(text: string): ValueTag {
  const t = (text || "").toLowerCase();
  for (const [tag, re] of VALUE_KEYWORDS) if (re.test(t)) return tag;
  return "open";
}

/** Fold the whole answer chain into a fresh JourneyState (idempotent). */
export function deriveState(situation: string, prev: QuestionAnswer[]): JourneyState {
  const state = emptyJourneyState();
  const blob = [situation, ...prev.map((p) => p.answer)].join(" \n ").toLowerCase();

  const tags = new Set<ValueTag>();
  for (const qa of prev) {
    const tag = classify(qa.selectedOption || qa.answer);
    if (tag !== "open") tags.add(tag);
  }
  for (const tag of tags) {
    if (!state.discoveredValues.includes(VALUE_PHRASE[tag])) {
      state.discoveredValues.push(VALUE_PHRASE[tag]);
    }
  }

  if (/\b(scared|afraid|fear|worry|worried|hate|stuck|trapped|regret|wrong path|miss)\b/.test(blob)) {
    state.fears.push("Choosing a path and finding it doesn't fit a year in");
  }
  if (/\b(money|income|pay|salary|rent|loan|afford|debt|fund)\b/.test(blob)) {
    state.constraints.push("Needs a viable financial footing");
  }
  const horizon = blob.match(/\b(\d{1,2})\s?(?:months?|years?)\b/);
  if (horizon) state.timeHorizon = horizon[0];

  // Risk posture inferred from the balance of security vs. opportunity/freedom signals.
  if (tags.has("opportunity") || tags.has("freedom")) {
    state.riskTolerance = tags.has("security")
      ? "mixed — drawn to upside but wants a floor"
      : "leans toward upside and optionality";
  } else if (tags.has("security")) {
    state.riskTolerance = "leans toward protecting a stable footing";
  }

  if (tags.has("identity")) state.identitySignals.push("Wants the path to feel like a fit, not just a résumé line");
  if (tags.has("growth")) state.identitySignals.push("Measures a good year by how much they grew");

  // Loose, reframed directions — never commitments.
  const hints = new Set<string>();
  if (tags.has("growth") || tags.has("security")) hints.add("Build a credible, legible signal on a structured runway");
  if (tags.has("freedom")) hints.add("Self-directed building where you own the outcome");
  if (tags.has("identity")) hints.add("Go deeper on the work that feels alive, even if slower");
  if (tags.has("opportunity")) hints.add("Take one concentrated, time-boxed swing at the rare window");
  if (hints.size < 2) hints.add("Keep two doors open in parallel before committing");
  state.possibleRouteHints = [...hints];

  // Surface the most painful uncertainty as a tag, drawn from explicit answers.
  for (const qa of prev) {
    const a = (qa.selectedOption || qa.answer || "").trim();
    if (qa.prompt.toLowerCase().includes("uncertainty") && a) {
      state.uncertaintyTags.push(a.toLowerCase().slice(0, 40));
    }
  }

  return state;
}

/** Count value tags across the answers (open excluded). */
function tagCounts(answers: QuestionAnswer[]): Record<ValueTag, number> {
  const counts: Record<ValueTag, number> = {
    growth: 0, freedom: 0, security: 0, identity: 0, opportunity: 0, open: 0,
  };
  for (const qa of answers) counts[classify(qa.selectedOption || qa.answer)] += 1;
  return counts;
}

/** The single dominant value tag across the answers ("open" if none). */
export function dominantTag(state: JourneyState, answers: QuestionAnswer[]): ValueTag {
  const counts = tagCounts(answers);
  let best: ValueTag = "open";
  let bestN = -1;
  for (const tag of Object.keys(counts) as ValueTag[]) {
    if (tag !== "open" && counts[tag] > bestN) {
      best = tag;
      bestN = counts[tag];
    }
  }
  // Fall back to the first discovered value's tag if answers were free-text.
  if (bestN <= 0 && state.discoveredValues.length) {
    for (const [tag, phrase] of Object.entries(VALUE_PHRASE) as [ValueTag, string][]) {
      if (tag !== "open" && state.discoveredValues.includes(phrase)) return tag;
    }
  }
  return bestN <= 0 ? "open" : best;
}

/** Value tags ranked by signal strength (answers + discovered values). */
export function rankTags(state: JourneyState, answers: QuestionAnswer[]): ValueTag[] {
  const counts = tagCounts(answers);
  // Boost tags that surfaced in the derived state (covers free-text journeys).
  for (const [tag, phrase] of Object.entries(VALUE_PHRASE) as [ValueTag, string][]) {
    if (tag !== "open" && state.discoveredValues.includes(phrase)) counts[tag] += 1;
  }
  return (Object.keys(counts) as ValueTag[])
    .filter((t) => t !== "open")
    .sort((a, b) => counts[b] - counts[a])
    .filter((t) => counts[t] > 0);
}
