"use client";

import { motion } from "framer-motion";
import { BookOpen, BarChart3 } from "lucide-react";
import type { EvidenceCard, BaseRateSignal, SourceType } from "@/lib/types";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { Pill } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";

const SOURCE_LABELS: Record<SourceType, string> = {
  curated_research: "Curated research",
  framework: "Framework",
  labor_market: "Labor-market data",
  user_provided: "You told us",
  ai_inferred: "AI-inferred",
};

/**
 * The evidence layer: curated/keyword-retrieved cards that back the branch, each
 * with a source type and an honest strength rating, plus base-rate signals that
 * are explicitly framed as aggregate patterns — never an individual prediction.
 */
export function EvidenceCards({
  cards,
  baseRateSignals,
}: {
  cards: EvidenceCard[];
  baseRateSignals: BaseRateSignal[];
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Card hover className="h-full">
                <CardBody className="flex h-full flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">
                      <BookOpen className="h-3 w-3" />
                      {SOURCE_LABELS[card.sourceType] ?? card.sourceType}
                    </Badge>
                    <LevelBadge label="Strength" level={card.evidenceStrength} />
                  </div>
                  <CardTitle className="text-sm leading-snug">{card.title}</CardTitle>
                  <p className="text-sm leading-relaxed text-soft/85">{card.content}</p>
                  <div className="mt-auto flex items-center gap-2 pt-1">
                    <Pill className="text-[11px]">{card.category}</Pill>
                  </div>
                  <p className="text-xs leading-relaxed text-mute/90">
                    <span className="font-medium uppercase tracking-wider text-mute/70">
                      Used for ·{" "}
                    </span>
                    {card.usedFor}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {baseRateSignals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <BarChart3 className="h-4 w-4 text-brand-glow" />
            Base-rate signals
          </div>
          <p className="text-xs leading-relaxed text-mute">
            These describe aggregate patterns across many people in similar
            situations. They frame the odds — they are not a prediction about any
            one individual, and your own outcome may differ.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {baseRateSignals.map((signal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Card className="h-full">
                  <CardBody className="flex h-full flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{signal.coverageLevel}</Badge>
                      <LevelBadge label="Confidence" level={signal.confidence} />
                    </div>
                    <p className="text-sm leading-relaxed text-white">{signal.claim}</p>
                    <p className="text-xs leading-relaxed text-mute">
                      <span className="font-medium uppercase tracking-wider text-mute/70">
                        Source ·{" "}
                      </span>
                      {signal.source}
                    </p>
                    <div
                      className={cn(
                        "mt-auto rounded-lg border border-line/50 bg-white/[0.02] px-3 py-2",
                      )}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-mute/70">
                        Limitations ·{" "}
                      </span>
                      <span className="text-xs italic leading-relaxed text-mute/90">
                        {signal.limitations}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
