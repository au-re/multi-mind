import { Box, Flex, Heading, Link } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate, useParams } from "@tanstack/react-router";
import { ChatInput } from "@/features/agent/components/chat-input";
import { MessageList } from "@/features/agent/components/message-list";
import { useAgent } from "@/features/agent/hooks/use-agent";
import { useCharacterListStore } from "@/stores/character-list-store";
import { MemoryPanel } from "../components/memory-panel";
import { TraitList } from "../components/trait-list";

const AGENT_CONFIG = {
  model: "gpt-5.2",
  baseURL: "/openai/v1",
  rootDir: "/projects/demo",
};

export const CharacterPage = () => {
  const { characterId } = useParams({ strict: false }) as { characterId: string };
  const character = useCharacterListStore((s) => s.selectCharacterById(characterId));
  const navigate = useNavigate();
  const { messages, isRunning, send } = useAgent(AGENT_CONFIG);

  if (!character) {
    navigate({ to: "/" });
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" h="100dvh">
      <Flex alignItems="center" gap="3" p="4" borderBottom="1px solid" borderColor="border.muted">
        <Link asChild>
          <RouterLink to="/">← Back</RouterLink>
        </Link>
        <Heading size="md">{character.name}</Heading>
      </Flex>

      <Flex flex="1" overflow="hidden">
        <Box w="300px" borderRight="1px solid" borderColor="border.muted" overflowY="auto">
          <TraitList traits={character.traits} />
          <MemoryPanel />
        </Box>
        <Box flex="1" display="flex" flexDirection="column">
          <MessageList messages={messages} />
          <ChatInput onSend={send} disabled={isRunning} />
        </Box>
      </Flex>
    </Box>
  );
};
