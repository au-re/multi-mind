# 99. Sources and Compatibility Notes

## Kaset / repo grounding used for this spec

### Main repo and docs
- GitHub repo: `https://github.com/pufflyai/kaset`
- Docs home: `https://kaset.dev/`

### Key docs consulted
- Coding Agents in the Browser: `https://kaset.dev/concepts/kas.html`
- Quick Start: `https://kaset.dev/getting-started/quick-start.html`
- Your App as a Filesystem: `https://kaset.dev/concepts/filesystem.html`
- Agent Behavior: `https://kaset.dev/modifications/behavior.html`
- Packages Overview: `https://kaset.dev/packages/overview.html`
- `@pstdio/tiny-ai-tasks`: `https://kaset.dev/packages/tiny-ai-tasks.html`

### Repo source files consulted
- `packages/@pstdio/kas/src/index.ts`
- `packages/@pstdio/kas/src/agent.ts`
- `packages/@pstdio/kas/src/approval.ts`
- `packages/@pstdio/kas/src/instructions.ts`
- `packages/@pstdio/tiny-ai-tasks/src/index.ts`
- `packages/@pstdio/tiny-ai-tasks/src/agents/createAgent.ts`
- `packages/@pstdio/tiny-ai-tasks/src/summarize/summarizeHistory.ts`
- `packages/@pstdio/tiny-ai-tasks/src/messages/bus.ts`
- `packages/@pstdio/tiny-ai-tasks/src/tools/Tool.ts`
- `packages/@pstdio/tiny-ai-tasks/src/tools/toOpenAITools.ts`
- `packages/@pstdio/tiny-ai-tasks/src/utils/messageTypes.ts`

## Important compatibility note

The Kaset public docs show a quick-start API where `createKasAgent` is initialized with workspace-focused options like `workspaceDir`, `approvalGatedTools`, and `requestApproval`. The current repo source visible in `packages/@pstdio/kas/src/agent.ts` instead exposes a slimmer options object centered on:
- `model`
- `apiKey`
- `baseURL`
- `systemPrompt`
- `tools`
- `reasoning`
- `maxTurns`
- `dangerouslyAllowBrowser`

Approval handling is exposed separately in `approval.ts`, and workspace instruction loading is exposed separately in `instructions.ts`.

This spec therefore:
- uses `createKasAgent` as the agent wrapper
- treats workspace access and action semantics as explicit tool wiring
- treats `AGENTS.md` loading as a separate step
- treats the deterministic controller as responsible for activation, skill checks, and state orchestration

## Why this matters

It keeps the design implementable against the repo surface that is visible today, while still aligning with Kaset’s documented filesystem-first / OPFS-first design philosophy.
