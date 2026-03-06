# T08: Create @multi-mind/braider package

**Priority:** P1
**Phase:** 3 — Actions and Braiding
**Parallelizable:** yes (depends on T01, T02, T03)
**Depends on:** T01, T02, T03

## Goal

Create the `packages/braider` package that reads the blackboard after all traits have acted and produces a single coherent response via a braider KAS agent.

## Scope

- Create `packages/braider/` with `package.json`, `tsconfig.json`, `src/index.ts`
- Implement claim lattice: cluster claims, score tensions, build discourse slots
- Implement style field aggregation: merge per-trait style shifts into net style vector
- Implement braider system prompt and developer note builders
- Implement `runBraider(blackboard, characterVoice, runtime)` — creates and runs braider KAS agent
- Implement deterministic post-pass cleanup

## Steps

1. Write tests for claim lattice (clustering, tension scoring), style field aggregation, cleanup
2. Create `packages/braider/package.json` with deps on shared, traits, blackboard
3. Write `packages/braider/src/claim-lattice.ts` — `buildClaimLattice(claimGraph)` -> `BraiderClaim[]`, `buildDiscourseSlots(claims, bridges)` -> `DiscourseSlot[]`
4. Write `packages/braider/src/style-field.ts` — `aggregateStyleField(actionLog, styleField)` -> `Record<StyleDim, StyleFieldCell>`
5. Write `packages/braider/src/prompt.ts` — braider system prompt (includes: discourse slots, style vector, character voice profile, lexical pool)
6. Write `packages/braider/src/agent.ts` — `runBraider` using `createKasAgent`
7. Write `packages/braider/src/cleanup.ts` — `cleanupResponse(text, characterVoice)` — deterministic post-pass (forbidden phrase removal, sentence length enforcement)
8. Write `packages/braider/src/index.ts`
9. Add `"packages/braider"` to root workspaces

## Implementation Notes

- The braider is a single KAS agent call with `maxTurns: 1`
- Its system prompt includes: discourse slots as structured data, style field summary, character voice constraints, lexical pool suggestions
- Developer note includes: forbidden phrases, max sentence length, register level
- `buildClaimLattice` groups claims by provenance overlap, ranks by net support (support - oppose)
- `buildDiscourseSlots` maps claims to slots: highest-support claims go to "core_answer", qualified claims go to "qualification", questions go to "question"
- `cleanupResponse`: remove forbidden phrases, trim sentences exceeding `sentenceLengthBase * 1.5`, apply register-level word substitutions
- **Assumption:** The braider doesn't need tools — it just generates text

## Acceptance

### Tests
- `packages/braider/src/claim-lattice.test.ts`:
  - Claims grouped by provenance overlap
  - Discourse slots assigned correctly
  - Tension bridges affect slot ordering
- `packages/braider/src/style-field.test.ts`:
  - Style shifts from multiple traits aggregate correctly
  - Tension detected when traits push opposite directions
- `packages/braider/src/cleanup.test.ts`:
  - Forbidden phrases removed
  - Long sentences trimmed

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
```

## References

- [schemas.md](../schemas.md) — `@multi-mind/braider` section (StyleDim, BraiderClaim, DiscourseSlot)
- Spec: `.pstdio/docs/specs/06-braiding-response.md` — braiding algorithm, discourse slots, cleanup
- [proposal.md](../proposal.md) — Build Order Phase 3
