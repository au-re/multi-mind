# Schemas — Webapp Character Flow

TypeScript interfaces for the character flow stores and components.

## Character List Store

```ts
// webapp/src/stores/character-list-store.ts

import { TraitConfig, CharacterVoiceProfile } from "@multi-mind/traits";

interface Character {
  id: string;
  name: string;
  traits: TraitConfig[];
  voice: CharacterVoiceProfile;
  createdAt: string;
}

interface CharacterListState {
  characters: Character[];
  activeCharacterId: string | null;
}

interface CharacterListActions {
  createCharacter: (name: string) => string; // returns new id
  deleteCharacter: (id: string) => void;
  updateCharacter: (id: string, patch: Partial<Omit<Character, "id" | "createdAt">>) => void;
  setActiveCharacter: (id: string | null) => void;
}

// Selectors
selectCharacterById: (id: string) => (state: CharacterListStore) => Character | undefined;
selectActiveCharacter: (state: CharacterListStore) => Character | undefined;
selectCharacterCount: (state: CharacterListStore) => number;
```

## Route Params

```ts
// Route param types for TanStack Router

interface CharacterRouteParams {
  characterId: string;
}

// Used by:
// /characters/$characterId       -> CharacterPage
// /characters/$characterId/edit  -> CharacterEditPage
```

## Component Props

```ts
// character-card.tsx
interface CharacterCardProps {
  character: Character;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
}

// trait-slider.tsx
interface TraitSliderProps {
  traitId: TraitId;
  label: string;
  skill: number;
  onChange: (traitId: TraitId, skill: number) => void;
}

// trait-editor.tsx
interface TraitEditorProps {
  traits: TraitConfig[];
  onChange: (traits: TraitConfig[]) => void;
}

// budget-indicator.tsx
interface BudgetIndicatorProps {
  totalSkill: number;
  validRange: { min: number; max: number }; // { min: 90, max: 110 }
}

// memory-panel.tsx
interface MemoryPanelProps {
  characterId: string;
}
```
