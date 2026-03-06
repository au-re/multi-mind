import { Box, Heading, Text } from "@chakra-ui/react";

export const HomePage = () => {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" minH="100dvh">
      <Box textAlign="center">
        <Heading size="2xl" mb="2">
          multi-mind
        </Heading>
        <Text color="fg.muted">Placeholder — ready for features.</Text>
      </Box>
    </Box>
  );
};
