import { describe, expect, it } from "vitest";
import { DEFAULT_TRAITS } from "./roster";
import { clampSkill, validateSkillBudget } from "./validation";

describe("validateSkillBudget", () => {
  it("validates default traits as within budget", () => {
    const result = validateSkillBudget(DEFAULT_TRAITS);
    expect(result.total).toBe(0);
    expect(result.valid).toBe(true);
  });

  it("accepts traits at maximum budget", () => {
    const traits = DEFAULT_TRAITS.map((t, i) => ({ ...t, skill: i < 2 ? 10 : 0 }));
    const result = validateSkillBudget(traits);
    expect(result.total).toBe(20);
    expect(result.valid).toBe(true);
  });

  it("rejects traits above maximum budget", () => {
    const highTraits = DEFAULT_TRAITS.map((t) => ({ ...t, skill: 5 }));
    const result = validateSkillBudget(highTraits);
    expect(result.total).toBe(45);
    expect(result.valid).toBe(false);
  });
});

describe("clampSkill", () => {
  it("clamps below minimum to 0", () => {
    expect(clampSkill(-5)).toBe(0);
  });

  it("clamps above maximum to 20", () => {
    expect(clampSkill(25)).toBe(20);
  });

  it("passes through valid values", () => {
    expect(clampSkill(10)).toBe(10);
  });
});
