import { describe, expect, it } from "vitest";
import type { CanonicalEvent } from "./canonical.ts";
import type { ShadowTrace } from "./shadow.ts";
import { InMemoryMemoryStore } from "./store.ts";

const CANONICAL_EVENT: CanonicalEvent = {
  eventId: "ev-001",
  turnId: 1,
  timestamp: "2026-03-06T12:00:00Z",
  userMessageSummary: "User wants to quit their job",
  assistantReplySummary: "Explored the decision from multiple angles",
  domainTags: ["career", "emotions"],
  facts: ["User is exhausted"],
  emotionalSummary: "frustrated, uncertain",
  uncertaintyNotes: ["unclear if overreacting"],
};

const SHADOW_TRACE: ShadowTrace = {
  traceId: "tr-001",
  eventId: "ev-001",
  traitId: "warmth",
  salience: 0.8,
  appraisal: "This person needs gentle support",
  gist: "User considering quitting due to exhaustion",
  feltLine: "The exhaustion was louder than the logic.",
  noticed: ["exhaustion", "uncertainty"],
  ignored: ["career details"],
  unfinishedBusiness: ["whether the exhaustion is chronic"],
  lexicalImprint: ["exhausted", "overreacting"],
  certainty: 0.6,
  moodColor: { warmth: 0.8, concern: 0.5 },
};

describe("InMemoryMemoryStore", () => {
  it("starts empty", () => {
    const store = new InMemoryMemoryStore();
    expect(store.getCanonicalEvents()).toEqual([]);
    expect(store.getShadowTraces("warmth")).toEqual([]);
  });

  it("adds and retrieves canonical events", () => {
    const store = new InMemoryMemoryStore();
    store.addCanonicalEvent(CANONICAL_EVENT);
    expect(store.getCanonicalEvents()).toHaveLength(1);
    expect(store.getCanonicalEvents()[0].eventId).toBe("ev-001");
  });

  it("retrieves canonical event by id", () => {
    const store = new InMemoryMemoryStore();
    store.addCanonicalEvent(CANONICAL_EVENT);
    expect(store.getCanonicalEvent("ev-001")).toEqual(CANONICAL_EVENT);
    expect(store.getCanonicalEvent("nonexistent")).toBeNull();
  });

  it("adds and retrieves shadow traces by traitId", () => {
    const store = new InMemoryMemoryStore();
    store.addShadowTrace(SHADOW_TRACE);

    expect(store.getShadowTraces("warmth")).toHaveLength(1);
    expect(store.getShadowTraces("warmth")[0].traceId).toBe("tr-001");
    expect(store.getShadowTraces("drive")).toEqual([]);
  });

  it("retrieves all shadow traces across traits", () => {
    const store = new InMemoryMemoryStore();
    store.addShadowTrace(SHADOW_TRACE);
    store.addShadowTrace({ ...SHADOW_TRACE, traceId: "tr-002", traitId: "drive" });

    expect(store.getAllShadowTraces()).toHaveLength(2);
  });

  it("stores multiple traces per trait", () => {
    const store = new InMemoryMemoryStore();
    store.addShadowTrace(SHADOW_TRACE);
    store.addShadowTrace({ ...SHADOW_TRACE, traceId: "tr-002" });

    expect(store.getShadowTraces("warmth")).toHaveLength(2);
  });
});
