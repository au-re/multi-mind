# 01. System Overview

## 1. Goal

Render **one coherent character** as the emergent result of **nine latent trait agents**. Each trait is a real agent with:
- a skill score from **0–20**
- an activation decision
- a D20-based join check
- a clarity / perception check
- a filtered view of the input
- tainted autobiographical recall
- an action budget
- the ability to modify a shared blackboard through constrained tools

The final answer is braided from the blackboard into **one voice**.

## 2. Why Kaset fits

Kaset is a browser-first, OPFS-centered agent toolkit. KAS is described as a client-side agent that can use tools and operate in a sandboxed workspace. The repo also exposes tool-calling building blocks and history summarization helpers. This makes Kaset a good fit for:
- persistent character state in files
- explicit agent guidance in `AGENTS.md`
- structured tool calls for blackboard actions
- reviewable diffs for long-term memory writes
- resumable flows and streaming if needed

## 3. Runtime roles

### 3.1 Controller (deterministic)
The controller is plain application logic. It is not itself an LLM agent.

Responsibilities:
- parse incoming message into a `Scene`
- compute per-trait relevance, difficulty, and activation checks
- build trait-limited views using the epistemic aperture
- retrieve shadow memories
- create per-round tool envelopes
- invoke trait KAS agents in initiative order
- resolve reactions
- invoke the braider KAS agent
- persist canonical and shadow memory

### 3.2 Trait agents (KAS instances)
Each trait agent is a dedicated `createKasAgent()` instance with:
- a custom system prompt
- a trait-specific prompt fragment
- a constrained tool list for the current round
- no direct access to the full original message unless explicitly allowed

### 3.3 Braider agent (KAS instance)
The braider is a separate `createKasAgent()` instance that:
- reads the claim lattice
- reads the style field
- reads tension bridges
- reads selected memory intrusions
- outputs one single-voice answer

### 3.4 Memory encoder (deterministic or hybrid)
After the turn, a memory encoder writes:
- one canonical event
- nine shadow traces

In v1 this should be deterministic or lightly templated. An LLM-assisted summarizer can be added later for richer gists.

## 4. Core loop

```text
user message
  -> scene analysis
  -> per-trait rating
  -> activation check
  -> join check
  -> clarity check
  -> trait view + memory retrieval
  -> initiative sort
  -> primary actions on blackboard
  -> reactions on blackboard
  -> braider reads blackboard
  -> final response
  -> long-term memory write
```

## 5. Design principles

### 5.1 Traits are real agents, not prompt fragments
Traits take actions with budgets and constraints.

### 5.2 Files are authoritative
Conversation state, trait state, blackboard state, and memory all live in OPFS-visible files.

### 5.3 Perception is bounded
Traits should not see the raw full message unless their clarity and knowledge boundaries allow it.

### 5.4 Tension is preserved
Conflicting pushes survive into syntax and discourse structure.

### 5.5 The final answer is singular
There is no visible “inner voice” transcript.

## 6. Major subsystems

- Trait model
- Action layer
- Blackboard
- Memory retrieval
- Braided realization
- Long-term memory
- Kaset integration

## 7. Top-level pseudocode

```ts
async function processTurn(input: UserTurn, state: EngineState): Promise<AssistantTurn> {
  const scene = analyzeScene(input, state);

  const contexts: TraitContext[] = [];
  for (const trait of state.traits) {
    const rating = rateSceneForTrait(scene, trait, state);

    if (!wantsToEnterRound(trait, state.traitState[trait.id], rating, state.rng)) {
      continue;
    }

    const join = runJoinCheck(trait, rating, state.rng);
    if (!join.success) continue;

    const clarity = runClarityCheck(trait, scene, join, state.rng);

    const traitView = buildTraitView(scene, trait, clarity, state.memory);
    const memories = retrieveShadowMemories(trait, scene, traitView, state.memory);

    contexts.push(buildTraitContext({
      trait,
      rating,
      join,
      clarity,
      traitView,
      memories,
      initiative: rollInitiative(trait, join, state.rng),
    }));
  }

  if (contexts.length === 0) {
    return runFallbackBraider(scene, state);
  }

  contexts.sort((a, b) => b.initiative - a.initiative);

  const blackboard = createRoundBlackboard(scene, state);

  for (const ctx of contexts) {
    await runTraitPrimaryPhase(ctx, blackboard, state);
  }

  for (const ctx of [...contexts].reverse()) {
    await runTraitReactionPhase(ctx, blackboard, state);
  }

  const finalText = await runBraider(scene, blackboard, state);
  await persistTurn(scene, blackboard, finalText, state);

  return { role: "assistant", content: finalText };
}
```
