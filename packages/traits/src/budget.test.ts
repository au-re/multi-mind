import { describe, expect, it } from "vitest";
import { computeActionBudget } from "./budget.ts";

describe("computeActionBudget", () => {
  it("returns base budget for zero margins", () => {
    const budget = computeActionBudget(0, 0);
    expect(budget).toEqual({ major: 1, minor: 1, reaction: 1 });
  });

  it("adds minor action at join margin >= 5", () => {
    const budget = computeActionBudget(5, 0);
    expect(budget.minor).toBe(2);
  });

  it("adds reaction at join margin >= 10", () => {
    const budget = computeActionBudget(10, 0);
    expect(budget.reaction).toBe(2);
  });

  it("does not add extras for low join margins", () => {
    const budget = computeActionBudget(4, 5);
    expect(budget).toEqual({ major: 1, minor: 1, reaction: 1 });
  });

  it("stacks bonuses for high join margin", () => {
    const budget = computeActionBudget(12, 3);
    expect(budget.minor).toBe(2);
    expect(budget.reaction).toBe(2);
  });
});
