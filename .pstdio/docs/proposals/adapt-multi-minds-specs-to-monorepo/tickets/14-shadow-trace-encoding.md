# T14: Implement shadow trace encoding after turns

**Priority:** P2
**Phase:** 5 — Memory and Polish
**Parallelizable:** yes (depends on T05, T09)
**Depends on:** T05, T09

## Goal

After each turn, encode the canonical event and per-trait shadow traces from the blackboard state, then persist them to the memory store.

## Scope

- Implement `encodeCanonicalEvent(scene, braiderOutput, turnId)` in `packages/memory/src/encoder.ts`
- Implement `encodeShadowTrace(traitId, traitSummary, scene, canonicalEventId)` in `packages/memory/src/encoder.ts`
- Wire encoding into `processTurn` post-braider phase

## Steps

1. Write tests for encoding functions
2. Write `packages/memory/src/encoder.ts`:
   - `encodeCanonicalEvent`: extracts `userMessageSummary`, `assistantReplySummary`, `domainTags`, `facts`, `emotionalSummary` from scene + braider output
   - `encodeShadowTrace`: extracts `salience` (from trait's action power), `appraisal` (from trait's claims), `gist` (summary of trait's actions), `feltLine`, `noticed`/`ignored` (from trait view), `certainty` (from clarity margin)
3. Update `packages/engine/src/controller.ts` — after braider, call encoding for canonical event + each active trait's shadow trace
4. Store results via `memoryStore.addCanonicalEvent()` and `memoryStore.addShadowTrace()`

## Implementation Notes

- V1 encoding is deterministic (no LLM call) — derive fields from blackboard state:
  - `gist` = concatenation of trait's claim texts
  - `feltLine` = dominant style dimension from trait's style shifts
  - `salience` = average action power of trait's actions
  - `noticed` = domain tags that matched trait's knowledge domains
  - `ignored` = domain tags that didn't match
  - `certainty` = `clamp01(0.5 + clarityMargin / 20)`
- Future: could use an LLM call for richer encoding
- `moodColor` = trait's style delta as a record

## Acceptance

### Tests
- `packages/memory/src/encoder.test.ts`:
  - encodeCanonicalEvent produces valid CanonicalEvent from scene + braider output
  - encodeShadowTrace produces valid ShadowTrace with correct salience, certainty
  - Fields derived correctly from blackboard state

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
```

## References

- [schemas.md](../schemas.md) — `CanonicalEvent`, `ShadowTrace` interfaces
- Spec: `.pstdio/docs/specs/07-long-term-memory.md` — encoding rules
- Spec: `.pstdio/docs/specs/05-memory-retrieval.md` — what fields matter for retrieval
