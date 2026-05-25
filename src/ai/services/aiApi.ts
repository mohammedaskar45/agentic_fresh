import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'
import type { Conversation, Message } from '../store/aiStore'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const aiApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await apiClient.get('/ai/conversations')
    return data
  },

  getConversation: async (id: string): Promise<{ messages: Message[] } & Conversation> => {
    const { data } = await apiClient.get(`/ai/conversations/${id}`)
    return data
  },

  createConversation: async (): Promise<Conversation> => {
    const { data } = await apiClient.post('/ai/conversations')
    return data
  },

  updateConversation: async (
    id: string,
    updates: { title?: string; is_pinned?: boolean; is_archived?: boolean },
  ): Promise<Conversation> => {
    const { data } = await apiClient.put(`/ai/conversations/${id}`, updates)
    return data
  },

  deleteConversation: async (id: string): Promise<void> => {
    await apiClient.delete(`/ai/conversations/${id}`)
  },

  getUsageStats: async (): Promise<{
    total_conversations: number
    total_tokens: number
    total_messages: number
  }> => {
    const { data } = await apiClient.get('/ai/usage')
    return data
  },
}
