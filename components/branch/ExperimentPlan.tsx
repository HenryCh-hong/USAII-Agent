"use client";

import { motion } from "framer-motion";
import { FlaskConical, TrendingUp, HeartPulse, Construction } from "lucide-react";
import type { FutureBranch } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/Card";
import { BulletList, Stat } from "@/components/ui/Primitives";
import { accentClasses, cn, type BranchAccent } from "@/lib/utils";

/**
 * A concrete 7-day experiment plus the context that makes it worth running:
 * skill compounding, emotional load, and current bottlenecks. The framing is
 * deliberate — one useful experiment could replace an assumption with real
 * signal before any commitment is made.
 */
export function ExperimentPlan({
  steps,
  skillCompounding,
  emotionalLoad,
  bottlenecks,
  accentKey,
}: {
  steps: FutureBranch["sevenDayExperiment"];
  skillCompounding: string;
  emotionalLoad: string;
  bottlenecks: string[];
  accentKey: BranchAccent;
}) {
  const accent = accentClasses(accentKey);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <Card className={cn(accent.glow)}>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <FlaskConical className={cn("h-4 w-4", accent.text)} />
            <h3 className="text-sm font-semibold text-white">
              A 7-day experiment you could run
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-mute">
            One useful experiment could be the cheapest way to turn a guess into
            evidence. The goal isn&apos;t to commit to this path — it&apos;s to
            replace one assumption with real signal before you decide.
          </p>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <motion.li
                key={step.day}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className="flex gap-3"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    accent.border,
                    accent.bg,
                    accent.text,
                  )}
                >
                  {step.day}
                </span>
                <div className="space-y-0.5 pt-0.5">
                  <p className="text-sm leading-snug text-white">{step.action}</p>
                  <p className="text-xs leading-relaxed text-mute">{step.purpose}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </CardBody>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardBody className="space-y-4">
            <Stat
              label="Skill compounding"
              value={
                <span className="flex items-start gap-2">
                  <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-quant" />
                  <span className="font-normal text-soft">{skillCompounding}</span>
                </span>
              }
            />
            <Stat
              label="Emotional load"
              value={
                <span className="flex items-start gap-2">
                  <HeartPulse className="mt-0.5 h-3.5 w-3.5 shrink-0 text-research" />
                  <span className="font-normal text-soft">{emotionalLoad}</span>
                </span>
              }
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Construction className="h-3.5 w-3.5 text-startup" />
              Current bottlenecks
            </div>
            <BulletList items={bottlenecks} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
