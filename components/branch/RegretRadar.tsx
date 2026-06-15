"use client";

import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import type { RegretRadarItem, RegretType } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/Card";
import { LevelBar } from "@/components/ui/Primitives";
import { LevelBadge } from "@/components/shared/LevelBadge";

const REGRET_LABELS: Record<RegretType, string> = {
  action: "Action regret",
  inaction: "Inaction regret",
  identity: "Identity regret",
  financial: "Financial regret",
  relational: "Relational regret",
  opportunity: "Opportunity regret",
};

/**
 * A qualitative regret radar. Each row names a kind of regret this path could
 * surface, with a level bar for relative intensity and a short description. The
 * weighting of regret is deeply personal — only the user can decide how much each
 * one matters, so the system surfaces them rather than scoring them for you.
 */
export function RegretRadar({ items }: { items: RegretRadarItem[] }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="divide-y divide-line/50 p-0">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="grid gap-3 p-5 sm:grid-cols-[200px_1fr] sm:items-start"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Compass className="h-3.5 w-3.5 text-brand-glow/70" />
                  {REGRET_LABELS[item.regretType] ?? item.regretType}
                </div>
                <LevelBadge label="Potential" level={item.level} />
                <LevelBar level={item.level} className="max-w-[180px]" />
              </div>
              <p className="text-sm leading-relaxed text-soft">{item.description}</p>
            </motion.div>
          ))}
        </CardBody>
      </Card>
      <p className="text-xs leading-relaxed text-mute">
        Regret is personal. These levels reflect how prominent each kind of regret
        could be on this path — but how heavily any of them should weigh is
        something only you can judge.
      </p>
    </div>
  );
}
