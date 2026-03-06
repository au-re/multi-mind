import type { TraitConfig } from "./config.ts";

export interface IdentityPacket {
  whoAmI: string;
  whatICareAboutNow: string;
  howISound: string;
  whatIWontFake: string;
  currentPull: string;
}

interface MemoryLike {
  feltLine: string;
}

export function buildIdentityPacket(trait: TraitConfig, memories: MemoryLike[]) {
  return {
    whoAmI: trait.identityAnchors[0],
    whatICareAboutNow: `Watching for: ${trait.knowledgeDomains.slice(0, 3).join(", ")}`,
    howISound: trait.voiceAnchors[0],
    whatIWontFake: `I stay true to: ${trait.identityAnchors[0]}`,
    currentPull: memories[0]?.feltLine ?? "Nothing old is pulling especially hard.",
  };
}
