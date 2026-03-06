# T03: Create @multi-mind/blackboard package (schema + store)

**Priority:** P0
**Phase:** 1 — Foundation
**Parallelizable:** yes (only depends on T01)
**Depends on:** T01

## Goal

Create the `packages/blackboard` package with the `RoundBlackboard` schema, an in-memory `BlackboardStore`, and the foundation for action tools.

## Scope

- Create `packages/blackboard/` with `package.json`, `tsconfig.json`, `src/index.ts`
- Implement schemas: `ClaimNode`, `TensionBridge`, `VetoRecord`, `ActionRecord`, `RoundBlackboard`
- Implement `BlackboardStore` class with read/write operations for all blackboard sections
- Implement `createEmptyBlackboard(roundId)` factory

## Steps

1. Write tests for BlackboardStore (create, read, write claims, vetoes, style, actions)
2. Create `packages/blackboard/package.json` with dep on `@multi-mind/shared`
3. Write `packages/blackboard/src/schema.ts` — all blackboard interfaces
4. Write `packages/blackboard/src/store.ts` — `BlackboardStore` class wrapping a `RoundBlackboard`
5. Write `packages/blackboard/src/index.ts` re-exporting all
6. Add `"packages/blackboard"` to root workspaces

## Implementation Notes

- `BlackboardStore` is an in-memory mutable store for one round. Methods:
  - `getClaims()`, `addClaim(claim)`, `updateClaim(id, update)`
  - `getStyleField()`, `shiftStyle(dim, delta, traitId)`
  - `addVeto(veto)`, `getVetoes()`
  - `logAction(record)`, `getActionLog()`
  - `addBridge(bridge)`, `getBridges()`
  - `getSalienceMap()`, `setSalience(key, value)`
- Research note: if traits run in parallel, the store needs conflict-safe writes. For v1, traits run sequentially within priority tiers, so simple mutation is safe.
- Action tools (push-claim, resist-claim, etc.) are in a separate ticket (T07)

## Acceptance

### Tests
- `packages/blackboard/src/store.test.ts`:
  - Create empty blackboard, verify all fields initialized
  - Add/update claims, verify graph state
  - Shift style dimensions, verify accumulation
  - Add vetoes and verify retrieval
  - Log actions and verify action log

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
```

## References

- [schemas.md](../schemas.md) — `@multi-mind/blackboard` section
- Spec: `.pstdio/docs/specs/04-actions-and-blackboard.md` — blackboard structure, action mechanics
- [research.md](../research.md) — §2 blackboard concurrency note
