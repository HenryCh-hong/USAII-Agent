"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { TopNav, ProgressSteps } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Section, SectionTitle } from "@/components/ui/Section";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { BranchMap } from "@/components/map/BranchMap";
import { BranchCard } from "@/components/map/BranchCard";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useForkedStore } from "@/lib/store";
import { useEnsureSimulation, useHydrated } from "@/lib/hooks";

export default function MapPage() {
  const hydrated = useHydrated();
  useEnsureSimulation();
  const simulation = useForkedStore((s) => s.simulation);

  if (!hydrated || !simulation) {
    return (
      <main className="min-h-screen">
        <AmbientBackground />
        <TopNav />
        <Section className="py-24 text-center text-mute">Opening your futures…</Section>
      </main>
    );
  }

  const { branches, context, mocked } = simulation;

  return (
    <main className="min-h-screen pb-24">
      <AmbientBackground />
      <TopNav />

      <Section className="pt-8">
        <ProgressSteps current="map" />
      </Section>

      <Section className="pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            eyebrow="Future Map · branching timelines"
            title="Three futures, opened side by side"
            subtitle={context.decision}
          />
          <Badge tone={mocked ? "neutral" : "brand"}>
            <Sparkles className="h-3 w-3" />
            {mocked ? "Demo simulation" : "Live simulation"}
          </Badge>
        </div>
      </Section>

      {/* The branching visualization */}
      <Section className="pt-12">
        <div className="rounded-3xl border border-line/60 bg-panel/40 p-6 backdrop-blur-xl sm:p-10">
          <BranchMap branches={branches} />
        </div>
      </Section>

      {/* Full branch previews */}
      <Section className="pt-8">
        <div className="grid gap-5 md:grid-cols-3">
          {branches.map((b, i) => (
            <BranchCard key={b.id} branch={b} index={i} />
          ))}
        </div>
      </Section>

      <Section className="pt-8">
        <ResponsibleAIBanner />
      </Section>

      <Section className="pt-8">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line/60 bg-panel/50 p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-medium text-white">
              Ready to see what you&apos;re really deciding?
            </div>
            <div className="text-sm text-mute">
              The Decision Brief synthesizes the strongest signals, the biggest unknowns, and what the AI will not decide for you.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/questions" className="text-sm text-mute hover:text-white">
              ← Revisit answers
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
