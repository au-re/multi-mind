import { ChakraProvider } from "@chakra-ui/react";
import { psTheme } from "@pstdio/ui/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Router } from "./router";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={psTheme}>
        <Router />
      </ChakraProvider>
    </QueryClientProvider>
  </StrictMode>,
);
