import type { UIConversation } from "@pstdio/kas/kas-ui";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface Conversation {
  id: string;
  title: string;
  messages: UIConversation;
  createdAt: string;
}

interface ConversationState {
  conversations: Record<string, Conversation>;
  activeConversationId: string | null;
}

interface ConversationActions {
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  setMessages: (id: string, messages: UIConversation) => void;
  setActiveConversation: (id: string | null) => void;
  selectActiveConversation: () => Conversation | undefined;
  reset: () => void;
}

const INITIAL_STATE: ConversationState = {
  conversations: {},
  activeConversationId: null,
};

export const useConversationStore = create<ConversationState & ConversationActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STATE,

        createConversation: (title) => {
          const id = crypto.randomUUID();
          const conversation: Conversation = {
            id,
            title: title ?? "New conversation",
            messages: [],
            createdAt: new Date().toISOString(),
          };
          set((state) => ({
            conversations: { ...state.conversations, [id]: conversation },
          }));
          return id;
        },

        deleteConversation: (id) => {
          set((state) => {
            const { [id]: _, ...rest } = state.conversations;
            return {
              conversations: rest,
              activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
            };
          });
        },

        setMessages: (id, messages) => {
          set((state) => {
            if (!state.conversations[id]) return state;
            return {
              conversations: {
                ...state.conversations,
                [id]: { ...state.conversations[id], messages },
              },
            };
          });
        },

        setActiveConversation: (id) => set({ activeConversationId: id }),

        selectActiveConversation: () => {
          const { conversations, activeConversationId } = get();
          if (!activeConversationId) return undefined;
          return conversations[activeConversationId];
        },

        reset: () => set(INITIAL_STATE),
      }),
      { name: "conversations" },
    ),
    { name: "conversations" },
  ),
);
