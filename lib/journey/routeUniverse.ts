/**
 * Route universe — the "Possible Futures Library".
 *
 * Real decisions rarely have exactly three choices. This module turns the
 * journey into a PORTFOLIO of meaningfully distinct route candidates (8 surfaced
 * from a library of 10 archetypes), each carrying deep, concrete micro-level
 * decision-review data (PART 4/6), then selects three as the sharpest comparison
 * set for deep simulation. Everything is
 * deterministic and mock-first (no API key, no live web): archetype templates are
 * SELECTED, SCORED, and lightly framed against the user's inferred journey signal.
 *
 * Honesty is structural:
 *  - The evidence-fit score is a transparent MATCH score (PART 7) computed in
 *    code — never a probability of success, never a forecast.
 *  - Each route links to the curated journey evidence base (lib/journey/evidence)
 *    by id; occupation/career DATA cards are dropped for non-career decisions, and
 *    a route with no applicable curated source says so honestly. AI-inferred
 *    assumptions are flagged, never shown as a citation (PART 8).
 *
 * The three primary routes are down-projected to the small RevealedPath shape the
 * deterministic adapter (lib/journey/adapter) expands into exactly three /map
 * branches — so the existing map/branch/brief loop is untouched.
 */
import type {
  JourneyState,
  PrimarySelection,
  QuestionAnswer,
  ReferenceNote,
  RevealedPath,
  RouteCandidate,
  RouteConfidence,
  RouteHorizon,
  RouteLevel,
  RouteScoreBreakdown,
  RouteScoreRationale,
} from "./types";
import { VALUE_PHRASE, dominantTag, rankTags } from "./values";
import type { ValueTag } from "./values";
import { evidenceCardsForIds } from "./evidence";

/* ----------------------------- Archetype model ---------------------------- */

interface Archetype {
  id: string;
  archetype: string;
  title: string;
  shortDescription: string;
  /** Short noun phrase, reads well lowercased mid-sentence (projection + display). */
  optimizesFor: string;

  coreIdea: string;
  whyItMakesSense: string;
  bestFitUser: string;
  assumptions: string[];

  gains: string[];
  givesUp: string[];
  hiddenTradeoffs: string[];
  opportunityCost: string;

  sevenDayActionPlan: string[];
  thirtyDayActionPlan: string[];
  ninetyDayDirection: string;
  lowCostExperiment: string;

  keyRisks: string[];
  earlyWarningSigns: string[];
  resourcesNeeded: string[];
  emotionalFriction: string;

  confidence: RouteConfidence;
  uncertainty: string;
  aiInferredAssumptions: string[];
  /** Ids into lib/journey/evidence (gated to the journey at build time). */
  evidenceCardIds: string[];

  /* axes that drive diversity, scoring, and primary selection */
  risk: RouteLevel;
  reversibility: RouteLevel;
  timeHorizon: RouteHorizon;
  ambition: RouteLevel;
  frictionLevel: RouteLevel;
  valueAffinity: Partial<Record<ValueTag, number>>;
}

/* --------------------------------- Library -------------------------------- */

const ARCHETYPES: Archetype[] = [
  {
    id: "conservative-anchor",
    archetype: "Conservative anchor",
    title: "Anchor on a stable, legible footing first",
    shortDescription:
      "Lock in one stable, recognizable footing before expanding, so later bets are made from strength rather than pressure.",
    optimizesFor: "a stable, legible footing others can recognize quickly",
    coreIdea:
      "Reduce downside before chasing upside: secure one footing — an offer, a credential, three months of runway — that makes every later move optional instead of forced.",
    whyItMakesSense:
      "When a clear footing recurs in your answers, securing it tends to lower the cost of every other path, because you stop deciding from scarcity and start deciding from choice.",
    bestFitUser:
      "Someone who decides worse under financial or status pressure and would rather expand from a secure base than gamble the base itself.",
    assumptions: [
      "A stable footing is actually reachable for you inside this window (an offer, an admit, a runway).",
      "Moving deliberately now does not quietly close a genuinely time-limited door.",
      "The footing you'd secure is one you'd still respect in a year, not just the easiest to grab.",
    ],
    gains: [
      "A financial and attention floor that steadies later decisions",
      "Room to take real risks later without panic",
      "A signal others read quickly, opening structured doors",
    ],
    givesUp: [
      "Near-term upside and optionality on a bolder track",
      "The compounding edge of committing early while a window is open",
    ],
    hiddenTradeoffs: [
      "Stability can quietly harden into staying put past the point it still serves you, because leaving a comfortable floor feels like a loss",
    ],
    opportunityCost:
      "The asymmetric upside of committing early to a bolder, less legible path while it is still wide open.",
    sevenDayActionPlan: [
      "Write down the single footing whose absence is creating the most background stress (money, an offer, a credential).",
      "List the 2–3 concrete actions that would secure it, with a date on each.",
      "Take the first reversible action this week — apply, ask, or bank one month of runway.",
    ],
    thirtyDayActionPlan: [
      "Secure or visibly de-risk that footing (signed offer, confirmed admit, runway in the account).",
      "Write the explicit condition — a date or a milestone — that triggers your first expansion beyond it.",
    ],
    ninetyDayDirection:
      "Operate from the secured base and start one small, deliberate expansion once the floor is genuinely solid — not before.",
    lowCostExperiment:
      "Spend one week acting as if the footing were already chosen — turn down one competing option in your head and notice whether you feel steadier or quietly boxed in.",
    keyRisks: [
      "Narrowing too early and treating safety as the whole goal rather than the base",
      "Mistaking the comfort of a secured floor for a finished decision",
    ],
    earlyWarningSigns: [
      "Two weeks pass and you keep deferring the expansion step you dated",
      "The footing starts to feel less like a base and more like a ceiling you defend",
    ],
    resourcesNeeded: [
      "A clear read on which footing is genuinely available to you now",
      "A small time buffer to secure it without rushing into the wrong one",
    ],
    emotionalFriction:
      "The quiet worry that playing it safe is its own risk — that steadiness costs you a window you cannot reopen later.",
    confidence: "Medium",
    uncertainty:
      "Whether the footing you'd secure is the one that actually frees you, or just the one that is easiest to reach.",
    aiInferredAssumptions: [
      "That a stable footing reduces, rather than postpones, your core tension — confirm by checking whether the pressure you feel is about money/status or about direction.",
    ],
    evidenceCardIds: ["bls-ooh", "two-way-doors", "outside-view"],
    risk: "Low",
    reversibility: "High",
    timeHorizon: "Medium",
    ambition: "Low",
    frictionLevel: "Low",
    valueAffinity: { security: 3, growth: 1, open: 1 },
  },
  {
    id: "balanced-portfolio",
    archetype: "Balanced portfolio",
    title: "Run a legible main track plus one real side bet",
    shortDescription:
      "Hold a recognizable main track for stability while running one genuine side bet, so you build a floor and a higher-upside option at the same time.",
    optimizesFor: "a floor and an option held at once",
    coreIdea:
      "Split your week on purpose: a legible main track carries the floor and most of your hours, while one real, protected side bet keeps a higher-upside door open and feeding you signal.",
    whyItMakesSense:
      "When your answers read as genuinely split, a deliberate split buys information about both directions before you have to commit to either — and a first-destination snapshot shows 'not landed yet' is common, not failure.",
    bestFitUser:
      "Someone with the bandwidth to protect focus on two fronts who learns more from doing a little of both than from deliberating between them.",
    assumptions: [
      "You have enough protected weekly hours to run a main track and one side bet without doing both poorly.",
      "The side bet is concrete enough to produce a result, not a hobby that absorbs time without teaching anything.",
      "The two tracks don't cannibalize the same scarce resource (the same deadline week, the same energy).",
    ],
    gains: [
      "A stable floor while a higher-upside option stays open",
      "Real signal from both directions before committing to one",
      "A natural hedge if either track stalls",
    ],
    givesUp: [
      "The depth that comes from full concentration on one path",
      "Some speed on each front and a clean, single story to tell",
    ],
    hiddenTradeoffs: [
      "Two half-commitments can feel like momentum while quietly letting you avoid the harder choice of which one you actually want",
    ],
    opportunityCost:
      "The compounding focus of going all-in on the single track that energizes you most.",
    sevenDayActionPlan: [
      "Name the main track (the floor) and the one side bet worth real hours.",
      "Block specific calendar time for each — e.g. weekday evenings for the bet — so neither bleeds into the other.",
      "Define what one strong week looks like on both, in a single sentence each.",
    ],
    thirtyDayActionPlan: [
      "Ship one concrete, visible result on each track (a delivered milestone; a shipped side-bet artifact).",
      "At day 30, note which track you protected time for when the week got tight — that pull is data.",
    ],
    ninetyDayDirection:
      "Let the track you instinctively defended earn more of your hours, and taper the other deliberately rather than dropping it abruptly.",
    lowCostExperiment:
      "For one week, log which track you reach for first in a free hour and which you skip when tired; the asymmetry tells you where your real commitment already lives.",
    keyRisks: [
      "Spreading thin and making only shallow progress on both fronts",
      "Using the split to postpone a decision you have, underneath, already half-made",
    ],
    earlyWarningSigns: [
      "Both tracks keep losing their protected calendar time to whatever is loudest",
      "You feel busy across the week but cannot point to one real result on either",
    ],
    resourcesNeeded: [
      "Enough genuinely free weekly hours to give each track a real shot",
      "A dead-simple way to track one result per track per month",
    ],
    emotionalFriction:
      "The discomfort of not fully committing — the nagging sense that holding two doors open is the same as deciding nothing.",
    confidence: "Medium",
    uncertainty:
      "Whether you truly have the bandwidth for two real tracks, or whether the split quietly halves the quality of both.",
    aiInferredAssumptions: [
      "That your answers are still genuinely split rather than already leaning — confirm by watching where your free hours actually go for a week.",
    ],
    evidenceCardIds: ["barbell", "value-of-information", "nace-first-destination"],
    risk: "Medium",
    reversibility: "High",
    timeHorizon: "Medium",
    ambition: "Medium",
    frictionLevel: "Medium",
    valueAffinity: { open: 3, security: 1, growth: 1, freedom: 1 },
  },
  {
    id: "ambitious-sprint",
    archetype: "Ambitious sprint",
    title: "Concentrate hard on the highest-upside track",
    shortDescription:
      "Pick the track with the most upside and pour concentrated effort into it for a defined push, trading breadth for depth and momentum.",
    optimizesFor: "momentum and depth on a single high-upside track",
    coreIdea:
      "Stop hedging for a fixed window (say 8–12 weeks). Put your best hours into the one track with the steepest upside and let focus compound into something a hedge never produces.",
    whyItMakesSense:
      "When growth and momentum dominate your answers, concentration compounds faster than a spread bet — but the outside view warns it usually takes longer than the inside view expects, so bound it.",
    bestFitUser:
      "Someone with a clear favorite who is held back more by hedging and second-guessing than by the track itself.",
    assumptions: [
      "One track genuinely has more upside for you than the others — not just more noise around it.",
      "You can protect a concentrated block of effort for the window without burning out.",
      "The window's payoff is worth the breadth you set down to get it.",
    ],
    gains: [
      "Compounding depth and visible momentum a hedge can't match",
      "A sharper, more distinctive signal in that one direction",
      "Faster, clearer feedback on whether the track is actually right for you",
    ],
    givesUp: [
      "The safety of a hedge if the track disappoints",
      "Breadth and optionality across other directions",
    ],
    hiddenTradeoffs: [
      "Concentrated effort raises the cost of being wrong about which track to concentrate on — and a sunk sprint is hard to abandon honestly",
    ],
    opportunityCost:
      "The optionality and floor you'd keep by spreading effort more cautiously across several tracks.",
    sevenDayActionPlan: [
      "Commit to one track out loud to someone, and set the exact length of the push.",
      "Clear two competing obligations off the next four weeks so the block is real.",
      "Ship one concrete artifact on the chosen track this week, however rough.",
    ],
    thirtyDayActionPlan: [
      "Stack four weeks of focused output and put it in front of 3–5 people who work in that world.",
      "Track, honestly, where the work energizes you and where it grinds you down.",
    ],
    ninetyDayDirection:
      "At the end of the push, reassess with real output in hand and decide deliberately whether to extend, pivot, or bank the momentum and diversify.",
    lowCostExperiment:
      "Run a single concentrated week on the track — no hedging — and compare your output and your energy at the end against a normal split week.",
    keyRisks: [
      "Concentrating on the wrong track and feeling the full cost of it",
      "Burning out from a pace you set in optimism and can't sustain",
    ],
    earlyWarningSigns: [
      "Output rises week over week but your energy keeps falling",
      "You catch yourself defending the choice to others more than enjoying the work",
    ],
    resourcesNeeded: [
      "A protected block of focused time, defended against everything non-essential",
      "1–2 people in that world who will react honestly to your output, not politely",
    ],
    emotionalFriction:
      "The exposure of going all-in — without a hedge, a disappointing result lands directly and personally, with no soft landing.",
    confidence: "Medium",
    uncertainty:
      "Whether the track you'd concentrate on is genuinely your highest-upside one, or just the loudest in your head right now.",
    aiInferredAssumptions: [
      "That concentration suits your temperament more than hedging does — an assumption a single focused week is designed to test.",
    ],
    evidenceCardIds: ["deliberate-practice", "outside-view", "onet"],
    risk: "High",
    reversibility: "Medium",
    timeHorizon: "Medium",
    ambition: "High",
    frictionLevel: "Medium",
    valueAffinity: { growth: 3, opportunity: 2, identity: 1 },
  },
  {
    id: "experimental-probe",
    archetype: "Reversible experiment",
    title: "Run a reversible 30-day parallel experiment",
    shortDescription:
      "Before committing, give your two strongest directions a real, comparable task for a fixed, fully reversible window and let the results — not the guess — decide.",
    optimizesFor: "resolving the core uncertainty cheaply before it gets expensive",
    coreIdea:
      "Buy information instead of buying certainty: design one small, comparable task per direction, run both inside 30 days, and pre-commit what a pass looks like before you start.",
    whyItMakesSense:
      "When deciding now is costly and a cheap test exists, a reversible probe replaces one big guess with two small pieces of real evidence — and customer-discovery framing keeps the test about behavior, not flattery.",
    bestFitUser:
      "Someone stuck between two strong directions who learns far more from doing a little of each than from another week of deliberation.",
    assumptions: [
      "A small, comparable test of each direction is genuinely possible in 30 days.",
      "A short trial produces signal that generalizes, rather than noise from one good or bad day.",
      "You'll honor the pre-committed pass/fail line instead of moving it afterward.",
    ],
    gains: [
      "Real, behavior-based evidence about each direction at low cost",
      "A bounded, fully reversible commitment with a clean exit",
      "A decision finally made on signal rather than on a guess",
    ],
    givesUp: [
      "A month of fully concentrated progress on one path",
      "The momentum that comes from committing outright",
    ],
    hiddenTradeoffs: [
      "A test designed loosely confirms whatever you already wanted to believe — the discipline is in the falsifiable line, not the activity",
    ],
    opportunityCost:
      "The head start you'd have by committing now to the direction you already lean toward.",
    sevenDayActionPlan: [
      "For each direction, write the one falsifiable thing it must show you (e.g. 'two of five target users ask for a follow-up').",
      "Design a small, comparable task for each that fits inside a week of evenings.",
      "Start the first task and timestamp it so the 30-day clock is real.",
    ],
    thirtyDayActionPlan: [
      "Run both tasks to completion under the same effort budget, no favoritism.",
      "Score each against the falsifiable line you wrote — not against your mood that day.",
    ],
    ninetyDayDirection:
      "Commit to whichever direction the evidence favored and fold the runner-up into a smaller ongoing bet, or set it down cleanly.",
    lowCostExperiment:
      "This week, give each of your two leading directions one real, comparable task — for an entrepreneurial one, interview 5 target users and build a single landing page; if no one asks for a follow-up, that route's demand assumption weakens.",
    keyRisks: [
      "Designing the test to confirm a conclusion you'd already reached",
      "Letting the 30-day experiment quietly drift into open-ended avoidance",
    ],
    earlyWarningSigns: [
      "The 30-day window keeps extending 'just one more week'",
      "You're collecting activity and busywork rather than answering the question you wrote down",
    ],
    resourcesNeeded: [
      "A falsifiable pass/fail question for each direction",
      "A fixed end date and a way to score the result honestly",
    ],
    emotionalFriction:
      "The restlessness of deliberately not committing yet — running a test can feel like stalling, even when it's the cheaper way to learn.",
    confidence: "Medium",
    uncertainty:
      "Whether a 30-day probe is long enough to produce signal that holds, or just a snapshot of a single month.",
    aiInferredAssumptions: [
      "That both directions are testable at small scale — confirm this before you design the probe, not after.",
    ],
    evidenceCardIds: ["value-of-information", "customer-development", "mom-test"],
    risk: "Low",
    reversibility: "High",
    timeHorizon: "Short",
    ambition: "Medium",
    frictionLevel: "Low",
    valueAffinity: { open: 3, opportunity: 1, growth: 1 },
  },
  {
    id: "fallback-floor",
    archetype: "Fallback floor",
    title: "Build a portable floor under every path",
    shortDescription:
      "Invest first in portable skills and a financial buffer that protect you whichever direction you take, lowering the stakes of the real choice.",
    optimizesFor: "a portable floor that survives whichever path you choose",
    coreIdea:
      "De-risk the person, not just the path: build one transferable skill and a defined buffer (e.g. three months of expenses) that travel with you, so any later choice is made from safety rather than fear.",
    whyItMakesSense:
      "When fear of a wrong turn weighs on your answers, a portable floor shrinks that fear directly — barbell framing pairs a protected base with a freer upside bet on top.",
    bestFitUser:
      "Someone whose hesitation comes more from exposure and 'what if it goes wrong' than from genuine confusion about direction.",
    assumptions: [
      "The skill and buffer you build genuinely transfer across the options you're weighing.",
      "Building the floor doesn't become a permanent reason to delay the real choice.",
      "Three-ish months of buffer is enough to change how you decide, not just how you feel.",
    ],
    gains: [
      "A safety margin that lowers the stakes of every path",
      "A skill that compounds regardless of which direction you take",
      "Calmer, less fear-driven decisions later",
    ],
    givesUp: [
      "Time that could go straight into a chosen direction now",
      "The urgency that sometimes forces a clearer, faster decision",
    ],
    hiddenTradeoffs: [
      "A floor can become a comfortable place to hide from the harder commitment, dressed up as prudence",
    ],
    opportunityCost:
      "Momentum on a specific path you might have built while you were reinforcing the floor.",
    sevenDayActionPlan: [
      "Name the one portable skill that strengthens every option you're weighing.",
      "Name the buffer (a savings number, a fallback offer) that would most lower your sense of exposure.",
      "Take one concrete step toward each — a first lesson; a transfer to savings.",
    ],
    thirtyDayActionPlan: [
      "Make visible progress on the portable skill (a finished course module, a small built thing).",
      "Set a target number for the buffer and a date to make the real directional choice.",
    ],
    ninetyDayDirection:
      "With the floor in place, make the real directional choice deliberately — from safety, not from scarcity — and let the floor support a bolder upside bet.",
    lowCostExperiment:
      "Spend one week building only the portable skill and banking the buffer step; then notice whether the broader decision actually feels less frightening, or exactly the same.",
    keyRisks: [
      "Treating the floor as the destination instead of the launch pad",
      "Postponing the directional choice indefinitely behind 'just a bit more buffer'",
    ],
    earlyWarningSigns: [
      "The buffer keeps growing but the real choice never gets a date",
      "You feel safer but no closer to a direction",
    ],
    resourcesNeeded: [
      "A clear view of which skills are genuinely portable across your options",
      "A modest, defined savings or fallback buffer and the discipline to cap it",
    ],
    emotionalFriction:
      "The pull to keep reinforcing the floor because it feels productive, even once it has stopped reducing any real risk.",
    confidence: "Medium",
    uncertainty:
      "Whether the floor you build actually transfers across your options, or really only serves one of them.",
    aiInferredAssumptions: [
      "That your hesitation is driven by exposure rather than direction — check this against your own answers before over-investing in the floor.",
    ],
    evidenceCardIds: ["barbell", "deliberate-practice", "acs-pums"],
    risk: "Low",
    reversibility: "High",
    timeHorizon: "Medium",
    ambition: "Low",
    frictionLevel: "Low",
    valueAffinity: { security: 3, identity: 1, open: 1 },
  },
  {
    id: "short-term-test",
    archetype: "Short-term test",
    title: "Run one cheap probe on the most painful unknown",
    shortDescription:
      "Isolate the single uncertainty that hurts most and resolve it with one fast, cheap probe this week, instead of carrying it through every other path.",
    optimizesFor: "resolving the single most painful unknown fast",
    coreIdea:
      "Find the one assumption that, if wrong, sinks the most paths — then buy a small piece of real signal on it before doing anything else, with a pass/fail line set in advance.",
    whyItMakesSense:
      "A single binding uncertainty often blocks several routes at once, so a pre-mortem on it and one cheap value-of-information test unlocks more of the map per hour than broad deliberation.",
    bestFitUser:
      "Someone who can feel which unknown is doing the most damage and wants to lance it quickly rather than circle it.",
    assumptions: [
      "One uncertainty is genuinely more binding than the rest right now.",
      "A small probe can actually move your belief about it, not merely describe it.",
      "You can name a result in advance that would change your mind.",
    ],
    gains: [
      "A fast answer to the question blocking the most paths",
      "A very low cost to run it — an afternoon, not a quarter",
      "Clearer footing under every later decision",
    ],
    givesUp: [
      "The breadth of testing several things at once",
      "Any false comfort the unexamined unknown was quietly providing",
    ],
    hiddenTradeoffs: [
      "Resolving one unknown can surface a harder one underneath that you weren't ready to face",
    ],
    opportunityCost:
      "The reassurance of leaving a painful question comfortably unexamined a little longer.",
    sevenDayActionPlan: [
      "Name the single uncertainty that, if it broke the wrong way, would sink the most paths.",
      "Design the cheapest test that could genuinely change your mind about it, and write the pass/fail line.",
      "Run it before the week ends — one conversation, one trial, one real data point.",
    ],
    thirtyDayActionPlan: [
      "Act on what the probe told you about the binding unknown.",
      "Pick the next most painful uncertainty and repeat the same one-week move.",
    ],
    ninetyDayDirection:
      "Carry the habit of testing the most binding unknown first, so the map keeps clearing instead of staying fogged.",
    lowCostExperiment:
      "Spend one afternoon getting a single real data point on the unknown that worries you most — one honest conversation or one small trial — then notice how much of the decision actually shifts.",
    keyRisks: [
      "Testing a comfortable question instead of the genuinely binding one",
      "Over-reading a single small result as if it settled everything",
    ],
    earlyWarningSigns: [
      "You keep refining the test design instead of running it",
      "The probe answered something easy and left the hard part untouched",
    ],
    resourcesNeeded: [
      "Honesty about which unknown actually hurts most",
      "An afternoon and a way to get one real data point",
    ],
    emotionalFriction:
      "The flinch of pointing a test straight at the thing you've been carefully avoiding looking at.",
    confidence: "Medium",
    uncertainty:
      "Whether the unknown that feels most painful is the one that is actually most binding on the decision.",
    aiInferredAssumptions: [
      "That a single unknown dominates the decision — confirm by checking how many of your paths it really blocks.",
    ],
    evidenceCardIds: ["value-of-information", "premortem"],
    risk: "Low",
    reversibility: "High",
    timeHorizon: "Short",
    ambition: "Low",
    frictionLevel: "Low",
    valueAffinity: { open: 2, opportunity: 1, security: 1 },
  },
  {
    id: "long-horizon-transform",
    archetype: "Long-term transformation",
    title: "Commit to a multi-year depth build",
    shortDescription:
      "Choose the direction worth years rather than months and start compounding deliberate depth now — accepting slow early payoff for a hard-to-copy edge later.",
    optimizesFor: "a durable, hard-to-copy depth that compounds over years",
    coreIdea:
      "Play a longer game on purpose: pick the direction you'd still respect in several years and invest in depth — through deliberate practice on its hardest sub-skill — that others can't shortcut.",
    whyItMakesSense:
      "When identity and meaning run through your answers, a long compounding build fits better than a quick win, and a multi-year cohort view is more honest than a six-month snapshot about how these paths unfold.",
    bestFitUser:
      "Someone with a direction that feels like them and the patience to push through the slow, illegible early stretch.",
    assumptions: [
      "The direction still fits the person you'll be in a few years, not only today.",
      "You can tolerate a long stretch of slow, externally-invisible early payoff.",
      "The depth you build stays valuable as the field changes around it.",
    ],
    gains: [
      "A distinctive, durable edge that's hard to copy",
      "Work that compounds across years instead of resetting",
      "Deep alignment between the path and who you are",
    ],
    givesUp: [
      "Near-term legibility and quick external validation",
      "The flexibility of staying broad and uncommitted",
    ],
    hiddenTradeoffs: [
      "A long commitment made for identity reasons is the hardest to re-examine honestly later, because questioning it feels like questioning yourself",
    ],
    opportunityCost:
      "The faster, more legible wins available on a shorter, more conventional track.",
    sevenDayActionPlan: [
      "Name the direction you'd still respect spending several years on.",
      "Identify the one deep sub-skill at its core that compounds and is hard to fake.",
      "Put real hours into the hardest part of that sub-skill this week, not the comfortable part.",
    ],
    thirtyDayActionPlan: [
      "Build a sustainable weekly rhythm of deep work on the core skill (protected, feedback-rich blocks).",
      "Set a 90-day checkpoint to honestly re-confirm the direction still fits you.",
    ],
    ninetyDayDirection:
      "Establish the long build as a durable habit, with scheduled checkpoints that genuinely let you re-examine the commitment rather than just defend it.",
    lowCostExperiment:
      "Spend one week on the most demanding real problem in that direction and notice, honestly, whether the hard parts absorb you or drain you — that reaction is your best early fit signal.",
    keyRisks: [
      "Committing years to a direction chosen by an older version of you",
      "Mistaking accumulated sunk cost for genuine fit as time passes",
    ],
    earlyWarningSigns: [
      "The hard parts consistently drain rather than absorb you",
      "You defend the path by how much you've already invested, not by its pull",
    ],
    resourcesNeeded: [
      "A sustainable long-term rhythm and patience for slow, invisible early payoff",
      "Honest checkpoints — and someone who will tell you the truth at them",
    ],
    emotionalFriction:
      "The loneliness of a slow, illegible early stretch while more conventional paths show visible wins around you.",
    confidence: "Low",
    uncertainty:
      "Whether the direction that fits you now will still fit the person you become over several years.",
    aiInferredAssumptions: [
      "That present identity-fit predicts future fit — a meaningful assumption to revisit honestly at every checkpoint.",
    ],
    evidenceCardIds: ["deliberate-practice", "nces-bb", "college-scorecard"],
    risk: "Medium",
    reversibility: "Low",
    timeHorizon: "Long",
    ambition: "High",
    frictionLevel: "High",
    valueAffinity: { identity: 3, growth: 2 },
  },
  {
    id: "high-risk-reward",
    archetype: "High-risk / high-reward",
    title: "Take one bounded bet on a rare window",
    shortDescription:
      "Make a concentrated bet on the opportunity that feels rare — but bound it with a pre-set stop, turning an open-ended gamble into a bounded one.",
    optimizesFor: "asymmetric upside on a rare window, with a hard stop",
    coreIdea:
      "Pursue the rare opportunity hard, but decide the exit before you start: a written stop date or condition that caps the downside while leaving the upside open.",
    whyItMakesSense:
      "When a closing window dominates your answers, a bounded bet answers the 'what if I'd tried' question without open-ended exposure — and a pre-mortem plus regret-minimization make the stop honest rather than ornamental.",
    bestFitUser:
      "Someone facing a genuinely time-limited opportunity who can commit hard and still honor a stop they set while calm.",
    assumptions: [
      "The window is genuinely rare and time-limited, not a feeling of scarcity dressed as a deadline.",
      "You can hold to a stop point once you're emotionally and financially invested.",
      "You have, or can build, a buffer that survives the bet not paying off.",
    ],
    gains: [
      "Exposure to a large, asymmetric upside",
      "A clear, final answer to the 'what if I had tried' question",
      "A capped downside, because the exit is set in advance",
    ],
    givesUp: [
      "Steadier compounding on a path you could hold for years",
      "Some stability during the bet itself",
    ],
    hiddenTradeoffs: [
      "A pre-set stop is easy to write and hard to honor once you're emotionally committed — the bet quietly rewrites its own exit",
    ],
    opportunityCost:
      "The reliable progress of a calmer path you set aside to take the swing.",
    sevenDayActionPlan: [
      "Write the one falsifiable signal that would prove the window is real (a customer-discovery interview result, a concrete commitment from someone).",
      "Set the stop — the exact date or condition where you walk away — and tell one person, before committing.",
      "Take the first concrete step toward the bet.",
    ],
    thirtyDayActionPlan: [
      "Pursue the opportunity at full effort while watching for the falsifiable signal you named.",
      "Check honestly against the stop you set, without quietly moving it.",
    ],
    ninetyDayDirection:
      "Either the signal confirmed the window and you lean further in, or the stop triggered and you exit cleanly — with the question answered either way.",
    lowCostExperiment:
      "Spend this week trying to find the single piece of evidence that the window is real — five honest interviews about past behavior, not opinions — before committing any further to it.",
    keyRisks: [
      "Sinking real time into a window that turns out less rare than it felt",
      "Quietly moving the stop point once you're invested",
    ],
    earlyWarningSigns: [
      "You find reasons to push the stop date back",
      "The evidence for the window stays a feeling rather than becoming a fact",
    ],
    resourcesNeeded: [
      "A buffer that survives the bet not paying off",
      "A pre-committed, written stop point — and a person who'll hold you to it",
    ],
    emotionalFriction:
      "The high stakes of a public swing, and the discipline it takes to honor a stop you set while calm but reach while invested.",
    confidence: "Low",
    uncertainty:
      "Whether the window is genuinely rare and closing, or a sense of scarcity that will look very different in a year.",
    aiInferredAssumptions: [
      "That the opportunity is genuinely time-limited — the single assumption most worth trying to falsify before you commit.",
    ],
    evidenceCardIds: ["premortem", "regret-min", "barbell", "customer-development"],
    risk: "High",
    reversibility: "Low",
    timeHorizon: "Medium",
    ambition: "High",
    frictionLevel: "High",
    valueAffinity: { opportunity: 3, freedom: 2, growth: 1 },
  },
  {
    id: "hybrid-signal",
    archetype: "Hybrid signal",
    title: "Braid two of your strengths into one signal",
    shortDescription:
      "Rather than choosing between two strengths, combine them into a single differentiated signal that few others can credibly claim.",
    optimizesFor: "a differentiated signal at the intersection of two strengths",
    coreIdea:
      "Treat the choice as a false binary: build at the intersection of your two strengths, where the combination itself — not either skill alone — is the edge and the less-crowded position.",
    whyItMakesSense:
      "When two directions both pull at you, the overlap is often less crowded than either alone; checking that real roles draw on both strengths keeps the hybrid from being merely novel.",
    bestFitUser:
      "Someone torn between two directions that could reinforce rather than cancel each other.",
    assumptions: [
      "Your two strengths genuinely combine into something more than their sum, not just two résumé lines.",
      "There's a real audience or use for the combination, not only novelty.",
      "You're competent enough in both that the blend reads as depth, not dabbling.",
    ],
    gains: [
      "A distinctive position few others can credibly claim",
      "Keeps both strengths in play instead of dropping one",
      "Turns an either/or into a both/and",
    ],
    givesUp: [
      "The clarity and legibility of a single, well-understood track",
      "Some depth in each strength taken alone",
    ],
    hiddenTradeoffs: [
      "A combination can read as unfocused to people who only value one of the two strengths — you trade legibility for distinctiveness",
    ],
    opportunityCost:
      "The straightforward legibility of going deep on one recognizable track.",
    sevenDayActionPlan: [
      "Name the two strengths and the specific point where they intersect.",
      "Sketch one concrete thing that lives at that intersection and nowhere else.",
      "Make a rough first version of it this week.",
    ],
    thirtyDayActionPlan: [
      "Build one small, real artifact that only the combination makes possible.",
      "Show it to people in each world and note who immediately gets it without explanation.",
    ],
    ninetyDayDirection:
      "Sharpen the hybrid into a position you can state in one line, and double down where the combination clearly lands with real people.",
    lowCostExperiment:
      "Make one small thing this week that only the intersection of your two strengths could produce, show it to five people across both worlds, and watch whose attention it actually catches.",
    keyRisks: [
      "Building something that reads as unfocused rather than distinctive",
      "Combining for novelty when there's no real demand for the mix",
    ],
    earlyWarningSigns: [
      "People consistently ask you to pick one of the two instead",
      "The combination interests you but not anyone you show it to",
    ],
    resourcesNeeded: [
      "Genuine competence in both strengths, not just interest in them",
      "A small audience in each world to react to the combination",
    ],
    emotionalFriction:
      "The unease of not fitting a clean category, and explaining a position that takes a sentence longer than a single track would.",
    confidence: "Medium",
    uncertainty:
      "Whether the intersection of your two strengths has real pull, or is mainly interesting to you.",
    aiInferredAssumptions: [
      "That your two strengths are complementary rather than competing for the same hours — test it with one real artifact before betting on it.",
    ],
    evidenceCardIds: ["onet", "deliberate-practice", "customer-development"],
    risk: "Medium",
    reversibility: "Medium",
    timeHorizon: "Medium",
    ambition: "Medium",
    frictionLevel: "Medium",
    valueAffinity: { freedom: 2, identity: 2, growth: 2, opportunity: 1 },
  },
  {
    id: "optimize-in-place",
    archetype: "Optimize in place",
    title: "Keep your current path, remove its biggest drag",
    shortDescription:
      "Instead of switching, stay where you are and aggressively fix the single thing that makes the current path feel wrong before deciding to leave it.",
    optimizesFor: "a fair test of the current path before leaving it",
    coreIdea:
      "Separate the path from its friction: remove the one drag that's coloring everything, then judge the current path on its real merits with the noise gone.",
    whyItMakesSense:
      "Restlessness is sometimes about a fixable irritant rather than the path itself; this is a two-way door, so clearing the drag first costs almost nothing and reveals whether the urge to leave is real.",
    bestFitUser:
      "Someone tempted to switch who hasn't yet separated a genuine misfit from a specific, fixable frustration.",
    assumptions: [
      "A single dominant drag is coloring how you feel about the whole path.",
      "That drag is actually fixable from where you stand, by a lever you control.",
      "A month with it gone is long enough to re-rate the path fairly.",
    ],
    gains: [
      "A fair test of the current path with the loudest noise removed",
      "Very low cost and almost fully reversible",
      "Clarity on whether the urge to leave is real or situational",
    ],
    givesUp: [
      "The fresh energy and clean slate of a real change",
      "Time, if the path turns out to be a genuine misfit anyway",
    ],
    hiddenTradeoffs: [
      "Optimizing in place can become a sophisticated reason to stay somewhere you've already outgrown",
    ],
    opportunityCost:
      "The momentum and learning of committing to a genuine change now rather than later.",
    sevenDayActionPlan: [
      "Name the single biggest drag on your current path — the one that colors the rest.",
      "Identify the most direct lever you actually control to reduce it.",
      "Pull that lever once this week (a conversation, a boundary, a changed routine).",
    ],
    thirtyDayActionPlan: [
      "Remove or sharply reduce the main drag.",
      "Re-rate the path now that the loudest friction is gone, against how you felt before.",
    ],
    ninetyDayDirection:
      "If the optimized path now feels right, deepen it; if it still feels wrong with the drag gone, treat that as strong, regret-minimizing evidence to leave.",
    lowCostExperiment:
      "Spend one week with the single biggest irritant removed — delegate it, mute it, or renegotiate it — and notice whether the whole path feels different or exactly the same.",
    keyRisks: [
      "Using optimization to avoid a change you already know you need",
      "Fixing a visible symptom while the real misfit stays underneath",
    ],
    earlyWarningSigns: [
      "The drag is gone but the restlessness remains",
      "You keep finding new small irritants to fix instead of deciding",
    ],
    resourcesNeeded: [
      "Honesty about whether the drag is the real issue or a stand-in",
      "One lever you genuinely control",
    ],
    emotionalFriction:
      "The suspicion that staying and optimizing is just a comfortable way to avoid a harder, cleaner break.",
    confidence: "Medium",
    uncertainty:
      "Whether your restlessness comes from one fixable drag or from a deeper misfit with the path itself.",
    aiInferredAssumptions: [
      "That a single fixable drag explains your restlessness — the week-long test is designed precisely to check this.",
    ],
    evidenceCardIds: ["two-way-doors", "premortem", "regret-min"],
    risk: "Low",
    reversibility: "High",
    timeHorizon: "Short",
    ambition: "Low",
    frictionLevel: "Low",
    valueAffinity: { security: 2, identity: 2, open: 1 },
  },
];

/* ----------------------------- Career gating ------------------------------ */

// Tight, occupation-specific keywords — gate occupation-level evidence cards so
// they only attach when the user's OWN words frame an occupation/career decision,
// never a "should I move cities" / "should I end this relationship" one. Only the
// raw situation is tested (not system-generated state, which leans career-ish).
const CAREER_RE =
  /\b(job|jobs|career|careers|intern|internship|recruit|quant|startup|start-up|founder|co-?founder|research|researcher|grad school|graduate school|graduat|master'?s|masters|phd|ph\.?d|mba|degree|majoring|major in|employer|employment|salary|wage|promotion|industry|academia|academic|profession|hiring|apprentic|bootcamp|residency|tenure|engineer|developer|analyst|consulting|medical school|law school)\b/i;

/** Whether the user's own words frame an occupation/career decision (drives provenance honesty). */
export function isCareerShaped(situation: string, _state?: JourneyState): boolean {
  return CAREER_RE.test(situation || "");
}

/* --------------------------------- Scoring -------------------------------- */

const STOP = new Set([
  "the", "a", "an", "and", "or", "of", "to", "for", "in", "on", "with", "your",
  "you", "it", "is", "are", "be", "this", "that", "what", "how", "more", "less",
  "than", "into", "over", "not", "but", "can", "could", "may", "might", "own",
  "one", "feel", "feels", "want", "wants", "matters", "matter",
]);

function tokens(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .match(/[a-z]+/g)
    ?.filter((t) => t.length > 2 && !STOP.has(t)) ?? [];
}

function overlap(a: string[], b: string[]): number {
  if (!a.length) return 0;
  let hit = 0;
  for (const t of a) if (b.some((u) => u === t || u.startsWith(t) || t.startsWith(u))) hit++;
  return hit / a.length;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Affinity of an archetype to the ranked value tags (0–1). */
function archetypeFit(arch: Archetype, ranked: ValueTag[]): number {
  if (!ranked.length) {
    return clamp((arch.valueAffinity.open ?? 0) / 3, 0.3, 0.85);
  }
  const d0 = ranked[0];
  const d1 = ranked[1];
  const a0 = arch.valueAffinity[d0] ?? 0;
  const a1 = d1 ? arch.valueAffinity[d1] ?? 0 : 0;
  return clamp((a0 * 1.0 + a1 * 0.6) / (3 * 1.6), 0, 1);
}

interface Scored {
  score: number;
  band: RouteCandidate["scoreBand"];
  breakdown: RouteScoreBreakdown;
  relevance: number;
}

function scoreArchetype(
  arch: Archetype,
  state: JourneyState,
  ranked: ValueTag[],
  curatedCount: number,
): Scored {
  const userInputCount = userInputsFor(state).length;
  const routeArchetypeFit = archetypeFit(arch, ranked);

  const stateValueTokens = tokens(
    [...state.discoveredValues, ...state.possibleRouteHints, ...state.identitySignals].join(" "),
  );
  const archTokens = tokens(
    `${arch.title} ${arch.optimizesFor} ${arch.shortDescription} ${arch.gains.join(" ")}`,
  );
  const rawValueMatch = stateValueTokens.length ? overlap(stateValueTokens, archTokens) : 0.5;
  const valueMatch = clamp(0.45 * rawValueMatch + 0.55 * routeArchetypeFit, 0, 1);

  const constraintTokens = tokens(state.constraints.join(" "));
  const threat = constraintTokens.length ? overlap(constraintTokens, tokens(arch.keyRisks.join(" "))) : 0;
  const revBase = arch.reversibility === "High" ? 0.85 : arch.reversibility === "Medium" ? 0.7 : 0.5;
  const riskDrag = state.constraints.length && arch.risk === "High" ? 0.12 : 0;
  const constraintFit = clamp(revBase - threat * 0.4 - riskDrag, 0.2, 1);

  const curatedEvidenceSupport = clamp(0.2 + curatedCount * 0.3 + userInputCount * 0.08, 0, 1);

  const uncertaintyPenalty = clamp(
    (arch.confidence === "Low" ? 0.4 : arch.confidence === "Medium" ? 0.2 : 0.08) +
      (state.uncertaintyTags.length ? 0.08 : 0) +
      (curatedCount === 0 ? 0.2 : 0),
    0,
    1,
  );

  const inferencePenalty = clamp(arch.aiInferredAssumptions.length * 0.18, 0, 0.5);

  const raw =
    valueMatch * 0.3 +
    constraintFit * 0.2 +
    routeArchetypeFit * 0.25 +
    curatedEvidenceSupport * 0.25 -
    uncertaintyPenalty * 0.15 -
    inferencePenalty * 0.1;

  const score = clamp(Math.round(clamp(raw, 0, 1) * 100), 28, 94);
  const band = score >= 66 ? "Strong" : score >= 45 ? "Moderate" : "Loose";
  const relevance = clamp(routeArchetypeFit * 0.6 + valueMatch * 0.4, 0, 1);

  return {
    score,
    band,
    breakdown: {
      valueMatch: round2(valueMatch),
      constraintFit: round2(constraintFit),
      routeArchetypeFit: round2(routeArchetypeFit),
      curatedEvidenceSupport: round2(curatedEvidenceSupport),
      uncertaintyPenalty: round2(uncertaintyPenalty),
      inferencePenalty: round2(inferencePenalty),
    },
    relevance,
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Honest, journey-specific user-input signals shaping a route. */
function userInputsFor(state: JourneyState): string[] {
  const out: string[] = [];
  for (const v of state.discoveredValues.slice(0, 2)) out.push(`You weighted ${v}`);
  if (state.timeHorizon) out.push(`Your framing over roughly ${state.timeHorizon}`);
  if (state.constraints[0]) out.push(state.constraints[0]);
  if (!out.length && state.riskTolerance) out.push(`Your read on risk: ${state.riskTolerance}`);
  if (!out.length) out.push("Your answers across the journey");
  return out.slice(0, 4);
}

function rationaleFor(
  arch: Archetype,
  state: JourneyState,
  userInputs: string[],
  curatedReferences: string[],
): RouteScoreRationale {
  return {
    strongestUserSignal:
      state.discoveredValues[0] ? `You weighted ${state.discoveredValues[0]}` : userInputs[0],
    strongestReferenceSupport:
      curatedReferences[0] ??
      "No curated source applies directly — this route leans on your answers and flagged assumptions",
    biggestUncertainty: arch.uncertainty,
    aiInferredAssumption:
      arch.aiInferredAssumptions[0] ?? "No hard assumption flagged — this is a reasonable read of your answers.",
  };
}

/* --------------------------- Candidate assembly --------------------------- */

function buildCandidate(
  arch: Archetype,
  state: JourneyState,
  ranked: ValueTag[],
  careerShaped: boolean,
): RouteCandidate {
  const userInputs = userInputsFor(state);
  // Resolve + gate the curated evidence cards this route actually leans on.
  const cards = evidenceCardsForIds(arch.evidenceCardIds, careerShaped);
  const curatedReferences = cards.map((c) => c.sourceName);
  const sc = scoreArchetype(arch, state, ranked, cards.length);
  return {
    id: arch.id,
    archetype: arch.archetype,
    title: arch.title,
    shortDescription: arch.shortDescription,
    coreIdea: arch.coreIdea,
    whyItMakesSense: arch.whyItMakesSense,
    bestFitUser: arch.bestFitUser,
    assumptions: arch.assumptions,
    gains: arch.gains,
    givesUp: arch.givesUp,
    hiddenTradeoffs: arch.hiddenTradeoffs,
    opportunityCost: arch.opportunityCost,
    sevenDayActionPlan: arch.sevenDayActionPlan,
    thirtyDayActionPlan: arch.thirtyDayActionPlan,
    ninetyDayDirection: arch.ninetyDayDirection,
    lowCostExperiment: arch.lowCostExperiment,
    keyRisks: arch.keyRisks,
    earlyWarningSigns: arch.earlyWarningSigns,
    resourcesNeeded: arch.resourcesNeeded,
    emotionalFriction: arch.emotionalFriction,
    confidenceLevel: arch.confidence,
    uncertainty: arch.uncertainty,
    evidenceSupport: {
      userInputs,
      curatedReferences,
      aiInferredAssumptions: arch.aiInferredAssumptions,
    },
    evidenceCardIds: cards.map((c) => c.id),
    risk: arch.risk,
    reversibility: arch.reversibility,
    timeHorizon: arch.timeHorizon,
    evidenceFitScore: sc.score,
    scoreBand: sc.band,
    scoreBreakdown: sc.breakdown,
    scoreRationale: rationaleFor(arch, state, userInputs, curatedReferences),
    isPrimaryRoute: false,
  };
}

/* ------------------------------ Universe build ---------------------------- */

/** Archetypes that guarantee genuine contrast in every universe (always surfaced). */
const SPINE_IDS = ["conservative-anchor", "ambitious-sprint", "experimental-probe", "hybrid-signal"];
/** How many candidates the route universe surfaces — kept stable for the demo. */
const UNIVERSE_TARGET = 8;
/** Number of route candidates the universe surfaces (8 from a library of 10). */
export const ROUTE_UNIVERSE_SIZE = UNIVERSE_TARGET;

export interface RouteUniverse {
  universe: RouteCandidate[];
  primarySelection: PrimarySelection;
  decision: string;
  coreQuestion: string;
  valueConflict: string;
}

/**
 * Build the route universe (8 distinct candidates surfaced from the 10-archetype
 * library), choose the three sharpest-contrast primary routes, and frame the
 * underlying fork.
 */
export function buildRouteUniverse(
  situation: string,
  answers: QuestionAnswer[],
  state: JourneyState,
): RouteUniverse {
  const ranked = rankTags(state, answers);
  const dominant = dominantTag(state, answers);
  const careerShaped = isCareerShaped(situation, state);

  // Build every candidate, then surface a stable-size portfolio: the contrast
  // spine is always present (so the three primary roles can always be filled),
  // filled out with the most relevant remaining archetypes, and ordered by
  // evidence-fit so the strongest matches for this journey read first.
  const all = ARCHETYPES.map((a) => buildCandidate(a, state, ranked, careerShaped));
  const target = clamp(UNIVERSE_TARGET, 6, ARCHETYPES.length);
  const spine = all.filter((c) => SPINE_IDS.includes(c.id));
  const rest = all
    .filter((c) => !SPINE_IDS.includes(c.id))
    .sort((a, b) => b.evidenceFitScore - a.evidenceFitScore);
  const chosen = [...spine];
  for (const c of rest) {
    if (chosen.length >= target) break;
    chosen.push(c);
  }
  const universe = chosen.sort((a, b) => b.evidenceFitScore - a.evidenceFitScore);

  const primarySelection = selectPrimaryRoutes(universe);
  for (const c of universe) c.isPrimaryRoute = primarySelection.primaryRouteIds.includes(c.id);

  const valuePhrase = state.discoveredValues[0] ?? VALUE_PHRASE[dominant];
  const secondPhrase =
    state.discoveredValues[1] ?? (ranked[1] ? VALUE_PHRASE[ranked[1]] : "a steadier footing");

  return {
    universe,
    primarySelection,
    decision:
      "Over the next chapter, which of these directions do you want to actually try first — knowing you can still revisit the others?",
    coreQuestion: `Underneath the surface choice, you seem to be weighing ${valuePhrase} against ${secondPhrase}.`,
    valueConflict: `A pull toward ${valuePhrase} set against the comfort of ${secondPhrase} — both real, and not fully satisfiable at once.`,
  };
}

/* ----------------------------- Primary selection -------------------------- */

const fitOf = (c: RouteCandidate) => c.evidenceFitScore;

/**
 * Pick the THREE sharpest-comparison routes — not simply the top three scores.
 * The set deliberately spans risk and reversibility: a steadier/stable route, a
 * higher-upside ambitious route, and a reversible or hybrid middle path — then
 * breaks ties by evidence-fit.
 */
export function selectPrimaryRoutes(universe: RouteCandidate[], userPicked?: string[]): PrimarySelection {
  if (userPicked && userPicked.length) {
    const ids = userPicked.filter((id) => universe.some((c) => c.id === id)).slice(0, 3);
    return {
      primaryRouteIds: ids,
      roleNotes: ids.map((id) => {
        const c = universe.find((x) => x.id === id)!;
        return { id, role: c.archetype, why: `You marked this as a primary route to simulate (${c.scoreBand} evidence-fit).` };
      }),
      summary:
        "Your chosen three. The map opens these for deep simulation; the rest stay in the library as routes you can still explore.",
      auto: false,
    };
  }

  const byFit = [...universe].sort((a, b) => fitOf(b) - fitOf(a));
  const pick = (pred: (c: RouteCandidate) => boolean, exclude: Set<string>) =>
    byFit.find((c) => !exclude.has(c.id) && pred(c));

  const chosen: { c: RouteCandidate; role: string; why: string }[] = [];
  const used = new Set<string>();

  const safe =
    pick((c) => c.risk === "Low" && c.reversibility === "High", used) ??
    pick((c) => c.risk === "Low", used) ??
    pick((c) => c.reversibility === "High", used);
  if (safe) {
    chosen.push({ c: safe, role: "Steadier anchor", why: "The lower-risk, more reversible end of the comparison." });
    used.add(safe.id);
  }

  const bold =
    pick((c) => c.risk === "High", used) ??
    pick((c) => c.timeHorizon === "Long", used) ??
    byFit.find((c) => !used.has(c.id));
  if (bold) {
    chosen.push({ c: bold, role: "Higher-upside", why: "The more ambitious, higher-variance end of the comparison." });
    used.add(bold.id);
  }

  const bridge =
    pick((c) => c.id === "hybrid-signal", used) ??
    pick((c) => c.reversibility === "High" && c.risk !== "Low", used) ??
    pick((c) => c.reversibility === "High", used) ??
    byFit.find((c) => !used.has(c.id));
  if (bridge) {
    const isHybrid = bridge.id === "hybrid-signal";
    chosen.push({
      c: bridge,
      role: isHybrid ? "Hybrid middle path" : "Reversible middle path",
      why: isHybrid
        ? "A both/and that braids your strengths rather than choosing between them."
        : "A reversible middle that tests the question before a full commitment.",
    });
    used.add(bridge.id);
  }

  for (const c of byFit) {
    if (chosen.length >= 3) break;
    if (!used.has(c.id)) {
      chosen.push({ c, role: c.archetype, why: `Added by evidence-fit (${c.scoreBand}).` });
      used.add(c.id);
    }
  }

  return {
    primaryRouteIds: chosen.map((x) => x.c.id),
    roleNotes: chosen.map((x) => ({ id: x.c.id, role: x.role, why: x.why })),
    summary:
      "These three are the sharpest comparison set — a steadier route, a higher-upside route, and a reversible or hybrid middle path — chosen to widen the contrast across risk, reversibility, and time horizon, then weighted by evidence-fit. They are routes to test side by side, not a ranking.",
    auto: true,
  };
}

/* ------------------------- Projection to the adapter ---------------------- */

/** Down-project a rich RouteCandidate into the small RevealedPath the adapter expands. */
export function candidateToRevealedPath(c: RouteCandidate): RevealedPath {
  const evidenceNotes: ReferenceNote[] = [
    ...c.evidenceSupport.userInputs.slice(0, 2).map((s) => ({
      label: "What you told us",
      sourceType: "user_answer" as const,
      summary: s,
      usedFor: "Why this route is on the board",
    })),
    ...c.evidenceSupport.curatedReferences.slice(0, 2).map((s) => ({
      label: s,
      sourceType: "curated_reference" as const,
      summary: `${s} — used at framework / occupation level, never as an individual prediction.`,
      usedFor: "Shaping and stress-testing this route",
    })),
    ...c.evidenceSupport.aiInferredAssumptions.slice(0, 1).map((s) => ({
      label: "AI-inferred assumption",
      sourceType: "ai_inferred" as const,
      summary: s,
      usedFor: "Flagged as an assumption to confirm",
    })),
  ];
  return {
    id: c.id,
    title: c.title,
    shortDescription: c.shortDescription,
    whatItOptimizesFor: optimizesPhrase(c),
    whatItRisks: c.keyRisks[0] ?? c.opportunityCost,
    whatYouMightMiss: c.opportunityCost,
    sevenDayTest: c.lowCostExperiment || c.sevenDayActionPlan[0] || "Run one small, reversible test this week.",
    evidenceNotes,
  };
}

/** Short "optimizes for" phrase recovered from the archetype behind a candidate. */
function optimizesPhrase(c: RouteCandidate): string {
  const arch = ARCHETYPES.find((a) => a.id === c.id);
  return arch?.optimizesFor ?? "what this route is built to protect";
}

/** The RevealedPath[] for the chosen primary routes, in primary-selection order. */
export function primaryRevealedPaths(universe: RouteCandidate[], primaryIds: string[]): RevealedPath[] {
  const byId = new Map(universe.map((c) => [c.id, c]));
  return primaryIds
    .map((id) => byId.get(id))
    .filter((c): c is RouteCandidate => !!c)
    .map(candidateToRevealedPath);
}
