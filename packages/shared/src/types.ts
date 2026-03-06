export type RNG = () => number;

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

export interface RuntimeConfig {
  model: string;
  apiKey?: string;
  baseURL?: string;
  reasoningEffort: "low" | "medium" | "high";
}

export interface Scene {
  rawUserText: string;
  intent: string;
  domainTags: string[];
  urgency: number;
  socialRisk: number;
  ambiguity: number;
  technicalDensity: number;
  abstractness: number;
  units: MessageUnit[];
  embedding?: number[];
}

export interface MessageUnit {
  text: string;
  domain: string;
  commonness: number;
  abstractness: number;
  morphologyTransparency: number;
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

export interface TraitRuntimeState {
  cooldown: number;
  fatigue: number;
}

export interface Store {
  readJson<T>(path: string): Promise<T | null>;
  writeJson<T>(path: string, data: T): Promise<void>;
  appendJsonl<T>(path: string, record: T): Promise<void>;
  list(prefix: string): Promise<string[]>;
}
