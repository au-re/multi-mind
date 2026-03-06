# multi-minds

This document set specifies a **single-character / many-traits** system implemented on top of **Kaset**.

The system uses:
- **`createKasAgent`** as the LLM/tool-calling wrapper for **trait agents** and the **braider agent**
- **`Tool`** objects from `@pstdio/tiny-ai-tasks` for blackboard actions
- **OPFS-style filesystem state** as the authoritative runtime and memory store
- **`AGENTS.md` / `agents.md`** as global environment guidance
- **`createSummarizer`** / **`truncateToBudget`** for history compaction

## Why this spec is shaped this way

Kaset is filesystem-first and browser-first. The repo and docs describe KAS as a client-side agent that operates in an OPFS-backed workspace, with streaming responses and approval-gated edits. The package overview also exposes lower-level agent primitives (`createAgent`, `Tool`, `createSummarizer`, `truncateToBudget`) that make it practical to build a higher-level orchestration layer around KAS. In the current repo source, `createKasAgent` is a thin wrapper over `createAgent` + `createLLMTask` and accepts a custom `systemPrompt` and `tools`, which is exactly what this design needs. The same repo also exposes `loadAgentInstructions`, which loads `agents.md` / `AGENTS.md` from the workspace. See `99-sources.md` for the source list.

## Document map

1. `01-system-overview.md`  
   High-level runtime, control flow, and Kaset fit.

2. `02-traits.md`  
   The nine-trait roster, research grounding, action biases, voice deltas, and tainted memory profiles.

3. `03-agent-setup.md`  
   Skill points, activation, join checks, clarity checks, trait config, and per-round KAS agent bootstrapping.

4. `04-actions-and-blackboard.md`  
   The action layer, blackboard schema, tool contracts, conflict resolution, and initiative order.

5. `05-memory-retrieval.md`  
   Canonical events, shadow traces, retrieval scoring, tainted recall, and per-trait view building.

6. `06-braiding-response.md`  
   Claim lattice, style field, discourse planning, and the single-voice braid realizer.

7. `07-long-term-memory.md`  
   Persistence, compaction, summaries, archival, and retrieval hygiene.

8. `08-kaset-implementation.md`  
   TypeScript-oriented implementation skeleton using `createKasAgent`, `Tool`, and filesystem layout.

9. `09-workspace-layout.md`  
   Recommended OPFS layout, `AGENTS.md`, prompt files, schemas, and runtime paths.

10. `10-example-turn.md`  
    Worked turn from input to final braided answer.

11. `99-sources.md`  
    Source grounding and compatibility notes.

## Core implementation stance

This spec deliberately **does not** expose full filesystem browsing to each trait agent. Each trait agent is still a real KAS-based agent, but it receives:
- a **trait-limited message view**
- a **trait-limited memory view**
- a **dynamic action toolset**
- a **round-local blackboard summary**

This avoids trait omniscience while still using the Kaset agent model.

## Key compatibility note

The public Kaset docs show a more integrated `createKasAgent({ workspaceDir, requestApproval, ... })` example, while the current repo source exposes a slimmer `createKasAgent(opts)` plus separate exports for approval gates, tools, and instruction loading. This spec targets the **repo surface that is visible today** and treats workspace access, approvals, and blackboard actions as explicit tools layered around KAS.

## Recommended build order

1. Implement workspace layout and schemas.
2. Implement deterministic controller: scene analysis, activation, join, clarity.
3. Implement blackboard action tools.
4. Implement one trait agent and one braider agent.
5. Add nine traits and shadow-memory retrieval.
6. Add summarization and archival.
7. Tune thresholds.

## Non-goals in v1

- visible inner-voice dialogue
- multi-character scenes
- automatic trait drift auditing
- free-form trait tool access outside the action layer
- unconstrained external browsing or general code editing by traits
