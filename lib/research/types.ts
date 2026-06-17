/**
 * Research dossier types — the structured output of the autonomous research
 * agent. Sources are public institutions, statistical datasets, decision-science
 * references, and public career-guidance used as ANALOGIES. Nothing here
 * identifies a private individual or claims the user "is like" a real person.
 */
import type { Level } from "../types";
import type { SearchProviderName } from "../web/types";
import type { ResearchSourceType, ReliabilityTier } from "./corpus";
import type { Resonance } from "../trajectory/archetypes";

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  publisher: string;
  sourceType: ResearchSourceType;
  reliabilityTier: ReliabilityTier;
  relevanceReason: string;
  coverageLevel: string;
  limitation: string;
  retrievedAt: string;
  usedFor: string;
  confidenceLevel: Level;
  isPublicTrajectory?: boolean;
  survivorshipNote?: string;
  /** Present only on rejected sources. */
  rejectionReason?: string;
}

export interface EvidenceCluster {
  id: string;
  label: string;
  summary: string;
  coverageLevel: string;
  sourceIds: string[];
}

export interface TrajectoryAnchorFinding {
  archetypeId: string;
  label: string;
  resonance: Resonance;
  note: string;
}

export interface GeneratedQuery {
  q: string;
  intent: string;
  branchId?: string;
}

export interface ResearchDossier {
  decision: string;
  provider: SearchProviderName;
  mocked: boolean;
  generatedQueries: GeneratedQuery[];
  sourcesFound: ResearchSource[];
  sourcesUsed: ResearchSource[];
  sourcesRejected: ResearchSource[];
  evidenceClusters: EvidenceCluster[];
  trajectoryAnchors: TrajectoryAnchorFinding[];
  limitations: string[];
  survivorshipBiasWarnings: string[];
  confidenceNotes: string[];
  whatWouldChangeAssessment: string[];
  validationExperiments: string[];
  generatedNote: string;
}
