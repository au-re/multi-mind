import type { Scene } from "@multi-mind/shared";
import { mulberry32 } from "@multi-mind/shared";
import { DEFAULT_ROSTER } from "@multi-mind/traits";
import { describe, expect, it } from "vitest";
import { checkActivation, checkClarity, checkJoin, rateTrait } from "./activation.ts";

const SCENE: Scene = {
  rawUserText: "I want to quit my job tomorrow. I'm exhausted but not sure if I'm overreacting.",
  intent: "decision-making",
  domainTags: ["emotions", "career", "risk"],
  urgency: 0.7,
  socialRisk: 0.4,
  ambiguity: 0.6,
  technicalDensity: 0.1,
  abstractness: 0.3,
  units: [
    {
      text: "I want to quit my job tomorrow.",
      domain: "career",
      commonness: 0.8,
      abstractness: 0.2,
      morphologyTransparency: 0.9,
    },
    {
      text: "I'm exhausted but not sure if I'm overreacting.",
      domain: "emotions",
      commonness: 0.9,
      abstractness: 0.3,
      morphologyTransparency: 0.9,
    },
  ],
};

describe("rateTrait", () => {
  it("returns a TraitRating with all required fields", () => {
    const warmth = DEFAULT_ROSTER.find((t) => t.id === "warmth")!;
    const rating = rateTrait(warmth, SCENE);
    expect(rating).toHaveProperty("relevance");
    expect(rating).toHaveProperty("difficulty");
    expect(rating).toHaveProperty("domainFit");
    expect(rating).toHaveProperty("triggerBonus");
    expect(rating).toHaveProperty("expectedUnknownRatio");
  });

  it("gives higher relevance to warmth for emotional scene", () => {
    const warmth = DEFAULT_ROSTER.find((t) => t.id === "warmth")!;
    const structure = DEFAULT_ROSTER.find((t) => t.id === "structure")!;
    const warmthRating = rateTrait(warmth, SCENE);
    const structureRating = rateTrait(structure, SCENE);
    expect(warmthRating.relevance).toBeGreaterThan(structureRating.relevance);
  });

  it("gives higher domain fit to warmth for emotional tags", () => {
    const warmth = DEFAULT_ROSTER.find((t) => t.id === "warmth")!;
    const rating = rateTrait(warmth, SCENE);
    expect(rating.domainFit).toBeGreaterThan(0);
  });

  it("clamps all values to valid ranges", () => {
    for (const trait of DEFAULT_ROSTER) {
      const rating = rateTrait(trait, SCENE);
      expect(rating.relevance).toBeGreaterThanOrEqual(0);
      expect(rating.relevance).toBeLessThanOrEqual(1);
      expect(rating.difficulty).toBeGreaterThanOrEqual(0);
      expect(rating.difficulty).toBeLessThanOrEqual(1);
      expect(rating.domainFit).toBeGreaterThanOrEqual(0);
      expect(rating.domainFit).toBeLessThanOrEqual(1);
      expect(rating.triggerBonus).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("checkActivation", () => {
  it("is deterministic with seeded RNG", () => {
    const trait = DEFAULT_ROSTER.find((t) => t.id === "warmth")!;
    const tstate = { cooldown: 0, fatigue: 0 };
    const rating = rateTrait(trait, SCENE);

    const r1 = checkActivation(trait, tstate, rating, mulberry32(42));
    const r2 = checkActivation(trait, tstate, rating, mulberry32(42));
    expect(r1).toBe(r2);
  });

  it("cooldown makes activation harder", () => {
    const trait = DEFAULT_ROSTER.find((t) => t.id === "warmth")!;
    const rating = rateTrait(trait, SCENE);

    let passesNoCooldown = 0;
    let passesCooldown = 0;
    for (let seed = 0; seed < 200; seed++) {
      if (checkActivation(trait, { cooldown: 0, fatigue: 0 }, rating, mulberry32(seed))) passesNoCooldown++;
      if (checkActivation(trait, { cooldown: 3, fatigue: 2 }, rating, mulberry32(seed))) passesCooldown++;
    }
    expect(passesNoCooldown).toBeGreaterThan(passesCooldown);
  });
});

describe("checkJoin", () => {
  it("returns success, roll, dc, margin", () => {
    const trait = DEFAULT_ROSTER.find((t) => t.id === "drive")!;
    const rating = rateTrait(trait, SCENE);
    const result = checkJoin(trait, rating, mulberry32(42));
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("roll");
    expect(result).toHaveProperty("dc");
    expect(result).toHaveProperty("margin");
    expect(result.margin).toBe(result.roll - result.dc);
  });

  it("is deterministic with seeded RNG", () => {
    const trait = DEFAULT_ROSTER.find((t) => t.id === "drive")!;
    const rating = rateTrait(trait, SCENE);
    const r1 = checkJoin(trait, rating, mulberry32(99));
    const r2 = checkJoin(trait, rating, mulberry32(99));
    expect(r1).toEqual(r2);
  });
});

describe("checkClarity", () => {
  it("returns roll, dc, margin", () => {
    const trait = DEFAULT_ROSTER.find((t) => t.id === "inquiry")!;
    const joinDc = 12;
    const result = checkClarity(trait, SCENE, joinDc, mulberry32(42));
    expect(result).toHaveProperty("roll");
    expect(result).toHaveProperty("dc");
    expect(result).toHaveProperty("margin");
    expect(result.margin).toBe(result.roll - result.dc);
  });

  it("higher skill produces higher rolls on average", () => {
    const high = DEFAULT_ROSTER.find((t) => t.id === "inquiry")!; // skill 16
    const low = DEFAULT_ROSTER.find((t) => t.id === "heat")!; // skill 6
    const joinDc = 12;

    let highTotal = 0;
    let lowTotal = 0;
    for (let seed = 0; seed < 200; seed++) {
      highTotal += checkClarity(high, SCENE, joinDc, mulberry32(seed)).roll;
      lowTotal += checkClarity(low, SCENE, joinDc, mulberry32(seed)).roll;
    }
    expect(highTotal / 200).toBeGreaterThan(lowTotal / 200);
  });
});
