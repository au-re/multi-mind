import type { ActionBudget } from "./budget.ts";
import type { TraitConfig } from "./config.ts";
import type { IdentityPacket } from "./identity.ts";

interface MemoryCueLike {
  gist: string;
  feltLine: string;
  certainty: number;
}

export function buildSystemPrompt(trait: TraitConfig, identity: IdentityPacket, memories: MemoryCueLike[]) {
  const lines: string[] = [
    `# Trait: ${trait.label}`,
    "",
    identity.whoAmI,
    "",
    "## What I notice",
    ...trait.knowledgeDomains.map((d) => `- ${d}`),
    "",
    "## How I sound",
    identity.howISound,
    "",
    "## What I won't fake",
    identity.whatIWontFake,
    "",
    "## Current pull",
    identity.currentPull,
  ];

  if (memories.length > 0) {
    lines.push("", "## Memory cues");
    for (const cue of memories) {
      lines.push(`- "${cue.gist}" (certainty: ${cue.certainty.toFixed(2)})`);
    }
  }

  lines.push(
    "",
    "## Constraints",
    "- Do not speak as a visible separate voice.",
    "- Do not invent masked details.",
    "- Use tools to act on the shared workspace.",
  );

  return lines.join("\n");
}

export function buildDeveloperNote(
  trait: TraitConfig,
  budget: ActionBudget,
  roundContext: { roundId: string; joinMargin: number; clarityMargin: number; visibleRatio: number },
) {
  const lines: string[] = [
    "## Round context",
    `Trait: ${trait.label}`,
    `Skill: ${trait.skill}`,
    `Join margin: ${roundContext.joinMargin >= 0 ? "+" : ""}${roundContext.joinMargin}`,
    `Clarity margin: ${roundContext.clarityMargin >= 0 ? "+" : ""}${roundContext.clarityMargin}`,
    `Visible ratio: ${roundContext.visibleRatio.toFixed(2)}`,
    "",
    "## Action budget",
    `Major: ${budget.major}`,
    `Minor: ${budget.minor}`,
    `Reaction: ${budget.reaction}`,
  ];

  return lines.join("\n");
}
