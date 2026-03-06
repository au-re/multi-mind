# T10: Create use-engine hook in webapp

**Priority:** P2
**Phase:** 4 — Integration
**Parallelizable:** no (depends on T09)
**Depends on:** T09

## Goal

Create a `useEngine` React hook that wraps the engine's `processTurn` and replaces the current direct `createKasAgent` usage in the webapp.

## Scope

- Create `webapp/src/features/agent/hooks/use-engine.ts`
- Replace `useAgent` usage in `agent-page.tsx` with `useEngine`
- Initialize engine state (runtime config, character voice, trait roster, in-memory store, seeded RNG)
- Stream intermediate status (which traits are active, braider running) to UI

## Steps

1. Write test for useEngine: mock engine processTurn, verify state transitions
2. Write `webapp/src/features/agent/hooks/use-engine.ts`:
   - Initialize `EngineState` on mount (default runtime config, default roster, empty memory)
   - `send(input)` calls `processTurn(state, input)` and updates conversation store
   - Expose `isRunning`, `activeTraits` (list of currently acting trait IDs), `phase` (scene/traits/braider)
3. Update `webapp/src/features/agent/pages/agent-page.tsx` to use `useEngine` instead of `useAgent`
4. Keep `useAgent` for now (it may be useful for non-engine agent interactions)

## Implementation Notes

- `useEngine` manages the full `EngineState` lifecycle
- Runtime config: `{ model: "gpt-5.2", baseURL: window.location.origin + "/openai/v1", reasoningEffort: "medium" }`
- Character voice: use default profile from roster (placeholder values)
- The hook should expose enough state for the UI to show "thinking" indicators per phase
- `processTurn` is async — the hook sets `isRunning: true` during execution
- **Assumption:** The conversation store already handles message state — engine just needs to push the final AssistantTurn

## Acceptance

### Tests
- `webapp/src/features/agent/hooks/use-engine.test.ts`:
  - send() calls processTurn with correct state
  - isRunning toggles during execution
  - Messages updated in conversation store after turn completes
- E2E: `e2e/tests/webapp/chat.spec.ts` — update to test engine-powered conversation flow

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
bun run test:e2e
```

## References

- [proposal.md](../proposal.md) — Webapp changes, Build Order Phase 4
- Existing: `webapp/src/features/agent/hooks/use-agent.ts` — current pattern to replace
- Existing: `webapp/src/features/agent/pages/agent-page.tsx` — page to update
