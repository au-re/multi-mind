import { Text } from "@chakra-ui/react";
import type { TraitConfig } from "@/features/traits";
import { TRAIT_CONSTRAINTS, validateSkillBudget } from "@/features/traits";

interface BudgetIndicatorProps {
  traits: TraitConfig[];
}

export const BudgetIndicator = (props: BudgetIndicatorProps) => {
  const { traits } = props;
  const { total, valid } = validateSkillBudget(traits);

  return (
    <Text fontWeight="semibold" color={valid ? "green.500" : "red.500"}>
      {total} / {TRAIT_CONSTRAINTS.totalSkillBudgetMin}-{TRAIT_CONSTRAINTS.totalSkillBudgetMax}
    </Text>
  );
};
