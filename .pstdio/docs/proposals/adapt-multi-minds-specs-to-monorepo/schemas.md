# Schemas — Multi-Minds Engine

Key TypeScript interfaces extracted from the specs and adapted for the monorepo.

## @multi-mind/shared

```ts
// types.ts

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
  embedding?: number[]; // optional in v1
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

export interface EngineState {
  runtime: RuntimeConfig;
  characterVoice: CharacterVoiceProfile;
  traits: TraitConfig[];
  traitState: Record<TraitId, TraitRuntimeState>;
  memory: MemoryStore;
  rng: RNG;
}

export interface TraitRuntimeState {
  cooldown: number;
  fatigue: number;
}

export type RNG = () => number;
```

## @multi-mind/traits

```ts
// config.ts

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
  skill: number; // 0..20
  impulseBias: number; // -2..+2
  initiativeBias: number; // -2..+2
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

// identity.ts

export interface IdentityPacket {
  whoAmI: string;
  whatICareAboutNow: string;
  howISound: string;
  whatIWontFake: string;
  currentPull: string;
}

// budget.ts

export interface ActionBudget {
  major: number;
  minor: number;
  reaction: number;
}

export interface TraitRating {
  relevance: number;
  difficulty: number;
  domainFit: number;
  triggerBonus: number;
  expectedUnknownRatio: number;
}
```

## @multi-mind/blackboard

```ts
// schema.ts

export interface ClaimNode {
  id: string;
  claimText: string;
  support: number;
  oppose: number;
  qualify: number;
  question: number;
  provenance: string[];
  sourceMix: string[];
}

export interface TensionBridge {
  id: string;
  left: string;
  right: string;
  kind: "concession" | "sequence" | "contrast" | "scope_split";
  strength: number;
}

export interface VetoRecord {
  id: string;
  targetId: string;
  cause: string;
  traitId: string;
  power: number;
}

export interface ActionRecord {
  id: string;
  traitId: string;
  type: string;
  power: number;
  params: Record<string, unknown>;
  status: "applied" | "suppressed" | "failed" | "tension";
}

export interface RoundBlackboard {
  roundId: string;
  salienceMap: Record<string, number>;
  uncertaintyMap: Record<string, number>;
  memoryPool: MemoryCue[];
  frameScores: Record<string, number>;
  modeScores: Record<string, number>;
  slotPriorities: Record<string, number>;
  claimGraph: Record<string, ClaimNode>;
  styleField: Record<string, number>;
  lexicalPool: Record<string, number>;
  bridgePool: TensionBridge[];
  vetoRecords: VetoRecord[];
  actionLog: ActionRecord[];
}
```

## @multi-mind/memory

```ts
// canonical.ts

export interface CanonicalEvent {
  eventId: string;
  turnId: number;
  timestamp: string;
  userMessageSummary: string;
  assistantReplySummary: string;
  domainTags: string[];
  facts: string[];
  emotionalSummary: string;
  uncertaintyNotes: string[];
  embedding?: number[]; // optional in v1
}

// shadow.ts

export interface ShadowTrace {
  traceId: string;
  eventId: string;
  traitId: TraitId;
  salience: number;
  appraisal: string;
  gist: string;
  feltLine: string;
  noticed: string[];
  ignored: string[];
  unfinishedBusiness: string[];
  lexicalImprint: string[];
  certainty: number;
  moodColor: Record<string, number>;
  embedding?: number[]; // optional in v1
}

// cue.ts

export interface MemoryCue {
  traceId: string;
  gist: string;
  feltLine: string;
  noticedDetail?: string;
  certainty: number;
  useMode: "analogy" | "warning" | "comfort" | "pattern";
}

// store.ts

export interface MemoryStore {
  canonical: CanonicalEvent[];
  shadowByTrait: Record<TraitId, ShadowTrace[]>;
}
```

## @multi-mind/braider

```ts
// style-field.ts

export type StyleDim =
  | "warmth"
  | "directness"
  | "hedging"
  | "dominance"
  | "abstraction"
  | "imagery"
  | "tempo"
  | "intensity"
  | "questioning";

export interface StyleFieldCell {
  net: number;
  tension: number;
  posLeader?: TraitId;
  negLeader?: TraitId;
}

// claim-lattice.ts

export interface BraiderClaim {
  id: string;
  text: string;
  support: number;
  oppose: number;
  qualify: number;
  question: number;
  provenance: string[];
}

export interface DiscourseSlot {
  name: "opening" | "core_answer" | "qualification" | "close" | "question";
  claims: string[];
  localStyle: Partial<Record<StyleDim, number>>;
  bridgeIds: string[];
}
```

## @multi-mind/engine

```ts
// controller.ts

export interface TraitRoundContext {
  trait: TraitConfig;
  rating: TraitRating;
  join: { success: boolean; roll: number; dc: number; margin: number };
  clarity: { roll: number; dc: number; margin: number };
  traitView: TraitView;
  memories: ShadowTrace[];
  budget: ActionBudget;
  initiative: number;
  visibleRatio: number;
  memoryResonance: number;
}

export interface TraitView {
  observedText: string;
  visibleRatio: number;
  maskedSpanIds: string[];
  associatedGlosses: string[];
}

export interface TraitActionSummary {
  traitId: TraitId;
  actionsUsed: ActionRecord[];
  styleDelta: Partial<Record<StyleDim, number>>;
  pressure: number;
}

export interface UserTurn {
  role: "user";
  content: string;
}

export interface AssistantTurn {
  role: "assistant";
  content: string;
}
```
