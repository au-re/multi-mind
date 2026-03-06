# 06. Braiding the Response

## 1. Goal

Produce one answer that:
- sounds like one character
- preserves tension
- reflects multiple trait pressures
- does not reveal inner-voice labels
- does not collapse into bland consensus

## 2. Inputs to the braider

The braider KAS agent receives:
- original user message
- optional short recent summary
- finalized blackboard state
- selected memory intrusions
- character baseline voice
- a strict “single speaker” instruction

It does **not** receive the raw full trait transcript.

## 3. Claim lattice

Cluster and aggregate claim pushes from the blackboard.

```ts
interface BraiderClaim {
  id: string;
  text: string;
  support: number;
  oppose: number;
  qualify: number;
  question: number;
  provenance: string[];
}

function claimTension(claim: BraiderClaim): number {
  const total = claim.support + claim.oppose + 1e-6;
  return Math.min(claim.support, claim.oppose) / total;
}
```

Preserve claims with high tension.

## 4. Style field

Traits push style without speaking directly.

```ts
type StyleDim =
  | "warmth"
  | "directness"
  | "hedging"
  | "dominance"
  | "abstraction"
  | "imagery"
  | "tempo"
  | "intensity"
  | "questioning";

interface StyleFieldCell {
  net: number;
  tension: number;
  posLeader?: TraitId;
  negLeader?: TraitId;
}
```

```ts
function buildStyleField(
  packets: TraitActionSummary[],
  baseline: CharacterVoiceProfile,
): Record<StyleDim, StyleFieldCell> {
  const dims: StyleDim[] = [
    "warmth",
    "directness",
    "hedging",
    "dominance",
    "abstraction",
    "imagery",
    "tempo",
    "intensity",
    "questioning",
  ];

  const out = {} as Record<StyleDim, StyleFieldCell>;

  for (const dim of dims) {
    const pos = packets.reduce((acc, p) => acc + Math.max(0, p.styleDelta[dim] ?? 0) * p.pressure, 0);
    const neg = packets.reduce((acc, p) => acc + Math.max(0, -(p.styleDelta[dim] ?? 0)) * p.pressure, 0);

    out[dim] = {
      net: squash(pos - neg + (baseline as any)[`${dim}Base`] ?? 0),
      tension: pos + neg > 0 ? Math.min(pos, neg) / (pos + neg) : 0,
      posLeader: findPosLeader(dim, packets),
      negLeader: findNegLeader(dim, packets),
    };
  }

  return out;
}
```

## 5. Tension bridges

A tension bridge tells the braider how to keep conflict alive.

Types:
- `concession`: “X, but Y”
- `sequence`: “X first, Y second”
- `contrast`: “X; still, Y”
- `scope_split`: “practically X, emotionally Y”

## 6. Discourse slots

Typical slots:
- opening
- core answer
- qualification
- close
- optional question

```ts
interface DiscourseSlot {
  name: "opening" | "core_answer" | "qualification" | "close" | "question";
  claims: string[];
  localStyle: Partial<Record<StyleDim, number>>;
  bridgeIds: string[];
}
```

## 7. Braider prompt contract

The braider system prompt should say:

```md
You are the final surface realizer for one character.

You are not a moderator and not a separate inner voice.

Your job is to produce one coherent answer that reflects the blackboard state.

Rules:
- sound like a single person
- do not mention trait names
- do not expose the action layer
- preserve meaningful tensions instead of averaging them away
- if a claim has high support and high opposition, keep both via syntax, sequencing, or scoped framing
- use memory intrusions as color, not as external fact
```

## 8. Braider developer note

Include:
- character baseline voice
- top claims
- top tensions
- style field summary
- lexical pool
- memory intrusions
- explicit forbidden moves

Example:

```md
## Character baseline
Plainspoken, slightly reflective, not theatrical.

## Style field
- warmth: +0.42 (tension 0.28)
- directness: +0.31 (tension 0.44)
- hedging: +0.21 (tension 0.52)
- intensity: +0.18 (tension 0.47)

## Claims
- support: validate exhaustion
- support: recommend a smaller immediate step
- oppose: immediate total commitment without runway check
- qualify: treat urgency as emotionally real but not sufficient by itself

## Bridges
- sequence: "validation first, decision threshold second"
- scope_split: "emotionally this feels urgent; practically more data is needed"

## Lexical pool
plainly, first, not necessarily, carry, before you decide

## Memory intrusions
- "This has the feel of a decision whose urgency may be emotional before it is practical."
```

## 9. Realization pseudocode

```ts
async function runBraider(
  scene: Scene,
  blackboard: RoundBlackboard,
  state: EngineState,
): Promise<string> {
  const prompt = buildBraiderPrompt(state.characterVoice, blackboard);
  const tools = buildBraiderReadOnlyTools(blackboard);

  const braider = createKasAgent({
    model: state.runtime.model,
    apiKey: state.runtime.apiKey,
    baseURL: state.runtime.baseURL,
    systemPrompt: prompt.system,
    tools,
    reasoning: { effort: "medium" },
    maxTurns: 2,
  });

  const messages = [
    { role: "developer", content: prompt.developer },
    { role: "user", content: scene.rawUserText },
  ];

  const chunks: string[] = [];
  for await (const update of braider(messages)) {
    if (Array.isArray(update)) continue;
    if (update?.role === "assistant" && typeof update.content === "string") {
      chunks.push(update.content);
    }
  }

  return finalizeBraidedText(chunks.join(""));
}
```

## 10. Post-pass cleanup

Run a deterministic cleanup pass:
- collapse repeated hedges
- remove inner-voice phrasing
- normalize sentence rhythm
- preserve at least one tension marker if tensions exist

## 11. Failure behavior

If the blackboard is too sparse:
- fall back to the character baseline voice
- use top mode + top style + top frame
- do not fabricate plurality
