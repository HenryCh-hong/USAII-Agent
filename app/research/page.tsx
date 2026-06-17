"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Telescope, Sparkles, Loader2 } from "lucide-react";
import { TopNav } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { ResearchConsole } from "@/components/research/ResearchConsole";
import { FutureRunTimeline } from "@/components/shared/FutureRunTimeline";
import { useForkedStore } from "@/lib/store";
import { useEnsureSimulation, useHydrated } from "@/lib/hooks";
import type { ResearchDossier } from "@/lib/research/types";

export default function ResearchPage() {
  const hydrated = useHydrated();
  useEnsureSimulation();
  const simulation = useForkedStore((s) => s.simulation);
  const context = useForkedStore((s) => s.context);

  const [dossier, setDossier] = useState<ResearchDossier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated || !simulation) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: context ?? simulation.context,
            branches: simulation.branches,
          }),
        });
        const data = await res.json();
        if (!cancelled && data?.dossier) setDossier(data.dossier as ResearchDossier);
      } catch {
        /* mock fallback is server-side; nothing to do client-side */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, simulation]);

  if (!hydrated || !simulation) {
    return (
      <main className="min-h-screen">
        <AmbientBackground />
        <TopNav />
        <Section className="py-24 text-center text-mute">Opening the research console…</Section>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      <AmbientBackground />
      <TopNav />

      <Section className="pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            eyebrow="Explore · the evidence behind your futures"
            title="Explore the evidence behind your futures"
            subtitle={simulation.context.decision}
          />
          <Badge tone={dossier && !dossier.mocked ? "brand" : "neutral"}>
            <Sparkles className="h-3 w-3" />
            {dossier ? (dossier.mocked ? "Mock corpus (no key)" : `Live · ${dossier.provider}`) : "Exploring"}
          </Badge>
        </div>
      </Section>

      <Section className="pt-6">
        <FutureRunTimeline current="Inspect the evidence trail" />
      </Section>

      <Section className="pt-6">
        <ResponsibleAIBanner />
      </Section>

      <Section className="pt-8">
        {loading || !dossier ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-line/60 bg-panel/40 p-16 text-center backdrop-blur-xl">
            <Loader2 className="h-6 w-6 animate-spin text-brand-glow" />
            <div className="text-sm font-medium text-white">Exploring the evidence…</div>
            <div className="mono-label">planning searches · gathering clues · weighing reliability · drawing path echoes</div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <ResearchConsole dossier={dossier} />
          </motion.div>
        )}
      </Section>

      <Section className="pt-10">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line/60 bg-panel/50 p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-medium text-white">Research feeds the futures — it doesn&apos;t decide them.</div>
            <div className="text-sm text-mute">
              Compare the three futures, or fold this evidence into the Decision Brief.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/map" className="inline-flex items-center gap-1.5 text-sm text-mute transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Future Map
            </Link>
            <LinkButton href="/brief" size="md">
              View Decision Brief <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </Section>
    </main>
  );
}
