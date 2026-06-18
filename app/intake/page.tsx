"use client";

import { TopNav, ProgressSteps } from "@/components/shared/Nav";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Section, SectionTitle } from "@/components/ui/Section";
import { ResponsibleAIBanner } from "@/components/shared/ResponsibleAIBanner";
import { FutureRunTimeline } from "@/components/shared/FutureRunTimeline";
import { IntakeForm } from "@/components/intake/IntakeForm";

export default function IntakePage() {
  return (
    <main className="min-h-screen pb-24">
      <AmbientBackground />
      <TopNav />

      <Section className="pt-8">
        <ProgressSteps current="intake" />
      </Section>

      <Section className="pt-6">
        <FutureRunTimeline current="Name the decision" />
      </Section>

      <Section className="pt-10">
        <SectionTitle
          eyebrow="Intake"
          title="Map your decision"
          subtitle="The honest answers you give here shape every branch the simulation surfaces next — honesty in, useful futures out. Nothing is graded; the more real your context, the more the scenarios may resonate."
        />
      </Section>

      <Section className="pt-6">
        <ResponsibleAIBanner variant="compact" />
      </Section>

      <Section className="pt-8">
        <IntakeForm />
      </Section>
    </main>
  );
}
