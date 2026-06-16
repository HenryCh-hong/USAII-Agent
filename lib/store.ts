"use client";

/**
 * Cross-page state without a backend.
 *
 * Holds the decision context, clarifying questions, the 3-branch simulation,
 * the decision brief, and per-branch Future Self chat histories. Persisted to
 * localStorage so the full journey (Intake → Map → Branch → Chat → Brief)
 * survives refreshes during a demo. No accounts, no server store.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ChatMessage,
  ClarifyingQuestion,
  DecisionBrief,
  FutureBranch,
  SimulationResult,
  UserContext,
} from "./types";

interface ForkedState {
  context: UserContext | null;
  questions: ClarifyingQuestion[];
  simulation: SimulationResult | null;
  brief: DecisionBrief | null;
  chats: Record<string, ChatMessage[]>;
  /** "mock" until a live model has produced a result this session. */
  lastSource: "mock" | "live" | null;

  setContext: (c: UserContext) => void;
  setQuestions: (q: ClarifyingQuestion[]) => void;
  answerQuestion: (id: string, answer: string) => void;
  setSimulation: (s: SimulationResult) => void;
  setBrief: (b: DecisionBrief) => void;
  appendChat: (branchId: string, msg: ChatMessage) => void;
  resetChat: (branchId: string) => void;
  getBranch: (id: string) => FutureBranch | undefined;
  hydrateDemo: (
    context: UserContext,
    questions: ClarifyingQuestion[],
    simulation: SimulationResult,
  ) => void;
  reset: () => void;
}

export const useForkedStore = create<ForkedState>()(
  persist(
    (set, get) => ({
      context: null,
      questions: [],
      simulation: null,
      brief: null,
      chats: {},
      lastSource: null,

      setContext: (context) => set({ context }),
      setQuestions: (questions) => set({ questions }),
      answerQuestion: (id, answer) =>
        set((s) => ({
          questions: s.questions.map((q) =>
            q.id === id ? { ...q, answer } : q,
          ),
        })),
      setSimulation: (simulation) =>
        set({
          simulation,
          lastSource: simulation.mocked ? "mock" : "live",
        }),
      setBrief: (brief) => set({ brief }),
      appendChat: (branchId, msg) =>
        set((s) => ({
          chats: {
            ...s.chats,
            [branchId]: [...(s.chats[branchId] ?? []), msg],
          },
        })),
      resetChat: (branchId) =>
        set((s) => ({ chats: { ...s.chats, [branchId]: [] } })),
      getBranch: (id) => get().simulation?.branches.find((b) => b.id === id),
      hydrateDemo: (context, questions, simulation) =>
        set({
          context,
          questions,
          simulation,
          lastSource: simulation.mocked ? "mock" : "live",
        }),
      reset: () =>
        set({
          context: null,
          questions: [],
          simulation: null,
          brief: null,
          chats: {},
          lastSource: null,
        }),
    }),
    {
      // Bumped v1 -> v2: branches now carry optional agentReview / audit-trail /
      // evidence-graph fields. A fresh key forces clean re-hydration so cached
      // sessions never render half-populated v2 panels.
      name: "forked-futures-v2",
      partialize: (s) => ({
        context: s.context,
        questions: s.questions,
        simulation: s.simulation,
        brief: s.brief,
        chats: s.chats,
        lastSource: s.lastSource,
      }),
    },
  ),
);
