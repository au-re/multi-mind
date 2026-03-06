import type { RNG, Scene, TraitRuntimeState } from "@multi-mind/shared";
import { clamp01, clampInt, d20 } from "@multi-mind/shared";
import type { TraitConfig } from "@multi-mind/traits";

export interface TraitRating {
  relevance: number;
  difficulty: number;
  domainFit: number;
  triggerBonus: number;
  expectedUnknownRatio: number;
}

export function rateTrait(trait: TraitConfig, scene: Scene): TraitRating {
  const salienceScore = weightedSceneScore(scene, trait.salienceWeights);
  const domainFit = domainSimilarity(scene.domainTags, trait.knowledgeDomains);
  const relevance = clamp01(salienceScore * 0.6 + domainFit * 0.4);
  const expectedUnknownRatio = estimateUnknownRatio(scene.units, trait);

  const difficulty = clamp01(
    0.4 * scene.technicalDensity +
      0.2 * scene.abstractness +
      0.2 * scene.ambiguity +
      0.2 * (1 - domainFit) +
      0.25 * expectedUnknownRatio,
  );

  return {
    relevance,
    difficulty,
    domainFit,
    triggerBonus: countTriggerHits(scene, trait.hardTriggers),
    expectedUnknownRatio,
  };
}

export function checkActivation(trait: TraitConfig, tstate: TraitRuntimeState, rating: TraitRating, rng: RNG) {
  const wantDc = clampInt(
    14 - Math.round(5 * rating.relevance) + tstate.cooldown + Math.round(2 * tstate.fatigue),
    8,
    22,
  );

  let actRoll = d20(rng);
  let actTotal = actRoll + Math.round(trait.skill / 4) + trait.impulseBias + rating.triggerBonus;

  if (rating.relevance > 0.85 || rating.triggerBonus >= 2) {
    actRoll = Math.max(d20(rng), d20(rng));
    actTotal = actRoll + Math.round(trait.skill / 4) + trait.impulseBias + rating.triggerBonus;
  }

  return actTotal >= wantDc;
}

export function checkJoin(trait: TraitConfig, rating: TraitRating, rng: RNG) {
  const dc = clampInt(10 + Math.round(15 * rating.difficulty) - Math.round(4 * rating.relevance), 6, 35);

  let roll: number;
  if (rating.difficulty > 0.85 && rating.domainFit < 0.25) {
    roll = Math.min(d20(rng), d20(rng)) + trait.skill + Math.round(3 * rating.domainFit);
  } else {
    roll = d20(rng) + trait.skill + Math.round(3 * rating.domainFit);
  }

  return {
    success: roll >= dc,
    roll,
    dc,
    margin: roll - dc,
  };
}

export function checkClarity(trait: TraitConfig, scene: Scene, joinDc: number, rng: RNG, familiarityBonus = 0) {
  const dc = clampInt(joinDc + Math.round(4 * scene.technicalDensity) + Math.round(3 * scene.abstractness), 6, 35);

  const roll = d20(rng) + trait.skill + familiarityBonus;

  return { roll, dc, margin: roll - dc };
}

function weightedSceneScore(scene: Scene, weights: Record<string, number>) {
  let score = 0;
  let totalWeight = 0;

  for (const tag of scene.domainTags) {
    const w = weights[tag] ?? 0;
    score += w;
    totalWeight += Math.abs(w);
  }

  score += scene.urgency * (weights.urgency ?? 0);
  score += scene.ambiguity * (weights.ambiguity ?? 0);
  score += scene.socialRisk * (weights.socialRisk ?? 0);
  totalWeight += Math.abs(weights.urgency ?? 0) + Math.abs(weights.ambiguity ?? 0) + Math.abs(weights.socialRisk ?? 0);

  const raw = scene.rawUserText.toLowerCase();
  for (const [keyword, w] of Object.entries(weights)) {
    if (raw.includes(keyword)) {
      score += w * 0.5;
      totalWeight += Math.abs(w) * 0.5;
    }
  }

  return totalWeight > 0 ? clamp01(score / totalWeight) : 0;
}

function domainSimilarity(sceneTags: string[], traitDomains: string[]) {
  if (sceneTags.length === 0 || traitDomains.length === 0) return 0;

  let matches = 0;
  for (const tag of sceneTags) {
    const tagLower = tag.toLowerCase();
    for (const domain of traitDomains) {
      if (domain.toLowerCase().includes(tagLower) || tagLower.includes(domain.toLowerCase())) {
        matches++;
        break;
      }
    }
  }

  return clamp01(matches / sceneTags.length);
}

function estimateUnknownRatio(units: Scene["units"], trait: TraitConfig) {
  if (units.length === 0) return 0.5;

  let unknown = 0;
  for (const unit of units) {
    const domainLower = unit.domain.toLowerCase();
    const known = trait.knowledgeDomains.some(
      (d) => d.toLowerCase().includes(domainLower) || domainLower.includes(d.toLowerCase()),
    );
    if (!known) unknown++;
  }

  return clamp01(unknown / units.length);
}

function countTriggerHits(scene: Scene, triggers: string[]) {
  const raw = scene.rawUserText.toLowerCase();
  let hits = 0;
  for (const trigger of triggers) {
    if (raw.includes(trigger.toLowerCase())) hits++;
  }
  return hits;
}
