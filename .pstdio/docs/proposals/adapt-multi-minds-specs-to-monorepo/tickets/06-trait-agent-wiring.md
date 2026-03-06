# T06: Wire trait agent execution in engine

**Priority:** P0
**Phase:** 2 — Core Loop
**Parallelizable:** no (depends on T02, T03, T04)
**Depends on:** T02, T03, T04

## Goal

Wire the engine controller to create and run a single trait KAS agent end-to-end: build prompts, create the agent via `createKasAgent`, execute with blackboard tools, and collect action results.

## Scope

- Implement `createTraitKasAgent(trait, context, blackboard, runtime)` in `packages/traits/src/agent-factory.ts`
- Implement `runTraitAgent(context, blackboard, runtime)` in `packages/engine/src/trait-runner.ts`
- Wire `processTurn` to call `runTraitAgent` for each joined trait in initiative order
- Build the tool envelope per trait (empty for now — real tools in T07)

## Steps

1. Write integration test: mock `createKasAgent` to return canned tool calls, verify blackboard mutations
2. Write `packages/traits/src/agent-factory.ts` — wraps `createKasAgent` with trait-specific system prompt, developer note, and tools
3. Write `packages/engine/src/trait-runner.ts` — `runTraitAgent` that:
   - Builds identity packet
   - Computes action budget
   - Builds system prompt + developer note
   - Creates KAS agent via factory
   - Runs agent with trait's filtered message view
   - Collects action records from blackboard
   - Returns `TraitActionSummary`
4. Update `packages/engine/src/controller.ts` — `processTurn` loops over joined traits, calls `runTraitAgent`
5. Add `@pstdio/kas` as dependency to `packages/engine`

## Implementation Notes

- `createTraitKasAgent` uses: `createKasAgent({ model, apiKey: "none", baseURL, systemPrompt, tools, dangerouslyAllowBrowser: true, maxTurns: 1 })`
- The trait's message view is a filtered version of the conversation — for v1, pass the full user message (trait view filtering is T16)
- Tool envelope is empty initially — T07 adds the real tools
- `maxTurns: 1` limits each trait to a single tool-use turn to control LLM cost
- The agent factory lives in `packages/traits` because it's trait-specific; the runner lives in `packages/engine` because it orchestrates

## Acceptance

### Tests
- `packages/engine/src/trait-runner.test.ts`:
  - Mock `createKasAgent` to return a tool call sequence
  - Verify trait runner creates agent with correct system prompt
  - Verify action records are logged to blackboard
  - Verify TraitActionSummary is returned
- `packages/traits/src/agent-factory.test.ts`:
  - Verify agent is created with correct config
  - Verify system prompt includes identity anchors and voice anchors

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
```

## References

- [proposal.md](../proposal.md) — Build Order Phase 2, step 6
- [research.md](../research.md) — §2 KAS agent API surface, §4 gateway usage
- Spec: `.pstdio/docs/specs/03-agent-setup.md` — agent creation, prompt assembly
- Spec: `.pstdio/docs/specs/08-kaset-implementation.md` — KAS integration details
- Existing: `webapp/src/features/agent/hooks/use-agent.ts` — current createKasAgent pattern
