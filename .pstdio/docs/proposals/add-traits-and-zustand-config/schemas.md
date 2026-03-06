# Schemas — Traits and Zustand Stores

## 1. Trait Types (`packages/traits/src/types.ts`)

```ts
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

export interface TraitRating {
  relevance: number; // 0..1
  difficulty: number; // 0..1
  domainFit: number; // 0..1
  triggerBonus: number; // 0..4
  expectedUnknownRatio: number; // 0..1
}

export interface TraitRuntimeState {
  cooldown: number;
  fatigue: number;
  lastActiveRound: number;
}

export interface ActionBudget {
  major: number;
  minor: number;
  reaction: number;
}

export interface IdentityPacket {
  whoAmI: string;
  whatICareAboutNow: string;
  howISound: string;
  whatIWontFake: string;
  currentPull: string;
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
```

## 2. Validation Constraints

```ts
export const TRAIT_CONSTRAINTS = {
  skillMin: 0,
  skillMax: 20,
  biasMin: -2,
  biasMax: 2,
  totalSkillBudgetMin: 90,
  totalSkillBudgetMax: 110,
  traitCount: 9,
} as const;
```

## 3. Zustand Trait Store (`webapp/src/stores/trait-store.ts`)

```ts
import { create } from "zustand";
import type { TraitConfig, TraitId } from "@multi-mind/traits";
import { DEFAULT_TRAITS, TRAIT_CONSTRAINTS } from "@multi-mind/traits";

interface TraitState {
  traits: TraitConfig[];
  selectedTraitId: TraitId | null;
}

interface TraitActions {
  setTraits: (traits: TraitConfig[]) => void;
  updateTrait: (id: TraitId, patch: Partial<TraitConfig>) => void;
  setSkill: (id: TraitId, skill: number) => void;
  resetToDefaults: () => void;
  selectTrait: (id: TraitId | null) => void;
}

export type TraitStore = TraitState & TraitActions;

export const useTraitStore = create<TraitStore>((set) => ({
  traits: DEFAULT_TRAITS,
  selectedTraitId: null,

  setTraits: (traits) => set({ traits }),

  updateTrait: (id, patch) =>
    set((state) => ({
      traits: state.traits.map((t) =>
        t.id === id ? { ...t, ...patch, id } : t
      ),
    })),

  setSkill: (id, skill) =>
    set((state) => ({
      traits: state.traits.map((t) =>
        t.id === id
          ? {
              ...t,
              skill: Math.max(
                TRAIT_CONSTRAINTS.skillMin,
                Math.min(TRAIT_CONSTRAINTS.skillMax, skill)
              ),
            }
          : t
      ),
    })),

  resetToDefaults: () => set({ traits: DEFAULT_TRAITS, selectedTraitId: null }),

  selectTrait: (selectedTraitId) => set({ selectedTraitId }),
}));

// Selectors
export const selectTotalSkillBudget = (state: TraitStore) =>
  state.traits.reduce((sum, t) => sum + t.skill, 0);

export const selectIsValidBudget = (state: TraitStore) => {
  const total = selectTotalSkillBudget(state);
  return (
    total >= TRAIT_CONSTRAINTS.totalSkillBudgetMin &&
    total <= TRAIT_CONSTRAINTS.totalSkillBudgetMax
  );
};

export const selectTraitById = (id: TraitId) => (state: TraitStore) =>
  state.traits.find((t) => t.id === id);

export const selectSelectedTrait = (state: TraitStore) =>
  state.traits.find((t) => t.id === state.selectedTraitId);
```

## 4. Zustand Character Store (`webapp/src/stores/character-store.ts`)

```ts
import { create } from "zustand";
import type { CharacterVoiceProfile } from "@multi-mind/traits";

interface CharacterState {
  characterVoice: CharacterVoiceProfile;
}

interface CharacterActions {
  setCharacterVoice: (voice: CharacterVoiceProfile) => void;
  updateCharacterVoice: (patch: Partial<CharacterVoiceProfile>) => void;
}

export type CharacterStore = CharacterState & CharacterActions;

export const useCharacterStore = create<CharacterStore>((set) => ({
  characterVoice: {
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
  },

  setCharacterVoice: (characterVoice) => set({ characterVoice }),

  updateCharacterVoice: (patch) =>
    set((state) => ({
      characterVoice: { ...state.characterVoice, ...patch },
    })),
}));
```
