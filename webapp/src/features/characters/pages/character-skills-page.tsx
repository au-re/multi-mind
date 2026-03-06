import { Box, Flex, Grid, Heading, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate, useParams } from "@tanstack/react-router";
import { TRAIT_CONSTRAINTS } from "@/features/traits";
import { useCharacterListStore } from "@/stores/character-list-store";
import { SkillCard } from "../components/skill-card";

export const CharacterSkillsPage = () => {
  const { characterId } = useParams({ strict: false }) as { characterId: string };
  const character = useCharacterListStore((s) => s.selectCharacterById(characterId));
  const navigate = useNavigate();

  if (!character) {
    navigate({ to: "/" });
    return null;
  }

  const totalSkill = character.traits.reduce((sum, t) => sum + t.skill, 0);

  return (
    <Box display="flex" flexDirection="column" h="100dvh">
      <Flex
        alignItems="center"
        justifyContent="space-between"
        p="4"
        borderBottom="1px solid"
        borderColor="border.muted"
      >
        <Flex alignItems="center" gap="3">
          <Link asChild>
            <RouterLink to="/characters/$characterId" params={{ characterId }}>
              ← Back
            </RouterLink>
          </Link>
          <Heading size="lg" letterSpacing="wide" textTransform="uppercase">
            {character.name}
          </Heading>
        </Flex>
        <Text fontSize="sm" color="fg.muted">
          {totalSkill} / {TRAIT_CONSTRAINTS.totalSkillBudgetMin}-{TRAIT_CONSTRAINTS.totalSkillBudgetMax}
        </Text>
      </Flex>

      <Grid flex="1" templateColumns="repeat(3, 1fr)" templateRows="repeat(3, 1fr)" gap="4" p="4" overflow="hidden">
        {character.traits.map((trait) => (
          <SkillCard key={trait.id} trait={trait} />
        ))}
      </Grid>
    </Box>
  );
};
