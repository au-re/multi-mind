import { Box, Text } from "@chakra-ui/react";
import type { UIConversation } from "@pstdio/kas/kas-ui";

interface MessageListProps {
  messages: UIConversation;
}

export const MessageList = (props: MessageListProps) => {
  const { messages } = props;

  if (messages.length === 0) {
    return (
      <Box flex="1" display="flex" alignItems="center" justifyContent="center">
        <Text color="fg.muted">Send a message to get started.</Text>
      </Box>
    );
  }

  return (
    <Box flex="1" overflowY="auto" p="4" display="flex" flexDirection="column" gap="3">
      {messages.map((message) => (
        <Box
          key={message.id}
          alignSelf={message.role === "user" ? "flex-end" : "flex-start"}
          maxW="80%"
          bg={message.role === "user" ? "blue.500" : "bg.subtle"}
          color={message.role === "user" ? "white" : "fg.default"}
          px="4"
          py="2"
          borderRadius="lg"
        >
          {message.parts
            .filter((p) => p.type === "text")
            .map((part, i) => (
              <Text key={i} whiteSpace="pre-wrap">
                {(part as { text: string }).text}
              </Text>
            ))}
          {message.parts
            .filter((p) => p.type === "tool-invocation")
            .map((part, i) => (
              <Text key={`tool-${i}`} fontSize="xs" color="fg.muted" fontFamily="mono">
                tool: {(part as { toolInvocation: { type: string } }).toolInvocation.type}
              </Text>
            ))}
        </Box>
      ))}
    </Box>
  );
};
