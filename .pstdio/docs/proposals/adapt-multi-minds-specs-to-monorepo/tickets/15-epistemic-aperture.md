# T15: Implement epistemic aperture (trait view filtering)

**Priority:** P3
**Phase:** 5 — Memory and Polish
**Parallelizable:** yes (depends on T04, T05)
**Depends on:** T04, T05

## Goal

Implement the epistemic aperture system that filters what each trait "sees" of the user message based on its clarity check, knowledge domains, and skill level.

## Scope

- Implement `buildTraitView(trait, scene, clarityMargin)` in `packages/memory/src/aperture.ts`
- Implement visible ratio calculation
- Implement domain-based masking of message units
- Wire trait views into trait runner (replace full message pass-through)

## Steps

1. Write tests for trait view building with various clarity margins and domain configurations
2. Write `packages/memory/src/aperture.ts`:
   - `computeVisibleRatio(clarityMargin, skill)` -> number [0,1]
   - `maskMessageUnits(units, trait, visibleRatio)` -> masked units
   - `buildTraitView(trait, scene, clarityMargin)` -> `TraitView`
3. Update `packages/engine/src/trait-runner.ts` — use `buildTraitView` instead of passing raw user message

## Implementation Notes

- `visibleRatio = clamp01(0.4 + clarityMargin / 20 + skill / 40)` — higher clarity and skill = sees more
- Masking: units outside the trait's `knowledgeDomains` are hidden if `visibleRatio < 0.8`
- Units in `blockedDomains` are always hidden regardless of visibility
- `observedText` = concatenation of visible unit texts
- `maskedSpanIds` = IDs of hidden units
- `associatedGlosses` = simple paraphrases of hidden content (v1: just "[hidden]")
- This is the highest-complexity subsystem per the research doc — keep v1 simple

## Acceptance

### Tests
- `packages/memory/src/aperture.test.ts`:
  - High clarity + matching domain = full visibility
  - Low clarity = reduced visible ratio
  - Blocked domains always hidden
  - visibleRatio computation correct at boundary values

### Commands
```bash
bun run format
bun run lint
bun run build
bun run test
```

## References

- [schemas.md](../schemas.md) — `TraitView` interface
- [research.md](../research.md) — complexity budget (aperture = High)
- Spec: `.pstdio/docs/specs/03-agent-setup.md` — epistemic aperture mechanics
- Spec: `.pstdio/docs/specs/05-memory-retrieval.md` — trait view in memory context
