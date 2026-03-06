import { execSync } from "node:child_process";
import { test as setup } from "@playwright/test";

const COMPOSE_FILE = new URL("../../../deploy/docker-compose.yml", import.meta.url).pathname;
const WEBAPP_URL = process.env.WEBAPP_URL ?? "http://localhost:5199";

async function waitForService(url: string, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Service at ${url} did not become ready within ${timeoutMs}ms`);
}

setup("start docker compose services", async () => {
  console.log("Starting docker compose services...");
  execSync(`docker compose -f ${COMPOSE_FILE} up -d --build`, {
    stdio: "inherit",
    timeout: 120_000,
  });

  console.log("Waiting for webapp to be ready...");
  await waitForService(WEBAPP_URL);
  console.log("All services are ready.");
});
