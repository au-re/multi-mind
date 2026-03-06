export interface ActionBudget {
  major: number;
  minor: number;
  reaction: number;
}

export function computeActionBudget(joinMargin: number, _clarityMargin: number): ActionBudget {
  const budget: ActionBudget = { major: 1, minor: 1, reaction: 1 };

  if (joinMargin >= 5) budget.minor += 1;
  if (joinMargin >= 10) budget.reaction += 1;

  return budget;
}
