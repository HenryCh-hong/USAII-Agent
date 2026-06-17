/**
 * Zod schema for the research dossier — runtime validation for /api/research.
 * Kept in the research module so the canonical lib/schemas.ts contract is
 * untouched. All fields mirror lib/research/types.ts.
 */
import { z } from "zod";

const levelSchema = z.enum(["low", "medium", "high"]);
const reliabilitySchema = z.enum(["high", "medium", "low"]);
const sourceTypeSchema = z.enum([
  "official_data",
  "education_outcomes",
  "labor_market",
  "decision_framework",
  "public_reference",
  "anecdotal",
]);
const resonanceSchema = z.enum(["strong", "partial", "weak", "missing"]);

export const researchSourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  domain: z.string(),
  publisher: z.string(),
  sourceType: sourceTypeSchema,
  reliabilityTier: reliabilitySchema,
  relevanceReason: z.string(),
  coverageLevel: z.string(),
  limitation: z.string(),
  retrievedAt: z.string(),
  usedFor: z.string(),
  confidenceLevel: levelSchema,
  isPublicTrajectory: z.boolean().optional(),
  survivorshipNote: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const researchDossierSchema = z.object({
  decision: z.string(),
  provider: z.enum(["mock", "google", "tavily"]),
  mocked: z.boolean(),
  generatedQueries: z.array(
    z.object({ q: z.string(), intent: z.string(), branchId: z.string().optional() }),
  ),
  sourcesFound: z.array(researchSourceSchema),
  sourcesUsed: z.array(researchSourceSchema),
  sourcesRejected: z.array(researchSourceSchema),
  evidenceClusters: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      summary: z.string(),
      coverageLevel: z.string(),
      sourceIds: z.array(z.string()),
    }),
  ),
  trajectoryAnchors: z.array(
    z.object({
      archetypeId: z.string(),
      label: z.string(),
      resonance: resonanceSchema,
      note: z.string(),
    }),
  ),
  limitations: z.array(z.string()),
  survivorshipBiasWarnings: z.array(z.string()),
  confidenceNotes: z.array(z.string()),
  whatWouldChangeAssessment: z.array(z.string()),
  validationExperiments: z.array(z.string()),
  generatedNote: z.string(),
});

export const researchRequestSchema = z.object({
  context: z.object({}).passthrough(),
  branches: z.array(z.object({}).passthrough()).optional(),
  mode: z.enum(["auto", "mock", "live"]).optional(),
});
