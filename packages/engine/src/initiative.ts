import type { RNG, TraitId } from "@multi-mind/shared";
import { d20 } from "@multi-mind/shared";
import type { TraitConfig } from "@multi-mind/traits";

export function rollInitiative(trait: TraitConfig, joinMargin: number, rng: RNG) {
  const marginBonus = Math.max(0, Math.floor(joinMargin / 5));
  return d20(rng) + trait.skill + trait.initiativeBias + marginBonus;
}

export function orderByInitiative<T extends { traitId: TraitId; initiative: number }>(entries: T[]) {
  return [...entries].sort((a, b) => b.initiative - a.initiative);
}
