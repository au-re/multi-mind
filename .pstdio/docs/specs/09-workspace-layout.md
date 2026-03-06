# 09. Workspace Layout

## 1. Root layout

```text
/AGENTS.md

/config/
  character.json
  traits.json
  memory-policy.md
  style-policy.md

/prompts/
  character-baseline.md
  braider.md
  traits/
    integrity.md
    warmth.md
    tact.md
    vigilance.md
    heat.md
    drive.md
    structure.md
    presence.md
    inquiry.md

/memory/
  canonical/
  shadow/
    integrity/
    warmth/
    tact/
    vigilance/
    heat/
    drive/
    structure/
    presence/
    inquiry/
  archive/

/runtime/
  recent/
    conversation.jsonl
    recent_summary.md
    active_character_state.json
  rounds/
    current/
      input.json
      blackboard.json
      actions.jsonl
      claims.json
      style.json
      tensions.json
      packets/
    history/

/schemas/
  canonical-event.schema.json
  shadow-trace.schema.json
  blackboard.schema.json
  traits.schema.json
```

## 2. `AGENTS.md` starter

```md
# Trait Engine Agents Guide

This workspace contains the state for a single-character multi-trait engine.

## Important rules
- Trait agents are internal controllers, not visible speakers.
- Trait agents must act through the provided tool interface.
- Trait agents must not infer masked content as fact.
- Trait agents must not read outside their assigned round context unless explicitly allowed.
- The braider must output one coherent character voice.

## Workspace conventions
- Trait configuration lives under `/config/traits.json`.
- Canonical memory lives under `/memory/canonical/`.
- Trait shadow memory lives under `/memory/shadow/<traitId>/`.
- Round state lives under `/runtime/rounds/current/`.

## Safety and coherence
- Preserve meaningful uncertainty.
- Use memory as lived recollection, not as external proof.
- Keep final outputs as one speaker.
```

## 3. `character.json`

```json
{
  "registerLevel": 0.42,
  "terseness": 0.56,
  "metaphorRate": 0.33,
  "profanityRate": 0.04,
  "humorRate": 0.09,
  "warmthBase": 0.18,
  "directnessBase": 0.31,
  "hedgingBase": 0.12,
  "sentenceLengthBase": 0.49,
  "signatureLexicon": ["plainly", "still", "for now"],
  "forbiddenPhrases": ["as an AI", "from multiple perspectives"]
}
```

## 4. `traits.json`

```json
{
  "traits": [
    {
      "id": "integrity",
      "label": "Integrity",
      "skill": 14,
      "impulseBias": 0,
      "initiativeBias": 1,
      "knowledgeDomains": ["social", "ethical", "practical"],
      "blockedDomains": ["specialist_biology", "specialist_finance"],
      "hardTriggers": ["hypocrisy", "fairness", "bluff"],
      "identityAnchors": ["I care whether this is honest and fair."],
      "voiceAnchors": ["plain, unshowy, and candid."],
      "actionBias": { "VETO_MOVE": 3, "RESIST_CLAIM": 2, "REQUEST_GAP": 2 },
      "salienceWeights": { "socialRisk": 0.9, "ambiguity": 0.7, "urgency": 0.4 },
      "styleBias": { "warmth": 0.0, "directness": 0.2, "hedging": 0.1, "intensity": -0.1 },
      "compactionProfile": { "keepNumbers": 0.2, "keepEmotionWords": 0.5, "keepActions": 0.7 },
      "taintProfile": { "fairness": 1.0, "betrayal": 0.9, "bluff": 0.9 }
    }
  ]
}
```

Repeat for the other eight traits.

## 5. Runtime round files

### `input.json`
```json
{
  "roundId": "r_000123",
  "userText": "I want to quit tomorrow. I'm exhausted, but I'm not sure if I'm overreacting.",
  "timestamp": "2026-03-06T10:00:00Z"
}
```

### `blackboard.json`
Contains the full shared board.

### `actions.jsonl`
Append-only log of tool calls and resolutions.

### `packets/`
Optional per-trait summaries for observability.

## 6. Schema hygiene

Keep JSON Schemas in `/schemas/` and validate:
- canonical events
- shadow traces
- blackboard writes
- trait config

## 7. Deletion policy

Round folders under `/runtime/rounds/` may be ephemeral after persistence.  
Canonical and shadow memory should not be deleted automatically in v1.

## 8. UI integration paths

If you surface observability later, read-only UI can inspect:
- `/runtime/recent/recent_summary.md`
- `/runtime/rounds/current/blackboard.json`
- `/memory/canonical/`
- `/memory/shadow/<traitId>/`
