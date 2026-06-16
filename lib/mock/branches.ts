import type { FutureBranch } from "../types";
import { BRANCH_GRAPH_NODE_IDS, graphSnapshotForBranch } from "../knowledge/graph";

/**
 * Canonical 3-branch simulation for the Alex persona. Every page reads these.
 * Language is intentionally non-deterministic ("may", "could", "tends to") and
 * every claim carries provenance. These are plausible scenarios, not forecasts.
 */

const quant: FutureBranch = {
  id: "quant-signal",
  track: "Quant Signal Track",
  title: "Go all-in on quant recruiting",
  thesis:
    "If you concentrate the next 12 months on legible quant signals — probability fluency, fast clean code, and a measurable project — you could enter junior-year recruiting as a strong candidate. The path trades breadth and optionality for depth and a clear, well-paid on-ramp.",
  baseRateSignals: [
    {
      claim:
        "Quant roles tend to recruit on legible, demonstrated signals (probability, competitive programming, structured interviews) rather than potential.",
      source: "Industry hiring patterns; BLS Occupational Outlook Handbook",
      coverageLevel: "occupation-level",
      confidence: "medium",
      limitations:
        "Aggregate pattern across the occupation — says nothing certain about one applicant's outcome.",
    },
    {
      claim:
        "Sophomore/junior internships are the dominant on-ramp, and many quant cycles open well before the role start date.",
      source: "Field hiring-cycle norms; campus recruiting calendars",
      coverageLevel: "field-level",
      confidence: "medium",
      limitations:
        "Timing is reliable; conversion to an offer is not. Cycles shift year to year.",
    },
  ],
  evidenceCards: [
    {
      id: "cc-quant-signals",
      title: "Quant roles screen for demonstrated, legible skill signals",
      category: "Career signals",
      content:
        "Quant trading/research pipelines reward depth in a narrow stack early: probability/statistics fluency, competitive programming, and measurable project outcomes. Occupation-level pattern.",
      sourceType: "labor_market",
      usedFor: "Shaping the 12-month trajectory toward legible signals",
      evidenceStrength: "medium",
    },
    {
      id: "cc-internship-conversion",
      title: "Early internships function as the dominant on-ramp",
      category: "Career structure",
      content:
        "Recruiting cycles for many quant roles open early; missing a cycle can shift an on-ramp by ~a year. Field-level timing pattern.",
      sourceType: "labor_market",
      usedFor: "Explaining the urgency / constraint-risk rating",
      evidenceStrength: "medium",
    },
    {
      id: "cc-skill-compounding",
      title: "Narrow early specialization compounds but can reduce optionality",
      category: "Skill compounding",
      content:
        "Deep specialization compounds fast and raises legibility to specialized employers, at the cost of lateral optionality. Structural tradeoff, not a value judgment.",
      sourceType: "framework",
      usedFor: "Naming the hidden optionality cost",
      evidenceStrength: "medium",
    },
    {
      id: "bls-quant-outlook",
      title: "Quant/analyst occupations: outlook & requirements",
      category: "Occupation outlook",
      content:
        "At the occupation level, the BLS Occupational Outlook Handbook describes quant/analyst roles — typical duties, general wage framing, demand direction, and the education the occupation expects.",
      sourceType: "labor_market",
      usedFor: "Occupation-level wage/outlook framing for the quant track",
      evidenceStrength: "medium",
      sourceName: "Occupational Outlook Handbook",
      publisher: "U.S. Bureau of Labor Statistics",
      sourceUrl: "https://www.bls.gov/ooh/",
      coverageLevel: "occupation",
      claim:
        "The OOH frames quant/analyst roles, typical wage ranges, and demand direction at the occupation level — not what any one person could earn.",
      limitations:
        "Occupation-level aggregates with a reporting lag; the typical pattern for the role, never an individual prediction.",
      reliabilityLevel: "high",
      lastReviewed: "2026-06-15",
      sourceCardId: "bls-quant-outlook",
    },
    {
      id: "onet-quant-skills",
      title: "Quant/analyst occupations: skills & worker characteristics",
      category: "Occupation skills profile",
      content:
        "O*NET catalogs the analytical and technical skills quant/analyst roles tend to draw on at the occupation level — useful for mapping which signals to build.",
      sourceType: "official_data",
      usedFor: "Mapping which legible skills the quant track screens for",
      evidenceStrength: "medium",
      sourceName: "O*NET OnLine",
      publisher: "U.S. Department of Labor (O*NET)",
      sourceUrl: "https://www.onetonline.org/",
      coverageLevel: "occupation",
      claim:
        "O*NET describes the skills and worker characteristics the occupation is commonly associated with, across the workforce.",
      limitations:
        "Occupation-level descriptions from analyst ratings/surveys; the typical role pattern, not an individual skill assessment.",
      reliabilityLevel: "high",
      lastReviewed: "2026-06-15",
      sourceCardId: "onet-quant-skills",
    },
  ],
  twelveMonthTrajectory: [
    {
      time: "Month 1–2",
      description:
        "Audit the gap between your current profile and target-firm signals; pick one quant-relevant project and a probability/stats study cadence.",
      uncertaintyNote:
        "Assumes your current algorithms/probability base is as strong as you rate it — worth verifying against real interview problems.",
    },
    {
      time: "Month 3–5",
      description:
        "Ship the measurable project; grind interview-style probability and coding under time pressure. Map the specific recruiting calendar for 3–5 target firms.",
      uncertaintyNote:
        "Recruiting calendars move; treat dates as provisional until confirmed with each firm/career center.",
    },
    {
      time: "Month 6–8",
      description:
        "Apply into the open cycle. Run mock interviews. Convert your project into a crisp, legible story.",
      uncertaintyNote:
        "Outcomes here are high-variance and depend on factors the simulation can't observe (firm needs, interviewer fit).",
    },
    {
      time: "Month 9–12",
      description:
        "Interview loops and (possibly) offers; if no offer, you exit with a strong, transferable quant/SWE profile for the next cycle.",
      uncertaintyNote:
        "An offer is one possible outcome, not the expected one. A no-offer outcome still leaves real, reusable signal.",
    },
  ],
  hiddenTradeoffs: [
    "Concentrating on legible quant signals quietly narrows your skill base — adjacent paths (research, founding) get harder to re-enter cleanly later.",
    "Optimizing for one recruiting cycle can make you calendar-driven rather than curiosity-driven for a year.",
    "The signal that wins quant interviews (speed, precision under pressure) is not the same muscle that builds zero-to-one products.",
  ],
  opportunityCosts: [
    "The 12 months not spent testing whether you actually like open-ended building or research.",
    "Side-project depth that could compound into a startup or portfolio is redirected into interview prep.",
  ],
  reversibility: "medium",
  skillCompounding:
    "Strong within the quant/SWE niche — probability, low-latency thinking, and disciplined problem-solving compound quickly and stay valuable. Weaker transfer to open-ended research or product discovery.",
  emotionalLoad:
    "Front-loaded and intense: concentrated stress during prep and interview cycles, with sharp legible feedback. Energizing if you like clear targets; draining if you prefer slow exploratory work.",
  bottlenecks: [
    "Probability/coding speed under real interview pressure (not just untimed practice).",
    "Recruiting-cycle timing — a missed window costs roughly a year.",
    "A single legible, measurable project that survives a 60-second explanation.",
  ],
  assumptions: [
    {
      claim: "Your algorithms and probability base is genuinely interview-strong.",
      type: "ai_inferred",
      confidence: "low",
      howToTest:
        "Do 5 timed interview-style probability/coding problems this week and score yourself honestly.",
    },
    {
      claim: "A paid internship next summer is non-negotiable for you.",
      type: "user_provided",
      confidence: "high",
      howToTest:
        "Already stated — this should weight constraint-risk heavily for any unpaid path.",
    },
    {
      claim:
        "Missing this cycle meaningfully delays the quant on-ramp by ~a year.",
      type: "source_supported",
      confidence: "medium",
      howToTest:
        "Confirm 3 target firms' actual cycle dates with their career pages or your career center.",
    },
  ],
  premortem: [
    "12 months out, this failed because you optimized for interviews you started too late to be competitive in — timing, not ability.",
    "It failed because you got an offer but realized in month 11 you'd never tested whether you actually enjoy the work, and the money didn't offset feeling intellectually flat.",
    "It failed because narrowing to quant signals atrophied the broader skills you'd have needed when the cycle didn't convert.",
  ],
  regretRadar: [
    {
      regretType: "opportunity",
      level: "medium",
      description:
        "Regret over the founding/research experiments you didn't run while heads-down on prep.",
    },
    {
      regretType: "identity",
      level: "medium",
      description:
        "Possible 'is this who I am?' tension if financial security comes at the cost of feeling intellectually alive — a value you flagged.",
    },
    {
      regretType: "inaction",
      level: "low",
      description:
        "Low regret-of-inaction: this path is decisive and time-bound, which suits your stated urgency.",
    },
  ],
  sevenDayExperiment: [
    {
      day: 1,
      action:
        "Do 3 timed, interview-style probability problems; record your honest score and where you stalled.",
      purpose: "Test the 'my base is strong' assumption with real signal.",
    },
    {
      day: 2,
      action:
        "Pull the actual recruiting timelines for 3 target quant firms.",
      purpose: "Replace assumed timing with confirmed dates.",
    },
    {
      day: 3,
      action:
        "Write a 60-second spoken explanation of your strongest project.",
      purpose: "See whether you have a legible signal or need to build one.",
    },
    {
      day: 4,
      action:
        "Do one timed coding interview problem and one mock behavioral answer.",
      purpose: "Feel the actual emotional load of the prep cycle.",
    },
    {
      day: 5,
      action:
        "Message one person currently in a quant role; ask what they underestimated.",
      purpose: "Get inside-view signal from someone past the cycle.",
    },
    {
      day: 6,
      action:
        "Block a realistic weekly prep schedule on your calendar and try one real session.",
      purpose: "Test whether 20 focused hours/week is actually available.",
    },
    {
      day: 7,
      action:
        "Score the week: did the work energize or drain you? Was your base where you assumed?",
      purpose: "Decide whether to commit, adjust, or kill this branch.",
    },
  ],
  killCriteria: [
    "After honest timed practice, you're far enough from interview-ready that this cycle isn't realistic and you'd rather not delay a year.",
    "A week of real prep consistently drains you in a way money clearly won't offset.",
    "The binding constraint (paid summer) is better served by a different track.",
  ],
  calibration: {
    evidenceStrength: "medium",
    userFit: "medium",
    constraintRisk: "low",
    uncertaintyLevel: "medium",
    dataCoverageNote:
      "Built from occupation/field-level hiring patterns plus your stated skills and constraints. No individual-level prediction is possible or implied.",
    calibrationRationale:
      "EvidenceStrength and userFit are medium because the supporting sources sit at occupation, field, and cohort coverage (BLS, O*NET, ACS, Scorecard, conversion/compounding cards) rather than confirming this individual's interview-ready base, which is only inferred. ConstraintRisk is low because the paid-summer constraint is user-stated and high-confidence, while uncertaintyLevel stays medium given the open questions about timing and actual readiness.",
  },
  graphNodeIds: BRANCH_GRAPH_NODE_IDS["quant-signal"],
  evidenceGraphSnapshot: graphSnapshotForBranch("quant-signal"),
  agentReview: {
    branchId: "quant-signal",
    contextAgentSummary:
      "Anchored the branch in the user's stated non-negotiable (a paid internship next summer) and an inferred algorithms/probability base, framing quant recruiting as one legible path among several.",
    retrievalAgentSummary:
      "Pulled occupation- and field-level sources (BLS quant outlook, O*NET quant skills, ACS field-to-occupation, Scorecard earnings) plus internal cards on quant signals, internship conversion, and skill compounding to populate the branch.",
    evidenceAgentSummary:
      "Mapped each claim to its honest coverage level, noting BLS/O*NET describe the occupation generally and conversion/compounding cards describe cohort tendencies, not this individual.",
    optimistView:
      "If the probability and coding base is genuinely interview-ready, leaning into legible quant signals could align well with how this niche tends to recruit, and an early internship may compound into stronger later positioning.",
    skepticView:
      "The branch could fail on timing rather than ability if prep starts too late to be competitive this cycle, and narrowing to quant-legible signals may cut optionality if the base turns out thinner than assumed.",
    calibrationSummary:
      "Set evidenceStrength and userFit to medium, constraintRisk to low, and uncertaintyLevel to medium, reflecting decent occupation-level sourcing against an unverified individual skill base.",
    safetySummary:
      "Stripped any deterministic offer/outcome language and exact figures, rephrasing claims into hedged, coverage-honest framings that describe what sources cover rather than what may happen to the user.",
    synthesisSummary:
      "Combined the agents into a hedged, judge-safe profile of quant recruiting as a real but timing-sensitive option whose viability hinges on a cheap near-term test of the user's actual interview readiness.",
  },
  reasoningAuditTrail: {
    branchId: "quant-signal",
    whyThisBranchExists:
      "The user's non-negotiable paid-summer-internship constraint (constraint-paid-summer) plus an inferred algorithms/probability base (skill-probability, skill-coding) make the quant path (path-quant) a plausible option, supported by occupation-level sourcing on quant roles (src-bls, src-onet) and the recognized role of legible quant signals in this niche's recruiting.",
    evidenceUsed: [
      "cc-quant-signals: how legible signals tend to matter in quant recruiting",
      "cc-internship-conversion: cohort-level patterns in internship-to-offer conversion",
      "cc-skill-compounding: how early skill investment tends to compound",
      "bls-quant-outlook + onet-quant-skills: occupation-level outlook and skill profile",
      "scorecard-earnings + acs-field-to-occupation: field/program-level earnings and field-to-occupation flows",
    ],
    assumptionsUsed: [
      "Algorithms/probability base is interview-strong [ai_inferred, low]",
      "Paid internship next summer is non-negotiable [user_provided, high]",
      "Missing this cycle delays the on-ramp by roughly a year [source_supported, medium]",
    ],
    uncertaintyDrivers: [
      "Whether the probability/coding base is actually interview-ready (inferred, unverified)",
      "Whether prep started early enough to be competitive this cycle (timing risk, risk-timing)",
      "Exact recruiting timelines and application windows for this cycle",
      "Loss of optionality from narrowing to quant-legible signals",
    ],
    optimistView:
      "If the probability and coding base is genuinely interview-ready, leaning into legible quant signals could align with how this niche tends to recruit, and an early internship may compound into stronger later positioning.",
    skepticView:
      "The branch could fail on timing rather than ability if prep starts too late to be competitive, and narrowing to quant-legible signals may reduce optionality if the underlying base proves thinner than assumed.",
    rejectedOverclaims: [
      "Deterministic offer-landing language (rewritten as hedged, factor-dependent framing)",
      "Exact percentage conversion/success figures (replaced with coverage-honest descriptions of what cohort sources cover)",
      "Individual-level prediction from occupation/field data (re-scoped to occupation- and cohort-level tendencies)",
    ],
    whatWouldChangeThisAssessment: [
      "Results of a mock interview / timed problem set showing the base is or is not interview-ready",
      "Confirmed recruiting dates showing the cycle window is still open or already closed",
      "Evidence the user can sustain prep volume alongside current commitments",
      "Signal that comparable-stage candidates are still entering this cycle's pipeline",
    ],
    nextValidationStep:
      "Run the 7-day experiment (exp-quant-7day) this week: a timed probability/coding mock interview to gauge actual readiness, paired with confirming this cycle's recruiting dates.",
  },
  rejectedOverclaims: [
    "Softened a deterministic offer-landing claim into hedged, factor-dependent language the model cannot observe.",
    "Removed invented exact conversion/success figures; replaced with coverage-honest descriptions of what cohort-level sources actually cover.",
    "Re-scoped occupation- and field-level data (BLS, O*NET, ACS, Scorecard) away from individual prediction toward aggregate tendencies.",
    "Reframed an all-in 'single best option' assertion as one plausible path whose tradeoff is reduced optionality.",
  ],
  evaluationSignals: [
    {
      name: "Groundedness",
      level: "medium",
      note: "Claims tie to named occupation- and cohort-level evidence ids, though the core skill assumption is inferred not verified.",
    },
    {
      name: "Hedging compliance",
      level: "high",
      note: "No deterministic or banned phrasing; consistent use of may/could/tends-to throughout.",
    },
    {
      name: "Provenance coverage",
      level: "high",
      note: "Each key assumption carries a provenance tag and each claim is kept at its honest coverage level.",
    },
    {
      name: "Calibration honesty",
      level: "medium",
      note: "Medium evidence/fit and uncertainty reflect a real but unverified individual base against decent occupation-level sourcing.",
    },
  ],
};

const startup: FutureBranch = {
  id: "startup-validation",
  track: "Startup Validation Track",
  title: "Build a startup",
  thesis:
    "Instead of building the product first, you could spend 12 months running cheap validation experiments to find a problem someone urgently wants solved. Done as a time-boxed sprint, this path is more reversible than it feels — its real costs are opportunity cost and runway, not permanent lock-in.",
  baseRateSignals: [
    {
      claim:
        "Startup outcomes are highly variable and heavy-tailed — most return little, a few return a lot.",
      source: "Aggregate venture outcome distributions",
      coverageLevel: "framework-level",
      confidence: "medium",
      limitations:
        "A base-rate framing about the class of ventures, not a prediction about your idea or you.",
    },
    {
      claim:
        "A common, avoidable failure mode is building before confirming urgent demand.",
      source: "Customer Development (Blank); The Mom Test (Fitzpatrick); YC guidance",
      coverageLevel: "framework-level",
      confidence: "high",
      limitations:
        "Strong framework consensus, but execution quality dominates outcomes.",
    },
  ],
  evidenceCards: [
    {
      id: "sv-talk-to-users",
      title: "Validate demand before building the product",
      category: "Validation",
      content:
        "Run problem interviews and a falsifiable demand test before writing significant code. Building before confirming urgent, frequent pain is a recurring early-founder failure mode.",
      sourceType: "framework",
      usedFor: "Designing the 7-day experiment and trajectory",
      evidenceStrength: "high",
    },
    {
      id: "sv-mom-test",
      title: "Ask about past behavior, not hypothetical enthusiasm",
      category: "Validation",
      content:
        "The reliable signal is what people already do, pay for, and work around — not 'would you use this?'. Politeness inflates hypothetical interest.",
      sourceType: "framework",
      usedFor: "Defining what counts as a real validation signal (kill criteria)",
      evidenceStrength: "high",
    },
    {
      id: "sv-reversibility",
      title: "Student-stage founding is often more reversible than it feels",
      category: "Reversibility",
      content:
        "For a student, a time-boxed validation sprint frequently transfers back to employment tracks; the irreversible cost is usually opportunity cost and runway, not lock-in.",
      sourceType: "framework",
      usedFor: "Setting the reversibility rating and reframing the fear of lock-in",
      evidenceStrength: "medium",
    },
    {
      id: "sv-cofounder-distribution",
      title: "Co-founder fit and distribution are common bottlenecks",
      category: "Bottleneck",
      content:
        "Two frequent early bottlenecks are co-founder alignment and a repeatable way to reach users. Teams that can build but can't reach demand stall.",
      sourceType: "framework",
      usedFor: "Naming the real bottlenecks beyond the idea",
      evidenceStrength: "medium",
    },
    {
      id: "nace-first-destination",
      title: "Graduate first-destination outcome categories",
      category: "Graduate outcomes",
      content:
        "At the graduating-cohort level, NACE sorts new graduates into outcome categories (employed, continuing education, still seeking) — context that a clean wind-down into employment is a normal post-graduation path.",
      sourceType: "education_outcomes",
      usedFor: "Framing reversibility — a wind-down still lands in a normal outcome category",
      evidenceStrength: "low",
      sourceName: "First-Destination Survey",
      publisher: "National Association of Colleges and Employers (NACE)",
      sourceUrl: "https://www.naceweb.org/job-market/graduate-outcomes/first-destination/",
      coverageLevel: "cohort",
      claim:
        "Describes the mix of post-graduation paths a cohort follows, not what any one graduate will do.",
      limitations:
        "Cohort-level snapshot shaped by response rates and timing; not an individual prediction.",
      reliabilityLevel: "medium",
      lastReviewed: "2026-06-15",
      sourceCardId: "nace-first-destination",
    },
    {
      id: "acs-income-distribution",
      title: "Income distributions by occupation and field",
      category: "Income distributions",
      content:
        "At the population level, ACS PUMS can be tabulated into earnings distributions by occupation/field — useful for framing the spread (not a point estimate) of fallback income if a venture winds down.",
      sourceType: "official_data",
      usedFor: "Framing the income spread / opportunity cost of the sprint",
      evidenceStrength: "low",
      sourceName: "American Community Survey — PUMS",
      publisher: "U.S. Census Bureau",
      sourceUrl: "https://www.census.gov/programs-surveys/acs/microdata.html",
      coverageLevel: "population",
      claim:
        "Population-level earnings spreads for a role or field, summarizing the surveyed population — not one person's earnings.",
      limitations:
        "Self-reported population aggregates that vary by geography, experience, and hours; not an individual prediction.",
      reliabilityLevel: "high",
      lastReviewed: "2026-06-15",
      sourceCardId: "acs-income-distribution",
    },
  ],
  twelveMonthTrajectory: [
    {
      time: "Month 1–2",
      description:
        "Pick a problem space you have unfair insight into. Run 10–15 problem interviews focused on current behavior, not your idea.",
      uncertaintyNote:
        "Interview signal is noisy; weight what people already do over what they say they'd do.",
    },
    {
      time: "Month 3–5",
      description:
        "Run a falsifiable demand test (landing page + concierge / pre-commit) before building. Decide go/no-go on real signal.",
      uncertaintyNote:
        "A passing test reduces — but doesn't remove — the risk that demand won't scale.",
    },
    {
      time: "Month 6–9",
      description:
        "If validated, build the smallest thing that delivers the core value to a handful of real users; find a distribution channel that repeats.",
      uncertaintyNote:
        "Distribution is often the true bottleneck; building rarely is.",
    },
    {
      time: "Month 10–12",
      description:
        "Either growing usage that justifies continuing, or a clean wind-down with a strong story, network, and shipped portfolio.",
      uncertaintyNote:
        "Both outcomes are plausible; the heavy-tailed base rate means 'small/none' is the modal result.",
    },
  ],
  hiddenTradeoffs: [
    "A validation sprint can quietly become a build sprint if you skip the falsifiable demand test — the exact failure mode the evidence warns about.",
    "Founding rewards tolerance for ambiguity and rejection; it spends emotional energy unevenly, with long flat stretches.",
    "Even a 'reversible' sprint consumes the one paid summer you said is non-negotiable — that's the real cost, not lock-in.",
  ],
  opportunityCosts: [
    "A missed quant/SWE recruiting cycle (which can delay that on-ramp ~a year).",
    "Income from a paid internship during the sprint — directly in tension with your stated constraint.",
  ],
  reversibility: "high",
  skillCompounding:
    "Broad and durable: customer discovery, distribution, shipping under uncertainty, and storytelling transfer to almost any future path — including employment. Less legible to traditional screeners than a named internship.",
  emotionalLoad:
    "Uneven and self-directed: bursts of momentum punctuated by rejection and ambiguity, with little external validation. Energizing if you're motivated by ownership; corrosive if you need steady, legible feedback.",
  bottlenecks: [
    "Finding a problem with urgent, frequent pain (not a 'nice idea').",
    "A repeatable distribution channel to reach those users.",
    "Funding the non-negotiable paid summer while you sprint.",
  ],
  assumptions: [
    {
      claim: "You can run a real validation sprint without sacrificing the paid summer.",
      type: "ai_inferred",
      confidence: "low",
      howToTest:
        "Sketch a budget: can a part-time or stipended path fund the summer while you validate? If not, this branch conflicts with a stated hard constraint.",
    },
    {
      claim: "You have unfair insight into at least one problem space.",
      type: "ai_inferred",
      confidence: "low",
      howToTest:
        "List 3 problems you understand better than most peers; if the list is thin, that's a signal to gather more surface area first.",
    },
    {
      claim: "You said the startup path feels reversible to you.",
      type: "user_provided",
      confidence: "high",
      howToTest:
        "Your own read — the evidence broadly agrees for time-boxed student sprints.",
    },
    {
      claim:
        "Building before validating is the main risk, and it's avoidable.",
      type: "source_supported",
      confidence: "high",
      howToTest:
        "Pre-commit to a falsifiable demand test before writing product code.",
    },
  ],
  premortem: [
    "12 months out, this failed because you fell in love with building and shipped a polished product nobody urgently needed.",
    "It failed because the sprint ate the paid summer and the financial constraint you flagged became the thing that forced you to quit mid-stream.",
    "It failed because you could build but never found a repeatable way to reach users — distribution, not product, was the wall.",
  ],
  regretRadar: [
    {
      regretType: "financial",
      level: "high",
      description:
        "Given the non-negotiable paid summer, the financial-regret surface here is the largest of the three branches.",
    },
    {
      regretType: "inaction",
      level: "high",
      description:
        "If you never test the founder hypothesis, the regret-of-not-trying could be large given how much you value autonomy and ownership.",
    },
    {
      regretType: "opportunity",
      level: "medium",
      description:
        "A missed recruiting cycle is a real, ~year-long opportunity cost.",
    },
  ],
  sevenDayExperiment: [
    {
      day: 1,
      action: "Write down 3 problems you might have unfair insight into.",
      purpose: "Test whether you have a real starting edge or just enthusiasm.",
    },
    {
      day: 2,
      action: "Draft 5 Mom-Test questions about current behavior (no pitching).",
      purpose: "Prepare to gather honest signal, not polite encouragement.",
    },
    {
      day: 3,
      action: "Talk to 3 people who have the problem; ask only about today.",
      purpose: "Get real demand signal from past behavior.",
    },
    {
      day: 4,
      action: "Stand up a one-page landing test describing the outcome (not the product).",
      purpose: "Create a falsifiable demand test before building anything.",
    },
    {
      day: 5,
      action: "Share it in 2 places your users actually are; measure interest.",
      purpose: "Probe the distribution bottleneck early.",
    },
    {
      day: 6,
      action: "Sketch a budget: can you fund the non-negotiable paid summer?",
      purpose: "Stress-test the branch against your hard financial constraint.",
    },
    {
      day: 7,
      action: "Score it: did anyone show real pull, and does the money math survive?",
      purpose: "Decide whether to continue validating, adjust, or kill the branch.",
    },
  ],
  killCriteria: [
    "After honest interviews, no one shows urgent pull — only polite interest.",
    "You can't fund the paid summer you said is non-negotiable.",
    "You notice yourself building before any demand signal exists.",
  ],
  calibration: {
    evidenceStrength: "high",
    userFit: "medium",
    constraintRisk: "high",
    uncertaintyLevel: "high",
    dataCoverageNote:
      "Backed by strong framework-level evidence on validation, but outcomes are heavy-tailed and this branch directly tensions your stated financial constraint. No individual outcome is predicted.",
    calibrationRationale:
      "EvidenceStrength is high because the validation playbook (customer discovery, the Mom Test, smallest-test framing) is well established at the framework level, but userFit is only medium and constraintRisk and uncertaintyLevel are high because founder fit and real demand are unobserved and the sprint directly tensions the non-negotiable paid-summer income. These levels are pegged at framework/branch coverage, not as any individual prediction or odds.",
  },
  graphNodeIds: BRANCH_GRAPH_NODE_IDS["startup-validation"],
  evidenceGraphSnapshot: graphSnapshotForBranch("startup-validation"),
  agentReview: {
    branchId: "startup-validation",
    contextAgentSummary:
      "Framed this branch against the user's non-negotiable paid-summer constraint, flagging that a founding sprint tensions financial stability most of the three paths.",
    retrievalAgentSummary:
      "Pulled framework-level customer-discovery and reversibility evidence (talk-to-users, Mom Test, student-stage reversibility, distribution bottleneck) keyed to the build-before-validate risk.",
    evidenceAgentSummary:
      "Anchored claims to framework-level sources (The Mom Test, Steve Blank customer development, YC guidance) and kept startup-outcome framing as a heavy-tailed base rate, never a personal odds estimate.",
    optimistView:
      "A time-boxed validation sprint could test demand cheaply and tends to be reversible at the student stage, since skills, network, and narrative often transfer back to employment tracks.",
    skepticView:
      "A validation sprint may quietly drift into a build sprint, and the path could fail by shipping a polished product nobody urgently needed while eroding the paid-summer runway.",
    calibrationSummary:
      "Assigned evidenceStrength high (validation frameworks are well established) but userFit medium and constraintRisk/uncertaintyLevel high, reflecting unverified founder fit and the live tension with paid-summer income.",
    safetySummary:
      "Scrubbed deterministic and odds-style phrasings, rewriting outcome language as hedged, framework-level scenarios that never imply an assured outcome for this individual.",
    synthesisSummary:
      "Composed the branch as a falsifiable 7-day experiment (Mom-Test interviews + a demand test + a budget stress-test) so the user, not the model, decides whether to proceed.",
  },
  reasoningAuditTrail: {
    branchId: "startup-validation",
    whyThisBranchExists:
      "The user treats a founding attempt as reversible (constraint and reversibility framing), and framework-level customer-discovery evidence (the talk-to-users and Mom-Test cards, the build-before-validate risk node, the smallest-test framework, and the startup path node) makes a cheap validation sprint a real, low-burn option rather than a leap into building.",
    evidenceUsed: [
      "sv-talk-to-users: validate demand before building (framework-level)",
      "sv-mom-test: ask about past behavior, not hypothetical enthusiasm (framework-level)",
      "sv-reversibility: student-stage founding is often more reversible than it feels (framework-level)",
      "sv-cofounder-distribution: co-founder fit and distribution as common early bottlenecks",
      "exp-startup-7day + fw-smallest-test: the smallest falsifiable test framing driving the 7-day plan",
    ],
    assumptionsUsed: [
      "Can run a validation sprint without sacrificing the paid summer [ai_inferred, low]",
      "Has an unfair insight into a problem space [ai_inferred, low]",
      "Startup path feels reversible to the user [user_provided, high]",
      "Building before validating is the main avoidable risk [source_supported, high]",
    ],
    uncertaintyDrivers: [
      "Whether genuine, paid-for problem demand exists (unobserved until tested)",
      "Whether the sprint stays validation-only or drifts into building",
      "Whether founder fit and any unfair insight actually hold",
      "Whether the paid-summer runway can absorb the time and budget cost",
    ],
    optimistView:
      "A small, falsifiable demand test plus Mom-Test interviews could surface real pull cheaply, and at the student stage the attempt tends to be reversible if it transfers skills and network back.",
    skepticView:
      "The sprint may drift into a polished build before demand is confirmed, so the path could fail by producing something nobody urgently needs while consuming non-negotiable summer income.",
    rejectedOverclaims: [
      "Removed a fabricated venture success-likelihood figure; reframed as a heavy-tailed, framework-level base rate that cheap experiments only update.",
      "Reframed a single-best-option / prescriptive framing as one reversible option the user evaluates.",
      "Reframed a stated 'unique edge' as an [ai_inferred, low] assumption to be tested.",
    ],
    whatWouldChangeThisAssessment: [
      "Multiple interviewees describe a painful, frequent problem they already pay or hack around to solve (raises confidence)",
      "A falsifiable demand test draws concrete commitment (sign-ups, pre-pay, waitlist) rather than polite interest (raises)",
      "The budget stress-test shows the sprint would dip into non-negotiable paid-summer income (lowers)",
      "Interviews surface only hypothetical enthusiasm with no past behavior (lowers)",
    ],
    nextValidationStep:
      "This week, run 5 Mom-Test problem interviews asking only about current behavior and existing spend, paired with one falsifiable demand signal (e.g., a landing page or pre-commitment ask), before writing any product code.",
  },
  rejectedOverclaims: [
    "Softened a deterministic traction/outcome claim into hedged, framework-level language.",
    "Removed a fabricated venture-likelihood figure; reframed as a qualitative heavy-tailed base rate that cheap experiments update.",
    "Removed prescriptive 'should-build' / single-best-option framing; reframed as one reversible option to evaluate.",
    "Reframed the user's 'unfair insight' from stated fact to an [ai_inferred, low] assumption to be falsified.",
  ],
  evaluationSignals: [
    {
      name: "Groundedness",
      level: "high",
      note: "Every claim maps to a known framework-level evidence card (Mom Test, customer development) or graph node; no invented sources.",
    },
    {
      name: "Hedging compliance",
      level: "high",
      note: "Outcome language uses may/could/tends-to; no deterministic, absolute, or fabricated-likelihood phrasing remains.",
    },
    {
      name: "Provenance coverage",
      level: "high",
      note: "Each assumption carries a provenance tag and confidence; evidence kept at honest framework-level coverage.",
    },
    {
      name: "Calibration honesty",
      level: "medium",
      note: "Levels reflect strong validation frameworks but genuinely unobserved founder fit and demand, so high uncertainty is stated, not minimized.",
    },
  ],
};

const research: FutureBranch = {
  id: "research-depth",
  track: "Research Depth Track",
  title: "Prepare for research / grad school",
  thesis:
    "You could spend 12 months cheaply testing research fit — through a lab, reading group, or replication — while building the letters and output that matter for admissions. The biggest open question isn't capability; it's whether open-ended research actually energizes you, which you've never tested.",
  baseRateSignals: [
    {
      claim:
        "Enjoying coursework predicts enjoying open-ended research only weakly.",
      source: "Graduate-research advising norms",
      coverageLevel: "field-level",
      confidence: "medium",
      limitations:
        "A general pattern; individuals vary, which is exactly why a cheap fit test matters.",
    },
    {
      claim:
        "Research output and strong letters tend to outweigh grades alone for research-track admissions.",
      source: "Graduate admissions norms",
      coverageLevel: "field-level",
      confidence: "medium",
      limitations:
        "Varies by sub-field and program; not a formula.",
    },
  ],
  evidenceCards: [
    {
      id: "gs-research-fit",
      title: "Research aptitude is best tested before committing",
      category: "Fit signal",
      content:
        "Open-ended research involves long feedback loops, ambiguity, and writing. A short real research experience is a cheaper fit test than committing to a multi-year program.",
      sourceType: "framework",
      usedFor: "Designing the fit-test 7-day experiment",
      evidenceStrength: "medium",
    },
    {
      id: "gs-advisor-leverage",
      title: "Advisor relationships and letters are high-leverage signals",
      category: "Admission signal",
      content:
        "Demonstrated research output and strong letters from researchers tend to carry more weight than grades alone; building a concrete contribution early is high-leverage.",
      sourceType: "framework",
      usedFor: "Shaping the 12-month trajectory toward letters/output",
      evidenceStrength: "medium",
    },
    {
      id: "gs-funding-time",
      title: "Research trades near-term income for deferred optionality",
      category: "Tradeoff",
      content:
        "Funded programs usually provide a stipend, not market salary — trading near-term earnings for credentials and deferred optionality. Opportunity cost concentrates in early compounding years.",
      sourceType: "labor_market",
      usedFor: "Naming the opportunity cost and constraint risk",
      evidenceStrength: "medium",
    },
    {
      id: "bls-postsec-outlook",
      title: "Postsecondary / research-track occupations: outlook",
      category: "Occupation outlook",
      content:
        "At the occupation level, the BLS Occupational Outlook Handbook describes postsecondary/research-track roles — duties, general wage framing, demand direction, and the advanced credentials these occupations expect.",
      sourceType: "labor_market",
      usedFor: "Occupation-level outlook/credential framing for the research track",
      evidenceStrength: "medium",
      sourceName: "Occupational Outlook Handbook",
      publisher: "U.S. Bureau of Labor Statistics",
      sourceUrl: "https://www.bls.gov/ooh/",
      coverageLevel: "occupation",
      claim:
        "Frames research-track roles, wage ranges, and demand direction at the occupation level — useful for direction, not personal outcome.",
      limitations:
        "Occupation-level aggregates grouping varied disciplines/institutions; a reporting lag; not an individual prediction.",
      reliabilityLevel: "high",
      lastReviewed: "2026-06-15",
      sourceCardId: "bls-postsec-outlook",
    },
    {
      id: "nces-earnings-debt",
      title: "Post-bachelor earnings trajectories & loan debt (cohort)",
      category: "Earnings trajectories and student debt",
      content:
        "At the cohort level, the NCES Baccalaureate & Beyond study follows bachelor's recipients over time — context for how earnings tend to develop and how borrowing/repayment typically unfold, framing the deferred-income tradeoff.",
      sourceType: "education_outcomes",
      usedFor: "Framing the deferred-income vs family-stability tradeoff",
      evidenceStrength: "medium",
      sourceName: "Baccalaureate and Beyond Longitudinal Study (B&B)",
      publisher: "National Center for Education Statistics (NCES)",
      sourceUrl: "https://nces.ed.gov/surveys/b&b/",
      coverageLevel: "cohort",
      claim:
        "Describes a tracked cohort's general earnings/debt pattern over time — not what any one graduate could earn or owe.",
      limitations:
        "Cohort-level longitudinal aggregates with self-reported elements and a follow-up lag; not an individual prediction.",
      reliabilityLevel: "medium",
      lastReviewed: "2026-06-15",
      sourceCardId: "nces-earnings-debt",
    },
  ],
  twelveMonthTrajectory: [
    {
      time: "Month 1–2",
      description:
        "Find one lab or reading group; do a small concrete task (replication, lit review) to get real exposure to the research feedback loop.",
      uncertaintyNote:
        "Two months is enough to feel the texture of research, not to judge a whole career — treat early signal as provisional.",
    },
    {
      time: "Month 3–6",
      description:
        "Contribute to a real project; aim for a small artifact and a relationship that could become a letter.",
      uncertaintyNote:
        "Output timelines in research are long and uncertain; a clean small contribution is more realistic than a paper.",
    },
    {
      time: "Month 7–9",
      description:
        "Decide on fit honestly. If yes, shape your summer and courses toward research; if no, you've cheaply avoided a multi-year mismatch.",
      uncertaintyNote:
        "The fit signal is personal and hard to generalize; your felt experience is the data here.",
    },
    {
      time: "Month 10–12",
      description:
        "Line up letters, a focused statement, and (if applicable) a funded summer research role.",
      uncertaintyNote:
        "Admissions outcomes vary widely by sub-field and cycle; preparation improves odds but guarantees nothing.",
    },
  ],
  hiddenTradeoffs: [
    "Research offers high autonomy but long stretches with no external validation — the opposite feedback profile from quant.",
    "The path defers income during your highest-compounding early years; that tensions your family-stability value.",
    "Multi-year commitments are hard to reverse mid-stream — the cheap window to test fit is *now*, not in year three.",
  ],
  opportunityCosts: [
    "Near-term earnings and the quant on-ramp, deferred for credentials and deferred optionality.",
    "Time that could compound into a startup or industry portfolio instead goes into exploratory research.",
  ],
  reversibility: "low",
  skillCompounding:
    "Deep and distinctive: rigorous thinking, writing, and the ability to make progress on open problems compound powerfully — but the payoff is back-loaded and most legible inside research/specialized industry.",
  emotionalLoad:
    "Autonomy paired with ambiguity: long feedback loops, self-directed motivation, and tolerance for being stuck. Energizing for people who love open problems; demoralizing for people who need fast legible wins.",
  bottlenecks: [
    "Getting into a lab / reading group with a real task (access, not ability).",
    "Producing a small concrete artifact on a long, uncertain timeline.",
    "Honestly assessing fit before a multi-year commitment.",
  ],
  assumptions: [
    {
      claim: "You'd enjoy open-ended research because you like hard classes.",
      type: "ai_inferred",
      confidence: "low",
      howToTest:
        "Spend a week shadowing real research work; coursework enjoyment is a weak proxy and this is your stated untested assumption.",
    },
    {
      claim: "You have never done real research yet.",
      type: "user_provided",
      confidence: "high",
      howToTest:
        "Stated directly — which is why fit is the dominant uncertainty for this branch.",
    },
    {
      claim:
        "Letters and output matter more than grades for this path.",
      type: "source_supported",
      confidence: "medium",
      howToTest:
        "Ask one researcher in your target sub-field what they weight most.",
    },
    {
      claim:
        "Deferred income is compatible with your family-stability value over your horizon.",
      type: "ai_inferred",
      confidence: "low",
      howToTest:
        "Talk with your family about the multi-year tradeoff explicitly; this is a values question the system can't resolve for you.",
    },
  ],
  premortem: [
    "12 months out, this failed because you committed before testing fit, and discovered in year two that you missed legible, fast feedback.",
    "It failed because the deferred income clashed with the family-stability value you ranked highly, creating ongoing strain.",
    "It failed because you couldn't get a real research task in time, so you had exposure to the idea of research but no actual signal or letters.",
  ],
  regretRadar: [
    {
      regretType: "identity",
      level: "medium",
      description:
        "If research turns out to fit who you are, not testing it could become a quiet long-term identity regret.",
    },
    {
      regretType: "financial",
      level: "medium",
      description:
        "Deferred income tensions your family-stability value over your compounding early years.",
    },
    {
      regretType: "action",
      level: "medium",
      description:
        "Committing before a fit test risks an action-regret if a multi-year path proves to be a mismatch.",
    },
  ],
  sevenDayExperiment: [
    {
      day: 1,
      action: "List 3 labs/reading groups whose questions genuinely interest you.",
      purpose: "Test whether real research topics pull you, or just the idea of grad school.",
    },
    {
      day: 2,
      action: "Read one paper from each end-to-end; note where you got bored vs hooked.",
      purpose: "Feel the actual texture of research reading.",
    },
    {
      day: 3,
      action: "Email one researcher offering to do a small concrete task.",
      purpose: "Probe the real bottleneck — access to a real task.",
    },
    {
      day: 4,
      action: "Attempt a tiny replication or lit-summary on a topic you liked.",
      purpose: "Experience the long-feedback-loop work, not just the reading.",
    },
    {
      day: 5,
      action: "Ask one grad student what they underestimated about research.",
      purpose: "Get inside-view signal on the emotional load.",
    },
    {
      day: 6,
      action: "Have an honest conversation with family about deferred income.",
      purpose: "Surface the values tradeoff the AI explicitly will not decide.",
    },
    {
      day: 7,
      action: "Score it: did open-ended work energize or drain you this week?",
      purpose: "Decide whether to pursue fit further, adjust, or kill the branch.",
    },
  ],
  killCriteria: [
    "A week of real research work consistently bored or frustrated you rather than energizing you.",
    "You can't access any real research task, so you'd be committing on the idea of research, not evidence.",
    "The deferred-income tradeoff is incompatible with your family's needs over your horizon.",
  ],
  calibration: {
    evidenceStrength: "medium",
    userFit: "low",
    constraintRisk: "medium",
    uncertaintyLevel: "high",
    dataCoverageNote:
      "Built from field-level research/admissions norms plus your stated (untested) interest. Fit is the dominant unknown and is inherently personal — not something the simulation can resolve.",
    calibrationRationale:
      "EvidenceStrength is medium because the supporting cards are field-level frameworks and aggregate source pointers, not individual data; userFit is low and uncertaintyLevel high because research fit is personal and entirely untested (the user has never done real research), while constraintRisk is medium since deferred income against the family-stability value is plausible but unverified.",
  },
  graphNodeIds: BRANCH_GRAPH_NODE_IDS["research-depth"],
  evidenceGraphSnapshot: graphSnapshotForBranch("research-depth"),
  agentReview: {
    branchId: "research-depth",
    contextAgentSummary:
      "Restated the decision as a research/grad-school track for a student who likes hard classes but has never done real research, weighing autonomy and deferred income against a stated family-stability value.",
    retrievalAgentSummary:
      "Surfaced the research-fit, advisor-leverage, and funding-time cards plus the BLS-style occupation outlook and NCES-style earnings/debt pointers as the most relevant, all at field- or occupation-level coverage.",
    evidenceAgentSummary:
      "Attached the grad-school cards and labor-market source pointers, carrying their field-level coverage and selection/recency limitations rather than personalizing any aggregate into an individual figure.",
    optimistView:
      "If open-ended research turns out to fit, this branch may offer high autonomy and compounding research/writing skills, and early output plus a strong letter could become high-leverage admission signals at the field level.",
    skepticView:
      "Research fit is personal and untested, so enthusiasm for coursework may not transfer to long ambiguous feedback loops; the path also tends to defer income in high-compounding years and grows harder to reverse mid-stream.",
    calibrationSummary:
      "Assigned evidenceStrength medium, userFit low, constraintRisk medium, uncertaintyLevel high, noting coverage is field-level and the dominant unknown is untested research fit.",
    safetySummary:
      "Scrubbed deterministic admission/earnings phrasing and any exact percentages, rewriting them as hedged, coverage-honest statements that leave the choice to the user.",
    synthesisSummary:
      "Reconciled the optimist and skeptic views into a hedged branch whose crux is research fit, recommending a cheap 7-day fit test before any multi-year commitment.",
  },
  reasoningAuditTrail: {
    branchId: "research-depth",
    whyThisBranchExists:
      "The user enjoys hard classes and values autonomy, and the research-path node plus the research-writing skill node make a research/grad-school track a real option; the research-fit, advisor-leverage, and funding-time cards give it field-level grounding rather than free association.",
    evidenceUsed: [
      "gs-research-fit: enjoying coursework is a weak predictor of enjoying open-ended research; a short real research trial is a cheaper fit test (field-level)",
      "gs-advisor-leverage: demonstrated research output and strong letters tend to outweigh grades alone for research-track admissions (field-level)",
      "gs-funding-time: funded programs typically provide a stipend rather than market salary, deferring near-term income (field-level)",
      "bls-postsec-outlook: occupation-level outlook for postsecondary/research-adjacent roles, useful for direction not personal outcome",
      "nces-earnings-debt: earnings/debt pointers describing what the source covers and its aggregate limitations",
    ],
    assumptionsUsed: [
      "Would enjoy open-ended research because likes hard classes [ai_inferred, low]",
      "Has never done real research yet [user_provided, high]",
      "Letters and research output tend to matter more than grades alone [source_supported, medium]",
      "Deferred income may be compatible with the family-stability value [ai_inferred, low]",
    ],
    uncertaintyDrivers: [
      "Research FIT is personal and untested — the dominant unknown",
      "Whether deferred income can coexist with the stated family-stability value",
      "Variation in admissions and funding across sub-fields, which field-level evidence cannot resolve for one person",
      "Tolerance for long stretches without external validation, which coursework does not test",
    ],
    optimistView:
      "If research fit holds, this branch may combine high autonomy with compounding research and writing skills, and early output plus a strong letter could act as high-leverage admission signals at the field level.",
    skepticView:
      "Liking hard classes may not transfer to ambiguous, long-feedback-loop research; the path tends to defer income during high-compounding years and becomes costlier to reverse the deeper one goes.",
    rejectedOverclaims: [
      "Reframed a deterministic admissions claim into a hedged, field-level statement (output and letters tend to carry more weight than grades alone)",
      "Removed any exact earnings or stipend percentage; described instead what the source covers and its aggregate limitations",
      "Reframed research enjoyment from fact to an ai_inferred (low) assumption routed to a cheap fit test",
    ],
    whatWouldChangeThisAssessment: [
      "A short real research trial (reading group or tiny replication) that the user finds energizing rather than draining would raise userFit",
      "A grad-student conversation revealing the day-to-day ambiguity feels intolerable would lower userFit",
      "A family conversation showing deferred income is or is not workable would shift constraintRisk",
      "Concrete early output or advisor interest would strengthen the field-level admission-signal evidence",
    ],
    nextValidationStep:
      "This week, attempt a tiny replication of one paper and talk to one grad student about the daily reality, then have a short family conversation about deferred income — a cheap test of the dominant fit and constraint unknowns.",
  },
  rejectedOverclaims: [
    "Softened a deterministic admissions claim into a hedged, field-level statement (output and letters tend to outweigh grades alone, varying by sub-field).",
    "Removed exact earnings/stipend/admission-odds figures; described what aggregate sources cover and their limitations.",
    "Reframed 'will enjoy research' from fact to an [ai_inferred, low] assumption routed to a cheap fit test.",
    "Reframed a superlative path claim as one plausible branch whose value depends on personal research fit the model cannot observe.",
  ],
  evaluationSignals: [
    {
      name: "Groundedness",
      level: "high",
      note: "Every claim ties to a named field-level grad-school card or labor-market source pointer; no fabricated numbers.",
    },
    {
      name: "Hedging compliance",
      level: "high",
      note: "Uses may/could/tends-to throughout; no deterministic verbs, absolute promises, or exact percentages.",
    },
    {
      name: "Provenance coverage",
      level: "medium",
      note: "Assumptions are tagged user_provided/source_supported/ai_inferred, though two key drivers rest on low-confidence inferences.",
    },
    {
      name: "Calibration honesty",
      level: "high",
      note: "userFit low and uncertaintyLevel high openly flag untested research fit as the dominant unknown.",
    },
  ],
};

export const DEMO_BRANCHES: FutureBranch[] = [quant, startup, research];
