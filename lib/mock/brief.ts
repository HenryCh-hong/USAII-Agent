import type { DecisionBrief } from "../types";

/** Canonical decision brief for the Alex persona. */
export const DEMO_BRIEF: DecisionBrief = {
  decisionFrame:
    "You're not really choosing quant vs startup vs research. You're choosing which of three values to put first for the next 12 months — financial security, ownership/autonomy, or intellectual depth — under one hard constraint (a paid summer) and one untested assumption (whether you'd actually like research).",
  strongestSignals: [
    "Quant has the lowest constraint-risk: it's decisive, time-bound, and aligns with your non-negotiable paid summer.",
    "Startup carries the strongest validation evidence but the highest financial-regret surface, given that same constraint.",
    "Research's dominant unknown is fit, not capability — and fit is cheaply testable before any multi-year commitment.",
    "All three paths share one cheap, high-value move: run the first 7-day experiment before committing.",
  ],
  biggestUncertainties: [
    "Whether open-ended research actually energizes you (you've never tested it).",
    "Whether a startup sprint can coexist with the paid summer you said is non-negotiable.",
    "Whether your probability/coding base is genuinely quant-interview-ready under timed pressure.",
  ],
  whatAIWillNotDecide: [
    "How to weight financial security against intellectual aliveness — that's your values call.",
    "Your real risk tolerance and your family's needs, which you understand far better than any model.",
    "Which regret you could live with — only you have lived your life.",
  ],
  recommendedExperiments: [
    "Quant: 3 timed interview problems + confirm 3 firms' real recruiting dates this week.",
    "Startup: 3 Mom-Test interviews about current behavior + a one-page demand test.",
    "Research: read one paper end-to-end and email one researcher offering a small task.",
  ],
  humanInLoopStatement:
    "Forked Futures will not choose your path. Values, risk tolerance, family context, identity, and emotional cost can't be fully captured by a model — so the final decision stays with you. The system's job is to make the futures you're choosing between legible, not to pick one.",
  responsibleAIStatement:
    "Every branch here is a plausible scenario, not a prediction. Claims are tagged as something you told us, something a curated source supports, or something the AI inferred. Where evidence is only field- or occupation-level, we keep the claim at that level instead of inventing a personal probability. Uncertainty is shown, not hidden.",
};
