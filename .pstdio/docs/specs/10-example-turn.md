# 10. Example Turn

## User input

> I want to quit tomorrow. I'm exhausted, but I'm not sure if I'm overreacting.

## 1. Scene analysis

```json
{
  "intent": "decide",
  "domainTags": ["work", "emotion", "planning"],
  "urgency": 0.83,
  "socialRisk": 0.54,
  "ambiguity": 0.48,
  "technicalDensity": 0.02,
  "abstractness": 0.31
}
```

## 2. Trait ratings (example)

| Trait | Relevance | Difficulty | Domain Fit |
|---|---:|---:|---:|
| Warmth | 0.86 | 0.22 | 0.92 |
| Vigilance | 0.89 | 0.29 | 0.84 |
| Drive | 0.78 | 0.26 | 0.88 |
| Structure | 0.71 | 0.33 | 0.80 |
| Inquiry | 0.52 | 0.42 | 0.74 |
| Heat | 0.41 | 0.30 | 0.73 |

Suppose active traits after checks:
- Warmth
- Vigilance
- Drive
- Structure
- Integrity
- Inquiry

## 3. Filtered views

### Warmth view
> "I want to quit tomorrow. I'm exhausted, but I'm not sure if I'm overreacting."

### Vigilance view
> "I want to quit tomorrow. I'm exhausted, but I'm not sure if I'm overreacting."

### Structure view
> "quit tomorrow ... exhausted ... not sure ... overreacting"

### Inquiry view
> "I want to quit tomorrow ... not sure ... ██reacting"

## 4. Retrieved memories

### Warmth memory cue
- gist: "This has the feel of someone who has been carrying too much for too long."
- feltLine: "The exhaustion sounds real before anything else."

### Vigilance memory cue
- gist: "Urgent decisions tend to look cleaner than they are when energy is gone."
- feltLine: "Check the floor before you jump."

### Drive memory cue
- gist: "Last time the situation improved once the next concrete step was smaller than the final decision."
- feltLine: "Shrink the move, keep the momentum."

## 5. Primary actions

### Warmth
- `SELECT_MODE(comfort)`
- `SHIFT_STYLE({ warmth: +0.45 })`

### Vigilance
- `REQUEST_GAP("financial_runway")`
- `FLAG_UNCERTAINTY("quit tomorrow")`

### Drive
- `SELECT_MODE(plan)`
- `PUSH_CLAIM("recommend_small_safe_step_first")`

### Structure
- `PROPOSE_FRAME("decision_thresholds")`
- `PRIORITIZE_SLOT("core_answer")`

### Integrity
- `RESIST_CLAIM("recommend_immediate_quit")`

### Inquiry
- `BRIDGE_TENSION("validate_exhaustion", "avoid_total_commitment", "scope_split")`

## 6. Reactions

### Presence (if active as style ghost)
- `ENDORSE_ACTION(Drive.PUSH_CLAIM)`

### Tact
- `QUALIFY_CLAIM("recommend_small_safe_step_first", "without sounding dismissive")`

## 7. Blackboard result snapshot

```json
{
  "modeScores": {
    "comfort": 0.68,
    "plan": 0.74,
    "warn": 0.51
  },
  "claimGraph": {
    "validate_exhaustion": { "support": 0.82, "oppose": 0.00, "qualify": 0.00 },
    "recommend_small_safe_step_first": { "support": 0.77, "oppose": 0.08, "qualify": 0.22 },
    "recommend_immediate_quit": { "support": 0.19, "oppose": 0.61, "qualify": 0.11 },
    "need_financial_runway_check": { "support": 0.69, "oppose": 0.00, "qualify": 0.15 }
  },
  "bridgePool": [
    {
      "left": "validate_exhaustion",
      "right": "need_financial_runway_check",
      "kind": "scope_split",
      "strength": 0.72
    }
  ],
  "styleField": {
    "warmth": 0.41,
    "directness": 0.22,
    "hedging": 0.19,
    "intensity": 0.11
  }
}
```

## 8. Braided answer shape

The braider should preserve:
- Warmth: exhaustion is real
- Drive: give a next step
- Vigilance / Integrity: do not treat urgency alone as enough
- Structure: frame it as thresholds
- Inquiry: keep the emotional/practical split

## 9. Example final output

> It makes sense that this feels urgent if you’re that exhausted, and I wouldn’t dismiss that part. I still wouldn’t force tomorrow into an all-or-nothing decision before you check the basics that make quitting survivable. The cleaner move is to treat this as two questions instead of one: first, do you need relief immediately; second, do you actually have enough runway to leave right now. If the answer to the first is yes, find the smallest step that lowers the pressure today, then decide the bigger one with a steadier head.

This sounds like one person, but it carries multiple trait pressures.

## 10. Memory write after the turn

### Canonical event summary
- user is considering quitting work soon
- exhaustion is explicitly stated
- uncertainty about overreacting remains
- assistant recommended smaller immediate step + runway check

### Warmth shadow trace
- gist: "Mostly I remember how worn down they sounded."
- feltLine: "Relief needed to come before judgment."

### Vigilance shadow trace
- gist: "It had the shape of a leap that needed one more hard number."
- feltLine: "Urgency is not the same as clearance."
