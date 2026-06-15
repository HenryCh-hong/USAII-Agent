"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ShieldOff } from "lucide-react";
import type { FutureBranch, UserContext, ChatMessage } from "@/lib/types";
import { accentClasses, accentForBranch, cn } from "@/lib/utils";
import { useForkedStore } from "@/lib/store";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { Button } from "@/components/ui/Button";

const SUGGESTED_PROMPTS = [
  "What did you underestimate?",
  "What would make this path fail?",
  "What would you regret?",
  "What should I test this week?",
  "What should I know before committing?",
];

/**
 * Future Self chat — a hedged, simulated voice grounded strictly in one branch's
 * assumptions. It rehearses a plausible self on this path; it never predicts and
 * never tells the user what to choose. Conversation lives in the store so it
 * survives navigation, and every failure mode falls back to in-branch material.
 */
export function FutureSelfChat({
  branch,
  context,
  index = 0,
}: {
  branch: FutureBranch;
  context: UserContext;
  index?: number;
}) {
  const accent = accentClasses(accentForBranch(branch.id, index));
  const messages = useForkedStore((s) => s.chats[branch.id]) ?? [];
  const appendChat = useForkedStore((s) => s.appendChat);

  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  // Seed the opening assistant message once, if this branch has no history yet.
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if (messages.length === 0) {
      appendChat(branch.id, {
        role: "assistant",
        content: `Speaking from inside this simulation's assumptions, I'm a rehearsal of who you might be on the ${branch.track} path — not a forecast. Ask me what I underestimated, what would make this fail, what I'd regret, or what to test this week.`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to the newest message / typing indicator.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending]);

  async function send(rawText: string) {
    const text = rawText.trim();
    if (!text || pending) return;

    // Snapshot the history the model should reason over BEFORE we append.
    const history: ChatMessage[] = [...messages];
    appendChat(branch.id, { role: "user", content: text });
    setDraft("");
    setPending(true);

    try {
      const res = await fetch("/api/future-self-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: branch.id,
          branch,
          context,
          history,
          message: text,
        }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data: { reply?: string } = await res.json();
      const reply =
        typeof data.reply === "string" && data.reply.trim().length > 0
          ? data.reply
          : fallbackReply(branch);
      appendChat(branch.id, { role: "assistant", content: reply });
    } catch {
      // Never hard-fail: speak from this branch's own assumptions instead.
      appendChat(branch.id, { role: "assistant", content: fallbackReply(branch) });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <ResponsibleAIBanner variant="compact" />

      {/* Conversation surface */}
      <div className={cn("rounded-2xl border border-line/70 bg-panel/50 backdrop-blur-xl", accent.glow)}>
        <div
          ref={scrollRef}
          className="max-h-[58vh] min-h-[320px] space-y-4 overflow-y-auto p-5 sm:p-6"
        >
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-br-sm bg-white/[0.07] text-white"
                      : cn("rounded-bl-sm border bg-white/[0.02] text-soft", accent.border),
                  )}
                >
                  {m.role === "assistant" && (
                    <div className={cn("mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider", accent.text)}>
                      <Sparkles className="h-3 w-3" />
                      Future Self · {branch.track}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {pending && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className={cn("flex items-center gap-1 rounded-2xl rounded-bl-sm border bg-white/[0.02] px-4 py-3", accent.border)}>
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className={cn("h-1.5 w-1.5 animate-pulse rounded-full", accent.text.replace("text-", "bg-"))}
                    style={{ animationDelay: `${d * 0.15}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Suggested prompt chips */}
        <div className="flex flex-wrap gap-2 border-t border-line/50 px-5 pt-4 sm:px-6">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              disabled={pending}
              onClick={() => send(p)}
              className={cn(
                "rounded-full border border-line/60 bg-white/[0.03] px-3 py-1.5 text-xs text-soft transition-colors hover:text-white disabled:opacity-50",
                "hover:border-brand/40 hover:bg-brand/5",
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input row */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="flex items-center gap-2 p-4 sm:px-6"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask your simulated self anything about this path…"
            className="min-w-0 flex-1 rounded-xl border border-line/70 bg-void/50 px-4 py-2.5 text-sm text-white placeholder:text-mute/70 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <Button type="submit" variant="primary" size="md" disabled={pending || draft.trim().length === 0}>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </form>
      </div>

      {/* Persistent disclaimer near the input */}
      <div className="flex items-start gap-2 px-1 text-xs text-mute">
        <ShieldOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mute/80" />
        <span>
          Future Self speaks from this simulation&apos;s assumptions. It will not tell you what to choose.
        </span>
      </div>
    </div>
  );
}

/** Graceful, in-branch fallback when the API is unreachable — still hedged. */
function fallbackReply(branch: FutureBranch): string {
  const tradeoff = branch.hiddenTradeoffs[0] ?? "a cost that tends to stay hidden until you're committed";
  const experiment =
    branch.sevenDayExperiment[0]?.action ?? "run a small, time-boxed test before committing";
  return `I'm offline from the live model right now, so I can only speak from this branch's own assumptions. On the ${branch.track} path, the thing most easily underestimated may be: ${tradeoff} I'm a rehearsal, not a forecast — so one useful experiment could be to start with the day-1 step this week: ${experiment} That tends to surface whether this path fits before any choice is locked in.`;
}
