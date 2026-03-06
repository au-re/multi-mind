import type { TraitId } from "./types";

interface TraitFlavor {
  tagline: string;
  description: string;
  color: string;
  icon: string;
}

export const TRAIT_FLAVOR: Record<TraitId, TraitFlavor> = {
  integrity: {
    tagline: "Hold the line",
    description:
      "Your moral backbone. It speaks when no one else will, anchoring you to principle even when the world bends.",
    color: "#4A90D9",
    icon: "Shield",
  },
  warmth: {
    tagline: "Feel what they feel",
    description: "The pulse of empathy. It reaches out through silence, reading hurt and hope in equal measure.",
    color: "#E8A838",
    icon: "Heart",
  },
  tact: {
    tagline: "Choose your words",
    description:
      "The art of the unsaid. It navigates tension with grace, knowing when to speak and when to let the room breathe.",
    color: "#7B68EE",
    icon: "MessageCircle",
  },
  vigilance: {
    tagline: "Nothing escapes you",
    description: "The eye that never closes. It catches the flicker in someone's gaze, the pause before the lie.",
    color: "#50C878",
    icon: "Eye",
  },
  heat: {
    tagline: "Let it burn",
    description:
      "Raw, unfiltered intensity. It erupts when reason fails, fueling confrontation and breaking through walls.",
    color: "#E85D4A",
    icon: "Flame",
  },
  drive: {
    tagline: "Push forward",
    description:
      "Relentless momentum. It refuses to stop, refuses to settle, dragging you toward the goal no matter the cost.",
    color: "#FF8C42",
    icon: "Zap",
  },
  structure: {
    tagline: "Order from chaos",
    description:
      "The architect within. It builds frameworks, finds patterns, and keeps the machine running when everything else falls apart.",
    color: "#708090",
    icon: "Grid3x3",
  },
  presence: {
    tagline: "Command the room",
    description:
      "The weight of being there. It fills doorways, holds gazes, and makes people listen before you even speak.",
    color: "#9B59B6",
    icon: "Crown",
  },
  inquiry: {
    tagline: "Ask the right question",
    description:
      "Boundless curiosity made sharp. It pulls at threads others ignore, unraveling the world one question at a time.",
    color: "#2EC4B6",
    icon: "Search",
  },
};
