# T01: Create @multi-mind/shared package

**Priority:** P0
**Phase:** 1 — Foundation
**Parallelizable:** yes (no dependencies)
**Depends on:** none

## Goal

Create the `packages/shared` workspace package with shared types, utilities, and a seeded PRNG. This is the foundation all other packages depend on.

## Scope

- Create `packages/shared/` with `package.json`, `tsconfig.json`, `src/index.ts`
- Implement types from the schemas doc: `RuntimeConfig`, `Scene`, `MessageUnit`, `CharacterVoiceProfile`, `EngineState`, `TraitRuntimeState`, `RNG`
- Implement utility functions: `clamp`, `clamp01`, `clampInt`
- Implement seeded PRNG (`mulberry32`) and `d20(rng)` dice function
- Add the workspace entry to root `package.json`

## Steps

1. Create `packages/shared/package.json` with name `@multi-mind/shared`, type `module`, main/types pointing to `src/index.ts`
2. Create `packages/shared/tsconfig.json` extending root config
3. Write `packages/shared/src/types.ts` with all shared interfaces (from proposal schemas.md `@multi-mind/shared` section)
4. Write `packages/shared/src/utils.ts` with `clamp`, `clamp01`, `clampInt`
5. Write `packages/shared/src/dice.ts` with `mulberry32(seed)` -> `RNG` and `d20(rng)` -> `number`
6. Write `packages/shared/src/index.ts` re-exporting all
7. Add `"packages/shared"` to root `package.json` workspaces array
8. Write tests first (TDD): `packages/shared/src/utils.test.ts`, `packages/shared/src/dice.test.ts`

## Implementation Notes

- `mulberry32` is a simple 32-bit seeded PRNG — returns `() => number` in [0,1). See spec §01 for dice mechanics.
- `d20(rng)` returns `Math.floor(rng() * 20) + 1`
- The `Store` interface (from ADR) should also live here: `readJson`, `writeJson`, `appendJsonl`, `list`
- `EngineState` references types from `@multi-mind/traits` — use string literal type for `TraitId` here and re-export from traits later
- No React dependencies

## Acceptance

### Tests
- `packages/shared/src/utils.test.ts`: clamp, clamp01, clampInt edge cases
- `packages/shared/src/dice.test.ts`: d20 returns 1-20, mulberry32 is deterministic given seed, produces uniform-ish distribution over 1000 rolls

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
```

## References

- [proposal.md](../proposal.md) — Package layout, Key Design Decisions §1
- [schemas.md](../schemas.md) — `@multi-mind/shared` section
- [adr.md](../adr.md) — Storage abstraction interface
- Spec: `.pstdio/docs/specs/01-system-overview.md` — dice mechanics, RNG
