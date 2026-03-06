export type TraitId =
  | "integrity"
  | "warmth"
  | "tact"
  | "vigilance"
  | "heat"
  | "drive"
  | "structure"
  | "presence"
  | "inquiry";

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

export interface CharacterVoiceProfile {
  registerLevel: number;
  terseness: number;
  metaphorRate: number;
  profanityRate: number;
  humorRate: number;
  warmthBase: number;
  directnessBase: number;
  hedgingBase: number;
  sentenceLengthBase: number;
  signatureLexicon: string[];
  forbiddenPhrases: string[];
}

export const TRAIT_CONSTRAINTS = {
  skillMin: 0,
  biasMin: -2,
  biasMax: 2,
  totalSkillBudgetMin: 90,
  totalSkillBudgetMax: 110,
  traitCount: 9,
} as const;
