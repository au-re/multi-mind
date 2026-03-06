# 08. Kaset Implementation

## 1. Package surface used

Use:
- `@pstdio/kas`
- `@pstdio/tiny-ai-tasks`
- `@pstdio/tiny-tasks`
- `@pstdio/opfs-utils`
- optionally `@pstdio/opfs-hooks`

## 2. Architecture decision

Although Kaset docs present KAS as a coding/browser agent with OPFS workspace integration, the current repo source shows `createKasAgent()` is generic enough to act as a tool-calling agent wrapper. This spec uses it as:
- trait agent wrapper
- braider wrapper

The deterministic controller handles the game logic.

## 3. Core runtime config

```ts
export interface RuntimeConfig {
  model: string;
  apiKey?: string;
  baseURL?: string;
  reasoningEffort: "low" | "medium" | "high";
}

export interface EngineState {
  runtime: RuntimeConfig;
  characterVoice: CharacterVoiceProfile;
  traits: TraitConfig[];
  traitState: Record<TraitId, TraitRuntimeState>;
  memory: MemoryStore;
  rng: RNG;
  workspaceDir: string;
}
```

## 4. Suggested workspace bootstrap

```ts
import { writeFile } from "@pstdio/opfs-utils";

async function bootstrapWorkspace(root: string) {
  await writeFile(`${root}/AGENTS.md`, DEFAULT_AGENTS_MD);
  await writeFile(`${root}/config/character.json`, JSON.stringify(DEFAULT_CHARACTER, null, 2));
  await writeFile(`${root}/config/traits.json`, JSON.stringify(DEFAULT_TRAITS, null, 2));
  await writeFile(`${root}/runtime/recent/conversation.jsonl`, "");
}
```

## 5. Load environment guidance

The repo exports `loadAgentInstructions`, which reads `agents.md` / `AGENTS.md` from a root directory and returns messages plus the discovered path. Use that to prepend global environment instructions.

```ts
import { loadAgentInstructions } from "@pstdio/kas/opfs-tools";

async function loadRootAgentGuide(root: string): Promise<string> {
  const res = await loadAgentInstructions(root);
  const content = res.messages
    .flatMap((m) => m.parts ?? [])
    .map((p: any) => p.text ?? "")
    .join("\n");
  return content;
}
```

## 6. Trait agent factory

```ts
function buildTraitSystemPrompt(rootGuide: string, trait: TraitConfig, character: CharacterVoiceProfile): string {
  return [
    rootGuide,
    "",
    "# Character Baseline",
    renderCharacterVoice(character),
    "",
    `# Trait Agent: ${trait.label}`,
    renderTraitGuide(trait),
    "",
    "# Global Rules",
    "- You are an internal trait agent, not a visible separate speaker.",
    "- Act through tools on the shared workspace.",
    "- Never reveal masked content as fact.",
    "- Never claim knowledge outside your allowed scope.",
  ].join("\n");
}
```

```ts
function makeTraitAgent(
  state: EngineState,
  rootGuide: string,
  trait: TraitConfig,
  tools: Tool[],
) {
  return createKasAgent({
    model: state.runtime.model,
    apiKey: state.runtime.apiKey,
    baseURL: state.runtime.baseURL,
    systemPrompt: buildTraitSystemPrompt(rootGuide, trait, state.characterVoice),
    tools,
    reasoning: { effort: state.runtime.reasoningEffort },
    maxTurns: 2,
  });
}
```

## 7. Round-local trait invocation

```ts
async function runTraitPrimaryPhase(
  ctx: TraitRoundContext,
  blackboard: BlackboardStore,
  state: EngineState,
): Promise<TraitActionSummary> {
  const tools = buildTraitToolset(ctx, blackboard);
  const rootGuide = await loadRootAgentGuide(state.workspaceDir);
  const agent = makeTraitAgent(state, rootGuide, ctx.trait, tools);

  const messages = [
    { role: "developer", content: renderTraitRoundDeveloperNote(ctx, blackboard) },
    { role: "user", content: "Spend your current action budget on the shared workspace." },
  ];

  const streamed: any[] = [];
  for await (const chunk of agent(messages)) {
    streamed.push(chunk);
  }

  return summarizeTraitRound(ctx, blackboard, streamed);
}
```

## 8. Action tools backed by files

Each tool mutates files under the active round directory.

### Example: style shift

```ts
function makeShiftStyleTool(ctx: TraitRoundContext, blackboard: BlackboardStore): Tool {
  return Tool(
    async (params: { delta: Partial<Record<StyleDim, number>> }) => {
      enforceMinorBudget(ctx, "SHIFT_STYLE");
      await blackboard.shiftStyle(ctx.trait.id, params.delta, normalizePower(computeActionPower(ctx, "SHIFT_STYLE")));
      return { ok: true, action: "SHIFT_STYLE", delta: params.delta };
    },
    {
      name: "shift_style",
      description: "Shift the braided style field for the final single-voice answer.",
      parameters: {
        type: "object",
        properties: {
          delta: { type: "object", additionalProperties: { type: "number" } }
        },
        required: ["delta"],
        additionalProperties: false
      }
    },
  );
}
```

## 9. Blackboard store abstraction

```ts
class BlackboardStore {
  constructor(private roundDir: string) {}

  async load(): Promise<RoundBlackboard> {
    return readJson(`${this.roundDir}/blackboard.json`);
  }

  async save(bb: RoundBlackboard): Promise<void> {
    await writeJson(`${this.roundDir}/blackboard.json`, bb);
  }

  async addClaimSupport(input: {
    claim: string;
    strength: number;
    traitId: string;
    source: string;
  }) {
    const bb = await this.load();
    const node = bb.claimGraph[input.claim] ?? {
      id: input.claim,
      claimText: input.claim,
      support: 0,
      oppose: 0,
      qualify: 0,
      question: 0,
      provenance: [],
      sourceMix: [],
    };

    node.support += input.strength;
    node.provenance.push(input.traitId);
    node.sourceMix.push(input.source);

    bb.claimGraph[input.claim] = node;
    await this.save(bb);
  }
}
```

## 10. Braider implementation

```ts
function buildBraiderSystemPrompt(rootGuide: string, character: CharacterVoiceProfile): string {
  return [
    rootGuide,
    "",
    "# Role",
    "You are the final surface realizer for one character.",
    "",
    "# Character Baseline",
    renderCharacterVoice(character),
    "",
    "# Rules",
    "- You do not speak as multiple voices.",
    "- You do not mention traits, blackboards, or tools.",
    "- Preserve meaningful tensions instead of averaging them away.",
    "- Use memory color as lived texture, not as external fact.",
  ].join("\n");
}
```

```ts
async function runBraider(scene: Scene, blackboard: BlackboardStore, state: EngineState): Promise<string> {
  const rootGuide = await loadRootAgentGuide(state.workspaceDir);
  const agent = createKasAgent({
    model: state.runtime.model,
    apiKey: state.runtime.apiKey,
    baseURL: state.runtime.baseURL,
    systemPrompt: buildBraiderSystemPrompt(rootGuide, state.characterVoice),
    tools: buildBraiderReadOnlyTools(blackboard),
    reasoning: { effort: state.runtime.reasoningEffort },
    maxTurns: 2,
  });

  const messages = [
    { role: "developer", content: await renderBraiderDeveloperNote(blackboard, state) },
    { role: "user", content: scene.rawUserText },
  ];

  let output = "";
  for await (const chunk of agent(messages)) {
    if (!Array.isArray(chunk) && chunk?.role === "assistant" && typeof chunk.content === "string") {
      output += chunk.content;
    }
  }
  return finalizeBraidedText(output);
}
```

## 11. Optional history compaction

```ts
import { createLLMTask, createSummarizer } from "@pstdio/tiny-ai-tasks";

function makeHistorySummarizer(runtime: RuntimeConfig) {
  const llm = createLLMTask({
    model: runtime.model,
    apiKey: runtime.apiKey,
    baseUrl: runtime.baseURL,
  });

  return createSummarizer(llm);
}
```

## 12. Root `AGENTS.md` recommendations

The root guide should define:
- the system’s overall goal
- the fact that the workspace contains character memory
- the rule that trait agents act only through tools
- privacy or safety constraints
- paths for config and runtime files

See `09-workspace-layout.md` for a starter file.

## 13. Why not expose general OPFS tools to every trait

Kaset’s docs emphasize that agents can search, read, patch, and generate files in the OPFS workspace. That is powerful, but for this system it would let traits peek beyond their bounded view. Therefore:
- controller code reads and filters the raw user message
- trait agents get only filtered round context
- tool access is scoped to specific blackboard and memory operations
- the braider is read-only

This preserves the design goal of bounded competence.

## 14. Versioning

Optional but recommended:
- after each turn, commit only memory and config changes
- keep round runtime folders ephemeral
- keep a clean audit log under `/runtime/logs/`
