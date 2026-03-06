# T04: Create @multi-mind/engine package (controller + activation)

**Priority:** P0
**Phase:** 2 — Core Loop
**Parallelizable:** no (integrates T01-T03)
**Depends on:** T01, T02, T03

## Goal

Create the `packages/engine` package with the deterministic controller loop: scene analysis, trait activation checks, initiative ordering, and phase management. This is the orchestrator that drives each turn.

## Scope

- Create `packages/engine/` with `package.json`, `tsconfig.json`, `src/index.ts`
- Implement scene analysis (lightweight LLM call to extract Scene)
- Implement trait rating: `rateTrait(trait, scene)` -> `TraitRating`
- Implement activation check: `checkActivation(trait, rating, rng)` -> boolean
- Implement join check: `checkJoin(trait, rating, rng)` -> `{ success, roll, dc, margin }`
- Implement clarity check: `checkClarity(trait, rating, rng)` -> `{ roll, dc, margin }`
- Implement initiative roll: `rollInitiative(trait, rng)` -> number
- Implement `processTurn(state, userMessage)` — the main orchestration loop
- Implement types: `TraitRoundContext`, `TraitView`, `TraitActionSummary`, `UserTurn`, `AssistantTurn`

## Steps

1. Write tests for activation, join, clarity, initiative (deterministic with seeded RNG)
2. Write tests for `rateTrait` with known scene/trait combos
3. Create `packages/engine/package.json` with deps on shared, traits, blackboard
4. Write `packages/engine/src/scene.ts` — `analyzeScene(userMessage, runtime)` -> `Scene`
5. Write `packages/engine/src/activation.ts` — `rateTrait`, `checkActivation`, `checkJoin`, `checkClarity`
6. Write `packages/engine/src/initiative.ts` — `rollInitiative`, `orderByInitiative`
7. Write `packages/engine/src/dice.ts` — re-export from shared or add engine-specific wrappers
8. Write `packages/engine/src/controller.ts` — `processTurn` orchestration
9. Write `packages/engine/src/index.ts`
10. Add `"packages/engine"` to root workspaces

## Implementation Notes

- **Scene analysis (v1):** Single `createKasAgent` call with a small prompt that returns structured JSON. The prompt asks the LLM to extract intent, domainTags, urgency, socialRisk, ambiguity from the user message. Fall back to a heuristic default if the call fails.
- **Activation DC:** `10 + difficulty - domainFit - triggerBonus`. Roll `d20 + skill/2`. Success if roll >= DC.
- **Join DC:** `12 + unknownRatio * 5 - impulseBias`. Roll `d20 + skill/3`.
- **Clarity DC:** `10 + ambiguity * 3`. Roll `d20 + skill/4`. Margin affects budget and visible ratio.
- **Initiative:** `d20 + initiativeBias + (skill / 5)`. Higher goes first.
- **processTurn flow:**
  1. Analyze scene
  2. Rate all 9 traits
  3. Activation check -> filter active traits
  4. Join check -> filter joined traits
  5. Clarity check for each joined trait
  6. Roll initiative, sort by initiative
  7. Run trait agents sequentially (T06 wires this)
  8. Run braider (T08 implements this)
  9. Return final response
- `processTurn` initially returns a stub — full wiring happens in T06

## Acceptance

### Tests
- `packages/engine/src/activation.test.ts`:
  - rateTrait produces expected TraitRating for known inputs
  - checkActivation passes/fails at known DC thresholds with seeded RNG
  - checkJoin passes/fails correctly
  - checkClarity margin affects budget
- `packages/engine/src/initiative.test.ts`:
  - rollInitiative returns deterministic values with seeded RNG
  - orderByInitiative sorts correctly

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
```

## References

- [schemas.md](../schemas.md) — `@multi-mind/engine` section
- [proposal.md](../proposal.md) — Build Order Phase 2
- Spec: `.pstdio/docs/specs/01-system-overview.md` — processTurn loop, activation/join/clarity
- Spec: `.pstdio/docs/specs/03-agent-setup.md` — scene analysis, trait rating
