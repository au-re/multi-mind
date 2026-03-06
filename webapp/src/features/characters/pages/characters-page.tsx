import { Box, Button, Flex, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { useCharacterListStore } from "@/stores/character-list-store";
import { CharacterCard } from "../components/character-card";
import { randomName } from "../random-name";

export const CharactersPage = () => {
  const characters = useCharacterListStore((s) => s.characters);
  const createCharacter = useCharacterListStore((s) => s.createCharacter);
  const deleteCharacter = useCharacterListStore((s) => s.deleteCharacter);
  const navigate = useNavigate();

  const handleCreate = () => {
    const id = createCharacter(randomName());
    navigate({ to: "/characters/$characterId/edit", params: { characterId: id } });
  };

  return (
    <Box p="6" maxW="960px" mx="auto">
      <Flex justifyContent="space-between" alignItems="center" mb="6">
        <Heading size="lg">Characters</Heading>
        <Button onClick={handleCreate}>New Character</Button>
      </Flex>

      {characters.length === 0 ? (
        <Box textAlign="center" py="16">
          <Text color="fg.muted" mb="4">
            No characters yet
          </Text>
          <Button onClick={handleCreate}>Create your first character</Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          {characters.map((c) => (
            <CharacterCard key={c.id} character={c} onDelete={deleteCharacter} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};
