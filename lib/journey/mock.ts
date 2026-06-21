/**
 * Mock journey — the always-available, keyless path.
 *
 * Deterministic but genuinely dynamic: the next question is keyed off the most
 * recent answer, and the reveal builds a full ROUTE UNIVERSE (6–10 distinct
 * candidates) selected and scored from the accumulated journey signal — so two
 * different journeys surface different questions and different route portfolios,
 * with no API key. Everything is hedged and labeled by honest provenance; nothing
 * here is a prediction or a recommendation.
 */
import type {
  JourneyNextResponse,
  JourneyQuestion,
  JourneyRevealResponse,
  JourneyState,
  QuestionAnswer,
  ReferenceNote,
} from "./types";
import { JOURNEY_TARGET_NODES } from "./types";
import { VALUE_PHRASE, classify, deriveState } from "./values";
import type { ValueTag } from "./values";
import { buildRouteUniverse, isCareerShaped, primaryRevealedPaths } from "./routeUniverse";

// Re-exported for lib/journey/agent.ts, which folds answers into a fresh state.
export { deriveState } from "./values";

/* ------------------------------ Question bank ----------------------------- */

function questionForNode(index: number, prevTag: ValueTag): JourneyQuestion {
  if (index === 0) {
    return {
      id: "jq1",
      prompt: "When you picture this going well a year from now, what are you most trying to protect?",
      type: "choice",
      options: [
        "Momentum & growth",
        "Freedom & ownership",
        "Security & a clear footing",
        "Identity & meaning",
        "Not missing a rare opportunity",
      ],
      whyThisQuestion:
        "Your dominant pull reshapes which paths are even worth comparing — the same option can be a win or a loss depending on it.",
      whatItSeparates: ["core value", "what you optimize for"],
    };
  }

  if (index === 1) {
    // Causally led by the value chosen at node 0.
    const lead = `Based on your last answer, ${VALUE_PHRASE[prevTag]} seems to matter most. `;
    if (prevTag === "freedom") {
      return {
        id: "jq2",
        prompt: lead + "What kind of freedom are you really protecting?",
        type: "choice",
        options: ["Control over my time", "Control over what I build", "Control over who I answer to"],
        whyThisQuestion: "Different kinds of freedom point to very different paths and tradeoffs.",
        whatItSeparates: ["freedom type", "autonomy"],
      };
    }
    if (prevTag === "security") {
      return {
        id: "jq2",
        prompt: lead + "Is the security you want financial, or more about a clear next step you can actually see?",
        type: "choice",
        options: ["Financial floor", "A visible, legible next step", "Both, roughly equally"],
        whyThisQuestion: "Financial security and legibility look similar but pull toward different paths.",
        whatItSeparates: ["security type", "binding constraint"],
      };
    }
    if (prevTag === "opportunity") {
      return {
        id: "jq2",
        prompt: lead + "Is that rare opportunity something specific you can name, or a feeling that a window is closing?",
        type: "short_text",
        whyThisQuestion: "A nameable opportunity is testable; a vague closing window is often a fear worth checking.",
        whatItSeparates: ["concreteness", "untested assumption"],
      };
    }
    if (prevTag === "identity") {
      return {
        id: "jq2",
        prompt: lead + "When has work felt most like *you* — and what was present in that moment?",
        type: "short_text",
        whyThisQuestion: "The texture of past fit is better signal for identity-fit than any label.",
        whatItSeparates: ["identity fit", "what energizes you"],
      };
    }
    // growth / open
    return {
      id: "jq2",
      prompt: lead + "Growth in what, exactly — your skills, your reputation, or the size of what you can take on?",
      type: "choice",
      options: ["Depth of skill", "External reputation/signal", "Scope of responsibility"],
      whyThisQuestion: "These three kinds of growth reward very different next moves.",
      whatItSeparates: ["growth type", "compounding"],
    };
  }

  if (index === 2) {
    return {
      id: "jq3",
      prompt:
        "Which uncertainty feels most painful right now — the one you'd most want resolved before deciding?",
      type: "choice",
      options: [
        "Income / security",
        "Ownership / freedom",
        "Intellectual depth",
        "External validation",
        "Whether I'd even enjoy it",
      ],
      whyThisQuestion: "The most painful uncertainty is usually the first thing worth a small test.",
      whatItSeparates: ["binding uncertainty", "what to test first"],
    };
  }

  if (index === 3) {
    return {
      id: "jq4",
      prompt: "What would make this decision feel successful 12 months from now — in your own words?",
      type: "short_text",
      whyThisQuestion:
        "Your own definition of success is the yardstick the paths should be measured against — not a generic one.",
      whatItSeparates: ["success criteria", "12-month yardstick"],
    };
  }

  // Fallback (should not be reached before the done check).
  return {
    id: `jq${index + 1}`,
    prompt: "Anything important about this decision we haven't touched yet?",
    type: "short_text",
    whyThisQuestion: "A final open prompt can surface a constraint the structured questions missed.",
    whatItSeparates: ["residual signal"],
  };
}

/* ------------------------------- Next node -------------------------------- */

export function buildMockJourneyNext(
  situation: string,
  previousQuestions: QuestionAnswer[],
): JourneyNextResponse {
  const index = previousQuestions.length;
  const updatedState = deriveState(situation, previousQuestions);

  if (index >= JOURNEY_TARGET_NODES) {
    return {
      mocked: true,
      done: true,
      updatedState,
      references: buildReferences(situation, previousQuestions, updatedState),
    };
  }

  const prevTag =
    index > 0
      ? classify(previousQuestions[index - 1].selectedOption || previousQuestions[index - 1].answer)
      : "open";
  const question = questionForNode(index, prevTag);

  return { mocked: true, done: false, question, updatedState };
}

/* ------------------------------ References -------------------------------- */

function buildReferences(
  situation: string,
  prev: QuestionAnswer[],
  state: JourneyState,
): ReferenceNote[] {
  const refs: ReferenceNote[] = [];

  // 1. User-provided signals — drawn from the user's actual answers.
  for (const v of state.discoveredValues.slice(0, 2)) {
    refs.push({
      label: "What you told us",
      sourceType: "user_answer",
      summary: `You signaled that ${v} weighs heavily for you.`,
      usedFor: "Choosing and reframing which paths to put in front of you",
    });
  }
  if (state.timeHorizon) {
    refs.push({
      label: "Your time horizon",
      sourceType: "user_answer",
      summary: `You framed this over roughly ${state.timeHorizon}.`,
      usedFor: "Sizing each path's first test to your window",
    });
  }

  // 2. Curated references — real, well-known framings, kept at framework/occupation
  // level with no invented statistics.
  refs.push({
    label: "Decision-science framing (premortem · reversibility)",
    sourceType: "curated_reference",
    summary:
      "Standard decision-quality practice: name how each path could fail in advance and judge how reversible it is, rather than optimizing a single forecast.",
    usedFor: "Structuring each path's risks and its 7-day test",
  });
  // Occupation-level source — attached only when the decision is actually
  // occupation-shaped, so it never reads as a per-user lookup that didn't happen.
  if (isCareerShaped(situation, state)) {
    refs.push({
      label: "U.S. Bureau of Labor Statistics — Occupational Outlook Handbook",
      sourceType: "curated_reference",
      summary:
        "Public, occupation-level framing of duties, typical demand direction, and the education a field tends to expect — never an individual outcome.",
      usedFor: "Grounding the career-shaped paths at their true coverage level",
    });
  }

  // 3. AI-inferred assumptions — clearly flagged.
  if (state.riskTolerance) {
    refs.push({
      label: "Inferred risk posture",
      sourceType: "ai_inferred",
      summary: `From the balance of your answers, your posture reads as: ${state.riskTolerance}. This is an assumption to confirm, not a measurement.`,
      usedFor: "Tuning how aggressive each path's first move is",
    });
  }
  refs.push({
    label: "Inferred fork",
    sourceType: "ai_inferred",
    summary:
      "The reframed paths are inferred from patterns across your answers — a reasonable reading you should edit, not a verdict.",
    usedFor: "Naming paths you may not have listed yourself",
  });

  return refs;
}

/* -------------------------------- Reveal ---------------------------------- */

export function buildMockJourneyReveal(
  situation: string,
  answers: QuestionAnswer[],
  journeyState: JourneyState,
): JourneyRevealResponse {
  const state =
    journeyState && journeyState.discoveredValues.length
      ? journeyState
      : deriveState(situation, answers);

  const { universe, primarySelection, decision, coreQuestion, valueConflict } = buildRouteUniverse(
    situation,
    answers,
    state,
  );

  return {
    mocked: true,
    decision,
    coreQuestion,
    valueConflict,
    // The three primary candidates, projected to the small shape the adapter expands.
    routes: primaryRevealedPaths(universe, primarySelection.primaryRouteIds),
    references: buildReferences(situation, answers, state),
    universe,
    primarySelection,
  };
}
