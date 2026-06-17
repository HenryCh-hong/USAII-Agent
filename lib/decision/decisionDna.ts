/**
 * Decision DNA — a sharp, hypothesis-framed diagnosis of what a decision is
 * REALLY about, so the product feels tailored to this specific decision rather
 * than generic. Additive and derived: it reads existing context + branch data
 * and does not modify the AI pipeline, mock data, or canonical schema.
 *
 * Responsible-AI: everything is framed as "appears to center on…" / "one possible
 * diagnosis…" / "a hypothesis to test" — never "you are the kind of person who…",
 * "your real problem is…", "you will regret…", or "the correct choice is…".
 */
import type { FutureBranch, UserContext } from "../types";

export interface BranchBottleneck {
  branchId: string;
  track: string;
  bottleneck: string;
  whyItMatters: string;
  strengthensIf: string;
  weakensIf: string;
  sevenDayTest: string;
}

export interface DecisionDna {
  coreTension: string;
  hiddenDecision: string;
  valueConflict: string[];
  branchBottlenecks: BranchBottleneck[];
  missingEvidence: string[];
  whatWouldMakeEasier: string;
  diagnosis: string;
}

/** Matches the seeded Alex persona so we can show the hand-authored sharp DNA. */
function isAlexLike(ctx: UserContext): boolean {
  const blob = (ctx.decision + " " + ctx.options.join(" ")).toLowerCase();
  return blob.includes("quant") && (blob.includes("startup") || blob.includes("research") || blob.includes("grad"));
}

const ALEX_BOTTLENECKS: Record<string, Omit<BranchBottleneck, "branchId" | "track">> = {
  "quant-signal": {
    bottleneck: "Can Alex build enough legible interview signal before the recruiting cycle opens?",
    whyItMatters: "The cycle is largely one-shot and timing-driven; the constraint is signal-by-a-deadline, not raw ability.",
    strengthensIf: "Timed practice shows he is near interview-ready and the work energizes rather than drains him.",
    weakensIf: "A week of real prep consistently drains him, or his base is far enough off that this cycle isn't realistic.",
    sevenDayTest: "Complete 10 timed probability questions, build one small market-signal notebook, and ask one quant mentor to critique it.",
  },
  "startup-validation": {
    bottleneck: "Can Alex find real, paid-for customer demand before over-investing in building?",
    whyItMatters: "Building before validating is the recurring early-founder failure mode, and a sprint tensions the non-negotiable paid summer.",
    strengthensIf: "Interviews surface a painful, frequent problem people already pay or hack around to solve.",
    weakensIf: "Only polite interest appears, or the budget can't fund the paid summer.",
    sevenDayTest: "Interview 5 potential users and write down the exact words they use for the problem, then run one falsifiable demand test (a landing page or pre-commitment ask).",
  },
  "research-depth": {
    bottleneck: "Can Alex tolerate slower feedback while building deep technical credibility?",
    whyItMatters: "Research fit is untested and the payoff is back-loaded; the dominant unknown is felt experience, not capability.",
    strengthensIf: "A week of real research work energizes him rather than draining him.",
    weakensIf: "He can't access a real task, or long ambiguity consistently frustrates him.",
    sevenDayTest: "Read one paper, reproduce one small result, and write a 1-page memo explaining exactly what confused you.",
  },
};

function alexDna(branches: FutureBranch[]): DecisionDna {
  return {
    coreTension:
      "This decision appears to center on three forms of compounding — institutional signal (quant), asymmetric upside (startup), and intellectual depth (research) — and which one to invest the next year in.",
    hiddenDecision:
      "Underneath the stated career choice is a sharper question: what kind of evidence does Alex want the next 12 months to produce about himself?",
    valueConflict: ["income upside", "autonomy", "intellectual challenge", "long-term optionality"],
    branchBottlenecks: branches.map((b) => {
      const a = ALEX_BOTTLENECKS[b.id] ?? genericBottleneck(b);
      return { branchId: b.id, track: b.track, ...a };
    }),
    missingEvidence: [
      "No direct customer-demand evidence yet.",
      "Limited public proof-of-work.",
      "Unclear tolerance for slower research feedback.",
      "Uncertain willingness to trade optionality for focus.",
    ],
    whatWouldMakeEasier:
      "A small validation test in each lane that turns vague preference into observed behavior — converting \"I think I'd like X\" into \"here is how I actually responded to X this week\".",
    diagnosis:
      "One possible diagnosis: Alex isn't choosing a final identity — he's choosing which kind of signal to produce next, and the cheapest way to decide is to produce a little of each this week. (A hypothesis to test, not a conclusion.)",
  };
}

function genericBottleneck(b: FutureBranch): Omit<BranchBottleneck, "branchId" | "track"> {
  const firstStep = b.sevenDayExperiment[0]?.action ?? "Run the smallest decisive test for this option.";
  const secondStep = b.sevenDayExperiment[1]?.action;
  const inferred = b.assumptions.find((a) => a.type === "ai_inferred") ?? b.assumptions[0];
  return {
    bottleneck: b.bottlenecks[0] ?? "The constraint most likely to decide this branch.",
    whyItMatters: "It is the binding constraint — it tends to decide the branch more than preferences do.",
    strengthensIf: inferred ? `Evidence confirms: ${inferred.claim.replace(/\.$/, "")}.` : "Early signal confirms the load-bearing assumption.",
    weakensIf: b.killCriteria[0] ?? b.premortem[0] ?? "The load-bearing assumption fails to hold under a cheap test.",
    sevenDayTest: secondStep ? `${firstStep} Then ${secondStep[0].toLowerCase()}${secondStep.slice(1)}` : firstStep,
  };
}

function genericDna(ctx: UserContext, branches: FutureBranch[]): DecisionDna {
  const values = ctx.values.length ? ctx.values.slice(0, 4) : ["what you value most"];
  return {
    coreTension: `Based on your stated values, this decision appears to center on a tension between ${values.slice(0, 3).join(", ")} across your options.`,
    hiddenDecision: `Underneath the stated choice is a sharper question: what kind of evidence do you want the next ${ctx.timeHorizon || "year"} to produce about which path actually fits you?`,
    valueConflict: values,
    branchBottlenecks: branches.map((b) => ({ branchId: b.id, track: b.track, ...genericBottleneck(b) })),
    missingEvidence: branches
      .map((b) => {
        const inf = b.assumptions.find((a) => a.type === "ai_inferred" && a.confidence === "low");
        return inf ? `${b.track}: no evidence yet that ${inf.claim.replace(/\.$/, "").toLowerCase()}.` : null;
      })
      .filter((x): x is string => Boolean(x)),
    whatWouldMakeEasier:
      "A small validation test per option that turns vague preference into observed behavior this week — so the choice rests on how you actually responded, not on how you imagine you would.",
    diagnosis:
      "One possible diagnosis: this is less about picking a final identity and more about which kind of signal to produce next — a hypothesis to test, not a conclusion.",
  };
}

export function buildDecisionDna(ctx: UserContext, branches: FutureBranch[]): DecisionDna {
  return isAlexLike(ctx) ? alexDna(branches) : genericDna(ctx, branches);
}
