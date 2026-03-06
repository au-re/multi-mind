# T13: Implement memory retrieval scoring

**Priority:** P2
**Phase:** 5 — Memory and Polish
**Parallelizable:** yes (depends on T05)
**Depends on:** T05

## Goal

Implement the memory retrieval system that scores and selects relevant shadow traces for each trait before their turn.

## Scope

- Implement `retrieveShadowMemories(traitId, scene, store, limit)` in `packages/memory/src/retrieval.ts`
- Implement scoring: text overlap + tag matching + salience + recency decay
- Return ranked `ShadowTrace[]` within the limit

## Steps

1. Write tests for retrieval scoring with known traces and scenes
2. Write `packages/memory/src/retrieval.ts`:
   - `scoreShadowTrace(trace, scene, trait)` -> number
   - `retrieveShadowMemories(traitId, scene, store, limit)` -> `ShadowTrace[]`
3. Scoring components:
   - **Tag overlap:** count of shared `domainTags` between scene and trace's parent canonical event
   - **Text overlap:** word overlap between `scene.rawUserText` and `trace.gist`
   - **Salience:** `trace.salience` directly
   - **Recency:** exponential decay based on turn distance
   - **Certainty bonus:** `trace.certainty * 0.2`

## Implementation Notes

- V1 skips embeddings/cosine similarity — uses text heuristics only
- Scoring formula: `tagOverlap * 3 + textOverlap * 2 + salience * 2 + recency + certaintyBonus`
- Recency: `Math.exp(-turnDistance / 10)` where turnDistance = current turn - trace's turn
- Limit defaults to 5 traces per trait
- The retriever needs access to canonical events to get domain tags for the trace's parent event
- Results are converted to `MemoryCue[]` via `createMemoryCue` (from T05) for blackboard injection

## Acceptance

### Tests
- `packages/memory/src/retrieval.test.ts`:
  - High-salience recent trace scores higher than low-salience old trace
  - Tag overlap boosts score significantly
  - Limit is respected — returns top N
  - Empty store returns empty array

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
```

## References

- [research.md](../research.md) — §8 Embeddings adaptation (v1: no embeddings)
- Spec: `.pstdio/docs/specs/05-memory-retrieval.md` — retrieval scoring
- Spec: `.pstdio/docs/specs/07-long-term-memory.md` — shadow trace fields used in scoring
