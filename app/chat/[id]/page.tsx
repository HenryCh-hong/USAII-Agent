"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { TopNav } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { FutureSelfChat } from "@/components/chat/FutureSelfChat";
import { useForkedStore } from "@/lib/store";
import { useEnsureSimulation, useHydrated } from "@/lib/hooks";
import { accentForBranch } from "@/lib/utils";

export default function FutureSelfChatPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const hydrated = useHydrated();
  useEnsureSimulation();
  const router = useRouter();
  const simulation = useForkedStore((s) => s.simulation);
  const branch = useForkedStore((s) => s.getBranch(id));

  // If the branch can't be resolved once everything is ready, return to the map.
  useEffect(() => {
    if (hydrated && simulation && !branch) {
      router.replace("/map");
    }
  }, [hydrated, simulation, branch, router]);

  if (!hydrated || !simulation || !branch) {
    return (
      <main className="min-h-screen">
        <AmbientBackground />
        <TopNav />
        <Section className="py-24 text-center text-mute">Tuning into your simulated self…</Section>
      </main>
    );
  }

  const context = simulation.context;
  const index = simulation.branches.findIndex((b) => b.id === branch.id);
  const accentKey = accentForBranch(branch.id, index < 0 ? 0 : index);

  return (
    <main className="min-h-screen pb-24">
      <AmbientBackground />
      <TopNav />

      <Section className="pt-8">
        <Link
          href={`/branch/${branch.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-mute transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to the {branch.track} branch
        </Link>
      </Section>

      <Section className="pt-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <SectionTitle
            eyebrow="Future Self"
            title={`Future Self — ${branch.track}`}
            subtitle={
              <>
                This is a <span className="text-white">simulated voice grounded in this branch&apos;s assumptions</span> —
                a rehearsal of who you might become on this path, not a real prediction of your future. It can surface
                what this scenario may underestimate, but it will not decide for you.
              </>
            }
          />
          <Badge tone={accentKey}>
            <MessageSquare className="h-3 w-3" />
            Simulated · not a forecast
          </Badge>
        </motion.div>
      </Section>

      <Section className="pt-8">
        <FutureSelfChat branch={branch} context={context} index={index < 0 ? 0 : index} />
      </Section>
    </main>
  );
}
