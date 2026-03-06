# T07: Implement blackboard action tools

**Priority:** P1
**Phase:** 3 — Actions and Braiding
**Parallelizable:** yes (only depends on T03)
**Depends on:** T03

## Goal

Implement the blackboard action tools that trait agents use to mutate the shared blackboard during their turn. Each tool is a `Tool` from `@pstdio/tiny-ai-tasks` that the KAS agent can call.

## Scope

- Implement one tool per file in `packages/blackboard/src/tools/`:
  - `push-claim.ts` — add a new claim to the claim graph
  - `resist-claim.ts` — oppose/qualify an existing claim
  - `select-mode.ts` — vote for a response mode (explain, challenge, comfort, etc.)
  - `shift-style.ts` — nudge a style dimension (warmth, directness, etc.)
  - `add-bridge.ts` — create a tension bridge between two claims
  - `cast-veto.ts` — veto a claim or style shift
  - `inject-lexicon.ts` — add words/phrases to the lexical pool
  - `set-salience.ts` — adjust salience scores for topics
- Implement `buildTraitToolset(traitId, budget, blackboard)` — returns the tool array for a trait
- Implement action power computation and normalization

## Steps

1. Write tests for each tool: verify blackboard mutations after tool execution
2. Write `packages/blackboard/src/power.ts` — `computeActionPower(traitSkill, actionType, budget)`, `normalizeActions(actionLog)`
3. Write each tool file in `packages/blackboard/src/tools/`
4. Write `packages/blackboard/src/toolset.ts` — `buildTraitToolset` that assembles tools with budget-aware wrappers
5. Write `packages/blackboard/src/conflict.ts` — challenge resolution when claims conflict
6. Update `packages/blackboard/src/index.ts` to export toolset builder

## Implementation Notes

- Each tool follows the pattern: `Tool(handler, { name, description, parameters })` from `@pstdio/tiny-ai-tasks`
- The handler receives parsed args and mutates the `BlackboardStore`
- Budget enforcement: the toolset wrapper tracks remaining actions (major/minor/reaction) and rejects calls that exceed budget
- Action power = `traitSkill * actionBias[actionType] * (1 + clarityMargin / 20)`
- Veto power must exceed the target's support to succeed
- `conflict.ts`: when two claims directly oppose, compare support totals; loser gets status "tension"
- **Assumption:** `@pstdio/tiny-ai-tasks` `Tool` export is accessible — verify import path

## Acceptance

### Tests
- `packages/blackboard/src/tools/push-claim.test.ts`: adds claim to graph with correct fields
- `packages/blackboard/src/tools/resist-claim.test.ts`: increases oppose/qualify on target claim
- `packages/blackboard/src/tools/shift-style.test.ts`: shifts style dimension by correct delta
- `packages/blackboard/src/tools/cast-veto.test.ts`: creates veto record, suppresses target if power sufficient
- `packages/blackboard/src/power.test.ts`: power computation and normalization
- `packages/blackboard/src/toolset.test.ts`: budget enforcement rejects excess actions
- `packages/blackboard/src/conflict.test.ts`: opposing claims resolved correctly

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
```

## References

- [schemas.md](../schemas.md) — `ClaimNode`, `VetoRecord`, `ActionRecord`
- Spec: `.pstdio/docs/specs/04-actions-and-blackboard.md` — full action list, power mechanics, conflict resolution
- [research.md](../research.md) — §3 Tool primitives
