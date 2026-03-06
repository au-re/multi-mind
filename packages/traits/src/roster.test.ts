import { describe, expect, it } from "vitest";
import type { TraitConfig } from "./config.ts";
import { DEFAULT_ROSTER, TRAIT_IDS } from "./roster.ts";

describe("roster", () => {
  it("contains exactly 9 traits", () => {
    expect(DEFAULT_ROSTER).toHaveLength(9);
  });

  it("has no duplicate IDs", () => {
    const ids = DEFAULT_ROSTER.map((t) => t.id);
    expect(new Set(ids).size).toBe(9);
  });

  it("contains all expected trait IDs", () => {
    const ids = DEFAULT_ROSTER.map((t) => t.id);
    for (const id of TRAIT_IDS) {
      expect(ids).toContain(id);
    }
  });

  it("has valid skill ranges for all traits", () => {
    for (const trait of DEFAULT_ROSTER) {
      expect(trait.skill).toBeGreaterThanOrEqual(0);
      expect(trait.skill).toBeLessThanOrEqual(20);
    }
  });

  it("has valid bias ranges", () => {
    for (const trait of DEFAULT_ROSTER) {
      expect(trait.impulseBias).toBeGreaterThanOrEqual(-2);
      expect(trait.impulseBias).toBeLessThanOrEqual(2);
      expect(trait.initiativeBias).toBeGreaterThanOrEqual(-2);
      expect(trait.initiativeBias).toBeLessThanOrEqual(2);
    }
  });

  it("has non-empty identity and voice anchors", () => {
    for (const trait of DEFAULT_ROSTER) {
      expect(trait.identityAnchors.length).toBeGreaterThan(0);
      expect(trait.voiceAnchors.length).toBeGreaterThan(0);
    }
  });

  it("has total skill budget in recommended range 90-110", () => {
    const total = DEFAULT_ROSTER.reduce((sum, t) => sum + t.skill, 0);
    expect(total).toBeGreaterThanOrEqual(90);
    expect(total).toBeLessThanOrEqual(110);
  });

  it("satisfies TraitConfig shape", () => {
    const requiredKeys: (keyof TraitConfig)[] = [
      "id",
      "label",
      "skill",
      "impulseBias",
      "initiativeBias",
      "identityAnchors",
      "voiceAnchors",
      "knowledgeDomains",
      "blockedDomains",
      "salienceWeights",
      "styleBias",
      "compactionProfile",
      "taintProfile",
      "actionBias",
      "hardTriggers",
    ];
    for (const trait of DEFAULT_ROSTER) {
      for (const key of requiredKeys) {
        expect(trait).toHaveProperty(key);
      }
    }
  });
});
