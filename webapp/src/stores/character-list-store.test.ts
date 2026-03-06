import { beforeEach, describe, expect, it } from "vitest";
import { useCharacterListStore } from "./character-list-store";

describe("character-list-store", () => {
  beforeEach(() => {
    useCharacterListStore.setState({ characters: [], activeCharacterId: null });
  });

  it("starts with empty characters", () => {
    const { characters } = useCharacterListStore.getState();
    expect(characters).toEqual([]);
  });

  it("creates a character with default traits", () => {
    const id = useCharacterListStore.getState().createCharacter("Alice");
    const { characters } = useCharacterListStore.getState();
    expect(characters).toHaveLength(1);
    expect(characters[0].name).toBe("Alice");
    expect(characters[0].id).toBe(id);
    expect(characters[0].traits).toHaveLength(9);
  });

  it("deletes a character", () => {
    const id = useCharacterListStore.getState().createCharacter("Alice");
    useCharacterListStore.getState().deleteCharacter(id);
    expect(useCharacterListStore.getState().characters).toHaveLength(0);
  });

  it("updates a character", () => {
    const id = useCharacterListStore.getState().createCharacter("Alice");
    useCharacterListStore.getState().updateCharacter(id, { name: "Bob" });
    expect(useCharacterListStore.getState().characters[0].name).toBe("Bob");
  });

  it("sets active character", () => {
    const id = useCharacterListStore.getState().createCharacter("Alice");
    useCharacterListStore.getState().setActiveCharacter(id);
    expect(useCharacterListStore.getState().activeCharacterId).toBe(id);
  });

  it("selectCharacterById finds a character", () => {
    const id = useCharacterListStore.getState().createCharacter("Alice");
    const found = useCharacterListStore.getState().selectCharacterById(id);
    expect(found?.name).toBe("Alice");
  });

  it("selectCharacterById returns undefined for unknown id", () => {
    const found = useCharacterListStore.getState().selectCharacterById("nope");
    expect(found).toBeUndefined();
  });
});
