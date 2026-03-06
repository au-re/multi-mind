import { Box, Button, Flex, Grid, Heading, Input } from "@chakra-ui/react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import type { TraitConfig, TraitId } from "@/features/traits";
import { validateSkillBudget } from "@/features/traits";
import { useCharacterListStore } from "@/stores/character-list-store";
import { BudgetIndicator } from "../components/budget-indicator";
import { SkillCard } from "../components/skill-card";

export const CharacterEditPage = () => {
  const { characterId } = useParams({ strict: false }) as { characterId: string };
  const character = useCharacterListStore((s) => s.selectCharacterById(characterId));
  const updateCharacter = useCharacterListStore((s) => s.updateCharacter);
  const navigate = useNavigate();

  const [name, setName] = useState(character?.name ?? "");
  const [traits, setTraits] = useState<TraitConfig[]>(character?.traits ?? []);

  if (!character) {
    navigate({ to: "/" });
    return null;
  }

  const handleTraitChange = (traitId: TraitId, skill: number) => {
    setTraits((prev) => prev.map((t) => (t.id === traitId ? { ...t, skill } : t)));
  };

  const handleSave = () => {
    updateCharacter(characterId, { name, traits });
    navigate({ to: "/characters/$characterId", params: { characterId } });
  };

  const handleCancel = () => {
    navigate({ to: "/characters/$characterId", params: { characterId } });
  };

  const { valid } = validateSkillBudget(traits);

  return (
    <Box p="6" maxW="960px" mx="auto">
      <Flex justifyContent="space-between" alignItems="center" mb="6">
        <Heading size="lg">Edit Character</Heading>
        <Flex gap="3">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!valid}>
            Save
          </Button>
        </Flex>
      </Flex>

      <Box mb="6">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Character name" size="lg" />
      </Box>

      <Flex justifyContent="space-between" alignItems="center" mb="4">
        <Heading size="md">Traits</Heading>
        <BudgetIndicator traits={traits} />
      </Flex>

      <Grid templateColumns="repeat(3, 1fr)" gap="4">
        {traits.map((trait) => (
          <SkillCard key={trait.id} trait={trait} onChange={handleTraitChange} />
        ))}
      </Grid>
    </Box>
  );
};
