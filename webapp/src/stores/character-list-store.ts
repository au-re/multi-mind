import type { CharacterVoiceProfile, TraitConfig } from "@multi-mind/traits";
import { DEFAULT_TRAITS, DEFAULT_VOICE_PROFILE } from "@multi-mind/traits";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface Character {
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
  createCharacter: (name: string) => string;
  deleteCharacter: (id: string) => void;
  updateCharacter: (id: string, patch: Partial<Character>) => void;
  setActiveCharacter: (id: string | null) => void;
  selectCharacterById: (id: string) => Character | undefined;
}

export const useCharacterListStore = create<CharacterListState & CharacterListActions>()(
  devtools(
    persist(
      (set, get) => ({
  characters: [],
  activeCharacterId: null,

  createCharacter: (name) => {
    const id = crypto.randomUUID();
    const character: Character = {
      id,
      name,
      traits: DEFAULT_TRAITS.map((t) => ({ ...t })),
      voice: {
        ...DEFAULT_VOICE_PROFILE,
        signatureLexicon: [...DEFAULT_VOICE_PROFILE.signatureLexicon],
        forbiddenPhrases: [...DEFAULT_VOICE_PROFILE.forbiddenPhrases],
      },
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ characters: [...state.characters, character] }));
    return id;
  },

  deleteCharacter: (id) => {
    set((state) => ({
      characters: state.characters.filter((c) => c.id !== id),
      activeCharacterId: state.activeCharacterId === id ? null : state.activeCharacterId,
    }));
  },

  updateCharacter: (id, patch) => {
    set((state) => ({
      characters: state.characters.map((c) => (c.id === id ? { ...c, ...patch, id } : c)),
    }));
  },

  setActiveCharacter: (id) => set({ activeCharacterId: id }),

  selectCharacterById: (id) => get().characters.find((c) => c.id === id),
      }),
      { name: "character-list" },
    ),
    { name: "character-list" },
  ),
);
