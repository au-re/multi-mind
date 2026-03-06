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
  trait("integrity", "Integrity", 0),
  trait("warmth", "Warmth", 0),
  trait("tact", "Tact", 0),
  trait("vigilance", "Vigilance", 0),
  trait("heat", "Heat", 0),
  trait("drive", "Drive", 0),
  trait("structure", "Structure", 0),
  trait("presence", "Presence", 0),
  trait("inquiry", "Inquiry", 0),
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
