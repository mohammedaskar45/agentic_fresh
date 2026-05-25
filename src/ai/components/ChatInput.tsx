import React, { useRef, useEffect, useCallback } from 'react'
import { useAiStore } from '../store/aiStore'
import { useAiConversation } from '../hooks/useAiConversation'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isLoading } = useAiStore()

  const handleSubmit = useCallback(() => {
    const value = textareaRef.current?.value.trim()
    if (!value || disabled || isLoading) return
    onSend(value)
    if (textareaRef.current) {
      textareaRef.current.value = ''
      textareaRef.current.style.height = 'auto'
    }
  }, [onSend, disabled, isLoading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
  }

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isLoading])

  return (
    <div className="ai-input-area">
      <div className="ai-input-container">
        {/* Voice button (placeholder for Phase 2) */}
        <button
          className="ai-mic-btn"
          title="Voice input (coming soon)"
          disabled
          id="ai-mic-btn"
          type="button"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          id="ai-message-input"
          className="ai-textarea"
          placeholder={isLoading ? 'AI is responding…' : 'Ask anything about the system…'}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled || isLoading}
          rows={1}
          aria-label="AI message input"
          aria-multiline="true"
        />

        <button
          id="ai-send-btn"
          className="ai-send-btn"
          onClick={handleSubmit}
          disabled={disabled || isLoading}
          aria-label="Send message"
          type="button"
        >
          {isLoading ? (
            <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'ai-spin 0.6s linear infinite' }} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
      <div className="ai-input-hint">Press Enter to send · Shift+Enter for new line</div>
    </div>
  )
}
