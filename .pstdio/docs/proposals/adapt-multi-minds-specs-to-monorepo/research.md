# Research — Spec-to-Repo Gap Analysis

## Spec assumptions vs repo reality

### 1. OPFS as primary storage

**Spec says:** All state lives in OPFS. Uses `@pstdio/opfs-utils` for read/write. File paths like `/memory/canonical/`, `/runtime/rounds/current/`.

**Repo reality:** The webapp already uses `@pstdio/kas` which includes `createOpfsTools`. OPFS is available in modern browsers. However, unit tests run in Bun/Node where OPFS doesn't exist.

**Adaptation:** Abstract storage behind an interface. Provide two implementations:
- `OpfsStore` for browser runtime (uses `@pstdio/opfs-utils`)
- `InMemoryStore` for tests and SSR

### 2. KAS agent API surface

**Spec says:** Uses `createKasAgent({ model, apiKey, baseURL, systemPrompt, tools, reasoning, maxTurns })`. Agents are async iterables yielding message chunks.

**Repo reality:** The webapp's `use-agent.ts` already uses this exact API from `@pstdio/kas@0.2.1`. The hook calls `createKasAgent` and iterates over `agent(messages)`.

**Adaptation:** The spec's agent usage matches what's already in the repo. The trait and braider agent factories can use the same pattern.

### 3. Tool primitives

**Spec says:** Uses `Tool` from `@pstdio/tiny-ai-tasks`. Tool signature is `Tool(handler, { name, description, parameters })`.

**Repo reality:** `@pstdio/kas` depends on `@pstdio/tiny-ai-tasks` (it's in the dependency chain). Need to verify the `Tool` export is accessible.

**Adaptation:** Import `Tool` from `@pstdio/tiny-ai-tasks` directly. Add it as a dependency to `@multi-mind/blackboard`.

### 4. Gateway vs direct API calls

**Spec says:** Agents use `model`, `apiKey`, `baseURL` directly — implying direct LLM API calls.

**Repo reality:** The gateway proxies `/openai/v1` to OpenAI. The webapp's vite config proxies `/v1` to `localhost:3000`. The `use-agent` hook creates agents with `baseURL: "/v1"` and no API key.

**Adaptation:** Keep using the gateway. Set `baseURL` to the gateway URL. No API key needed client-side — the gateway injects it.

### 5. Nine trait agents per turn = 9+ LLM calls

**Spec says:** Each active trait makes 1-3 LLM calls, plus the braider makes 1-2. A busy turn could be 10-20 LLM calls.

**Repo reality:** This is expensive and slow. Users will notice latency.

**Adaptation:** V1 mitigations:
- Activation checks filter out traits (typically 4-6 active, not all 9)
- Set `maxTurns: 1` for traits (single tool-use turn)
- Run trait agents in parallel where possible (no ordering dependency in primary phase within the same priority tier)
- Consider a "fast mode" with fewer traits and lower reasoning effort

### 6. D20 dice mechanics

**Spec says:** Uses `d20(rng)` rolls for activation, join, clarity, initiative. RNG is seeded.

**Repo reality:** No dice code exists. This is pure math — easy to implement.

**Adaptation:** Create a seeded PRNG (e.g. mulberry32) in `packages/shared`. All dice functions are deterministic given the seed, which makes testing easy.

### 7. Scene analysis

**Spec says:** Parse user message into Scene with `intent`, `domainTags`, `urgency`, `socialRisk`, `ambiguity`, `technicalDensity`, `abstractness`, `units`.

**Repo reality:** No scene analysis exists. The spec doesn't specify whether this is LLM-powered or heuristic.

**Adaptation:** V1: use a lightweight LLM call (single `createKasAgent` with a small prompt) to extract scene tags. Keep it to one fast call. Fall back to keyword heuristics if needed.

### 8. Embeddings

**Spec says:** `CanonicalEvent` and `ShadowTrace` have `embedding: number[]` fields. Memory retrieval uses `cosine(scene.embedding, trace.embedding)`.

**Repo reality:** No embedding infrastructure. The gateway only proxies chat completions, not embeddings.

**Adaptation:** V1: make embeddings optional (already noted in spec §07.10). Use text overlap + tag matching + salience scoring for retrieval. Add embeddings later when an embedding endpoint is available.

## Complexity budget

| Subsystem | Files (est.) | Complexity | Priority |
|---|---|---|---|
| shared | 3 | Low | P0 |
| traits (config + roster) | 5 | Low | P0 |
| blackboard (schema + store) | 3 | Low | P0 |
| engine (controller + checks) | 5 | Medium | P0 |
| blackboard (action tools) | 15 | Medium | P1 |
| memory (schemas + store) | 5 | Low | P1 |
| braider | 5 | Medium | P1 |
| memory (retrieval + encoding) | 4 | Medium | P2 |
| memory (aperture + views) | 3 | High | P2 |
| webapp integration | 3 | Medium | P2 |
| memory (persistence/OPFS) | 3 | Medium | P3 |

Total: ~54 source files across 6 packages.

## Risk areas

1. **LLM call volume** — 10+ calls per turn is slow and expensive. Need aggressive filtering and parallelism.
2. **Blackboard concurrency** — If traits run in parallel, the in-memory blackboard needs conflict-safe writes (or serial execution).
3. **OPFS availability** — OPFS works in main thread and workers but has quirks per browser. Need graceful fallback.
4. **KAS API stability** — `@pstdio/kas` is at 0.2.1. The API may change. Pin the version and isolate behind our own factory functions.
