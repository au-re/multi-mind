import { Stack, Text } from "@chakra-ui/react";
import type { UIConversation } from "@pstdio/kas/kas-ui";
import { EmptyState } from "@pstdio/ui";
import { AutoScroll, ChatMessage, ChatPrimitives } from "@pstdio/ui/chat-ui";
import { MessageCircleIcon } from "lucide-react";

interface MessageListProps {
  messages: UIConversation;
}

export const MessageList = (props: MessageListProps) => {
  const { messages } = props;
  const hasMessages = messages.length > 0;
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  return (
    <ChatPrimitives.Root>
      <AutoScroll userMessageCount={userMessageCount} />
      <ChatPrimitives.Viewport>
        {hasMessages ? (
          <Stack gap="sm" p="md">
            {messages.map((message) => {
              const from = message.role === "user" ? "user" : "assistant";

              return (
                <ChatMessage.Root key={message.id} from={from}>
                  <ChatMessage.Content from={from}>
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
                  </ChatMessage.Content>
                </ChatMessage.Root>
              );
            })}
          </Stack>
        ) : (
          <EmptyState
            icon={<MessageCircleIcon size={48} strokeWidth={1.5} />}
            title="Start a conversation"
            description="Send a message to get started."
          />
        )}
      </ChatPrimitives.Viewport>
      <ChatPrimitives.ScrollToBottom aria-label="Scroll to latest message" />
    </ChatPrimitives.Root>
  );
};
