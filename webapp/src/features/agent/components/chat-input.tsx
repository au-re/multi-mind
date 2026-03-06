import { Box, IconButton, Textarea } from "@chakra-ui/react";
import { SendHorizonal } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = (props: ChatInputProps) => {
  const { onSend, disabled } = props;
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box display="flex" gap="2" p="4" borderTop="1px solid" borderColor="border.muted">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        resize="none"
        rows={1}
        flex="1"
      />
      <IconButton
        aria-label="Send message"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        alignSelf="flex-end"
      >
        <SendHorizonal />
      </IconButton>
    </Box>
  );
};
