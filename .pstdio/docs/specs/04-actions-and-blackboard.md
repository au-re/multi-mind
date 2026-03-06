# 04. Actions and Blackboard

## 1. Action layer summary

Traits are real agents because they can perform **actions** on a shared round blackboard.

An action may intervene in:
- attention
- memory
- interpretation
- response planning
- style

Traits do **not** speak directly.

## 2. Blackboard schema

```ts
interface ClaimNode {
  id: string;
  claimText: string;
  support: number;
  oppose: number;
  qualify: number;
  question: number;
  provenance: string[];
  sourceMix: string[];
}

interface TensionBridge {
  id: string;
  left: string;
  right: string;
  kind: "concession" | "sequence" | "contrast" | "scope_split";
  strength: number;
}

interface VetoRecord {
  id: string;
  targetId: string;
  cause: string;
  traitId: string;
  power: number;
}

interface ActionRecord {
  id: string;
  traitId: string;
  type: string;
  power: number;
  params: Record<string, unknown>;
  status: "applied" | "suppressed" | "failed" | "tension";
}

interface RoundBlackboard {
  roundId: string;
  salienceMap: Record<string, number>;
  uncertaintyMap: Record<string, number>;
  memoryPool: MemoryCue[];

  frameScores: Record<string, number>;
  modeScores: Record<string, number>;
  slotPriorities: Record<string, number>;

  claimGraph: Record<string, ClaimNode>;
  styleField: Record<string, number>;
  lexicalPool: Record<string, number>;
  bridgePool: TensionBridge[];

  vetoRecords: VetoRecord[];
  actionLog: ActionRecord[];
}
```

## 3. Passive actions

These happen automatically, outside the trait action budget.

### `IDENTITY_PULSE`
Re-anchors the trait.

### `APERTURE_FILTER`
Builds the filtered view.

### `MEMORY_SCAN`
Retrieves candidate shadow traces.

## 4. Major actions

### `RECALL_TRACE`
Pull one shadow memory cue into the round.

### `PROPOSE_FRAME`
Advance a high-level reading of the situation.

### `PUSH_CLAIM`
Add support to a claim.

### `RESIST_CLAIM`
Push against a claim or trajectory.

### `SELECT_MODE`
Increase weight for a response mode:
- explain
- comfort
- warn
- plan
- reflect
- ask

### `REQUEST_GAP`
Mark missing information the answer must surface.

### `VETO_MOVE`
Attempt to suppress a move that violates constraints.

## 5. Minor actions

### `FOCUS_SPAN`
Raise salience of a span.

### `FLAG_UNCERTAINTY`
Raise uncertainty pressure on a span or meaning.

### `SHIFT_STYLE`
Shift warmth, directness, hedging, dominance, abstraction, imagery, tempo, intensity, questioning.

### `SEED_LEXICON`
Inject favored words / phrases.

### `PRIORITIZE_SLOT`
Boost opening / core / qualification / close / question.

### `BRIDGE_TENSION`
Tell the braider to preserve a conflict using a specific bridge shape.

## 6. Reaction actions

### `QUALIFY_CLAIM`
Keep a claim, but narrow or soften it.

### `CHALLENGE_ACTION`
Contest another action.

### `COUNTERMEMORY`
Inject a memory that complicates another trait’s push.

### `ENDORSE_ACTION`
Join another action instead of creating a new one.

## 7. Tool design

Each action is exposed to trait KAS agents as a `Tool`.

Example:

```ts
import { Tool } from "@pstdio/tiny-ai-tasks";

function makePushClaimTool(ctx: TraitRoundContext, blackboard: RoundBlackboardRef) {
  return Tool(
    async (params: { claim: string; source: "observed" | "memory" | "association" }, config) => {
      enforceCanPushClaim(ctx, params);

      const power = computeActionPower(ctx, "PUSH_CLAIM");
      const strength = normalizePower(power);

      await blackboard.addClaimSupport({
        claim: params.claim,
        strength,
        traitId: ctx.trait.id,
        source: params.source,
      });

      return {
        ok: true,
        action: "PUSH_CLAIM",
        claim: params.claim,
        strength,
      };
    },
    {
      name: "push_claim",
      description: "Increase support for a claim in the shared blackboard.",
      parameters: {
        type: "object",
        properties: {
          claim: { type: "string" },
          source: { type: "string", enum: ["observed", "memory", "association"] }
        },
        required: ["claim", "source"],
        additionalProperties: false
      }
    },
  );
}
```

## 8. Per-round dynamic tool envelope

Do **not** give every trait every action tool every round.

Instead:
- compute budget
- compute visibility
- compute allowed action set
- expose only permitted tools

Example policy:

```ts
function buildTraitToolset(ctx: TraitRoundContext): Tool[] {
  const tools: Tool[] = [];

  // always safe
  tools.push(makeShiftStyleTool(ctx));
  tools.push(makeSeedLexiconTool(ctx));
  tools.push(makeFocusSpanTool(ctx));
  tools.push(makeFlagUncertaintyTool(ctx));

  if (ctx.budget.major > 0) {
    tools.push(makeSelectModeTool(ctx));
    tools.push(makeRequestGapTool(ctx));
    tools.push(makeRecallTraceTool(ctx));
  }

  if (ctx.visibleRatio >= 0.45) {
    tools.push(makeProposeFrameTool(ctx));
    tools.push(makePushClaimTool(ctx));
    tools.push(makeResistClaimTool(ctx));
  }

  if (ctx.budget.reaction > 0) {
    tools.push(makeQualifyClaimTool(ctx));
    tools.push(makeChallengeActionTool(ctx));
    tools.push(makeCounterMemoryTool(ctx));
    tools.push(makeEndorseActionTool(ctx));
  }

  if (ctx.trait.id === "integrity" || ctx.trait.id === "tact") {
    tools.push(makeVetoMoveTool(ctx));
  }

  return tools;
}
```

## 9. Action power

```ts
const ACTION_DIFFICULTY: Record<string, number> = {
  RECALL_TRACE: 4,
  PROPOSE_FRAME: 6,
  PUSH_CLAIM: 5,
  RESIST_CLAIM: 5,
  SELECT_MODE: 4,
  REQUEST_GAP: 4,
  VETO_MOVE: 7,

  FOCUS_SPAN: 2,
  FLAG_UNCERTAINTY: 2,
  SHIFT_STYLE: 2,
  SEED_LEXICON: 2,
  PRIORITIZE_SLOT: 3,
  BRIDGE_TENSION: 5,

  QUALIFY_CLAIM: 4,
  CHALLENGE_ACTION: 6,
  COUNTERMEMORY: 5,
  ENDORSE_ACTION: 2,
};

function computeActionPower(ctx: TraitRoundContext, actionType: string): number {
  return Math.max(
    0,
    ctx.trait.skill +
      Math.max(0, ctx.join.margin) / 3 +
      Math.max(0, ctx.clarity.margin) / 4 +
      4 * ctx.rating.relevance +
      3 * ctx.memoryResonance +
      (ctx.trait.actionBias[actionType] ?? 0) -
      ACTION_DIFFICULTY[actionType],
  );
}

function normalizePower(power: number): number {
  return 1 / (1 + Math.exp(-(power - 10) / 3));
}
```

## 10. Conflict resolution

```ts
function resolveChallenge(target: ActionRecord, challenger: ActionRecord): "suppressed" | "failed" | "tension" {
  const diff = challenger.power - target.power;

  if (diff >= 4) {
    target.status = "suppressed";
    return "suppressed";
  }

  if (diff <= -4) {
    challenger.status = "failed";
    return "failed";
  }

  target.status = "tension";
  challenger.status = "tension";
  return "tension";
}
```

When close contests happen, the conflict is **preserved**, not flattened.

## 11. Round phases

### Phase A — primary actions
Initiative descending.

### Phase B — reactions
Initiative ascending.

### Phase C — style commit
Residual style and lexical pools are finalized.

## 12. Persistence

Store blackboard state in OPFS under:

```text
/runtime/rounds/<roundId>/
  blackboard.json
  actions.jsonl
  claims.json
  style.json
  tensions.json
```
