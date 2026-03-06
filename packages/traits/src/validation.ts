import type { TraitConfig } from "./types";
import { TRAIT_CONSTRAINTS } from "./types";

export function validateSkillBudget(traits: TraitConfig[]) {
  const total = traits.reduce((sum, t) => sum + t.skill, 0);
  const valid = total >= TRAIT_CONSTRAINTS.totalSkillBudgetMin && total <= TRAIT_CONSTRAINTS.totalSkillBudgetMax;
  return { total, valid };
}

export function clampSkill(skill: number) {
  return Math.max(TRAIT_CONSTRAINTS.skillMin, skill);
}
