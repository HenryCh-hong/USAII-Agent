import type { ClarifyingQuestion, UserContext } from "../types";

/**
 * Demo persona — Alex, a CS sophomore. This is the always-available seed for
 * the whole journey so a judge can experience the product end-to-end with zero
 * setup and no API key.
 */
export const DEMO_CONTEXT: UserContext = {
  decision:
    "After my sophomore year, should I go all-in on quant recruiting, try to build a startup, or aim for a research / grad-school path?",
  options: [
    "Go all-in on quant recruiting",
    "Build a startup",
    "Prepare for research / grad school",
  ],
  major: "Computer Science (sophomore)",
  skills: [
    "Strong at algorithms & probability",
    "Competitive programming (mid-tier)",
    "Ship side projects in TypeScript/Python",
    "Comfortable with statistics",
  ],
  values: [
    "Long-term optionality",
    "Doing work that feels intellectually alive",
    "Financial stability for my family",
    "Autonomy",
  ],
  constraints: [
    "Need a paid internship next summer (limited savings)",
    "Visa timing matters for some employers",
    "~20 focused hours/week outside coursework",
  ],
  fears: [
    "Picking a path and discovering I hate it a year in",
    "Missing the quant recruiting cycle if I hesitate",
    "Building something nobody wants",
    "Closing doors I can't reopen",
  ],
  background:
    "First-gen student, scholarship. Did one SWE internship at a mid-size company last summer. Has a half-built side project. No research experience yet.",
  timeHorizon: "12 months (decide direction before junior-year recruiting)",
  urgency: "soon",
};

/**
 * Pre-baked clarifying questions for the demo. In live mode /api/questions
 * generates these; in mock mode we use these so the flow always works.
 */
export const DEMO_QUESTIONS: ClarifyingQuestion[] = [
  {
    id: "q1",
    question:
      "When you imagine \"success\" in 5 years, is it closer to financial security, intellectual depth, or building something that's yours?",
    why: "Your dominant value reshapes which tradeoffs actually matter to you — the same path can be a win or a loss depending on this.",
    probes: "value-weighting",
    answer:
      "Mostly financial security for my family, but I don't want to feel intellectually dead doing it.",
  },
  {
    id: "q2",
    question:
      "How reversible does each option feel to you right now — could you switch tracks in a year without major cost?",
    why: "We tag reversibility per branch, but your perception of lock-in drives how much deliberation each choice deserves.",
    probes: "reversibility-perception",
    answer:
      "Quant feels like a one-shot cycle. Startup feels reversible. Research feels like a longer commitment.",
  },
  {
    id: "q3",
    question:
      "What's the hard constraint you're least willing to compromise — money next summer, visa timing, or hours per week?",
    why: "The binding constraint often decides the path more than preferences do; we want to model the real one, not the stated one.",
    probes: "binding-constraint",
    answer:
      "A paid internship next summer is non-negotiable. I can't go a summer unpaid.",
  },
  {
    id: "q4",
    question:
      "Have you ever done open-ended research, or is that an assumption you'd be testing?",
    why: "Liking coursework predicts research fit weakly. If it's untested, that's an assumption we should flag, not a fact.",
    probes: "untested-assumption",
    answer:
      "Never done real research. I assume I'd like it because I like hard classes, but I genuinely don't know.",
  },
];
