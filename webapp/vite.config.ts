import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(() => ({
  base: process.env.BASE_PATH ?? "/",
  server: {
    port: 5199,
    proxy: {
      "/v1": process.env.GATEWAY_URL ?? "http://localhost:3000",
      "/healthz": process.env.GATEWAY_URL ?? "http://localhost:3000",
    },
  },
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@chakra-ui/react",
      "@emotion/react",
      "@emotion/styled",
    ],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
}));
