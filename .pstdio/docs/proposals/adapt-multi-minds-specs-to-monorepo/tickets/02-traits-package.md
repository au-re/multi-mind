# T02: Create @multi-mind/traits package

**Priority:** P0
**Phase:** 1 — Foundation
**Parallelizable:** yes (only depends on T01)
**Depends on:** T01

## Goal

Create the `packages/traits` workspace package with trait config types, the 9-trait roster, identity packet builder, and action budget computation.

## Scope

- Create `packages/traits/` with `package.json`, `tsconfig.json`, `src/index.ts`
- Implement types: `TraitId`, `TraitConfig`, `IdentityPacket`, `ActionBudget`, `TraitRating`
- Implement the 9 default trait definitions (roster)
- Implement `buildIdentityPacket(trait, scene)` — constructs the identity block for a trait's system prompt
- Implement `computeActionBudget(rating, clarityMargin)` — determines major/minor/reaction action counts
- Implement `buildSystemPrompt(trait, identity, memories)` and `buildDeveloperNote(trait, budget, round)`

## Steps

1. Write tests for roster (9 traits with valid config shapes), identity builder, budget computation
2. Create `packages/traits/package.json` with dep on `@multi-mind/shared`
3. Write `packages/traits/src/config.ts` — `TraitId` union, `TraitConfig` interface
4. Write `packages/traits/src/roster.ts` — 9 trait definitions with skill scores, domains, biases
5. Write `packages/traits/src/identity.ts` — `buildIdentityPacket`
6. Write `packages/traits/src/budget.ts` — `computeActionBudget`, `TraitRating`
7. Write `packages/traits/src/prompt.ts` — system prompt and developer note builders
8. Write `packages/traits/src/index.ts` re-exporting all
9. Add `"packages/traits"` to root workspaces

## Implementation Notes

- The 9 traits are: integrity, warmth, tact, vigilance, heat, drive, structure, presence, inquiry
- Roster values come from spec §02 — use the example character profile as default
- `computeActionBudget`: base is `{major: 1, minor: 1, reaction: 1}`. Clarity margin > 5 adds +1 minor, > 10 adds +1 major. High rating relevance adds +1 minor.
- `buildSystemPrompt` assembles: identity anchors + voice anchors + knowledge domains + identity packet + memory cues
- `buildDeveloperNote` assembles: budget limits + blocked domains + round context
- **Assumption:** Exact roster skill scores are placeholder values until character design is finalized

## Acceptance

### Tests
- `packages/traits/src/roster.test.ts`: all 9 traits present, valid TraitConfig shape, no duplicate IDs
- `packages/traits/src/budget.test.ts`: budget computation for various clarity margins
- `packages/traits/src/identity.test.ts`: identity packet fields populated from trait config

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
```

## References

- [schemas.md](../schemas.md) — `@multi-mind/traits` section
- Spec: `.pstdio/docs/specs/02-traits.md` — trait definitions, skill scores
- Spec: `.pstdio/docs/specs/03-agent-setup.md` — identity packet, system prompt, developer note
