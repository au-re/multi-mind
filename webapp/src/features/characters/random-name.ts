const ADJECTIVES = [
  "Brave",
  "Clever",
  "Gentle",
  "Fierce",
  "Mystic",
  "Silent",
  "Swift",
  "Radiant",
  "Shadow",
  "Golden",
  "Crystal",
  "Iron",
  "Ember",
  "Frost",
  "Storm",
  "Lunar",
  "Solar",
  "Crimson",
  "Azure",
  "Verdant",
];

const NOUNS = [
  "Fox",
  "Sage",
  "Raven",
  "Wolf",
  "Phoenix",
  "Sphinx",
  "Oracle",
  "Knight",
  "Nomad",
  "Bard",
  "Titan",
  "Wraith",
  "Golem",
  "Seer",
  "Herald",
  "Rogue",
  "Druid",
  "Monk",
  "Pilot",
  "Scribe",
];

const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export const randomName = () => `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
