import type { TraitConfig } from "./types";

function trait(id: TraitConfig["id"], label: string, skill: number): TraitConfig {
  return {
    id,
    label,
    skill,
    impulseBias: 0,
    initiativeBias: 0,
    identityAnchors: [],
    voiceAnchors: [],
    knowledgeDomains: [],
    blockedDomains: [],
    salienceWeights: {},
    styleBias: {},
    compactionProfile: {},
    taintProfile: {},
    actionBias: {},
    hardTriggers: [],
  };
}

export const DEFAULT_TRAITS: TraitConfig[] = [
  trait("integrity", "Integrity", 14),
  trait("warmth", "Warmth", 11),
  trait("tact", "Tact", 10),
  trait("vigilance", "Vigilance", 13),
  trait("heat", "Heat", 6),
  trait("drive", "Drive", 15),
  trait("structure", "Structure", 12),
  trait("presence", "Presence", 9),
  trait("inquiry", "Inquiry", 16),
];

export const DEFAULT_VOICE_PROFILE = {
  registerLevel: 0.42,
  terseness: 0.56,
  metaphorRate: 0.33,
  profanityRate: 0.04,
  humorRate: 0.09,
  warmthBase: 0.18,
  directnessBase: 0.31,
  hedgingBase: 0.12,
  sentenceLengthBase: 0.49,
  signatureLexicon: ["plainly", "still", "for now"],
  forbiddenPhrases: ["as an AI", "from multiple perspectives"],
} as const;
