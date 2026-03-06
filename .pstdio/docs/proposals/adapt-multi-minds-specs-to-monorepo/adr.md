# ADR: Engine Architecture for Multi-Minds

**Status:** proposed
**Date:** 2026-03-06

## Decision

Implement the multi-minds trait engine as a set of pure TypeScript workspace packages (`packages/*`) that run client-side in the browser. The engine orchestrates multiple `createKasAgent` instances (one per active trait + one braider) behind a deterministic controller. Storage is abstracted behind an interface with OPFS and in-memory implementations.

## Context

The specs describe a sophisticated multi-agent system with 9 trait agents, a blackboard action layer, and a braider. We need to decide:

1. Where the engine runs (client vs server)
2. How to structure the code (monolith vs packages)
3. How to handle storage (OPFS vs abstraction)
4. How to manage LLM call cost

## Options Considered

### Option A: Client-side engine, multi-package (chosen)

Engine runs in the browser. Split into 6 focused packages. Storage abstracted behind interfaces.

- (+) Matches Kaset's browser-first philosophy
- (+) No server-side infrastructure needed beyond the gateway
- (+) Packages are independently testable
- (+) Clean separation of concerns
- (-) Browser has limited compute and memory
- (-) LLM calls go through gateway, adding latency

### Option B: Server-side engine

Engine runs on a Node/Bun backend. Webapp is a thin client.

- (+) More compute available
- (+) Can use real databases for memory
- (-) Breaks Kaset's browser-first design
- (-) Requires a new backend service
- (-) Adds complexity to deploy

### Option C: Single engine package

All engine code in one `packages/engine` package.

- (+) Simpler dependency graph
- (-) Large package, harder to navigate
- (-) Can't test subsystems in isolation
- (-) Violates the repo's 350-line file limit at scale

## Consequences

### Package boundaries

- `@multi-mind/shared` — no deps, pure types/utils
- `@multi-mind/traits` — depends on shared
- `@multi-mind/blackboard` — depends on shared, traits
- `@multi-mind/memory` — depends on shared, traits
- `@multi-mind/braider` — depends on shared, traits, blackboard
- `@multi-mind/engine` — depends on all above + `@pstdio/kas`

### Storage abstraction

```ts
interface Store {
  readJson<T>(path: string): Promise<T | null>;
  writeJson<T>(path: string, data: T): Promise<void>;
  appendJsonl<T>(path: string, record: T): Promise<void>;
  list(prefix: string): Promise<string[]>;
}
```

Two implementations: `OpfsStore` (browser) and `InMemoryStore` (tests).

### LLM call management

- Trait activation checks are deterministic (no LLM call) — they filter before agent creation
- Active traits run their KAS agents (1 call each, `maxTurns: 1`)
- Braider runs 1 KAS agent call
- Scene analysis uses 1 lightweight LLM call
- Worst case: ~8 LLM calls per turn (1 scene + 6 active traits + 1 braider)
- Best case: ~4 LLM calls (1 scene + 2 active traits + 1 braider)

### Testing strategy

- Unit tests for deterministic logic (activation, dice, power, conflict resolution) — no LLM mocking needed
- Integration tests for agent factories — mock `createKasAgent` to return canned tool calls
- E2E tests for full pipeline — run against real gateway

## Related

- Spec: `.pstdio/docs/specs/01-system-overview.md` (core loop)
- Spec: `.pstdio/docs/specs/08-kaset-implementation.md` (KAS integration)
- Spec: `.pstdio/docs/specs/09-workspace-layout.md` (storage layout)
