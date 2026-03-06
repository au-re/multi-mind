import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import { useConversationStore } from "@/stores/conversation-store";
import { ChatInput } from "../components/chat-input";
import { MessageList } from "../components/message-list";
import { DEFAULT_AGENT_CONFIG, useAgent } from "../hooks/use-agent";

function useEnsureConversation() {
  const activeId = useConversationStore((s) => s.activeConversationId);
  const create = useConversationStore((s) => s.createConversation);
  const setActive = useConversationStore((s) => s.setActiveConversation);

  useEffect(() => {
    if (!activeId) {
      const id = create();
      setActive(id);
    }
  }, [activeId, create, setActive]);

  return activeId;
}

export const AgentPage = () => {
  const conversationId = useEnsureConversation();

  if (!conversationId) return null;

  return <AgentChat conversationId={conversationId} />;
};

const AgentChat = (props: { conversationId: string }) => {
  const { conversationId } = props;
  const { messages, isRunning, send } = useAgent(DEFAULT_AGENT_CONFIG, conversationId);

  return (
    <Box display="flex" flexDirection="column" h="100dvh" w="100vw">
      <MessageList messages={messages} />
      <ChatInput onSend={send} disabled={isRunning} />
    </Box>
  );
};
