# Adapt Multi-Minds Specs to Monorepo

**Status:** draft
**Created:** 2026-03-06

## Summary

Map the multi-minds spec (`.pstdio/docs/specs/`) onto the existing Bun monorepo. The specs describe a single-character / many-traits agent system built on Kaset (`@pstdio/kas`). The current repo has a minimal webapp with a chat UI, an OpenAI gateway proxy, and E2E tests — but no engine code. This proposal defines the package layout, key interfaces, build order, and integration points needed to implement the engine.

## Context

### What the specs describe

A system that renders **one coherent character** from **nine latent trait agents**. Each trait is a real KAS agent with skill scores, activation/join/clarity checks, filtered message views, tainted memory, and constrained action tools. Traits act on a shared **blackboard** during each turn. A **braider agent** reads the blackboard and produces a single-voice response. Memory is split into canonical events and per-trait shadow traces.

Key subsystems:
1. **Controller** — deterministic orchestrator (scene analysis, activation, initiative, phase management)
2. **Trait agents** — 9 KAS agents with round-scoped tool envelopes
3. **Blackboard** — shared mutable state (claims, style, tensions, vetoes)
4. **Memory** — canonical events + 9 shadow trace stores + retrieval scoring
5. **Braider** — KAS agent that converts blackboard into final text
6. **Workspace** — OPFS-backed file layout for config, memory, runtime state

### What the repo has today

- `webapp/` — React 19 + Vite + Chakra UI chat interface, `useAgent` hook wrapping `createKasAgent`
- `gateway/` — AgentGateway proxy routing to OpenAI
- `packages/e2e/` — Playwright E2E tests
- `deploy/` — Docker Compose orchestration
- No engine, trait, blackboard, or memory packages

## Proposed Package Layout

```
packages/
  engine/              # Core orchestration — the "controller"
    src/
      controller.ts    # processTurn loop
      scene.ts         # scene analysis
      activation.ts    # trait rating, activation, join, clarity checks
      initiative.ts    # initiative rolls, phase ordering
      dice.ts          # d20, RNG utilities
      index.ts
    package.json       # @multi-mind/engine

  traits/              # Trait definitions and agent factory
    src/
      config.ts        # TraitConfig, TraitId types
      roster.ts        # 9 default trait definitions
      prompt.ts        # system prompt + developer note builders
      agent-factory.ts # createTraitKasAgent wrapper
      identity.ts      # identity packet builder
      budget.ts        # action budget computation
      index.ts
    package.json       # @multi-mind/traits

  blackboard/          # Shared round state + action tools
    src/
      schema.ts        # RoundBlackboard, ClaimNode, etc.
      store.ts         # BlackboardStore (read/write round state)
      tools/           # one file per action tool
        push-claim.ts
        resist-claim.ts
        select-mode.ts
        shift-style.ts
        ...
      toolset.ts       # buildTraitToolset (dynamic tool envelope)
      power.ts         # action power + normalization
      conflict.ts      # challenge resolution
      index.ts
    package.json       # @multi-mind/blackboard

  memory/              # Canonical events, shadow traces, retrieval
    src/
      canonical.ts     # CanonicalEvent schema + read/write
      shadow.ts        # ShadowTrace schema + read/write
      retrieval.ts     # retrieveShadowMemories scoring
      cue.ts           # MemoryCue conversion
      encoder.ts       # encodeShadowTrace, encodeCanonicalEvent
      aperture.ts      # epistemic aperture + trait view building
      store.ts         # MemoryStore abstraction
      index.ts
    package.json       # @multi-mind/memory

  braider/             # Braider agent + response realization
    src/
      prompt.ts        # braider system prompt + developer note
      claim-lattice.ts # claim clustering + tension scoring
      style-field.ts   # style field aggregation
      agent.ts         # runBraider using createKasAgent
      cleanup.ts       # post-pass deterministic cleanup
      index.ts
    package.json       # @multi-mind/braider

  shared/              # Shared types and utilities
    src/
      types.ts         # RuntimeConfig, EngineState, Scene, etc.
      utils.ts         # clamp, clamp01, clampInt
      index.ts
    package.json       # @multi-mind/shared
```

### Webapp changes

- `webapp/src/features/agent/hooks/use-agent.ts` — replace direct `createKasAgent` usage with `@multi-mind/engine` `processTurn`
- New `webapp/src/features/agent/hooks/use-engine.ts` — hook wrapping the engine with React state
- Config UI (later) for character voice and trait tuning

### What stays the same

- `gateway/` — no changes needed, still proxies OpenAI
- `deploy/` — no changes needed for v1
- `packages/e2e/` — update tests once UI reflects engine output

## Key Design Decisions

### 1. OPFS vs filesystem abstraction

The specs assume OPFS (browser filesystem). For v1, we abstract storage behind a `Store` interface so the engine works in both browser (OPFS) and Node/Bun (regular fs) contexts. This enables testing outside the browser.

### 2. Engine runs client-side

The controller and all agent calls run in the browser, matching Kaset's browser-first philosophy. The gateway proxies LLM API calls. No server-side engine code.

### 3. Packages are pure TypeScript libraries

All `packages/*` are plain TypeScript with no React dependencies (except the webapp itself). This keeps the engine testable and portable.

### 4. Trait agents are ephemeral

Trait KAS agents are created per-round and discarded. No persistent agent state beyond what the memory system stores.

### 5. V1 simplifications (from spec 07 and 10)

- No vector embeddings — use text search + tags + salience scoring
- No monthly archive compaction — just accumulate
- No familiarity index — static domain matching
- Simplified scene analysis — keyword/tag based, not LLM-powered

## Build Order

### Phase 1 — Foundation

1. Create `packages/shared` with types and utilities
2. Create `packages/blackboard` with schema and store (in-memory first)
3. Create `packages/traits` with config types and roster

### Phase 2 — Core Loop

4. Create `packages/engine` with controller, scene analysis, activation checks
5. Create `packages/memory` with canonical/shadow schemas and in-memory store
6. Wire controller to run one trait agent end-to-end

### Phase 3 — Actions and Braiding

7. Implement blackboard action tools (one per file)
8. Create `packages/braider` with prompt builder and agent wrapper
9. Full round: 9 traits + braider producing output

### Phase 4 — Integration

10. Create `use-engine` hook in webapp
11. Connect chat UI to engine pipeline
12. Update E2E tests for new flow

### Phase 5 — Memory and Polish

13. Implement memory persistence (OPFS in browser, fs in tests)
14. Implement memory retrieval scoring
15. Implement shadow trace encoding after turns
16. Add trait view filtering (epistemic aperture)

## Touch Points

| Area | Files / Packages | Change Type |
|---|---|---|
| New packages | `packages/shared`, `engine`, `traits`, `blackboard`, `memory`, `braider` | Create |
| Webapp hook | `webapp/src/features/agent/hooks/use-agent.ts` | Replace |
| Webapp page | `webapp/src/features/agent/pages/agent-page.tsx` | Update |
| Root config | `package.json` (workspace entries) | Update |
| E2E tests | `packages/e2e/tests/webapp/home.spec.ts` | Update |
| Root tsconfig | `tsconfig.base.json` (path aliases) | Update |

## Open Questions

- [MISSING INFORMATION] What LLM model and API key flow should the webapp use? Currently the gateway proxies OpenAI — should the engine call the gateway or use `@pstdio/kas` directly with an API key?
- [MISSING INFORMATION] Should the `AGENTS.md` and workspace config files live in the repo (static) or be created at runtime in OPFS?
- [MISSING INFORMATION] What character profile should we ship as the default? The specs show an example but don't commit to a specific character.
- [MISSING INFORMATION] How should we handle the `@pstdio/kas` dependency — is it available on npm or vendored? The webapp already uses it at `0.2.1`.

## Non-Goals

- Visible inner-voice dialogue
- Multi-character scenes
- Automatic trait drift auditing
- Server-side engine execution
- Vector database integration (v1)
