# T05: Create @multi-mind/memory package (schemas + in-memory store)

**Priority:** P1
**Phase:** 2 — Core Loop
**Parallelizable:** yes (only depends on T01, T02)
**Depends on:** T01, T02

## Goal

Create the `packages/memory` package with canonical event and shadow trace schemas, memory cue types, and an in-memory store implementation.

## Scope

- Create `packages/memory/` with `package.json`, `tsconfig.json`, `src/index.ts`
- Implement schemas: `CanonicalEvent`, `ShadowTrace`, `MemoryCue`, `MemoryStore`
- Implement `InMemoryMemoryStore` class
- Implement `createMemoryCue(trace)` — converts a ShadowTrace to a MemoryCue for blackboard injection

## Steps

1. Write tests for InMemoryMemoryStore (add/get canonical events, add/get shadow traces by trait)
2. Create `packages/memory/package.json` with deps on shared, traits
3. Write `packages/memory/src/canonical.ts` — `CanonicalEvent` interface
4. Write `packages/memory/src/shadow.ts` — `ShadowTrace` interface
5. Write `packages/memory/src/cue.ts` — `MemoryCue` interface, `createMemoryCue(trace)`
6. Write `packages/memory/src/store.ts` — `MemoryStore` interface, `InMemoryMemoryStore`
7. Write `packages/memory/src/index.ts`
8. Add `"packages/memory"` to root workspaces

## Implementation Notes

- `MemoryStore` interface:
  - `addCanonicalEvent(event)`, `getCanonicalEvents()`, `getCanonicalEvent(eventId)`
  - `addShadowTrace(trace)`, `getShadowTraces(traitId)`, `getAllShadowTraces()`
- `InMemoryMemoryStore` stores arrays in memory — no persistence yet (that's T13)
- `createMemoryCue` maps: `traceId`, `gist`, `feltLine`, one `noticed` item as `noticedDetail`, `certainty`, and infers `useMode` from appraisal keywords
- Embeddings are optional (`embedding?: number[]`) — v1 skips them
- No retrieval scoring yet (that's T14)

## Acceptance

### Tests
- `packages/memory/src/store.test.ts`:
  - Add and retrieve canonical events
  - Add shadow traces for different traits, retrieve by traitId
  - Empty store returns empty arrays
- `packages/memory/src/cue.test.ts`:
  - createMemoryCue maps fields correctly
  - useMode inference from appraisal text

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
```

## References

- [schemas.md](../schemas.md) — `@multi-mind/memory` section
- Spec: `.pstdio/docs/specs/05-memory-retrieval.md` — memory cue structure
- Spec: `.pstdio/docs/specs/07-long-term-memory.md` — canonical events, shadow traces
