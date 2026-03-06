import { mulberry32 } from "@multi-mind/shared";
import { DEFAULT_ROSTER } from "@multi-mind/traits";
import { describe, expect, it } from "vitest";
import { orderByInitiative, rollInitiative } from "./initiative.ts";

describe("rollInitiative", () => {
  it("is deterministic with seeded RNG", () => {
    const trait = DEFAULT_ROSTER.find((t) => t.id === "drive")!;
    const r1 = rollInitiative(trait, 5, mulberry32(42));
    const r2 = rollInitiative(trait, 5, mulberry32(42));
    expect(r1).toBe(r2);
  });

  it("initiative bias contributes to the roll", () => {
    // Same seed, same margin — difference is trait.skill + trait.initiativeBias
    const heat = DEFAULT_ROSTER.find((t) => t.id === "heat")!; // skill 6, bias +2
    const drive = DEFAULT_ROSTER.find((t) => t.id === "drive")!; // skill 15, bias 0

    // With same RNG seed, the d20 roll is identical, so the difference is:
    // heat: d20 + 6 + 2 = d20 + 8
    // drive: d20 + 15 + 0 = d20 + 15
    const heatInit = rollInitiative(heat, 0, mulberry32(42));
    const driveInit = rollInitiative(drive, 0, mulberry32(42));
    expect(driveInit - heatInit).toBe(15 - 8); // skill + bias difference
  });

  it("join margin bonus adds to initiative", () => {
    const trait = DEFAULT_ROSTER.find((t) => t.id === "drive")!;
    const lowMargin = rollInitiative(trait, 2, mulberry32(42));
    const highMargin = rollInitiative(trait, 12, mulberry32(42));
    // margin 12 => bonus of floor(12/5) = 2, margin 2 => bonus of 0
    expect(highMargin).toBeGreaterThan(lowMargin);
  });
});

describe("orderByInitiative", () => {
  it("sorts descending by initiative", () => {
    const entries = [
      { traitId: "warmth" as const, initiative: 10 },
      { traitId: "drive" as const, initiative: 18 },
      { traitId: "heat" as const, initiative: 5 },
    ];
    const sorted = orderByInitiative(entries);
    expect(sorted[0].traitId).toBe("drive");
    expect(sorted[1].traitId).toBe("warmth");
    expect(sorted[2].traitId).toBe("heat");
  });

  it("handles empty array", () => {
    expect(orderByInitiative([])).toEqual([]);
  });

  it("does not mutate input", () => {
    const entries = [
      { traitId: "warmth" as const, initiative: 10 },
      { traitId: "drive" as const, initiative: 18 },
    ];
    const original = [...entries];
    orderByInitiative(entries);
    expect(entries).toEqual(original);
  });
});
