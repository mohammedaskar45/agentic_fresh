import { useRef, useCallback } from 'react'
import { useAiStore } from '../store/aiStore'

/**
 * useStreaming – low-level hook for managing streaming token accumulation.
 * Used internally by useAiConversation. Exposed for any component that
 * needs direct streaming state inspection.
 */
export function useStreaming() {
  const bufferRef = useRef<string>('')
  const { appendToLastMessage, setLastMessageStreamingDone } = useAiStore()

  const appendChunk = useCallback(
    (chunk: string) => {
      bufferRef.current += chunk
      appendToLastMessage(chunk)
    },
    [appendToLastMessage],
  )

  const finishStream = useCallback(() => {
    bufferRef.current = ''
    setLastMessageStreamingDone()
  }, [setLastMessageStreamingDone])

  const getBuffer = useCallback(() => bufferRef.current, [])

  const resetBuffer = useCallback(() => {
    bufferRef.current = ''
  }, [])

  return { appendChunk, finishStream, getBuffer, resetBuffer }
}
