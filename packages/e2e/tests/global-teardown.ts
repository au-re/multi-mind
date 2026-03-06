import { execSync } from "node:child_process";
import { test as teardown } from "@playwright/test";

const COMPOSE_FILE = new URL("../../../deploy/docker-compose.yml", import.meta.url).pathname;

teardown("stop docker compose services", async () => {
  console.log("Stopping docker compose services...");
  execSync(`docker compose -f ${COMPOSE_FILE} down`, {
    stdio: "inherit",
    timeout: 30_000,
  });
  console.log("Services stopped.");
});
