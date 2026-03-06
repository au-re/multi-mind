# 03. Agent Setup

## 1. Overview

Every trait is instantiated as its own **KAS agent** with:
- its own `systemPrompt`
- the shared model config
- a round-local `Tool[]` set
- max turns tuned low (`1..3`)
- no direct visibility into the full workspace except through approved tools

The braider is also a KAS agent, but with a different prompt and read-only tool set.

## 2. Why use `createKasAgent` for traits

The current repo source shows `createKasAgent(opts)` is a wrapper around `createAgent` + `createLLMTask`, and it accepts:
- `model`
- `apiKey`
- `baseURL`
- `systemPrompt`
- `tools`
- `reasoning`
- `maxTurns`
- `dangerouslyAllowBrowser`

That is enough to run one agent per trait with custom prompts and action tools.

## 3. Agent categories

### 3.1 Trait agent
Purpose:
- spend its round budget on blackboard actions

Tools:
- action tools only
- optional read-only introspection tools for its own shadow memory files

### 3.2 Braider agent
Purpose:
- convert blackboard state into one character utterance

Tools:
- read-only blackboard / memory tools
- optional “draft scratchpad” tool
- no direct mutation of long-term memory

### 3.3 Maintenance agents (optional later)
- memory summarizer
- archive compactor
- tuning assistant

These are not needed in v1.

## 4. Activation, join, clarity

## 4.1 Scene rating

```ts
interface TraitRating {
  relevance: number;      // 0..1
  difficulty: number;     // 0..1
  domainFit: number;      // 0..1
  triggerBonus: number;   // 0..4
  expectedUnknownRatio: number; // 0..1
}
```

```ts
function rateSceneForTrait(scene: Scene, trait: TraitConfig): TraitRating {
  const relevance = weightedSceneScore(scene, trait.salienceWeights);
  const domainFit = domainSimilarity(scene.domainTags, trait.knowledgeDomains);
  const expectedUnknownRatio = estimateUnknownRatio(scene.units, trait);

  const difficulty = clamp01(
    0.4 * scene.technicalDensity +
    0.2 * scene.abstractness +
    0.2 * scene.ambiguity +
    0.2 * (1 - domainFit) +
    0.25 * expectedUnknownRatio
  );

  return {
    relevance,
    difficulty,
    domainFit,
    triggerBonus: countTriggerHits(scene, trait.hardTriggers),
    expectedUnknownRatio,
  };
}
```

## 4.2 Activation check (“do I want in?”)

```ts
function wantsToEnterRound(
  trait: TraitConfig,
  tstate: TraitRuntimeState,
  rating: TraitRating,
  rng: RNG,
): boolean {
  const wantDc = clampInt(
    8,
    22,
    14 - Math.round(5 * rating.relevance) + tstate.cooldown + Math.round(2 * tstate.fatigue),
  );

  let actRoll = d20(rng);
  let actTotal =
    actRoll +
    Math.round(trait.skill / 4) +
    trait.impulseBias +
    rating.triggerBonus;

  if (rating.relevance > 0.85 || rating.triggerBonus >= 2) {
    actRoll = Math.max(d20(rng), d20(rng)); // advantage
    actTotal =
      actRoll +
      Math.round(trait.skill / 4) +
      trait.impulseBias +
      rating.triggerBonus;
  }

  return actTotal >= wantDc;
}
```

## 4.3 Join check (“can I contribute?”)

```ts
function runJoinCheck(
  trait: TraitConfig,
  rating: TraitRating,
  rng: RNG,
): { success: boolean; roll: number; dc: number; margin: number } {
  const dc = clampInt(6, 35, 10 + Math.round(15 * rating.difficulty) - Math.round(4 * rating.relevance));

  let roll = d20(rng) + trait.skill + Math.round(3 * rating.domainFit);

  if (rating.difficulty > 0.85 && rating.domainFit < 0.25) {
    roll = Math.min(d20(rng), d20(rng)) + trait.skill + Math.round(3 * rating.domainFit);
  }

  return {
    success: roll >= dc,
    roll,
    dc,
    margin: roll - dc,
  };
}
```

## 4.4 Clarity check (“how much do I perceive?”)

```ts
function runClarityCheck(
  trait: TraitConfig,
  scene: Scene,
  join: { dc: number },
  rng: RNG,
  familiarityBonus = 0,
): { roll: number; dc: number; margin: number } {
  const dc = clampInt(
    6,
    35,
    join.dc + Math.round(4 * scene.technicalDensity) + Math.round(3 * scene.abstractness),
  );

  const roll = d20(rng) + trait.skill + familiarityBonus;

  return { roll, dc, margin: roll - dc };
}
```

## 5. Identity activation packet

Built every round for every active trait.

```ts
interface IdentityPacket {
  whoAmI: string;
  whatICareAboutNow: string;
  howISound: string;
  whatIWontFake: string;
  currentPull: string;
}
```

```ts
function buildIdentityPacket(trait: TraitConfig, memories: ShadowTrace[]): IdentityPacket {
  return {
    whoAmI: trait.identityAnchors[0],
    whatICareAboutNow: inferCurrentValue(trait, memories),
    howISound: trait.voiceAnchors[0],
    whatIWontFake: boundarySummary(trait),
    currentPull: memories[0]?.feltLine ?? "Nothing old is pulling especially hard.",
  };
}
```

## 6. Per-round KAS agent creation

```ts
import { createKasAgent } from "@pstdio/kas";

function createTraitKasAgent(
  runtime: RuntimeConfig,
  trait: TraitConfig,
  systemPrompt: string,
  tools: Tool[],
) {
  return createKasAgent({
    model: runtime.model,
    apiKey: runtime.apiKey,
    baseURL: runtime.baseURL,
    systemPrompt,
    tools,
    reasoning: { effort: "medium" },
    maxTurns: 2,
  });
}
```

## 7. Prompt stack

### 7.1 Global stack
1. Root `AGENTS.md` guidance
2. Character baseline voice prompt
3. Trait-specific prompt
4. Per-round developer note:
   - identity packet
   - filtered view
   - memory cues
   - action budget
   - allowed tools
   - non-negotiable constraints

### 7.2 Example developer note

```md
## Round context
Trait: Inquiry
Skill: 16
Join margin: +5
Clarity margin: -1
Visible ratio: 0.61

## Identity pulse
- Who I am: I look for hidden patterns and alternate readings.
- What I care about now: whether this situation means more than it first appears to.
- How I sound: exploratory but not fluffy.
- What I won't fake: certainty about masked content.
- Current pull: "This reminds me of the last time the surface explanation hid the real motive."

## Observed text
"I want to quit tomorrow. I'm exhausted, but I'm not sure if I'm overreacting."

## Memory cues
- "Last time the decision felt urgent because the shame was louder than the facts."
- "There was a real turning point once the pattern was named correctly."

## Allowed tools
- propose_frame
- bridge_tension
- seed_lexicon
- recall_trace
- qualify_claim

## Constraints
- Do not speak as a visible separate voice.
- Do not invent masked details.
- Use tools to act on the shared workspace.
```

## 8. Budget computation

```ts
interface ActionBudget {
  major: number;
  minor: number;
  reaction: number;
}

function computeActionBudget(joinMargin: number, clarityMargin: number): ActionBudget {
  const budget: ActionBudget = { major: 1, minor: 1, reaction: 1 };

  if (joinMargin >= 5) budget.minor += 1;
  if (joinMargin >= 10) budget.reaction += 1;
  if (clarityMargin < 0) budget.major = Math.min(budget.major, 1); // same count, but restricted by policy

  return budget;
}
```

## 9. Initiative

```ts
function rollInitiative(trait: TraitConfig, joinMargin: number, rng: RNG): number {
  const marginBonus = Math.max(0, Math.floor(joinMargin / 5));
  return d20(rng) + trait.skill + trait.initiativeBias + marginBonus;
}
```
