import { Box } from "@chakra-ui/react";
import { ChatInput } from "../components/chat-input";
import { MessageList } from "../components/message-list";
import { useAgent } from "../hooks/use-agent";

const AGENT_CONFIG = {
  model: "gpt-5.2",
  baseURL: "/openai/v1",
  rootDir: "/projects/demo",
};

export const AgentPage = () => {
  const { messages, isRunning, send } = useAgent(AGENT_CONFIG);

  return (
    <Box display="flex" flexDirection="column" h="100dvh">
      <MessageList messages={messages} />
      <ChatInput onSend={send} disabled={isRunning} />
    </Box>
  );
};
