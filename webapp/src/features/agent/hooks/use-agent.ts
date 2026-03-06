import { createApprovalGate, createKasAgent, type Tool } from "@pstdio/kas";
import { toConversationUI } from "@pstdio/kas/kas-ui";
import { createOpfsTools } from "@pstdio/kas/opfs-tools";
import { useState } from "react";
import { useConversationStore } from "@/stores/conversation-store";

interface CreateAgentOptions {
  model: string;
  baseURL: string;
  rootDir: string;
}

export const DEFAULT_AGENT_CONFIG: CreateAgentOptions = {
  model: "gpt-5.2",
  baseURL: `${window.location.origin}/openai/v1`,
  rootDir: "/projects/demo",
};

export function createAgent({ model, baseURL, rootDir }: CreateAgentOptions) {
  const opfsTools = createOpfsTools({
    rootDir,
    approvalGate: createApprovalGate({
      requestApproval: async ({ tool, workspaceDir }) => {
        return window.confirm(`Allow ${tool} in ${workspaceDir}?`);
      },
    }),
  });

  return createKasAgent({
    model,
    apiKey: "none",
    baseURL,
    tools: [...opfsTools] as Tool[],
    dangerouslyAllowBrowser: true,
  });
}

export function useAgent({ model, baseURL, rootDir }: CreateAgentOptions, conversationId: string) {
  const messages = useConversationStore((s) => s.conversations[conversationId]?.messages ?? []);
  const setMessages = useConversationStore((s) => s.setMessages);
  const [isRunning, setIsRunning] = useState(false);

  const agent = createAgent({ model, baseURL, rootDir });

  const send = async (input: string) => {
    setIsRunning(true);
    const userMessages = [
      ...messages.flatMap((m) =>
        m.parts
          .filter((p) => p.type === "text")
          .map((p) => ({ role: m.role as "user" | "assistant", content: (p as { text: string }).text })),
      ),
      { role: "user" as const, content: input },
    ];

    try {
      for await (const conversation of toConversationUI(agent(userMessages))) {
        setMessages(conversationId, conversation);
      }
    } finally {
      setIsRunning(false);
    }
  };

  return { messages, isRunning, send };
}
