import type { UIMessage } from "@pstdio/kas/kas-ui";
import { afterEach, describe, expect, it } from "vitest";
import { useConversationStore } from "./conversation-store";

const makeMessage = (role: "user" | "assistant", text: string): UIMessage => ({
  id: crypto.randomUUID(),
  role,
  parts: [{ type: "text", text, state: "done" }],
});

describe("conversation store", () => {
  afterEach(() => {
    useConversationStore.getState().reset();
  });

  describe("createConversation", () => {
    it("creates a new conversation and returns its id", () => {
      const id = useConversationStore.getState().createConversation();
      const conv = useConversationStore.getState().conversations[id];
      expect(conv).toBeDefined();
      expect(conv.messages).toEqual([]);
    });

    it("sets a title when provided", () => {
      const id = useConversationStore.getState().createConversation("My Chat");
      expect(useConversationStore.getState().conversations[id].title).toBe("My Chat");
    });
  });

  describe("setMessages", () => {
    it("updates messages for a conversation", () => {
      const id = useConversationStore.getState().createConversation();
      const msgs = [makeMessage("user", "hello"), makeMessage("assistant", "hi")];
      useConversationStore.getState().setMessages(id, msgs);
      expect(useConversationStore.getState().conversations[id].messages).toEqual(msgs);
    });

    it("does nothing for a non-existent conversation", () => {
      const before = useConversationStore.getState().conversations;
      useConversationStore.getState().setMessages("bogus", [makeMessage("user", "hello")]);
      expect(useConversationStore.getState().conversations).toEqual(before);
    });
  });

  describe("deleteConversation", () => {
    it("removes a conversation", () => {
      const id = useConversationStore.getState().createConversation();
      useConversationStore.getState().deleteConversation(id);
      expect(useConversationStore.getState().conversations[id]).toBeUndefined();
    });

    it("clears activeConversationId if the active conversation is deleted", () => {
      const id = useConversationStore.getState().createConversation();
      useConversationStore.getState().setActiveConversation(id);
      useConversationStore.getState().deleteConversation(id);
      expect(useConversationStore.getState().activeConversationId).toBeNull();
    });
  });

  describe("setActiveConversation", () => {
    it("sets the active conversation id", () => {
      const id = useConversationStore.getState().createConversation();
      useConversationStore.getState().setActiveConversation(id);
      expect(useConversationStore.getState().activeConversationId).toBe(id);
    });
  });

  describe("selectActiveConversation", () => {
    it("returns the active conversation", () => {
      const id = useConversationStore.getState().createConversation("Test");
      useConversationStore.getState().setActiveConversation(id);
      const active = useConversationStore.getState().selectActiveConversation();
      expect(active?.title).toBe("Test");
    });

    it("returns undefined when no conversation is active", () => {
      expect(useConversationStore.getState().selectActiveConversation()).toBeUndefined();
    });
  });
});
