import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import type { Character } from "@/stores/character-list-store";

interface CharacterCardProps {
  character: Character;
}

export const CharacterCard = (props: CharacterCardProps) => {
  const { character } = props;
  const navigate = useNavigate();

  const topTraits = [...character.traits].sort((a, b) => b.skill - a.skill).slice(0, 4);

  return (
    <Box borderWidth="1px" borderRadius="lg" p="4" cursor="pointer" _hover={{ bg: "bg.subtle" }}>
      <Flex justifyContent="space-between" alignItems="center" mb="2">
        <Text
          fontWeight="bold"
          fontSize="lg"
          onClick={() => navigate({ to: "/characters/$characterId", params: { characterId: character.id } })}
          cursor="pointer"
        >
          {character.name}
        </Text>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate({ to: "/characters/$characterId/edit", params: { characterId: character.id } })}
        >
          Edit
        </Button>
      </Flex>
      <Flex gap="2" flexWrap="wrap">
        {topTraits.map((t) => (
          <Text key={t.id} fontSize="sm" color="fg.muted">
            {t.label} {t.skill}
          </Text>
        ))}
      </Flex>
    </Box>
  );
};
