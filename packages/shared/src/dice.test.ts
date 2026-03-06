import { describe, expect, it } from "vitest";
import { d20, mulberry32 } from "./dice.ts";

describe("mulberry32", () => {
  it("produces deterministic output for same seed", () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);
    const results1 = Array.from({ length: 10 }, () => rng1());
    const results2 = Array.from({ length: 10 }, () => rng2());
    expect(results1).toEqual(results2);
  });

  it("produces values in [0, 1)", () => {
    const rng = mulberry32(123);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("produces different values for different seeds", () => {
    const rng1 = mulberry32(1);
    const rng2 = mulberry32(2);
    const v1 = rng1();
    const v2 = rng2();
    expect(v1).not.toBe(v2);
  });
});

describe("d20", () => {
  it("returns values between 1 and 20", () => {
    const rng = mulberry32(99);
    for (let i = 0; i < 1000; i++) {
      const roll = d20(rng);
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(20);
    }
  });

  it("is deterministic with seeded RNG", () => {
    const rolls1 = Array.from({ length: 5 }, () => d20(mulberry32(42)));
    const rolls2 = Array.from({ length: 5 }, () => d20(mulberry32(42)));
    // Each call creates a fresh RNG with same seed, so first roll should match
    expect(rolls1[0]).toBe(rolls2[0]);
  });

  it("returns integers", () => {
    const rng = mulberry32(77);
    for (let i = 0; i < 100; i++) {
      const roll = d20(rng);
      expect(Number.isInteger(roll)).toBe(true);
    }
  });
});
