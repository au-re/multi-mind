import { describe, expect, it, vi } from "vitest";

vi.mock("@pstdio/kas", () => ({
  createKasAgent: vi.fn((opts: Record<string, unknown>) => {
    const fn = vi.fn();
    Object.assign(fn, { _opts: opts });
    return fn;
  }),
  createApprovalGate: vi.fn(() => ({ gated: true })),
}));

vi.mock("@pstdio/kas/opfs-tools", () => ({
  createOpfsTools: vi.fn((opts: Record<string, unknown>) => [{ name: "opfs_tool", rootDir: opts.rootDir }]),
}));

import { createKasAgent } from "@pstdio/kas";
import { createOpfsTools } from "@pstdio/kas/opfs-tools";
import { createAgent } from "./use-agent";

describe("createAgent", () => {
  it("creates OPFS tools with the given rootDir", () => {
    createAgent({ model: "gpt-4o-mini", baseURL: "/openai/v1", rootDir: "/projects/demo" });
    expect(createOpfsTools).toHaveBeenCalledWith(expect.objectContaining({ rootDir: "/projects/demo" }));
  });

  it("passes model, baseURL, and tools to createKasAgent", () => {
    createAgent({ model: "gpt-4o-mini", baseURL: "/openai/v1", rootDir: "/projects/demo" });
    expect(createKasAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4o-mini",
        baseURL: "/openai/v1",
        dangerouslyAllowBrowser: true,
      }),
    );
  });
});
