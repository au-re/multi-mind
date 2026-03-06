# T09: Full round integration — 9 traits + braider

**Priority:** P1
**Phase:** 3 — Actions and Braiding
**Parallelizable:** no (integrates T04, T06, T07, T08)
**Depends on:** T04, T06, T07, T08

## Goal

Wire the complete turn pipeline: scene analysis -> activation -> join -> clarity -> initiative -> run all active trait agents with tools -> braider -> cleanup -> return response.

## Scope

- Update `processTurn` in engine controller to call braider after trait phase
- Wire blackboard action tools into trait agent toolset
- Add post-turn cleanup: update trait cooldown/fatigue, encode canonical event
- Integration test with mocked LLM that exercises the full pipeline

## Steps

1. Write integration test: mock `createKasAgent` for all trait + braider calls, verify end-to-end flow
2. Update `packages/engine/src/controller.ts`:
   - After trait phase, call `runBraider(blackboard, characterVoice, runtime)`
   - After braider, call `cleanupResponse`
   - Update `traitState` (cooldown, fatigue) for traits that acted
   - Return `AssistantTurn` with braider output
3. Update trait runner to pass `buildTraitToolset` result as tools
4. Add memory event encoding stub (actual encoding in T15)

## Implementation Notes

- Trait cooldown: each active trait gets +1 cooldown, decaying by 1 per turn (clamped to 0)
- Trait fatigue: each trait accumulates fatigue based on action count, decaying by 0.5 per turn
- Cooldown > 0 imposes a -2 penalty on activation DC
- This ticket makes the engine functionally complete (minus memory persistence)
- The integration test should verify: correct number of trait agents activated, blackboard populated, braider called with blackboard state, final response returned

## Acceptance

### Tests
- `packages/engine/src/controller.integration.test.ts`:
  - Full processTurn with mocked LLM: 3-5 traits activate, each adds claims, braider produces output
  - Cooldown/fatigue updated after turn
  - ActionLog contains entries from all active traits
  - Final response passes through cleanup

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
```

## References

- [proposal.md](../proposal.md) — Build Order Phase 3, step 9
- Spec: `.pstdio/docs/specs/01-system-overview.md` — full turn loop
- Spec: `.pstdio/docs/specs/03-agent-setup.md` — cooldown, fatigue mechanics
