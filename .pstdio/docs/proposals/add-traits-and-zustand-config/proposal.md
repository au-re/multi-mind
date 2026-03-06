# Add Traits Package and Zustand Config Management

**Status:** draft
**Created:** 2026-03-06

## Summary

Create the `packages/traits` library with trait types, the 9-trait roster, and prompt builders. Add Zustand as the webapp state management layer with stores for trait configuration. Add a read-only trait display panel showing all 9 traits.

## Context

### What exists

- The specs define 9 traits based on Big Five Aspects + Honesty-Humility (spec 02)
- A `TraitConfig` TypeScript interface and `TraitId` union are specified (spec 02, section 3)
- A default `traits.json` with one example trait is shown (spec 09, section 4)
- The webapp has no state management — all state is local `useState` in `use-agent.ts`
- Zustand is not yet installed

### What this proposal adds

1. **`packages/traits`** — shared library with types, default roster, and prompt fragment builders
2. **Zustand stores** — in the webapp, managing trait configs and character state
3. **Trait display panel** — read-only UI component showing all 9 traits and their skill levels

## Proposed Changes

### 1. `packages/traits` — Shared Trait Library

```
packages/traits/
  src/
    types.ts          # TraitId, TraitConfig, TraitRating, TraitRuntimeState
    roster.ts         # DEFAULT_TRAITS: all 9 trait definitions with defaults
    prompt.ts         # renderTraitGuide(), renderTraitRoundDeveloperNote()
    identity.ts       # buildIdentityPacket()
    budget.ts         # computeActionBudget()
    validation.ts     # validateTraitConfig(), validateSkillBudget()
    index.ts          # public API barrel
  package.json        # @multi-mind/traits
  tsconfig.json
```

Key decisions:
- Pure TypeScript, zero runtime dependencies
- Exports types and functions only — no React, no side effects
- Contains the full 9-trait roster with all fields from spec 02 and spec 09
- Validation helpers enforce spec constraints (skill 0..20, total budget 90-110, biases -2..+2)

### 2. Zustand Stores in Webapp

Add `zustand` as a dependency to `webapp/package.json`.

New files:

```
webapp/src/stores/
  trait-store.ts      # Trait config state + actions
  character-store.ts  # Character voice profile state (placeholder for later)
```

#### `trait-store.ts`

State:
- `traits: TraitConfig[]` — the 9 trait configs for the active character
- `selectedTraitId: TraitId | null` — which trait is selected for detail editing

Actions:
- `setTraits(traits: TraitConfig[])` — replace full roster (e.g. load from file)
- `updateTrait(id: TraitId, patch: Partial<TraitConfig>)` — edit a single trait
- `setSkill(id: TraitId, skill: number)` — update skill level with clamping
- `resetToDefaults()` — load DEFAULT_TRAITS from `@multi-mind/traits`
- `selectTrait(id: TraitId | null)` — set selected trait for detail view

Derived (computed via selectors):
- `totalSkillBudget` — sum of all trait skills
- `isValidBudget` — whether total is in 90-110 range
- `traitById(id)` — lookup helper

#### `character-store.ts`

Minimal placeholder store for character voice profile. Will be expanded in a future proposal when the braider is implemented.

State:
- `characterVoice: CharacterVoiceProfile` — from spec 09 section 3

### 3. Trait Display Panel

Read-only panel that visualizes the current character's 9 traits.

```
webapp/src/features/traits/
  components/
    trait-display-panel.tsx    # Panel showing all 9 traits with skill levels
    trait-bar.tsx              # Single trait bar displaying name and skill level
```

#### `trait-display-panel.tsx`

Reads from the trait Zustand store and renders all 9 traits as a compact list. Each trait shows its name and skill level via `trait-bar.tsx`. No editing — display only.

#### `trait-bar.tsx`

Displays a single trait with:
- Trait label
- Skill level (0-20) as a horizontal bar or badge
- Visual intensity mapped to skill level

### 4. Persistence (V1)

Trait configs are stored in-memory via Zustand. No persistence layer in this proposal — that will come with the workspace/OPFS integration. The store provides `setTraits()` for loading and the state is serializable for future persistence.

## Build Order

### Phase 1 — Traits Package
1. Create `packages/traits` with `package.json`, `tsconfig.json`
2. Implement `types.ts` with `TraitId`, `TraitConfig`, and related types
3. Implement `roster.ts` with all 9 default trait definitions
4. Implement `validation.ts` for config validation
5. Implement `prompt.ts` and `identity.ts`
6. Implement `budget.ts`
7. Add unit tests for validation and budget computation

### Phase 2 — Zustand Stores
8. Install `zustand` in webapp
9. Create `trait-store.ts` with state, actions, and selectors
10. Create `character-store.ts` placeholder
11. Add unit tests for store actions and selectors

### Phase 3 — Trait Display Panel
12. Create `trait-bar.tsx` component
13. Create `trait-display-panel.tsx` component
14. Add Storybook stories for trait display components

### Phase 4 — Validation
15. Run format, lint, build, test

## Touch Points

| Area | Files / Packages | Change Type |
|---|---|---|
| New package | `packages/traits/` | Create |
| Webapp dependency | `webapp/package.json` | Update (add zustand) |
| Webapp stores | `webapp/src/stores/trait-store.ts` | Create |
| Webapp stores | `webapp/src/stores/character-store.ts` | Create |
| Webapp UI | `webapp/src/features/traits/` | Create |
| Root config | `package.json` (workspace entries — already includes packages/*) | No change needed |


## Non-Goals

- Trait config editing UI (will be a separate proposal)
- Engine integration (covered by the existing monorepo proposal)
- Blackboard or memory packages
- Braider implementation
- OPFS persistence
- Trait runtime state (cooldown, fatigue) — that belongs in the engine
