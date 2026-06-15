"use client";

import { motion } from "framer-motion";
import { AlertTriangle, OctagonX } from "lucide-react";
import type { FutureBranch } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/Card";

/**
 * A cautionary, hedged premortem. We imagine the path has already failed and
 * reason backward to the most plausible reasons — plus explicit "kill criteria"
 * for when it could make sense to stop. Amber/rose tone signals caution without
 * claiming certainty; these are possible failure modes, not destiny.
 */
export function Premortem({
  premortem,
  killCriteria,
}: {
  premortem: FutureBranch["premortem"];
  killCriteria: FutureBranch["killCriteria"];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="border-startup/30">
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-startup" />
            <h3 className="text-sm font-semibold text-white">
              Imagine it&apos;s 12 months later — and this path failed
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-mute">
            Looking back from that imagined point, these tend to be the most likely
            reasons it could have gone wrong. They are prompts to pre-empt, not
            forecasts.
          </p>
          <ul className="space-y-3">
            {premortem.map((reason, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="flex gap-3 rounded-lg border border-startup/20 bg-startup/[0.04] px-3 py-2.5"
              >
                <span className="mt-0.5 select-none text-startup/80">⚠</span>
                <span className="text-sm leading-relaxed text-soft">{reason}</span>
              </motion.li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card className="border-rose-500/30">
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <OctagonX className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-white">
              Kill criteria — when it may make sense to stop
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-mute">
            Deciding these in advance can protect you from sunk-cost momentum. If
            one of these holds, it could be a signal to pause and reconsider — you
            still hold the call.
          </p>
          <ul className="space-y-3">
            {killCriteria.map((criterion, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="flex gap-3 rounded-lg border border-rose-500/20 bg-rose-500/[0.04] px-3 py-2.5"
              >
                <span className="mt-0.5 select-none text-rose-400/80">✕</span>
                <span className="text-sm leading-relaxed text-soft">{criterion}</span>
              </motion.li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
