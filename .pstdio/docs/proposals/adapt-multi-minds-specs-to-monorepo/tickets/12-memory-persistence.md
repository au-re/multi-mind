# T12: Implement memory persistence (OPFS + fs)

**Priority:** P2
**Phase:** 5 — Memory and Polish
**Parallelizable:** yes (depends on T05)
**Depends on:** T05

## Goal

Implement the `Store` abstraction with two backends: `OpfsStore` for browser runtime and `FsStore` for Bun/Node tests. Wire the memory package to use these stores.

## Scope

- Implement `OpfsStore` in `packages/memory/src/opfs-store.ts` — OPFS-backed JSON/JSONL read/write
- Implement `FsStore` in `packages/memory/src/fs-store.ts` — filesystem-backed for tests
- Implement `PersistentMemoryStore` that wraps a `Store` and persists canonical events and shadow traces
- Wire memory store selection based on environment

## Steps

1. Write tests for FsStore (uses temp dirs)
2. Write `packages/shared/src/store.ts` — `Store` interface (`readJson`, `writeJson`, `appendJsonl`, `list`)
3. Write `packages/memory/src/fs-store.ts` — `FsStore` implementing `Store` using `node:fs/promises`
4. Write `packages/memory/src/opfs-store.ts` — `OpfsStore` implementing `Store` using OPFS API
5. Write `packages/memory/src/persistent-store.ts` — `PersistentMemoryStore` extending `InMemoryMemoryStore` with save/load from `Store`
6. Update exports

## Implementation Notes

- `Store` interface lives in `@multi-mind/shared` (from ADR)
- `OpfsStore` uses `navigator.storage.getDirectory()` + file handles for read/write
- `FsStore` uses `Bun.file` / `node:fs/promises` for read/write
- File layout follows spec §09: `/memory/canonical/{eventId}.json`, `/memory/shadow/{traitId}/{traceId}.json`
- `appendJsonl` is used for audit logs — one JSON object per line
- `PersistentMemoryStore.load()` reads all files on init; `.save()` writes dirty entries
- **Assumption:** OPFS is available in the browser main thread (not just workers)

## Acceptance

### Tests
- `packages/memory/src/fs-store.test.ts`:
  - writeJson + readJson roundtrip
  - appendJsonl creates valid JSONL
  - list returns file paths under prefix
- `packages/memory/src/persistent-store.test.ts`:
  - Save canonical events, reload from store, verify data integrity
  - Save shadow traces by trait, reload correctly

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
```

## References

- [adr.md](../adr.md) — Store interface definition
- [research.md](../research.md) — §1 OPFS adaptation, §3 OPFS availability
- Spec: `.pstdio/docs/specs/09-workspace-layout.md` — file layout
- Spec: `.pstdio/docs/specs/07-long-term-memory.md` — persistence format
