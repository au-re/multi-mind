import { expect, test } from "@playwright/test";

const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://localhost:3737";
const GATEWAY_ADMIN_URL = process.env.GATEWAY_ADMIN_URL ?? "http://localhost:15000";
const GATEWAY_READINESS_URL = process.env.GATEWAY_READINESS_URL ?? "http://localhost:15021";
const GATEWAY_STATS_URL = process.env.GATEWAY_STATS_URL ?? "http://localhost:15020";

test.describe("gateway readiness", () => {
  test("readiness endpoint returns 200", async () => {
    const res = await fetch(GATEWAY_READINESS_URL);
    expect(res.status).toBe(200);
  });

  test("admin endpoint is reachable", async () => {
    const res = await fetch(GATEWAY_ADMIN_URL);
    expect(res.ok).toBe(true);
  });

  test("stats endpoint is reachable", async () => {
    const res = await fetch(GATEWAY_STATS_URL);
    expect(res.ok).toBe(true);
  });
});

test.describe("gateway proxy", () => {
  test("openai proxy route exists and rejects unauthenticated requests", async () => {
    const res = await fetch(`${GATEWAY_URL}/openai/v1/models`);
    // The gateway should forward to OpenAI, which rejects without valid auth
    // A 401 or 403 means the route is correctly proxying
    expect([401, 403]).toContain(res.status);
  });
});
