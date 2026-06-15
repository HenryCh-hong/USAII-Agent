/**
 * Mock layer — the always-available demo path.
 *
 * Everything here is fully typed against lib/types.ts and is what every API
 * route falls back to when there's no API key or the model misbehaves. The
 * demo persona always returns the rich canonical dataset; arbitrary inputs get
 * an evidence-grounded template honestly adapted to their options.
 */
import type {
  ChatMessage,
  ClarifyingQuestion,
  DecisionBrief,
  FutureBranch,
  SimulationResult,
  UserContext,
} from "../types";
import { DEMO_BRANCHES } from "./branches";
import { DEMO_BRIEF } from "./brief";
import { DEMO_CONTEXT, DEMO_QUESTIONS } from "./demoContext";

export { DEMO_BRANCHES, DEMO_BRIEF, DEMO_CONTEXT, DEMO_QUESTIONS };

export const DEMO_SIMULATION: SimulationResult = {
  context: DEMO_CONTEXT,
  branches: DEMO_BRANCHES,
  mocked: true,
  generatedNote:
    "Demo simulation for the Alex persona — built from curated evidence and explicit assumptions. These are plausible scenarios, not predictions.",
};

/** Heuristic: does this context look like our seeded demo persona? */
function isDemoLike(ctx: UserContext): boolean {
  const blob = (ctx.decision + " " + ctx.options.join(" ")).toLowerCase();
  return (
    blob.includes("quant") &&
    (blob.includes("startup") || blob.includes("research") || blob.includes("grad"))
  );
}

/** Light personalization of the canonical branches onto arbitrary options. */
function personalizeBranches(ctx: UserContext): FutureBranch[] {
  return DEMO_BRANCHES.map((b, i) => {
    const option = ctx.options[i];
    if (!option) return b;
    return {
      ...b,
      title: option,
      thesis:
        `Considering "${option}": ` +
        b.thesis.replace(/^[^—:]*[—:]\s*/, "").slice(0, 1).toLowerCase() +
        b.thesis.replace(/^[^—:]*[—:]\s*/, "").slice(1),
    };
  });
}

export function buildMockQuestions(ctx: UserContext): ClarifyingQuestion[] {
  if (isDemoLike(ctx)) {
    return DEMO_QUESTIONS.map(({ answer, ...q }) => q);
  }
  // Generic but genuinely useful clarifiers, templated on the user's framing.
  return [
    {
      id: "q1",
      question: `When you picture "success" a few years after "${ctx.decision}", which matters most: stability, depth, or ownership?`,
      why: "Your dominant value reshapes which tradeoffs actually matter — the same path can be a win or a loss depending on this.",
      probes: "value-weighting",
    },
    {
      id: "q2",
      question:
        "How reversible does each option feel to you right now — could you switch in a year without major cost?",
      why: "Perceived lock-in drives how much deliberation each choice deserves.",
      probes: "reversibility-perception",
    },
    {
      id: "q3",
      question:
        ctx.constraints.length > 0
          ? `Of your constraints (${ctx.constraints.slice(0, 2).join("; ")}), which are you least willing to compromise?`
          : "What's the one hard constraint you're least willing to compromise?",
      why: "The binding constraint often decides the path more than preferences do.",
      probes: "binding-constraint",
    },
    {
      id: "q4",
      question:
        ctx.fears.length > 0
          ? `You mentioned fearing "${ctx.fears[0]}". Is that based on experience, or is it an assumption you'd be testing?`
          : "Which of your beliefs about these options is untested — something you assume but haven't verified?",
      why: "Untested assumptions should be flagged and tested, not treated as facts.",
      probes: "untested-assumption",
    },
  ];
}

export function buildMockSimulation(ctx: UserContext): SimulationResult {
  const branches = isDemoLike(ctx) ? DEMO_BRANCHES : personalizeBranches(ctx);
  return {
    context: ctx,
    branches,
    mocked: true,
    generatedNote: isDemoLike(ctx)
      ? "Demo simulation — built from curated evidence and explicit assumptions. Plausible scenarios, not predictions."
      : "Evidence-grounded simulation template adapted to your options. Run with an API key for fully personalized branches. These are plausible scenarios, not predictions.",
  };
}

export function buildMockBrief(
  ctx: UserContext,
  branches: FutureBranch[],
): DecisionBrief {
  if (isDemoLike(ctx)) return DEMO_BRIEF;
  const lowestRisk = [...branches].sort(
    (a, b) => rank(a.calibration.constraintRisk) - rank(b.calibration.constraintRisk),
  )[0];
  return {
    decisionFrame: `You're choosing between ${branches
      .map((b) => `"${b.title}"`)
      .join(", ")} — but underneath, you're deciding which of your values (${ctx.values
      .slice(0, 3)
      .join(", ")}) to put first over your ${ctx.timeHorizon} horizon.`,
    strongestSignals: branches.map(
      (b) =>
        `${b.title}: strongest where evidence is ${b.calibration.evidenceStrength} and constraint-risk is ${b.calibration.constraintRisk}.`,
    ),
    biggestUncertainties: branches.flatMap((b) =>
      b.assumptions
        .filter((a) => a.type === "ai_inferred" && a.confidence === "low")
        .slice(0, 1)
        .map((a) => `${b.title}: ${a.claim}`),
    ),
    whatAIWillNotDecide: [
      "How to weight your values against each other.",
      "Your true risk tolerance and personal context.",
      "Which regret you could live with.",
    ],
    recommendedExperiments: branches.map(
      (b) => `${b.title}: ${b.sevenDayExperiment[0]?.action ?? "run the first 7-day experiment."}`,
    ),
    humanInLoopStatement:
      "Forked Futures will not choose your path. Values, risk tolerance, family context, and lived experience can't be captured by a model — so the final decision stays with you.",
    responsibleAIStatement: `Each branch is a plausible scenario, not a prediction. Claims are tagged by provenance and kept at the evidence's true coverage level. The lowest-constraint-risk option here looks like "${lowestRisk?.title}", but that is context, not advice.`,
  };
}

function rank(l: "low" | "medium" | "high"): number {
  return l === "low" ? 0 : l === "medium" ? 1 : 2;
}

/**
 * Grounded Future Self responder for mock mode. Keyed on the user's intent and
 * drawn strictly from the selected branch, always framed as simulation, never
 * prediction.
 */
export function mockChatReply(
  branch: FutureBranch,
  userMessage: string,
  _history: ChatMessage[],
): string {
  const m = userMessage.toLowerCase();
  const frame = "Speaking from inside this simulation's assumptions";

  if (/underestimat|surpris|didn'?t expect|blind ?spot/.test(m)) {
    return `${frame}, the thing most easily underestimated on the "${branch.title}" path is this: ${branch.hiddenTradeoffs[0]} A version of me 12 months out might also say I underrated "${branch.bottlenecks[0]}". Remember — I'm a rehearsal, not a forecast. The way to find out for real is the day-1 experiment: ${branch.sevenDayExperiment[0]?.action}`;
  }
  if (/fail|go wrong|worst|risk|fall apart/.test(m)) {
    return `${frame}, the most likely way this path fails isn't dramatic: ${branch.premortem[0]} Watch the kill criteria too — if "${branch.killCriteria[0]}", that's your signal to step back. None of this is destiny; it's a possible failure mode worth pre-empting.`;
  }
  if (/regret/.test(m)) {
    const top = [...branch.regretRadar].sort((a, b) => rank(b.level) - rank(a.level))[0];
    return `${frame}, the regret I'd watch most is ${top.regretType} (${top.level}): ${top.description} But regret is personal — what I'd regret and what you'd regret aren't the same, which is exactly the part the system leaves to you.`;
  }
  if (/test|this week|experiment|try|start/.test(m)) {
    const steps = branch.sevenDayExperiment
      .slice(0, 3)
      .map((s) => `Day ${s.day}: ${s.action} (${s.purpose})`)
      .join(" ");
    return `${frame}, the cheapest way to get real signal this week: ${steps} The point isn't to commit — it's to replace one assumption with evidence before you decide.`;
  }
  if (/commit|decide|should i|before i|choose/.test(m)) {
    return `${frame}, before committing I'd want to honestly resolve this assumption first: "${branch.assumptions.find((a) => a.type === "ai_inferred")?.claim ?? branch.assumptions[0]?.claim}". Test it with: ${branch.assumptions[0]?.howToTest} And to be clear — I won't tell you to choose this path. That call depends on your values and risk tolerance, which only you hold.`;
  }
  // Default
  return `${frame}, here's the honest shape of the "${branch.title}" path: ${branch.thesis} The hidden cost people miss is "${branch.hiddenTradeoffs[0]}", and the real bottleneck is "${branch.bottlenecks[0]}". Ask me what I underestimated, what would make this fail, what I'd regret, or what to test this week — I'll answer from this scenario's assumptions, not as a prediction.`;
}
