import { Box, Text } from "@chakra-ui/react";

export const MemoryPanel = () => {
  return (
    <Box flex="1" display="flex" alignItems="center" justifyContent="center" p="4">
      <Text color="fg.muted">No memories yet</Text>
    </Box>
  );
};
