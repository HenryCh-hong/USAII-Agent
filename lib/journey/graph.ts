/**
 * Decision-graph model + pure horizontal layout.
 *
 * This is the product model for the guided journey: a left-to-right decision
 * GRAPH, not a vertical question timeline. The user walks it node by node. Each
 * answer option is a physical branch; the chosen branch continues forward while
 * the unchosen options remain attached to their fork as greyed "roads not taken";
 * the next question appears farther right; and after the final node the tree fans
 * open into the route universe at the far right.
 *
 * buildDecisionGraph is a PURE function over journey progress — it assigns every
 * node an (x, y) from a simple coordinate model (x = depth · COL_W; y = lane ·
 * LANE_H) so the canvas can be plain absolute-positioned divs + SVG connectors,
 * with no graph library. The canvas (components/journey/DecisionGraphCanvas) is
 * purely presentational over the state this returns.
 */

/* ------------------------------ Coordinate model -------------------------- */

/** Horizontal distance between depths (columns). */
export const COL_W = 300;
/** Vertical distance between lanes for question/choice/ghost nodes. */
export const LANE_H = 96;
/** Tighter vertical step used only for the route-candidate fan (many nodes). */
export const FAN_STEP = 46;
/** Station/question card width (the current question card renders wider). */
export const NODE_W = 196;
/** Left padding before depth 0. */
export const PAD_X = 28;

export type DecisionNodeKind =
  | "origin"
  | "question"
  | "choice"
  | "ghost_choice"
  | "route_universe"
  | "route_candidate"
  | "primary_route";

export type DecisionNodeStatus =
  | "origin"
  | "current"
  | "chosen"
  | "unchosen"
  | "answered"
  | "future"
  | "revealed";

export interface DecisionGraphNode {
  id: string;
  kind: DecisionNodeKind;
  label: string;
  prompt?: string;
  answer?: string;
  questionId?: string;
  parentId?: string;
  status: DecisionNodeStatus;
  depth: number;
  lane: number;
  x: number;
  y: number;
  metadata?: Record<string, unknown>;
}

export type DecisionEdgeStatus = "chosen" | "unchosen" | "future" | "revealed";

export interface DecisionGraphEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  status: DecisionEdgeStatus;
}

export interface DecisionGraphState {
  nodes: DecisionGraphNode[];
  edges: DecisionGraphEdge[];
  currentNodeId: string;
  walkedPath: string[];
}

/* ------------------------------- Builder input ---------------------------- */

/** One committed step on the walked path (its fork, choice, and roads not taken). */
export interface AnsweredStep {
  /** Index-derived step id, e.g. "step-0" (robust even if a model reuses ids). */
  stepId: string;
  /** Short node label for the chosen station. */
  topic: string;
  /** The question prompt that was answered here. */
  prompt: string;
  /** The chosen option label (the branch walked), if a branch was picked. */
  chosen?: string;
  /** A free-text answer, if the user typed their own path. */
  typed?: string;
  /** True when the node was skipped. */
  skipped?: boolean;
  /** The option labels NOT chosen — rendered as greyed unlived branches. */
  unchosen: string[];
}

/** A compact route summary used only to fan the universe open on the map. */
export interface RouteFanItem {
  id: string;
  title: string;
  archetype: string;
  isPrimary: boolean;
}

export interface BuildGraphInput {
  situation: string;
  answered: AnsweredStep[];
  /** Present while a question is live (questions phase). */
  currentTopic?: string | null;
  /** "questions" while walking; "reveal" once the universe is open. */
  phase: "questions" | "reveal";
  /** The route universe, present at reveal — fans open at the far right. */
  routeFan?: RouteFanItem[];
}

/* --------------------------------- helpers -------------------------------- */

const xFor = (depth: number) => PAD_X + depth * COL_W;
const yFor = (lane: number, step = LANE_H) => lane * step;

/** Symmetric lane offsets that skip the center lane: +1, -1, +2, -2, … */
function ghostLanes(n: number): number[] {
  const out: number[] = [];
  for (let i = 1; out.length < n; i++) {
    out.push(i);
    if (out.length < n) out.push(-i);
  }
  return out;
}

function short(s: string, n = 30): string {
  const t = (s || "").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

/* --------------------------------- builder -------------------------------- */

/**
 * Build the full horizontal decision-graph state from journey progress. Pure and
 * deterministic — every node gets an absolute (x, y); the canvas only renders.
 */
export function buildDecisionGraph(input: BuildGraphInput): DecisionGraphState {
  const { situation, answered, currentTopic, phase, routeFan } = input;
  const nodes: DecisionGraphNode[] = [];
  const edges: DecisionGraphEdge[] = [];
  const walkedPath: string[] = [];

  // depth 0 — the origin (the messy situation), far left.
  const originId = "origin";
  nodes.push({
    id: originId,
    kind: "origin",
    label: "Your situation",
    answer: short(situation, 44),
    status: "origin",
    depth: 0,
    lane: 0,
    x: xFor(0),
    y: yFor(0),
  });
  walkedPath.push(originId);

  // Each answered step: chosen station on the center lane + greyed ghosts above/below.
  let forkId = originId;
  answered.forEach((step, i) => {
    const depth = i + 1;
    const choiceId = `choice-${i}`;
    const answerLabel = step.skipped
      ? "skipped"
      : step.chosen || step.typed || "your own words";
    nodes.push({
      id: choiceId,
      kind: "choice",
      label: step.topic,
      prompt: step.prompt,
      answer: short(answerLabel, 34),
      questionId: step.stepId,
      parentId: forkId,
      status: step.skipped ? "answered" : "chosen",
      depth,
      lane: 0,
      x: xFor(depth),
      y: yFor(0),
      metadata: { skipped: step.skipped },
    });
    edges.push({
      id: `e-${forkId}-${choiceId}`,
      from: forkId,
      to: choiceId,
      status: step.skipped ? "future" : "chosen",
    });
    walkedPath.push(choiceId);

    // Roads not taken — stay attached to the fork, greyed, in offset lanes.
    const lanes = ghostLanes(step.unchosen.length);
    step.unchosen.forEach((opt, j) => {
      const ghostId = `ghost-${i}-${j}`;
      const lane = lanes[j];
      nodes.push({
        id: ghostId,
        kind: "ghost_choice",
        label: short(opt, 28),
        parentId: forkId,
        status: "unchosen",
        depth,
        lane,
        x: xFor(depth),
        y: yFor(lane),
      });
      edges.push({
        id: `e-${forkId}-${ghostId}`,
        from: forkId,
        to: ghostId,
        status: "unchosen",
      });
    });

    forkId = choiceId;
  });

  const frontierDepth = answered.length + 1;

  if (phase === "questions") {
    // The live fork — carries the question bubble + interactive branches.
    const currentId = "current";
    nodes.push({
      id: currentId,
      kind: "question",
      label: currentTopic || "Next question",
      parentId: forkId,
      status: "current",
      depth: frontierDepth,
      lane: 0,
      x: xFor(frontierDepth),
      y: yFor(0),
    });
    edges.push({
      id: `e-${forkId}-${currentId}`,
      from: forkId,
      to: currentId,
      status: "chosen",
    });

    // The fog node — the path ahead, still unknown.
    const fogId = "fog";
    nodes.push({
      id: fogId,
      kind: "question",
      label: "the path ahead",
      status: "future",
      depth: frontierDepth + 1,
      lane: 0,
      x: xFor(frontierDepth + 1),
      y: yFor(0),
    });
    edges.push({ id: `e-${currentId}-${fogId}`, from: currentId, to: fogId, status: "future" });

    return { nodes, edges, currentNodeId: currentId, walkedPath };
  }

  // Reveal phase — the tree fans open into the route universe at the far right.
  const fan = routeFan ?? [];
  const universeId = "route-universe";
  nodes.push({
    id: universeId,
    kind: "route_universe",
    label: `${fan.length} possible routes`,
    parentId: forkId,
    status: "revealed",
    depth: frontierDepth,
    lane: 0,
    x: xFor(frontierDepth),
    y: yFor(0),
  });
  edges.push({ id: `e-${forkId}-${universeId}`, from: forkId, to: universeId, status: "revealed" });

  const candDepth = frontierDepth + 1;
  const mid = (fan.length - 1) / 2;
  fan.forEach((r, i) => {
    const lane = i - mid;
    const id = `route-${r.id}`;
    nodes.push({
      id,
      kind: r.isPrimary ? "primary_route" : "route_candidate",
      label: short(r.title, 26),
      parentId: universeId,
      status: "revealed",
      depth: candDepth,
      // Lane stored in FAN_STEP units; bake the tighter step into y directly.
      lane,
      x: xFor(candDepth),
      y: yFor(lane, FAN_STEP),
      metadata: { archetype: r.archetype, isPrimary: r.isPrimary },
    });
    edges.push({
      id: `e-${universeId}-${id}`,
      from: universeId,
      to: id,
      status: "revealed",
    });
  });

  return { nodes, edges, currentNodeId: universeId, walkedPath };
}
