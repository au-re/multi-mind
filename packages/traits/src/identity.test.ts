import { describe, expect, it } from "vitest";
import type { TraitConfig } from "./config.ts";
import { buildIdentityPacket } from "./identity.ts";

const MOCK_TRAIT: TraitConfig = {
  id: "inquiry",
  label: "Inquiry",
  skill: 16,
  impulseBias: 0,
  initiativeBias: 1,
  identityAnchors: ["I look for hidden patterns and alternate readings."],
  voiceAnchors: ["exploratory but not fluffy"],
  knowledgeDomains: ["philosophy", "psychology"],
  blockedDomains: [],
  salienceWeights: {},
  styleBias: {},
  compactionProfile: {},
  taintProfile: {},
  actionBias: {},
  hardTriggers: [],
};

describe("buildIdentityPacket", () => {
  it("uses first identity anchor as whoAmI", () => {
    const packet = buildIdentityPacket(MOCK_TRAIT, []);
    expect(packet.whoAmI).toBe("I look for hidden patterns and alternate readings.");
  });

  it("uses first voice anchor as howISound", () => {
    const packet = buildIdentityPacket(MOCK_TRAIT, []);
    expect(packet.howISound).toBe("exploratory but not fluffy");
  });

  it("sets default currentPull when no memories", () => {
    const packet = buildIdentityPacket(MOCK_TRAIT, []);
    expect(packet.currentPull).toContain("Nothing");
  });

  it("uses first memory feltLine as currentPull when available", () => {
    const memories = [{ feltLine: "Last time the surface hid the real motive." }];
    const packet = buildIdentityPacket(MOCK_TRAIT, memories as never[]);
    expect(packet.currentPull).toBe("Last time the surface hid the real motive.");
  });

  it("populates all required fields", () => {
    const packet = buildIdentityPacket(MOCK_TRAIT, []);
    expect(packet.whoAmI).toBeTruthy();
    expect(packet.whatICareAboutNow).toBeTruthy();
    expect(packet.howISound).toBeTruthy();
    expect(packet.whatIWontFake).toBeTruthy();
    expect(packet.currentPull).toBeTruthy();
  });
});
