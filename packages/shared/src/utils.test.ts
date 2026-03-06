import { describe, expect, it } from "vitest";
import { clamp, clamp01, clampInt } from "./utils.ts";

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps to min when below", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps to max when above", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("handles equal min and max", () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it("handles negative ranges", () => {
    expect(clamp(0, -10, -5)).toBe(-5);
  });
});

describe("clamp01", () => {
  it("returns value when within 0..1", () => {
    expect(clamp01(0.5)).toBe(0.5);
  });

  it("clamps to 0", () => {
    expect(clamp01(-0.5)).toBe(0);
  });

  it("clamps to 1", () => {
    expect(clamp01(1.5)).toBe(1);
  });

  it("handles boundaries", () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(1)).toBe(1);
  });
});

describe("clampInt", () => {
  it("floors and clamps", () => {
    expect(clampInt(5.7, 0, 10)).toBe(5);
  });

  it("clamps to min as integer", () => {
    expect(clampInt(-3.2, 0, 10)).toBe(0);
  });

  it("clamps to max as integer", () => {
    expect(clampInt(15.9, 0, 10)).toBe(10);
  });
});
