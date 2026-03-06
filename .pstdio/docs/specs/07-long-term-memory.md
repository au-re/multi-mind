# 07. Long-Term Memory

## 1. Purpose

Preserve character continuity without giving every trait unlimited raw transcript access.

## 2. Memory layers

### Layer A — Recent working state
High-resolution, recent turns.

```text
/runtime/recent/
  conversation.jsonl
  recent_summary.md
  active_character_state.json
```

### Layer B — Canonical event store
Factual-ish turn summaries.

```text
/memory/canonical/YYYY-MM/
```

### Layer C — Shadow traces
Trait-tainted recollections.

```text
/memory/shadow/<traitId>/
```

### Layer D — Archives
Compacted monthly or size-based bundles.

```text
/memory/archive/
  canonical-2026-03.ndjson
  shadow-inquiry-2026-03.ndjson
```

## 3. Working memory policies

### 3.1 Recent window
Keep:
- last 8–20 turns raw
- rolling summary after that

### 3.2 Trait retrieval cap
Per trait per round:
- max 2 direct shadow traces
- max 1 low-salience associative gloss

### 3.3 Memory write frequency
Write after every assistant turn.

## 4. Summarization

Kaset’s `@pstdio/tiny-ai-tasks` exposes `createSummarizer` and `truncateToBudget`. Use them for:
- recent conversation compaction
- monthly archive summaries
- “developer-note” style condensed histories

### 4.1 Recommended pattern

```ts
import { createLLMTask, createSummarizer } from "@pstdio/tiny-ai-tasks";

const llm = createLLMTask({ model: runtime.model, apiKey: runtime.apiKey });
const summarizeHistory = createSummarizer(llm);

const compacted = await collectFinal(
  summarizeHistory({
    history: extendedHistory,
    opts: { budget: 5000, markSummary: true },
  }),
);
```

### 4.2 Summary role
Summaries should be stored as:
- recent conversation summary
- trait-specific shadow overview (optional)
- monthly archive note

## 5. Long-term retention rules

### Keep forever
- high-salience canonical events
- user rules
- trait-defining “origin” memories
- unresolved unfinished-business traces

### Decay or archive
- low-salience routine turns
- repetitive logistics-only turns
- traces with no future retrieval hits for N turns

## 6. Trait memory exposure

Each trait should gain familiarity with repeated concepts.

This is represented by a separate familiarity index:

```ts
interface FamiliarityIndex {
  traitId: TraitId;
  concepts: Record<string, number>; // concept -> 0..1
}
```

Repeated exposure can raise `memoryExposure` in the epistemic aperture.

## 7. Archive compaction pass

```ts
async function compactMemoryMonth(monthKey: string, state: EngineState) {
  const events = await loadCanonicalEvents(monthKey);
  const shadow = await loadShadowTracesForMonth(monthKey);

  const grouped = groupByTheme(events);
  const summaries = grouped.map(makeArchiveSummary);

  await writeJson(`/memory/archive/${monthKey}-canonical-summary.json`, summaries);

  for (const trait of state.traits) {
    const traitShadow = shadow.filter((x) => x.traitId === trait.id);
    const distilled = distillShadowCluster(traitShadow);
    await writeJson(`/memory/archive/${monthKey}-${trait.id}-shadow-summary.json`, distilled);
  }
}
```

## 8. Retrieval hygiene

Do not retrieve:
- trace clusters that are near-duplicates of each other
- traces contradicted by clearer recent events unless explicitly used as counter-memory
- traces older than retention budget with zero thematic relevance

## 9. User-editable memory rules

Keep a user-editable file:
```text
/config/memory-policy.md
```

This can define:
- privacy exclusions
- retention windows
- protected memory classes
- user-authored identity anchors

## 10. V1 simplification

In v1:
- no vector database needed
- embeddings can be optional if unavailable
- simple text search + tags + salience is enough
- monthly archive is enough
