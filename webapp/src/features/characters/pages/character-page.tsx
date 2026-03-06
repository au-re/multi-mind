import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChatInput } from "@/features/agent/components/chat-input";
import { MessageList } from "@/features/agent/components/message-list";
import { DEFAULT_AGENT_CONFIG, useAgent } from "@/features/agent/hooks/use-agent";
import { useCharacterListStore } from "@/stores/character-list-store";
import { useConversationStore } from "@/stores/conversation-store";
import { MemoryPanel } from "../components/memory-panel";
import { TraitList } from "../components/trait-list";

function useCharacterConversation(characterId: string) {
  const conversations = useConversationStore((s) => s.conversations);
  const create = useConversationStore((s) => s.createConversation);

  const existing = Object.values(conversations).find((c) => c.title === `character:${characterId}`);

  useEffect(() => {
    if (!existing) {
      create(`character:${characterId}`);
    }
  }, [existing, create, characterId]);

  return existing?.id ?? null;
}

export const CharacterPage = () => {
  const { characterId } = useParams({ strict: false }) as { characterId: string };
  const character = useCharacterListStore((s) => s.selectCharacterById(characterId));
  const navigate = useNavigate();
  const conversationId = useCharacterConversation(characterId);

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
        <Box flex="1" />
        <Button asChild size="sm" variant="ghost">
          <RouterLink to="/characters/$characterId/skills" params={{ characterId }}>
            Skills
          </RouterLink>
        </Button>
      </Flex>

      <Flex flex="1" overflow="hidden">
        <Box w="300px" borderRight="1px solid" borderColor="border.muted" overflowY="auto">
          <TraitList traits={character.traits} />
          <MemoryPanel />
        </Box>
        <Box flex="1" display="flex" flexDirection="column">
          {conversationId ? <CharacterChat conversationId={conversationId} /> : null}
        </Box>
      </Flex>
    </Box>
  );
};

const CharacterChat = (props: { conversationId: string }) => {
  const { conversationId } = props;
  const { messages, isRunning, send } = useAgent(DEFAULT_AGENT_CONFIG, conversationId);

  return (
    <>
      <MessageList messages={messages} />
      <ChatInput onSend={send} disabled={isRunning} />
    </>
  );
};
