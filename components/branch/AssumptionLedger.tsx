"use client";

import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";
import type { Assumption } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/Card";
import { ClaimTag, ClaimLegend } from "@/components/shared/ClaimTag";
import { LevelBadge } from "@/components/shared/LevelBadge";
import { Divider } from "@/components/ui/Primitives";

/**
 * The responsible-AI centerpiece: every claim that shapes this branch, tagged by
 * provenance (you told us / source-supported / AI-inferred), shown with its
 * confidence and — crucially — a concrete way to test it. Nothing here is
 * presented as fact; assumptions are meant to be replaced with real signal.
 */
export function AssumptionLedger({ assumptions }: { assumptions: Assumption[] }) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-soft/85">
        Every branch rests on assumptions. Rather than hide them, this ledger
        lists each one, tags where it came from, and pairs it with a way to test
        it — so a low-confidence guess can be replaced with real signal before you
        decide.
      </p>

      <Card>
        <CardBody className="space-y-0 p-0">
          {assumptions.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              {i > 0 && <Divider />}
              <div className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-white">{a.claim}</p>
                  <div className="flex items-start gap-2 rounded-lg border border-line/50 bg-white/[0.02] px-3 py-2">
                    <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-glow/70" />
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-mute">
                        How to test ·{" "}
                      </span>
                      <span className="text-xs leading-relaxed text-soft">
                        {a.howToTest}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  <ClaimTag type={a.type} />
                  <LevelBadge label="Confidence" level={a.confidence} />
                </div>
              </div>
            </motion.div>
          ))}
        </CardBody>
      </Card>

      <div className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-mute">
          Where each claim comes from
        </div>
        <ClaimLegend />
      </div>
    </div>
  );
}
