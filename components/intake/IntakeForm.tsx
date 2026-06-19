"use client";

/**
 * IntakeForm — "decision calibration", not a survey.
 *
 * Collects a full UserContext across grouped, premium sections (The decision /
 * You / Constraints & fears / Timing), can load the Alex demo persona, and on
 * submit seeds the store + fetches clarifying questions before routing to
 * /questions. Everything degrades gracefully to demo data offline.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  Plus,
  X,
  Compass,
  GitFork,
  User,
  ShieldAlert,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import type { ClarifyingQuestion, UserContext, Urgency } from "@/lib/types";
import { URGENCY_LABELS } from "@/lib/types";
import { useForkedStore } from "@/lib/store";
import { DEMO_CONTEXT, DEMO_QUESTIONS } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Section";
import { Divider } from "@/components/ui/Primitives";

/** Local editable shape — list fields kept as newline text for low-friction entry. */
interface DraftState {
  decision: string;
  options: string[];
  major: string;
  skills: string;
  values: string;
  constraints: string;
  fears: string;
  background: string;
  timeHorizon: string;
  urgency: Urgency;
}

const EMPTY_DRAFT: DraftState = {
  decision: "",
  options: ["", "", ""],
  major: "",
  skills: "",
  values: "",
  constraints: "",
  fears: "",
  background: "",
  timeHorizon: "",
  urgency: "exploring",
};

/** Common forks — prefill the decision + routes, then the user edits freely.
 * (Stage 2 adds an AI "suggest my fork" from a messy free-text situation.) */
const FORK_TEMPLATES: { label: string; decision: string; options: string[] }[] = [
  {
    label: "Signal · Building · Depth",
    decision: "Should I focus the next year on building career signal, self-directed building, or academic depth?",
    options: ["Career signal (recruiting / credentials)", "Self-directed building (projects / startup)", "Academic depth (research / grad school)"],
  },
  {
    label: "Stable · Risky · Exploratory",
    decision: "Should I take the stable path, the risky path, or an exploratory path?",
    options: ["Stable path", "Risky path", "Exploratory path"],
  },
  {
    label: "Grad school · Industry · Startup",
    decision: "Should I head to graduate school, into industry, or start a startup?",
    options: ["Graduate school", "Industry", "Startup"],
  },
  {
    label: "Prestige · Fit · Learning",
    decision: "Should I prioritize the prestige opportunity, personal fit, or long-term learning?",
    options: ["Prestige opportunity", "Personal fit", "Long-term learning"],
  },
  {
    label: "Stay · Pivot · Pause",
    decision: "Should I stay the course, pivot, or pause?",
    options: ["Stay the course", "Pivot", "Pause"],
  },
];

/** Each non-empty, trimmed line becomes a list item. */
function linesToItems(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function itemsToLines(items: string[]): string {
  return items.join("\n");
}

export function IntakeForm() {
  const router = useRouter();
  const setContext = useForkedStore((s) => s.setContext);
  const setQuestions = useForkedStore((s) => s.setQuestions);

  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [submitting, setSubmitting] = useState(false);
  const [loadedDemo, setLoadedDemo] = useState(false);

  const update = <K extends keyof DraftState>(key: K, value: DraftState[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setOption = (index: number, value: string) =>
    setDraft((d) => ({
      ...d,
      options: d.options.map((o, i) => (i === index ? value : o)),
    }));

  const addOption = () =>
    setDraft((d) => ({ ...d, options: [...d.options, ""] }));

  const removeOption = (index: number) =>
    setDraft((d) => ({
      ...d,
      // Never drop below two slots — a fork needs at least two paths.
      options:
        d.options.length <= 2
          ? d.options
          : d.options.filter((_, i) => i !== index),
    }));

  const applyTemplate = (t: { decision: string; options: string[] }) =>
    setDraft((d) => ({ ...d, decision: t.decision, options: [...t.options] }));

  const loadDemo = () => {
    setDraft({
      decision: DEMO_CONTEXT.decision,
      options: [...DEMO_CONTEXT.options],
      major: DEMO_CONTEXT.major,
      skills: itemsToLines(DEMO_CONTEXT.skills),
      values: itemsToLines(DEMO_CONTEXT.values),
      constraints: itemsToLines(DEMO_CONTEXT.constraints),
      fears: itemsToLines(DEMO_CONTEXT.fears),
      background: DEMO_CONTEXT.background,
      timeHorizon: DEMO_CONTEXT.timeHorizon,
      urgency: DEMO_CONTEXT.urgency,
    });
    setLoadedDemo(true);
  };

  const cleanOptions = useMemo(
    () => draft.options.map((o) => o.trim()).filter(Boolean),
    [draft.options],
  );

  // Submit requires a framed decision and at least two real options.
  const canSubmit =
    draft.decision.trim().length > 0 && cleanOptions.length >= 2 && !submitting;

  const buildContext = (): UserContext => ({
    decision: draft.decision.trim(),
    options: cleanOptions,
    major: draft.major.trim(),
    skills: linesToItems(draft.skills),
    values: linesToItems(draft.values),
    constraints: linesToItems(draft.constraints),
    fears: linesToItems(draft.fears),
    background: draft.background.trim(),
    timeHorizon: draft.timeHorizon.trim(),
    urgency: draft.urgency,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const ctx = buildContext();
    setContext(ctx);
    setSubmitting(true);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: ctx }),
      });
      if (!res.ok) throw new Error(`questions ${res.status}`);
      const data: { questions?: ClarifyingQuestion[] } = await res.json();
      const questions = data.questions ?? [];
      // Even a 200 could in theory be empty — fall back so the flow never stalls.
      setQuestions(questions.length ? questions : stripAnswers(DEMO_QUESTIONS));
    } catch {
      // Offline / route error: degrade to demo clarifiers, unanswered.
      setQuestions(stripAnswers(DEMO_QUESTIONS));
    } finally {
      router.push("/questions");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Demo loader — premium, prominent, optional. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand/30 bg-brand/10 text-brand-glow">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-medium text-white">
                  First time here? Load the Alex demo
                </div>
                <div className="text-sm text-mute">
                  Fills every field with a worked example — a CS sophomore weighing quant, a startup, and research.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {loadedDemo && (
                <Badge tone="brand">
                  <Sparkles className="h-3 w-3" />
                  Loaded
                </Badge>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadDemo}
              >
                Load the Alex demo
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Guided fork — prefill a common fork, then edit everything below. */}
      <FormGroup
        icon={GitFork}
        eyebrow="Start here"
        title="Pick a common fork — or write your own below"
        delay={0.04}
      >
        <p className="text-sm leading-relaxed text-mute">
          Not sure how to frame it? Start from a common fork — it fills in the
          decision and routes below, and you can edit everything.
        </p>
        <div className="flex flex-wrap gap-2">
          {FORK_TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t)}
              className="rounded-full border border-line/70 bg-white/[0.03] px-3.5 py-1.5 text-sm text-soft transition-colors hover:border-brand/50 hover:text-white"
            >
              {t.label}
            </button>
          ))}
        </div>
      </FormGroup>

      {/* 1 — The decision */}
      <FormGroup
        icon={Compass}
        eyebrow="The decision"
        title="What are you actually choosing between?"
        delay={0.05}
      >
        <Field
          label="The decision"
          hint="Frame it as a question to your future self."
          required
        >
          <Textarea
            value={draft.decision}
            onChange={(v) => update("decision", v)}
            placeholder="After my sophomore year, should I go all-in on quant recruiting, build a startup, or aim for research?"
            rows={3}
          />
        </Field>

        <Field
          label="The options on the table"
          hint="At least two distinct paths. Each becomes one future branch."
          required
        >
          <div className="space-y-2.5">
            {draft.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line/60 bg-white/[0.03] text-xs font-semibold text-mute">
                  {i + 1}
                </span>
                <input
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  disabled={draft.options.length <= 2}
                  aria-label="Remove option"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line/60 text-mute transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center gap-1.5 text-sm text-brand-glow/90 transition-colors hover:text-brand-glow"
            >
              <Plus className="h-4 w-4" />
              Add another option
            </button>
          </div>
        </Field>
      </FormGroup>

      {/* 2 — You */}
      <FormGroup
        icon={User}
        eyebrow="You"
        title="The context only you can give"
        delay={0.1}
      >
        <Field label="Field of study / focus" hint="What you're studying or working in.">
          <input
            value={draft.major}
            onChange={(e) => update("major", e.target.value)}
            placeholder="Computer Science (sophomore)"
            className={inputClass}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Skills & strengths" hint="One per line.">
            <Textarea
              value={draft.skills}
              onChange={(v) => update("skills", v)}
              placeholder={"Strong at algorithms & probability\nShip side projects in TypeScript"}
              rows={5}
            />
          </Field>
          <Field label="What you value" hint="One per line.">
            <Textarea
              value={draft.values}
              onChange={(v) => update("values", v)}
              placeholder={"Long-term optionality\nWork that feels intellectually alive"}
              rows={5}
            />
          </Field>
        </div>

        <Field
          label="Background"
          hint="Anything that shapes how these paths land for you."
        >
          <Textarea
            value={draft.background}
            onChange={(v) => update("background", v)}
            placeholder="First-gen student on scholarship. One SWE internship. A half-built side project. No research experience yet."
            rows={3}
          />
        </Field>
      </FormGroup>

      {/* 3 — Constraints & fears */}
      <FormGroup
        icon={ShieldAlert}
        eyebrow="Constraints & fears"
        title="The things that quietly decide it"
        delay={0.15}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Hard constraints" hint="One per line.">
            <Textarea
              value={draft.constraints}
              onChange={(v) => update("constraints", v)}
              placeholder={"Need a paid internship next summer\n~20 focused hours/week outside coursework"}
              rows={5}
            />
          </Field>
          <Field label="Fears & worries" hint="One per line.">
            <Textarea
              value={draft.fears}
              onChange={(v) => update("fears", v)}
              placeholder={"Picking a path and hating it a year in\nClosing doors I can't reopen"}
              rows={5}
            />
          </Field>
        </div>
      </FormGroup>

      {/* 4 — Timing */}
      <FormGroup
        icon={Clock}
        eyebrow="Timing"
        title="How much runway you have"
        delay={0.2}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Time horizon" hint="The window this decision plays out over.">
            <input
              value={draft.timeHorizon}
              onChange={(e) => update("timeHorizon", e.target.value)}
              placeholder="12 months (decide before junior-year recruiting)"
              className={inputClass}
            />
          </Field>
          <Field label="Urgency" hint="How close you are to choosing.">
            <select
              value={draft.urgency}
              onChange={(e) => update("urgency", e.target.value as Urgency)}
              className={cn(inputClass, "appearance-none pr-9")}
            >
              {(Object.keys(URGENCY_LABELS) as Urgency[]).map((u) => (
                <option key={u} value={u} className="bg-panel text-white">
                  {URGENCY_LABELS[u]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormGroup>

      {/* Submit */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-mute">
            {canSubmit
              ? "Next, the system may ask a few clarifying questions before opening your futures."
              : "Add a decision and at least two options to continue."}
          </div>
          <Button type="submit" size="lg" disabled={!canSubmit}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Calibrating…
              </>
            ) : (
              <>
                Calibrate my decision
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}

/** Drop persisted demo answers so clarifiers arrive unanswered on fallback. */
function stripAnswers(qs: ClarifyingQuestion[]): ClarifyingQuestion[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return qs.map(({ answer, ...q }) => q);
}

/* ---------- presentational helpers ---------- */

const inputClass =
  "w-full rounded-lg border border-line/70 bg-void/40 px-3.5 py-2.5 text-sm text-white placeholder:text-mute/60 outline-none transition-colors focus:border-brand/50 focus:bg-void/60";

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(inputClass, "resize-y leading-relaxed")}
    />
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-soft">
          {label}
          {required && <span className="ml-1 text-brand-glow">*</span>}
        </label>
        {hint && <span className="text-xs text-mute/80">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function FormGroup({
  icon: Icon,
  eyebrow,
  title,
  children,
  delay = 0,
}: {
  icon: typeof Compass;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card>
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line/60 bg-white/[0.03] text-brand-glow/80">
              <Icon className="h-4 w-4" />
            </span>
            <div className="space-y-1">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h3 className="text-base font-semibold tracking-tight text-white">
                {title}
              </h3>
            </div>
          </div>
          <Divider />
          <div className="space-y-5">{children}</div>
        </div>
      </Card>
    </motion.div>
  );
}
