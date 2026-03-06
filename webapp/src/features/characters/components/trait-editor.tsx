import { Box, Flex, Input, Text } from "@chakra-ui/react";
import type { TraitConfig, TraitId } from "@/features/traits";
import { clampSkill } from "@/features/traits";

interface TraitEditorProps {
  traits: TraitConfig[];
  onChange: (traitId: TraitId, skill: number) => void;
}

export const TraitEditor = (props: TraitEditorProps) => {
  const { traits, onChange } = props;

  return (
    <Box display="flex" flexDirection="column" gap="3">
      {traits.map((trait) => (
        <Flex key={trait.id} alignItems="center" gap="3">
          <Text flex="1" fontWeight="medium">
            {trait.label}
          </Text>
          <Input
            type="number"
            value={trait.skill}
            min={0}
            width="80px"
            textAlign="center"
            onChange={(e) => {
              const val = Number.parseInt(e.target.value, 10);
              if (!Number.isNaN(val)) {
                onChange(trait.id, clampSkill(val));
              }
            }}
          />
        </Flex>
      ))}
    </Box>
  );
};
