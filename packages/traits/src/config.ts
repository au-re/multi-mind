import type { TraitId } from "@multi-mind/shared";

export type { TraitId };

export interface TraitConfig {
  id: TraitId;
  label: string;
  skill: number;
  impulseBias: number;
  initiativeBias: number;
  identityAnchors: string[];
  voiceAnchors: string[];
  knowledgeDomains: string[];
  blockedDomains: string[];
  salienceWeights: Record<string, number>;
  styleBias: Record<string, number>;
  compactionProfile: Record<string, number>;
  taintProfile: Record<string, number>;
  actionBias: Record<string, number>;
  hardTriggers: string[];
}
