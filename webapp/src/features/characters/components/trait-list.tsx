import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import type { TraitConfig } from "@multi-mind/traits";

interface TraitListProps {
  traits: TraitConfig[];
}

export const TraitList = (props: TraitListProps) => {
  const { traits } = props;

  return (
    <Box p="4">
      <Heading size="sm" mb="3">
        Traits
      </Heading>
      <Box display="flex" flexDirection="column" gap="2">
        {traits.map((trait) => (
          <Flex key={trait.id} justifyContent="space-between" alignItems="center">
            <Text fontSize="sm">{trait.label}</Text>
            <Text fontSize="sm" fontWeight="semibold">
              {trait.skill}
            </Text>
          </Flex>
        ))}
      </Box>
    </Box>
  );
};
