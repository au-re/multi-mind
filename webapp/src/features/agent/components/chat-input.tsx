import { Box } from "@chakra-ui/react";
import { createSerializedPromptState, ChatInput as PstdioChatInput } from "@pstdio/ui/chat-ui";
import { useState } from "react";

const EMPTY_STATE = createSerializedPromptState();

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = (props: ChatInputProps) => {
  const { onSend, disabled } = props;
  const [key, setKey] = useState(0);

  const handleSubmit = (text: string) => {
    onSend(text);
    setKey((k) => k + 1);
  };

  return (
    <Box px="sm" pb="sm" w="full">
      <PstdioChatInput
        key={key}
        defaultState={EMPTY_STATE}
        placeholder="Type a message..."
        onSubmit={handleSubmit}
        isDisabled={disabled}
      />
    </Box>
  );
};
