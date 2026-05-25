import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAiStore } from '../store/aiStore'
import { useAuthStore } from '@/stores/auth-store'
import { aiApi } from '../services/aiApi'
import { v4 as uuidv4 } from 'uuid'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

export function useAiConversation() {
  const socketRef = useRef<Socket | null>(null)
  const {
    setLoading,
    setThinking,
    setError,
    addMessage,
    appendToLastMessage,
    setLastMessageStreamingDone,
    setActiveConversationId,
    setConversations,
    setActiveToolCall,
    messages,
    activeConversationId,
  } = useAiStore()

  const token = useAuthStore((s) => s.auth.accessToken)

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return
    if (socketRef.current) {
      if (!socketRef.current.connected) {
        socketRef.current.connect()
      }
      return
    }

    const socket = io(`${SOCKET_URL}/ai`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socket.on('connected', () => {
      setError(null)
    })

    socket.on('conversation_id', (data: { conversation_id: string }) => {
      setActiveConversationId(data.conversation_id)
      // Refresh conversations list
      aiApi.getConversations().then(setConversations).catch(console.error)
    })

    socket.on('thinking', () => {
      setThinking(true)
    })

    socket.on('stream_start', () => {
      setLoading(true)
      setThinking(false)
      // Add empty assistant message that we'll stream into
      addMessage({
        id: uuidv4(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      })
    })

    socket.on('stream_chunk', (data: { content: string }) => {
      appendToLastMessage(data.content)
    })

    socket.on('tool_call', (data: { name: string; status: string }) => {
      setActiveToolCall({ name: data.name, status: data.status as 'executing' | 'done' })
      if (data.status === 'done') {
        setTimeout(() => setActiveToolCall(null), 1500)
      }
    })

    socket.on('stream_end', () => {
      setLastMessageStreamingDone()
      setLoading(false)
      setThinking(false)
      setActiveToolCall(null)
      // Refresh conversations after message
      aiApi.getConversations().then(setConversations).catch(console.error)
    })

    socket.on('stream_error', (data: { message: string }) => {
      setError(data.message)
      setLoading(false)
      setThinking(false)
      setLastMessageStreamingDone()
    })

    socket.on('error', (data: { message: string }) => {
      setError(data.message)
      setLoading(false)
      setThinking(false)
    })

    socket.on('disconnect', () => {
      setError('Disconnected from AI. Reconnecting...')
    })

    socket.on('reconnect', () => {
      setError(null)
    })

    socketRef.current = socket
  }, [
    token,
    setError,
    setLoading,
    setThinking,
    addMessage,
    appendToLastMessage,
    setLastMessageStreamingDone,
    setActiveConversationId,
    setConversations,
    setActiveToolCall,
  ])

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  // Send a message
  const sendMessage = useCallback(
    (message: string, conversationId?: string) => {
      // Add user message immediately
      addMessage({
        id: uuidv4(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      })

      if (!socketRef.current?.connected) {
        connect()

        // Wait for authenticated 'connected' event before sending
        const handleConnected = () => {
          socketRef.current?.emit('message', {
            message,
            conversation_id: conversationId || activeConversationId || undefined,
          })
          socketRef.current?.off('connected', handleConnected)
        }

        socketRef.current?.on('connected', handleConnected)

        // Timeout to remove listener if connection/auth fails
        setTimeout(() => {
          socketRef.current?.off('connected', handleConnected)
        }, 10000)
        return
      }

      socketRef.current.emit('message', {
        message,
        conversation_id: conversationId || activeConversationId || undefined,
      })
    },
    [connect, addMessage, activeConversationId],
  )

  // Load conversation history
  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        setLoading(true)
        const conv = await aiApi.getConversation(conversationId)
        setActiveConversationId(conv.id)
        useAiStore.getState().setMessages(
          (conv.messages as import('../store/aiStore').Message[]) || [],
        )
      } catch {
        setError('Failed to load conversation')
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, setActiveConversationId],
  )

  // Load conversations list
  const loadConversations = useCallback(async () => {
    try {
      const convs = await aiApi.getConversations()
      setConversations(convs)
    } catch {
      // silent
    }
  }, [setConversations])

  return {
    messages,
    sendMessage,
    connect,
    disconnect,
    loadConversation,
    loadConversations,
    socket: socketRef.current,
  }
}
