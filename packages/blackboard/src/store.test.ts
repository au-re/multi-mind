import { describe, expect, it } from "vitest";
import { BlackboardStore, createEmptyBlackboard } from "./store.ts";

describe("createEmptyBlackboard", () => {
  it("creates blackboard with given roundId", () => {
    const bb = createEmptyBlackboard("round-1");
    expect(bb.roundId).toBe("round-1");
  });

  it("initializes all collections as empty", () => {
    const bb = createEmptyBlackboard("round-1");
    expect(Object.keys(bb.claimGraph)).toHaveLength(0);
    expect(Object.keys(bb.styleField)).toHaveLength(0);
    expect(bb.bridgePool).toHaveLength(0);
    expect(bb.vetoRecords).toHaveLength(0);
    expect(bb.actionLog).toHaveLength(0);
    expect(bb.memoryPool).toHaveLength(0);
  });
});

describe("BlackboardStore", () => {
  it("adds and retrieves claims", () => {
    const store = new BlackboardStore("round-1");
    store.addClaim({
      id: "c1",
      claimText: "The user is frustrated",
      support: 3,
      oppose: 0,
      qualify: 0,
      question: 0,
      provenance: ["heat"],
      sourceMix: ["observed"],
    });
    const claims = store.getClaims();
    expect(claims).toHaveLength(1);
    expect(claims[0].claimText).toBe("The user is frustrated");
  });

  it("updates an existing claim", () => {
    const store = new BlackboardStore("round-1");
    store.addClaim({
      id: "c1",
      claimText: "Test",
      support: 1,
      oppose: 0,
      qualify: 0,
      question: 0,
      provenance: ["drive"],
      sourceMix: ["observed"],
    });
    store.updateClaim("c1", { support: 5, oppose: 2 });
    const claims = store.getClaims();
    expect(claims[0].support).toBe(5);
    expect(claims[0].oppose).toBe(2);
  });

  it("shifts style dimensions", () => {
    const store = new BlackboardStore("round-1");
    store.shiftStyle("warmth", 0.3);
    store.shiftStyle("warmth", 0.2);
    store.shiftStyle("directness", -0.5);
    const style = store.getStyleField();
    expect(style.warmth).toBeCloseTo(0.5);
    expect(style.directness).toBeCloseTo(-0.5);
  });

  it("adds and retrieves vetoes", () => {
    const store = new BlackboardStore("round-1");
    store.addVeto({
      id: "v1",
      targetId: "c1",
      cause: "Too harsh",
      traitId: "tact",
      power: 8,
    });
    expect(store.getVetoes()).toHaveLength(1);
    expect(store.getVetoes()[0].cause).toBe("Too harsh");
  });

  it("logs and retrieves actions", () => {
    const store = new BlackboardStore("round-1");
    store.logAction({
      id: "a1",
      traitId: "drive",
      type: "PUSH_CLAIM",
      power: 12,
      params: { claim: "We need a plan" },
      status: "applied",
    });
    expect(store.getActionLog()).toHaveLength(1);
    expect(store.getActionLog()[0].type).toBe("PUSH_CLAIM");
  });

  it("adds and retrieves bridges", () => {
    const store = new BlackboardStore("round-1");
    store.addBridge({
      id: "b1",
      left: "c1",
      right: "c2",
      kind: "concession",
      strength: 0.7,
    });
    expect(store.getBridges()).toHaveLength(1);
    expect(store.getBridges()[0].kind).toBe("concession");
  });

  it("manages salience map", () => {
    const store = new BlackboardStore("round-1");
    store.setSalience("frustration", 0.8);
    store.setSalience("plan", 0.5);
    const map = store.getSalienceMap();
    expect(map.frustration).toBe(0.8);
    expect(map.plan).toBe(0.5);
  });

  it("exposes raw blackboard state", () => {
    const store = new BlackboardStore("round-1");
    store.addClaim({
      id: "c1",
      claimText: "Test",
      support: 1,
      oppose: 0,
      qualify: 0,
      question: 0,
      provenance: [],
      sourceMix: [],
    });
    const raw = store.getBlackboard();
    expect(raw.roundId).toBe("round-1");
    expect(raw.claimGraph.c1).toBeDefined();
  });
});
