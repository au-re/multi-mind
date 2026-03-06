import { describe, expect, it } from "vitest";
import { randomName } from "./random-name";

describe("randomName", () => {
  it("returns a two-word name", () => {
    const name = randomName();
    const parts = name.split(" ");
    expect(parts).toHaveLength(2);
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBeGreaterThan(0);
  });

  it("generates different names across calls", () => {
    const names = new Set(Array.from({ length: 20 }, () => randomName()));
    expect(names.size).toBeGreaterThan(1);
  });
});
