# Add Webapp Character Flow

**Status:** draft
**Created:** 2026-03-06
**Depends on:** `add-traits-and-zustand-config`

## Summary

Replace the single-page chat UI with a multi-page character flow. Users land on a characters list, can create new characters with trait configuration, and open any character into a split-panel view with memories and chat.

## Context

### What exists

- The webapp has one route (`/`) rendering `AgentPage` — a full-screen chat interface
- Router: TanStack React Router with hash-based history
- UI framework: Chakra UI v3, React 19
- No character management, no trait editing, no multi-page navigation
- The `add-traits-and-zustand-config` proposal adds `packages/traits` (types, roster, validation), Zustand stores (`trait-store`, `character-store`), and a read-only trait display panel

### What this proposal adds

1. **Characters page** — list all characters, create new ones
2. **Character page** — split-panel view with memories and chat
3. **Character edit page** — trait skill level editing with budget validation
4. **Routing** — three new routes replacing the current single route
5. **Character list store** — Zustand store managing multiple characters

## Proposed Changes

### 1. Route Structure

```
/                              -> CharactersPage (list + create)
/characters/$characterId       -> CharacterPage (memories + chat)
/characters/$characterId/edit  -> CharacterEditPage (trait config)
```

The current `AgentPage` at `/` is replaced by `CharactersPage`. The catch-all redirect stays.

#### Router changes (`webapp/src/router.tsx`)

- Add a `charactersRoute` layout route under root for `/characters`
- Add `characterRoute` (`$characterId`) and `characterEditRoute` (`$characterId/edit`)
- Replace the index route component from `AgentPage` to `CharactersPage`

### 2. Characters Page (`/`)

File: `webapp/src/features/characters/pages/characters-page.tsx`

- Reads from `useCharacterListStore()` to get all characters
- Renders a grid of `CharacterCard` components
- "New Character" button creates a character with default traits and navigates to its edit page
- Empty state when no characters exist

#### `CharacterCard` component

File: `webapp/src/features/characters/components/character-card.tsx`

- Shows character name
- Shows a compact trait summary (e.g. top 3 traits by skill level)
- Click navigates to `/characters/$characterId`
- Edit button navigates to `/characters/$characterId/edit`

### 3. Character Page (`/characters/$characterId`)

File: `webapp/src/features/characters/pages/character-page.tsx`

- Reads `$characterId` from route params
- Loads character from store, redirects to `/` if not found
- Two-panel horizontal layout:
  - **Left panel:** `MemoryPanel` — placeholder for canonical event list (shows empty state for now)
  - **Right panel:** Chat interface — reuses `MessageList` + `ChatInput` from `features/agent/`
- Header bar with character name and back link to `/`

#### `MemoryPanel` component

File: `webapp/src/features/characters/components/memory-panel.tsx`

- Placeholder component showing "No memories yet"
- Will be wired to canonical events in a future proposal

### 4. Character Edit Page (`/characters/$characterId/edit`)

File: `webapp/src/features/characters/pages/character-edit-page.tsx`

- Reads `$characterId` from route params
- Loads character from store, redirects to `/` if not found
- Character name input field
- `TraitEditor` showing all 9 traits with editable skill levels
- `BudgetIndicator` showing total skill budget and valid/invalid state
- Save button — writes to character list store, navigates to character page
- Cancel button — discards changes, navigates back

#### `TraitEditor` component

File: `webapp/src/features/characters/components/trait-editor.tsx`

- Renders all 9 traits using `TraitSlider`
- Manages local draft state (copy of traits from store)
- Exposes `onChange` and current trait array

#### `TraitSlider` component

File: `webapp/src/features/characters/components/trait-slider.tsx`

- Single trait row: label + slider (0-20) + numeric display
- Uses Chakra UI `Slider` component
- Fires `onChange(traitId, newSkill)` on adjustment

#### `BudgetIndicator` component

File: `webapp/src/features/characters/components/budget-indicator.tsx`

- Shows `current / max` (e.g. "97 / 90-110")
- Green when in valid range (90-110), red when outside
- Uses `validateSkillBudget()` from `@multi-mind/traits`

### 5. Character List Store

File: `webapp/src/stores/character-list-store.ts`

This extends the stores from the `add-traits-and-zustand-config` proposal. Instead of a single `trait-store` and `character-store`, we manage a **list of characters**, each with their own traits and voice profile.

State:
- `characters: Character[]` — all characters
- `activeCharacterId: string | null` — currently viewed character

```ts
interface Character {
  id: string;
  name: string;
  traits: TraitConfig[];
  voice: CharacterVoiceProfile;
  createdAt: string;
}
```

Actions:
- `createCharacter(name: string)` — creates character with default traits from `@multi-mind/traits`, returns id
- `deleteCharacter(id: string)` — removes a character
- `updateCharacter(id: string, patch: Partial<Character>)` — update name, traits, or voice
- `setActiveCharacter(id: string | null)` — set which character is active

Selectors:
- `selectCharacterById(id: string)` — lookup
- `selectActiveCharacter()` — active character or null

### 6. Integration with Existing Agent Hook

The `useAgent` hook in `features/agent/hooks/use-agent.ts` currently hardcodes an `AGENT_CONFIG`. The character page will:

- Pass the character's config (model, baseURL) to `useAgent`
- Keep the same `useAgent` API — just parameterize the config per character
- The `AGENT_CONFIG` constant moves from `AgentPage` to be derived from the active character

## File Structure

```
webapp/src/
  features/
    characters/
      pages/
        characters-page.tsx          # List + create
        character-page.tsx           # Memories + chat
        character-edit-page.tsx      # Trait editing
      components/
        character-card.tsx           # List item card
        trait-editor.tsx             # All 9 traits editor
        trait-slider.tsx             # Single trait slider
        budget-indicator.tsx         # Skill budget display
        memory-panel.tsx             # Placeholder memories
  stores/
    character-list-store.ts          # Character CRUD store
```

## Build Order

### Phase 1 — Store
1. Create `character-list-store.ts` with Character type, CRUD actions, and selectors
2. Add unit tests for store actions

### Phase 2 — Routing
3. Update `router.tsx` with new route tree
4. Create page component stubs (render placeholder text)
5. Verify navigation works end-to-end

### Phase 3 — Characters List Page
6. Create `character-card.tsx`
7. Create `characters-page.tsx` with grid layout and create button
8. Add Storybook stories for `CharacterCard`

### Phase 4 — Character Edit Page
9. Create `trait-slider.tsx`
10. Create `budget-indicator.tsx`
11. Create `trait-editor.tsx`
12. Create `character-edit-page.tsx` wiring editor to store
13. Add Storybook stories for trait editing components

### Phase 5 — Character Page
14. Create `memory-panel.tsx` placeholder
15. Create `character-page.tsx` with split layout and chat integration
16. Verify full flow: create -> edit -> view -> chat

### Phase 6 — Validation
17. Run `bun run format && bun run lint && bun run build && bun run test`
18. Update E2E tests for new navigation flow

## Touch Points

| Area | Files / Packages | Change Type |
|---|---|---|
| Webapp routing | `webapp/src/router.tsx` | Update |
| Webapp stores | `webapp/src/stores/character-list-store.ts` | Create |
| Characters feature | `webapp/src/features/characters/` (8 files) | Create |
| Agent page | `webapp/src/features/agent/pages/agent-page.tsx` | May become unused (chat reused directly) |
| Agent hook | `webapp/src/features/agent/hooks/use-agent.ts` | Update (parameterize config) |
| Dependencies | `webapp/package.json` | Update (zustand — covered by traits proposal) |
| E2E tests | `packages/e2e/` | Update |

## Non-Goals

- Persistence (characters are in-memory only — persistence comes with OPFS proposal)
- Character voice profile editing (only trait skill levels in this proposal)
- Memory retrieval and display (memory panel is a placeholder)
- Engine integration (chat still uses raw `useAgent` / KAS agent)
- Character avatars or images
- Character import/export
