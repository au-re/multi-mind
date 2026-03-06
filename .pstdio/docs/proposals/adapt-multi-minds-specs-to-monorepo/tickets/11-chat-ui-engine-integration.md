# T11: Connect chat UI to engine pipeline

**Priority:** P2
**Phase:** 4 — Integration
**Parallelizable:** no (depends on T10)
**Depends on:** T10

## Goal

Update the chat UI components to display engine-specific state: active traits, current phase, and the braided response.

## Scope

- Update `message-list.tsx` to show engine metadata (optional: which traits contributed)
- Update `chat-input.tsx` to disable during engine processing
- Add a status indicator showing current engine phase (analyzing / traits acting / braiding)
- Update E2E tests for the new flow

## Steps

1. Update `webapp/src/features/agent/components/message-list.tsx` — render phase indicator when engine is running
2. Update `webapp/src/features/agent/components/chat-input.tsx` — disable input while `isRunning`
3. Add a lightweight status bar component showing: "Analyzing scene..." / "Traits deliberating (3/5)..." / "Braiding response..."
4. Update `webapp/src/features/agent/pages/agent-page.tsx` to pass engine phase to components
5. Update `e2e/tests/webapp/chat.spec.ts` — test that messages appear after engine completes

## Implementation Notes

- Phase indicator is a simple text display — no complex animations for v1
- The `useEngine` hook from T10 exposes `phase` and `activeTraits` — use these
- Keep the existing chat UI structure — just add engine awareness
- Trait metadata on messages is optional for v1 — add if simple, skip if complex

## Acceptance

### Tests
- `e2e/tests/webapp/chat.spec.ts`:
  - User sends message, sees processing indicator
  - Response appears after engine completes
  - Input is disabled during processing, re-enabled after

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
bun run test:e2e
```

## References

- [proposal.md](../proposal.md) — Build Order Phase 4, steps 11-12
- Existing: `webapp/src/features/agent/components/message-list.tsx`
- Existing: `webapp/src/features/agent/components/chat-input.tsx`
