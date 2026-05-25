import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ToolCallInfo {
  name: string
  status: 'executing' | 'done'
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  isStreaming?: boolean
  toolCalls?: ToolCallInfo[]
}

export interface Conversation {
  id: string
  title: string
  is_pinned: boolean
  token_usage: number
  created_at: string
  updated_at: string
  model_used: string
}

interface AiState {
  // UI state
  isOpen: boolean
  isSidebarOpen: boolean
  isLoading: boolean
  isThinking: boolean
  activeToolCall: ToolCallInfo | null
  error: string | null

  // Conversation state
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Message[]

  // Actions
  setOpen: (open: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setThinking: (thinking: boolean) => void
  setError: (error: string | null) => void
  setActiveConversationId: (id: string | null) => void
  setConversations: (conversations: Conversation[]) => void
  addMessage: (message: Message) => void
  updateLastMessage: (content: string) => void
  setMessages: (messages: Message[]) => void
  appendToLastMessage: (chunk: string) => void
  setLastMessageStreamingDone: () => void
  setActiveToolCall: (toolCall: ToolCallInfo | null) => void
  clearMessages: () => void
  reset: () => void
}

export const useAiStore = create<AiState>()(
  persist(
    (set) => ({
      isOpen: false,
      isSidebarOpen: false,
      isLoading: false,
      isThinking: false,
      activeToolCall: null,
      error: null,
      conversations: [],
      activeConversationId: null,
      messages: [],

      setOpen: (open) => set({ isOpen: open }),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      setLoading: (loading) => set({ isLoading: loading }),
      setThinking: (thinking) => set({ isThinking: thinking }),
      setError: (error) => set({ error }),
      setActiveConversationId: (id) => set({ activeConversationId: id }),
      setConversations: (conversations) => set({ conversations }),

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      updateLastMessage: (content) =>
        set((state) => {
          const messages = [...state.messages]
          if (messages.length > 0) {
            messages[messages.length - 1] = {
              ...messages[messages.length - 1],
              content,
            }
          }
          return { messages }
        }),

      appendToLastMessage: (chunk) =>
        set((state) => {
          const messages = [...state.messages]
          if (messages.length > 0) {
            const last = messages[messages.length - 1]
            messages[messages.length - 1] = {
              ...last,
              content: last.content + chunk,
              isStreaming: true,
            }
          }
          return { messages }
        }),

      setLastMessageStreamingDone: () =>
        set((state) => {
          const messages = [...state.messages]
          if (messages.length > 0) {
            messages[messages.length - 1] = {
              ...messages[messages.length - 1],
              isStreaming: false,
            }
          }
          return { messages }
        }),

      setActiveToolCall: (toolCall) => set({ activeToolCall: toolCall }),

      setMessages: (messages) => set({ messages }),

      clearMessages: () =>
        set({ messages: [], activeConversationId: null }),

      reset: () =>
        set({
          isOpen: false,
          isSidebarOpen: false,
          isLoading: false,
          isThinking: false,
          activeToolCall: null,
          error: null,
          conversations: [],
          activeConversationId: null,
          messages: [],
        }),
    }),
    {
      name: 'ai-store',
      partialize: (state) => ({
        activeConversationId: state.activeConversationId,
        isSidebarOpen: state.isSidebarOpen,
      }),
    },
  ),
)
