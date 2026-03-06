# 05. Memory Retrieval

## 1. Goal

Give each trait its own **tainted recollection** of past events.

The same event should not be recalled neutrally by all traits.

## 2. Two-layer memory model

### 2.1 Canonical event
Shared, relatively factual record.

```ts
interface CanonicalEvent {
  eventId: string;
  turnId: number;
  timestamp: string;
  userMessageSummary: string;
  assistantReplySummary: string;
  domainTags: string[];
  facts: string[];
  emotionalSummary: string;
  uncertaintyNotes: string[];
  embedding: number[];
}
```

### 2.2 Shadow trace
Trait-specific recollection.

```ts
interface ShadowTrace {
  traceId: string;
  eventId: string;
  traitId: TraitId;

  salience: number;
  appraisal: string;
  gist: string;
  feltLine: string;

  noticed: string[];
  ignored: string[];
  unfinishedBusiness: string[];
  lexicalImprint: string[];

  certainty: number;
  moodColor: Record<string, number>;
  embedding: number[];
}
```

## 3. Trait-limited view building

Before memory retrieval, the trait receives a filtered message view.

### 3.1 Epistemic aperture

```ts
function epistemicAperture(
  unit: MessageUnit,
  trait: TraitConfig,
  clarityShift: number,
  memoryExposure: number,
): number {
  if (trait.blockedDomains.includes(unit.domain) && memoryExposure < 0.6) {
    return 0;
  }

  const knownness =
    0.35 * unit.commonness +
    0.25 * memoryExposure +
    0.2 * domainMatch(unit.domain, trait.knowledgeDomains) +
    0.1 * unit.morphologyTransparency +
    0.1 * (trait.skill / 20) +
    clarityShift -
    0.25 * unit.abstractness;

  return clamp01(knownness);
}
```

### 3.2 Rendering rules
- `>= 0.65` keep exact phrase
- `0.40 .. 0.64` simplify / paraphrase
- `< 0.40` blank to `██`

Phrase-level blanking is required.

## 4. Trait view object

```ts
interface TraitView {
  observedText: string;
  visibleRatio: number;
  maskedSpanIds: string[];
  associatedGlosses: string[];
}
```

## 5. Retrieval scoring

Each active trait retrieves top `k=2` shadow traces.

```ts
function retrieveShadowMemories(
  trait: TraitConfig,
  scene: Scene,
  traitView: TraitView,
  store: MemoryStore,
): ShadowTrace[] {
  const traces = store.shadowByTrait[trait.id] ?? [];

  const scored = traces.map((trace) => {
    const score =
      0.35 * cosine(scene.embedding, trace.embedding) +
      0.2 * appraisalMatch(scene, trace) +
      0.15 * moodMatch(scene, trace) +
      0.15 * unfinishedBusinessMatch(scene, trace) +
      0.1 * lexicalResonance(traitView.observedText, trace.lexicalImprint) +
      0.05 * recencyScore(trace);

    return { trace, score };
  });

  return scored
    .filter((x) => x.score > 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((x) => x.trace);
}
```

## 6. Conversational memory cues

Do not give traits raw trace files verbatim. Convert them to short cues.

```ts
interface MemoryCue {
  traceId: string;
  gist: string;
  feltLine: string;
  noticedDetail?: string;
  certainty: number;
  useMode: "analogy" | "warning" | "comfort" | "pattern";
}
```

Example:
```json
{
  "traceId": "tr_128",
  "gist": "This feels like the last time urgency covered for thin evidence.",
  "feltLine": "The certainty is cleaner than the facts.",
  "noticedDetail": "the timeline pressure",
  "certainty": 0.58,
  "useMode": "warning"
}
```

## 7. Memory use constraints

A shadow memory may:
- color tone
- suggest a frame
- support caution
- motivate a question
- introduce a lived analogy

A shadow memory may **not**:
- override clear observed facts by default
- reveal blocked knowledge indirectly
- become universal truth

## 8. Writing new memory after the turn

### 8.1 Canonical write
The controller writes one canonical event.

### 8.2 Shadow write
For each trait, encode:
- what it noticed
- what it ignored
- how it appraised the event
- one conversational gist
- one felt line
- unfinished business
- lexical imprint

```ts
function encodeShadowTrace(
  trait: TraitConfig,
  scene: Scene,
  blackboard: RoundBlackboard,
  finalText: string,
  packet: TraitActionSummary | null,
): ShadowTrace {
  const noticed = selectNoticedFragments(trait, scene, blackboard, packet);
  const ignored = inferIgnoredFragments(scene, noticed);
  const appraisal = inferTraitAppraisal(trait, noticed, blackboard, finalText);
  const gist = buildConversationalGist(trait, appraisal, noticed);
  const feltLine = buildFeltLine(trait, appraisal, gist);
  const unfinishedBusiness = inferUnfinishedBusiness(trait, blackboard);

  return {
    traceId: newId(),
    eventId: currentEventId(),
    traitId: trait.id,
    salience: estimateShadowSalience(packet, blackboard),
    appraisal,
    gist,
    feltLine,
    noticed,
    ignored,
    unfinishedBusiness,
    lexicalImprint: extractLexicalImprint(trait, finalText, blackboard),
    certainty: estimateTraceCertainty(packet),
    moodColor: deriveMoodColor(trait, appraisal),
    embedding: embed(`${gist} ${feltLine}`),
  };
}
```

## 9. Storage layout

```text
/memory/
  canonical/
    2026-03/
      ev_000001.json
      ev_000002.json

  shadow/
    integrity/
      tr_000001.json
    warmth/
      tr_000001.json
    tact/
      tr_000001.json
    ...
```
