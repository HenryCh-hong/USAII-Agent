/**
 * Route universe — the "Possible Futures Library".
 *
 * Real decisions rarely have exactly three choices. This module turns the
 * journey into a PORTFOLIO of 6–10 meaningfully distinct route candidates, each
 * carrying full micro-level decision-review data (PART 4/6), then selects three
 * as the sharpest comparison set for deep simulation. Everything is deterministic
 * and mock-first (no API key, no live web): archetype templates are SELECTED,
 * SCORED, and lightly framed against the user's inferred journey signal.
 *
 * Honesty is structural:
 *  - The evidence-fit score is a transparent MATCH score (PART 7) computed in
 *    code — never a probability of success, never a forecast.
 *  - Every evidence item is split by provenance: user inputs, curated/reference
 *    framings, and clearly-flagged AI-inferred assumptions (PART 8). An inference
 *    is never presented as a citation.
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
  curatedReferences: string[];
  aiInferredAssumptions: string[];

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
      "Move deliberately: lock in one stable, recognizable footing before expanding, so later moves are made from strength rather than pressure.",
    optimizesFor: "a stable, legible footing others can recognize quickly",
    coreIdea:
      "Reduce downside first. Secure a footing — an offer, a credential, a runway — that makes every later bet optional rather than forced.",
    whyItMakesSense:
      "When a stable footing recurs in your answers, protecting it tends to lower the cost of every other path, because you stop deciding from scarcity.",
    bestFitUser:
      "Someone who values a clear footing and would rather expand from a secure base than gamble the base itself.",
    assumptions: [
      "A stable footing is available to you within this window.",
      "Moving deliberately now does not quietly foreclose a rare opportunity.",
    ],
    gains: [
      "A floor under your finances and your attention",
      "Room to take real risks later without panic",
      "A legible signal others read quickly",
    ],
    givesUp: [
      "Some near-term upside and optionality",
      "The compounding edge of an early, concentrated bet",
    ],
    hiddenTradeoffs: [
      "Stability can quietly harden into staying put past the point it still serves you",
    ],
    opportunityCost:
      "The asymmetric upside of committing early to a bolder, less legible path while the window is open.",
    sevenDayActionPlan: [
      "Name the single footing that would most lower your background stress.",
      "List the two or three concrete steps that secure it.",
      "Take the first reversible step toward it this week.",
    ],
    thirtyDayActionPlan: [
      "Secure or substantially de-risk that footing.",
      "Write the explicit condition under which you would expand beyond it.",
    ],
    ninetyDayDirection:
      "Operate from the secured base and begin one small, deliberate expansion once the floor is genuinely solid.",
    lowCostExperiment:
      "Spend a week acting as if the stable footing were already chosen, and notice whether you feel steadier or quietly boxed in.",
    keyRisks: [
      "Narrowing too early and treating safety as the only goal",
      "Mistaking comfort for a finished decision",
    ],
    earlyWarningSigns: [
      "You keep deferring the expansion step you wrote down",
      "The footing feels less like a base and more like a ceiling",
    ],
    resourcesNeeded: [
      "A clear read on which footing is actually available",
      "A small time buffer to secure it without rushing",
    ],
    emotionalFriction:
      "The quiet worry that playing it safe is its own kind of risk — that steadiness costs you a window you cannot reopen.",
    confidence: "Medium",
    uncertainty:
      "Whether the footing you would secure is the one that actually frees you, or just the one that is easiest to reach.",
    curatedReferences: [
      "Reversibility / option-value framing",
      "U.S. Bureau of Labor Statistics — Occupational Outlook Handbook (occupation-level)",
    ],
    aiInferredAssumptions: [
      "That a stable footing reduces, rather than delays, your core tension — an assumption to confirm.",
    ],
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
      "Hold a recognizable main track for stability while running one genuine side bet, so you build a floor and an option at the same time.",
    optimizesFor: "a floor and an option held at once",
    coreIdea:
      "Split your energy on purpose: a legible main track carries the floor, while a single real side bet keeps a higher-upside door open.",
    whyItMakesSense:
      "When your answers read as genuinely split, a deliberate split tends to buy information about both directions before you have to commit to either.",
    bestFitUser:
      "Someone who can protect focus on two fronts and would rather learn from both directions than guess between them.",
    assumptions: [
      "You have enough bandwidth to run a main track and one side bet without doing both poorly.",
      "The side bet is real enough to teach you something, not a hobby in disguise.",
    ],
    gains: [
      "A stable floor while a higher-upside option stays open",
      "Real signal from both directions before committing",
      "A natural hedge if one track stalls",
    ],
    givesUp: [
      "The depth that comes from full concentration on one path",
      "Some speed on each front",
    ],
    hiddenTradeoffs: [
      "Two half-commitments can feel like motion while quietly avoiding the harder choice",
    ],
    opportunityCost:
      "The compounding focus of going all-in on the single track that energizes you most.",
    sevenDayActionPlan: [
      "Name the main track and the one side bet worth real hours.",
      "Block protected time for each so neither bleaks into the other.",
      "Define what a strong week looks like on both.",
    ],
    thirtyDayActionPlan: [
      "Ship one concrete result on each track.",
      "Compare which one you protected time for when the week got tight.",
    ],
    ninetyDayDirection:
      "Let the track you instinctively defended earn more of your time, and taper the other rather than dropping it abruptly.",
    lowCostExperiment:
      "For one week, log which track you reach for first when you have a free hour — the pull is data about where your commitment already lives.",
    keyRisks: [
      "Spreading thin and progressing slowly on both fronts",
      "Using the split to postpone a decision you have already half-made",
    ],
    earlyWarningSigns: [
      "Both tracks keep slipping their protected time",
      "You feel busy but cannot point to real progress on either",
    ],
    resourcesNeeded: [
      "Enough weekly hours to give each track a real shot",
      "A simple way to track progress on both",
    ],
    emotionalFriction:
      "The discomfort of not fully committing — the nagging sense that holding two doors open is the same as deciding nothing.",
    confidence: "Medium",
    uncertainty:
      "Whether you have the bandwidth for two real tracks, or whether the split quietly halves both.",
    curatedReferences: [
      "Barbell / floor-and-upside risk framing",
      "Information-value (value-of-information) framing",
    ],
    aiInferredAssumptions: [
      "That your answers are still genuinely split rather than already leaning — confirm by watching where your hours go.",
    ],
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
      "Stop hedging for a defined window. Put your best hours into the one track with the steepest upside and let focus compound.",
    whyItMakesSense:
      "When growth and momentum dominate your answers, concentration tends to compound faster than a spread bet — depth is hard to fake and hard to copy.",
    bestFitUser:
      "Someone with a clear favorite who is held back more by hedging than by the path itself.",
    assumptions: [
      "One track genuinely has more upside for you than the others.",
      "You can protect a concentrated block of effort without burning out.",
    ],
    gains: [
      "Compounding depth and visible momentum",
      "A sharper, more distinctive signal",
      "Faster, clearer feedback on whether the track is right",
    ],
    givesUp: [
      "The safety of a hedge if the track disappoints",
      "Breadth across other directions",
    ],
    hiddenTradeoffs: [
      "Concentrated effort raises the cost of being wrong about which track to concentrate on",
    ],
    opportunityCost:
      "The optionality and floor you would keep by spreading your effort more cautiously.",
    sevenDayActionPlan: [
      "Commit to one track out loud and set the length of the push.",
      "Clear two competing obligations off your week.",
      "Produce one real artifact on the chosen track.",
    ],
    thirtyDayActionPlan: [
      "Stack four weeks of focused output and show it to people in that world.",
      "Note where the work energizes you and where it grinds.",
    ],
    ninetyDayDirection:
      "Reassess at the end of the push with real output in hand, and decide whether to extend, pivot, or bank the momentum.",
    lowCostExperiment:
      "Run a single concentrated week on the track and measure output and energy against a normal hedged week.",
    keyRisks: [
      "Concentrating on the wrong track and feeling the cost sharply",
      "Burnout from an unsustainable pace",
    ],
    earlyWarningSigns: [
      "Output rises but energy keeps falling week over week",
      "You are defending the choice to others more than enjoying the work",
    ],
    resourcesNeeded: [
      "A protected block of focused time",
      "One or two people in that world who will react honestly to your output",
    ],
    emotionalFriction:
      "The exposure of going all-in — without a hedge, a disappointing result lands directly and personally.",
    confidence: "Medium",
    uncertainty:
      "Whether the track you would concentrate on is genuinely your highest-upside one, or just the loudest right now.",
    curatedReferences: [
      "Deliberate-practice / skill-compounding framing",
      "Decision-science premortem framing",
    ],
    aiInferredAssumptions: [
      "That concentration suits your temperament more than hedging does — an assumption worth testing for a week.",
    ],
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
      "Before committing, run a tightly time-boxed, fully reversible experiment across your two strongest directions and let the results, not the guess, decide.",
    optimizesFor: "resolving the core uncertainty cheaply before it gets expensive",
    coreIdea:
      "Buy information instead of buying certainty. Give each leading direction a real, comparable task for a fixed window, then read the signal.",
    whyItMakesSense:
      "When deciding now is costly and a cheap test exists, a reversible probe tends to replace one big guess with two small pieces of real evidence.",
    bestFitUser:
      "Someone stuck between two strong directions who learns more by doing a little of each than by deliberating further.",
    assumptions: [
      "A small, comparable test of each direction is genuinely possible in 30 days.",
      "A short trial produces signal that generalizes, rather than noise.",
    ],
    gains: [
      "Real evidence about each direction at low cost",
      "A bounded, fully reversible commitment",
      "A decision made on signal rather than a guess",
    ],
    givesUp: [
      "A month of fully concentrated progress on one path",
      "The clarity that comes from committing outright",
    ],
    hiddenTradeoffs: [
      "A test designed loosely can confirm whatever you already wanted to believe",
    ],
    opportunityCost:
      "The head start you would have by committing now to the direction you already lean toward.",
    sevenDayActionPlan: [
      "Write the one falsifiable thing each direction has to show you.",
      "Design a small, comparable task for each.",
      "Start the first task and timestamp it.",
    ],
    thirtyDayActionPlan: [
      "Run both tasks to completion under the same effort budget.",
      "Score each against the falsifiable thing you wrote, not against your mood.",
    ],
    ninetyDayDirection:
      "Commit to whichever direction the evidence favored and fold the runner-up into a smaller ongoing bet or set it down.",
    lowCostExperiment:
      "Give each of your two leading directions one real, comparable task this week and note which one you protected time for.",
    keyRisks: [
      "Designing the test to confirm a foregone conclusion",
      "Letting the experiment drift into open-ended avoidance",
    ],
    earlyWarningSigns: [
      "The 30-day window keeps quietly extending",
      "You are collecting activity rather than answering the question you wrote down",
    ],
    resourcesNeeded: [
      "A falsifiable question for each direction",
      "A fixed end date and a way to score the result",
    ],
    emotionalFriction:
      "The restlessness of deliberately not committing yet — running a test can feel like stalling, even when it is the cheaper way to learn.",
    confidence: "Medium",
    uncertainty:
      "Whether a 30-day probe is long enough to produce signal that holds, or just a snapshot.",
    curatedReferences: [
      "Information-value (value-of-information) framing",
      "Minimum-viable-test (build-measure-learn) framing",
    ],
    aiInferredAssumptions: [
      "That your two directions are testable at small scale — confirm before you design the probe.",
    ],
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
      "Invest first in portable skills and a financial buffer that protect you no matter which direction you take, lowering the stakes of the real choice.",
    optimizesFor: "a portable floor that survives whichever path you choose",
    coreIdea:
      "De-risk the person, not just the path. Build skills and a buffer that travel with you, so any later choice is made from safety rather than fear.",
    whyItMakesSense:
      "When fear of a wrong turn weighs on your answers, a portable floor tends to shrink that fear directly, because the downside of being wrong gets smaller.",
    bestFitUser:
      "Someone whose hesitation comes more from exposure than from confusion about direction.",
    assumptions: [
      "The skills and buffer you build genuinely transfer across your options.",
      "Building the floor does not become a way to delay the real choice indefinitely.",
    ],
    gains: [
      "A safety margin that lowers the stakes of every path",
      "Skills that compound regardless of direction",
      "Calmer, less fear-driven decision-making later",
    ],
    givesUp: [
      "Time that could go straight into a chosen direction",
      "The urgency that sometimes forces a clearer decision",
    ],
    hiddenTradeoffs: [
      "A floor can become a comfortable place to hide from the harder commitment",
    ],
    opportunityCost:
      "Momentum on a specific path you might have built while you were reinforcing the floor.",
    sevenDayActionPlan: [
      "Name the one portable skill that strengthens every option you are weighing.",
      "Name the buffer that would most lower your sense of exposure.",
      "Take one concrete step toward each.",
    ],
    thirtyDayActionPlan: [
      "Make visible progress on the portable skill.",
      "Set a target for the buffer and a date to reassess.",
    ],
    ninetyDayDirection:
      "With the floor in place, make the real directional choice deliberately — from safety, not from scarcity.",
    lowCostExperiment:
      "Spend a week building only the portable skill and notice whether the broader decision feels less frightening afterward.",
    keyRisks: [
      "Treating the floor as the destination instead of the base",
      "Indefinitely postponing the directional choice",
    ],
    earlyWarningSigns: [
      "The floor keeps growing but the real choice never arrives",
      "You feel safe but no closer to a direction",
    ],
    resourcesNeeded: [
      "A clear view of which skills are genuinely portable",
      "A modest, defined savings or time buffer",
    ],
    emotionalFriction:
      "The pull to keep reinforcing the floor because it feels productive, even once it has stopped reducing real risk.",
    confidence: "Medium",
    uncertainty:
      "Whether the floor you build actually transfers across your options, or only to one of them.",
    curatedReferences: [
      "Barbell / floor-and-upside risk framing",
      "Deliberate-practice / skill-compounding framing",
    ],
    aiInferredAssumptions: [
      "That your hesitation is driven by exposure rather than direction — an assumption to check against your own answers.",
    ],
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
      "Isolate the single uncertainty that hurts most and resolve it with one fast, cheap probe this week, rather than carrying it through every other path.",
    optimizesFor: "resolving the single most painful unknown fast",
    coreIdea:
      "Find the one assumption that, if wrong, sinks the most paths — and buy a small piece of real signal on it before anything else.",
    whyItMakesSense:
      "A single binding uncertainty often blocks several routes at once; testing it first tends to unlock more of the map per hour than broad deliberation.",
    bestFitUser:
      "Someone who can feel which unknown is doing the most damage and wants to lance it quickly.",
    assumptions: [
      "One uncertainty is genuinely more binding than the rest.",
      "A small probe can move your belief about it, not just describe it.",
    ],
    gains: [
      "A fast answer to the question blocking the most paths",
      "A very low cost to run it",
      "Clearer footing for every later decision",
    ],
    givesUp: [
      "The breadth of testing several things at once",
      "Any false comfort the unknown was providing",
    ],
    hiddenTradeoffs: [
      "Resolving one unknown can surface a harder one you were not ready to face",
    ],
    opportunityCost:
      "The reassurance of leaving a painful question comfortably unexamined a little longer.",
    sevenDayActionPlan: [
      "Name the single uncertainty that blocks the most paths.",
      "Design the cheapest test that could change your mind about it.",
      "Run it before the week ends.",
    ],
    thirtyDayActionPlan: [
      "Act on what the probe told you about the binding unknown.",
      "Pick the next most painful uncertainty and repeat the move.",
    ],
    ninetyDayDirection:
      "Carry a habit of testing the most binding unknown first, so the map keeps clearing rather than staying fogged.",
    lowCostExperiment:
      "Spend one afternoon getting a single real data point on the unknown that worries you most, then notice how much of the decision shifts.",
    keyRisks: [
      "Testing a comfortable question instead of the binding one",
      "Over-reading a single small result",
    ],
    earlyWarningSigns: [
      "You keep refining the test instead of running it",
      "The probe answered something easy and left the hard part untouched",
    ],
    resourcesNeeded: [
      "Honesty about which unknown actually hurts most",
      "An afternoon and a way to get one real data point",
    ],
    emotionalFriction:
      "The flinch of pointing a test straight at the thing you have been avoiding looking at.",
    confidence: "Medium",
    uncertainty:
      "Whether the unknown that feels most painful is the one that is actually most binding.",
    curatedReferences: [
      "Information-value (value-of-information) framing",
      "Decision-science premortem framing",
    ],
    aiInferredAssumptions: [
      "That a single unknown dominates the decision — confirm by checking how many paths it really blocks.",
    ],
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
      "Choose the direction worth years, not months, and start compounding deliberate depth now — accepting slow early payoff for a hard-to-copy edge later.",
    optimizesFor: "a durable, hard-to-copy depth that compounds over years",
    coreIdea:
      "Play a longer game on purpose. Pick the direction you would still respect in several years and invest in depth that others cannot shortcut.",
    whyItMakesSense:
      "When identity and meaning run through your answers, a long compounding build tends to fit better than a quick win — depth is where distinctiveness accrues.",
    bestFitUser:
      "Someone with a direction that feels like them and the patience to let it compound past the slow early stretch.",
    assumptions: [
      "The direction still fits you years from now, not just today.",
      "You can tolerate a long stretch of slow, illegible early payoff.",
    ],
    gains: [
      "A distinctive, durable edge that is hard to copy",
      "Work that compounds rather than resets",
      "Deep alignment between the path and who you are",
    ],
    givesUp: [
      "Near-term legibility and quick external validation",
      "The flexibility of staying broad and uncommitted",
    ],
    hiddenTradeoffs: [
      "A long commitment made for identity reasons is the hardest to re-examine honestly later",
    ],
    opportunityCost:
      "The faster, more legible wins available on a shorter, more conventional track.",
    sevenDayActionPlan: [
      "Name the direction you would still respect spending years on.",
      "Identify the deep skill at its core that compounds.",
      "Put real hours into the hardest part of that skill this week.",
    ],
    thirtyDayActionPlan: [
      "Build a sustainable weekly rhythm of deep work on the core skill.",
      "Set a checkpoint to re-confirm the direction still fits you.",
    ],
    ninetyDayDirection:
      "Establish the long build as a durable habit, with honest checkpoints that let you re-examine the commitment rather than defend it.",
    lowCostExperiment:
      "Spend a week on the most demanding real problem in that direction and notice, honestly, whether the hard parts energize or drain you.",
    keyRisks: [
      "Committing years to a direction chosen by an old version of you",
      "Mistaking sunk cost for genuine fit as time passes",
    ],
    earlyWarningSigns: [
      "The hard parts consistently drain rather than absorb you",
      "You defend the path by its cost so far rather than its pull",
    ],
    resourcesNeeded: [
      "A sustainable long-term rhythm and patience for slow payoff",
      "Honest checkpoints to re-examine fit over time",
    ],
    emotionalFriction:
      "The loneliness of a slow, illegible early stretch while more conventional paths show visible wins around you.",
    confidence: "Low",
    uncertainty:
      "Whether the direction that fits you now will still fit the person you become over several years.",
    curatedReferences: [
      "Deliberate-practice / skill-compounding framing",
      "U.S. Bureau of Labor Statistics — Occupational Outlook Handbook (occupation-level)",
    ],
    aiInferredAssumptions: [
      "That present identity-fit predicts future fit — a meaningful assumption to revisit at each checkpoint.",
    ],
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
      "Pursue the rare opportunity hard, but decide the exit before you start, so the downside is capped while the upside stays open.",
    whyItMakesSense:
      "When a closing window dominates your answers, a bounded bet tends to resolve the 'what if I had tried' question without the open-ended exposure of an unbounded one.",
    bestFitUser:
      "Someone facing a genuinely time-limited opportunity who can commit hard and still honor a pre-set stop.",
    assumptions: [
      "The window is genuinely rare and time-limited, not a feeling of scarcity.",
      "You can hold to a stop point once you are emotionally invested.",
    ],
    gains: [
      "Exposure to a large, asymmetric upside",
      "A clear answer to the 'what if I had tried' question",
      "A capped downside, because the exit is set in advance",
    ],
    givesUp: [
      "Steadier compounding on a path you could hold for years",
      "Some stability during the bet itself",
    ],
    hiddenTradeoffs: [
      "A pre-set stop is easy to write and hard to honor once you are emotionally committed",
    ],
    opportunityCost:
      "The reliable progress of a calmer path you set aside to take the swing.",
    sevenDayActionPlan: [
      "Write the one falsifiable signal that would prove the window is real.",
      "Set the stop point — the date or condition where you walk away — before committing.",
      "Take the first concrete step toward the bet.",
    ],
    thirtyDayActionPlan: [
      "Pursue the opportunity at full effort while watching for the falsifiable signal.",
      "Check honestly against the stop you set, without moving it.",
    ],
    ninetyDayDirection:
      "Either the signal confirmed the window and you lean further in, or the stop triggered and you exit cleanly with the question answered.",
    lowCostExperiment:
      "Spend the week trying to find the single piece of evidence that the window is real before committing any further to it.",
    keyRisks: [
      "Sinking real time into a window that was less rare than it felt",
      "Quietly moving the stop point once you are invested",
    ],
    earlyWarningSigns: [
      "You find reasons to push the stop date back",
      "The evidence for the window stays a feeling rather than a fact",
    ],
    resourcesNeeded: [
      "A buffer that survives the bet not paying off",
      "A pre-committed, written stop point",
    ],
    emotionalFriction:
      "The high stakes of a public swing, and the discipline it takes to honor a stop you set while calm but reach while invested.",
    confidence: "Low",
    uncertainty:
      "Whether the window is genuinely rare and closing, or a sense of scarcity dressed as a deadline.",
    curatedReferences: [
      "Decision-science premortem framing",
      "Barbell / floor-and-upside risk framing",
    ],
    aiInferredAssumptions: [
      "That the opportunity is genuinely time-limited — the assumption most worth falsifying before you commit.",
    ],
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
      "Treat the choice as a false binary. Build at the intersection of your two strengths, where the combination itself is the edge.",
    whyItMakesSense:
      "When two directions both pull at you, the overlap is often less crowded than either alone — a hybrid tends to convert a hard choice into a distinctive position.",
    bestFitUser:
      "Someone torn between two directions that could reinforce rather than cancel each other.",
    assumptions: [
      "Your two strengths genuinely combine into something more than their sum.",
      "There is a real audience or use for the combination, not just novelty.",
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
      "A combination can read as unfocused to people who only value one of the two strengths",
    ],
    opportunityCost:
      "The straightforward legibility of going deep on one recognizable track.",
    sevenDayActionPlan: [
      "Name the two strengths and the specific point where they intersect.",
      "Sketch one concrete thing that lives at that intersection.",
      "Make a rough first version of it.",
    ],
    thirtyDayActionPlan: [
      "Build a small, real artifact that only the combination makes possible.",
      "Show it to people in each world and note who immediately gets it.",
    ],
    ninetyDayDirection:
      "Sharpen the hybrid into a position you can describe in one line, and double down where the combination clearly lands.",
    lowCostExperiment:
      "Make one small thing this week that only the intersection of your two strengths could produce, and watch whose attention it catches.",
    keyRisks: [
      "Building something that reads as unfocused rather than distinctive",
      "Combining for novelty when there is no real demand for the mix",
    ],
    earlyWarningSigns: [
      "People consistently ask you to pick one of the two instead",
      "The combination interests you but not anyone you show it to",
    ],
    resourcesNeeded: [
      "Genuine competence in both strengths, not just interest",
      "A small audience in each world to react to the combination",
    ],
    emotionalFriction:
      "The unease of not fitting a clean category, and explaining a position that takes a sentence longer than a single track would.",
    confidence: "Medium",
    uncertainty:
      "Whether the intersection of your two strengths has real pull, or is mainly interesting to you.",
    curatedReferences: [
      "Deliberate-practice / skill-compounding framing",
      "Minimum-viable-test (build-measure-learn) framing",
    ],
    aiInferredAssumptions: [
      "That your two strengths are complementary rather than competing for the same hours — an assumption to test with a real artifact.",
    ],
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
      "Separate the path from its friction. Remove the one drag that is coloring everything, then judge the current path on its real merits.",
    whyItMakesSense:
      "Restlessness is sometimes about a fixable irritant rather than the path itself; clearing it first tends to reveal whether the urge to leave is real.",
    bestFitUser:
      "Someone tempted to switch who has not yet separated a genuine misfit from a specific, fixable frustration.",
    assumptions: [
      "A single dominant drag is coloring how you feel about the whole path.",
      "That drag is actually fixable from where you stand.",
    ],
    gains: [
      "A fair test of the current path with the noise removed",
      "Very low cost and almost fully reversible",
      "Clarity on whether the urge to leave is real or situational",
    ],
    givesUp: [
      "The fresh energy and clean slate of a real change",
      "Time, if the path turns out to be a genuine misfit anyway",
    ],
    hiddenTradeoffs: [
      "Optimizing in place can become a reason to stay somewhere you have already outgrown",
    ],
    opportunityCost:
      "The momentum and learning of committing to a genuine change now rather than later.",
    sevenDayActionPlan: [
      "Name the single biggest drag on your current path.",
      "Identify the most direct lever you control to reduce it.",
      "Pull that lever once this week.",
    ],
    thirtyDayActionPlan: [
      "Remove or sharply reduce the main drag.",
      "Re-rate the path now that the loudest friction is gone.",
    ],
    ninetyDayDirection:
      "If the optimized path now feels right, deepen it; if it still feels wrong with the drag gone, treat that as strong evidence to leave.",
    lowCostExperiment:
      "Spend a week with the single biggest irritant removed and notice whether the whole path feels different or the same.",
    keyRisks: [
      "Using optimization to avoid a change you already know you need",
      "Fixing a symptom while the real misfit stays",
    ],
    earlyWarningSigns: [
      "The drag is gone but the restlessness remains",
      "You keep finding new irritants to fix instead of deciding",
    ],
    resourcesNeeded: [
      "Honesty about whether the drag is the real issue",
      "One lever you actually control",
    ],
    emotionalFriction:
      "The suspicion that staying and optimizing is just a comfortable way to avoid a harder, cleaner break.",
    confidence: "Medium",
    uncertainty:
      "Whether your restlessness comes from one fixable drag or from a deeper misfit with the path itself.",
    curatedReferences: [
      "Reversibility / option-value framing",
      "Decision-science premortem framing",
    ],
    aiInferredAssumptions: [
      "That a single fixable drag explains your restlessness — an assumption that the week-long test is designed to check.",
    ],
    risk: "Low",
    reversibility: "High",
    timeHorizon: "Short",
    ambition: "Low",
    frictionLevel: "Low",
    valueAffinity: { security: 2, identity: 2, open: 1 },
  },
];

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

// Tight, occupation-specific keywords — gate occupation-level references (e.g. BLS)
// so they only attach when the user's OWN words frame an occupation/career decision,
// never to a "should I move cities" / "should I end this relationship" one. Only the
// raw situation is tested (not system-generated state, which leans career-ish), and
// generic terms like "work" / "role" / "offer" are deliberately excluded.
const CAREER_RE =
  /\b(job|jobs|career|careers|intern|internship|recruit|quant|startup|start-up|founder|co-?founder|research|researcher|grad school|graduate school|graduat|master'?s|masters|phd|ph\.?d|mba|degree|majoring|major in|employer|employment|salary|wage|promotion|industry|academia|academic|profession|hiring|apprentic|bootcamp|residency|tenure|engineer|developer|analyst|consulting|medical school|law school)\b/i;
const OCCUPATION_REF_RE = /Bureau of Labor Statistics|Occupational Outlook/i;

/** Whether the user's own words frame an occupation/career decision (drives provenance honesty). */
export function isCareerShaped(situation: string, _state?: JourneyState): boolean {
  return CAREER_RE.test(situation || "");
}

/**
 * The curated references actually honest to show for this journey. Occupation-level
 * sources are dropped when the decision is not occupation-shaped — they were never
 * looked up for the user, so they must not appear as per-user reference support.
 */
function curatedFor(arch: Archetype, careerShaped: boolean): string[] {
  const refs = careerShaped
    ? arch.curatedReferences
    : arch.curatedReferences.filter((r) => !OCCUPATION_REF_RE.test(r));
  return refs.length ? refs : ["Decision-science premortem framing"];
}

/** Affinity of an archetype to the ranked value tags (0–1). */
function archetypeFit(arch: Archetype, ranked: ValueTag[]): number {
  if (!ranked.length) {
    // Open journey — favour the flexible, low-commitment archetypes.
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

function scoreArchetype(arch: Archetype, state: JourneyState, ranked: ValueTag[], curated: string[]): Scored {
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

  const curatedEvidenceSupport = clamp(
    0.2 + curated.length * 0.3 + userInputCount * 0.08,
    0,
    1,
  );

  const uncertaintyPenalty = clamp(
    (arch.confidence === "Low" ? 0.4 : arch.confidence === "Medium" ? 0.2 : 0.08) +
      (state.uncertaintyTags.length ? 0.08 : 0) +
      (curated.length === 0 ? 0.2 : 0),
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
  curated: string[],
): RouteScoreRationale {
  return {
    strongestUserSignal:
      state.discoveredValues[0] ? `You weighted ${state.discoveredValues[0]}` : userInputs[0],
    strongestReferenceSupport: curated[0] ?? "Decision-science framing",
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
  const curated = curatedFor(arch, careerShaped);
  const sc = scoreArchetype(arch, state, ranked, curated);
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
      curatedReferences: curated,
      aiInferredAssumptions: arch.aiInferredAssumptions,
    },
    risk: arch.risk,
    reversibility: arch.reversibility,
    timeHorizon: arch.timeHorizon,
    evidenceFitScore: sc.score,
    scoreBand: sc.band,
    scoreBreakdown: sc.breakdown,
    scoreRationale: rationaleFor(arch, state, userInputs, curated),
    isPrimaryRoute: false,
  };
}

/* ------------------------------ Universe build ---------------------------- */

/** Archetypes that guarantee genuine contrast in every universe. */
const SPINE_IDS = ["conservative-anchor", "ambitious-sprint", "experimental-probe", "hybrid-signal"];
const UNIVERSE_TARGET = 8; // within the 6–10 band

export interface RouteUniverse {
  universe: RouteCandidate[];
  primarySelection: PrimarySelection;
  decision: string;
  coreQuestion: string;
  valueConflict: string;
}

/**
 * Build the full route universe (6–10 distinct candidates) for a journey, choose
 * the three sharpest-contrast primary routes, and frame the underlying fork.
 */
export function buildRouteUniverse(
  situation: string,
  answers: QuestionAnswer[],
  state: JourneyState,
): RouteUniverse {
  const ranked = rankTags(state, answers);
  const dominant = dominantTag(state, answers);
  const careerShaped = isCareerShaped(situation, state);

  const all = ARCHETYPES.map((a) => ({
    arch: a,
    scored: scoreArchetype(a, state, ranked, curatedFor(a, careerShaped)),
  }));

  // Portfolio: the contrast spine + the most relevant remaining archetypes.
  const spine = all.filter((x) => SPINE_IDS.includes(x.arch.id));
  const rest = all
    .filter((x) => !SPINE_IDS.includes(x.arch.id))
    .sort((a, b) => b.scored.relevance - a.scored.relevance);

  const target = clamp(UNIVERSE_TARGET, 6, Math.min(10, ARCHETYPES.length));
  const chosenArchs = [...spine.map((x) => x.arch)];
  for (const x of rest) {
    if (chosenArchs.length >= target) break;
    chosenArchs.push(x.arch);
  }

  // Order the universe by evidence-fit so the strongest matches read first.
  const universe = chosenArchs
    .map((a) => buildCandidate(a, state, ranked, careerShaped))
    .sort((a, b) => b.evidenceFitScore - a.evidenceFitScore);

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
  // If the user has explicitly chosen, honour it (capped at three).
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

  // 1) Steadier / lower-risk anchor.
  const safe =
    pick((c) => c.risk === "Low" && c.reversibility === "High", used) ??
    pick((c) => c.risk === "Low", used) ??
    pick((c) => c.reversibility === "High", used);
  if (safe) {
    chosen.push({ c: safe, role: "Steadier anchor", why: "The lower-risk, more reversible end of the comparison." });
    used.add(safe.id);
  }

  // 2) Higher-upside / more ambitious.
  const bold =
    pick((c) => c.risk === "High", used) ??
    pick((c) => c.timeHorizon === "Long", used) ??
    byFit.find((c) => !used.has(c.id));
  if (bold) {
    chosen.push({ c: bold, role: "Higher-upside", why: "The more ambitious, higher-variance end of the comparison." });
    used.add(bold.id);
  }

  // 3) Reversible / hybrid middle path.
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

  // Backfill defensively if any archetype slot came up empty.
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
