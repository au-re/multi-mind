# Tickets — Adapt Multi-Minds Specs to Monorepo

## Dependency Graph

```
T01 (shared) ─────┬──── T02 (traits) ───┬──── T06 (trait wiring) ──── T09 (full round) ──── T10 (useEngine) ──── T11 (chat UI)
                   │                     │                              │
                   ├──── T03 (blackboard)┤──── T07 (action tools) ─────┘
                   │                     │
                   │                     ├──── T08 (braider) ──────────┘
                   │                     │
                   └──── T05 (memory) ───┼──── T12 (persistence)
                                         ├──── T13 (retrieval)
                                         ├──── T14 (encoding) ────────── depends on T09
                                         └──── T15 (aperture) ────────── depends on T04

T04 (engine) ─────── depends on T01, T02, T03
```

## Phase 1 — Foundation (P0, parallelizable)

| Ticket | Title | Depends on | Parallelizable |
|--------|-------|-----------|----------------|
| [T01](01-shared-package.md) | Create @multi-mind/shared package | none | yes |
| [T02](02-traits-package.md) | Create @multi-mind/traits package | T01 | yes |
| [T03](03-blackboard-schema-store.md) | Create @multi-mind/blackboard package (schema + store) | T01 | yes |

## Phase 2 — Core Loop (P0)

| Ticket | Title | Depends on | Parallelizable |
|--------|-------|-----------|----------------|
| [T04](04-engine-controller.md) | Create @multi-mind/engine (controller + activation) | T01, T02, T03 | no |
| [T05](05-memory-schemas-store.md) | Create @multi-mind/memory (schemas + store) | T01, T02 | yes |
| [T06](06-trait-agent-wiring.md) | Wire trait agent execution in engine | T02, T03, T04 | no |

## Phase 3 — Actions and Braiding (P1)

| Ticket | Title | Depends on | Parallelizable |
|--------|-------|-----------|----------------|
| [T07](07-blackboard-action-tools.md) | Implement blackboard action tools | T03 | yes |
| [T08](08-braider-package.md) | Create @multi-mind/braider package | T01, T02, T03 | yes |
| [T09](09-full-round-integration.md) | Full round integration | T04, T06, T07, T08 | no |

## Phase 4 — Integration (P2)

| Ticket | Title | Depends on | Parallelizable |
|--------|-------|-----------|----------------|
| [T10](10-use-engine-hook.md) | Create use-engine hook in webapp | T09 | no |
| [T11](11-chat-ui-engine-integration.md) | Connect chat UI to engine | T10 | no |

## Phase 5 — Memory and Polish (P2-P3)

| Ticket | Title | Depends on | Parallelizable |
|--------|-------|-----------|----------------|
| [T12](12-memory-persistence.md) | Memory persistence (OPFS + fs) | T05 | yes |
| [T13](13-memory-retrieval.md) | Memory retrieval scoring | T05 | yes |
| [T14](14-shadow-trace-encoding.md) | Shadow trace encoding after turns | T05, T09 | yes |
| [T15](15-epistemic-aperture.md) | Epistemic aperture (trait view filtering) | T04, T05 | yes |

## Max Parallelism Opportunities

- **After T01:** T02, T03, T05 can all start in parallel
- **After T03:** T07, T08 can start in parallel (even before T04)
- **After T05:** T12, T13 can start in parallel
- **After T09:** T10, T14 can start in parallel
