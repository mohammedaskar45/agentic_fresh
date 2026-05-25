import React, { useEffect, useRef, useCallback } from 'react'
import { useAiStore } from '../store/aiStore'
import { useAiConversation } from '../hooks/useAiConversation'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { ToolCallIndicator } from './ToolCallIndicator'
import { HistorySidebar } from './HistorySidebar'
import { PromptSuggestions } from './PromptSuggestions'
import '../styles/ai.css'

export function ChatModal() {
  const {
    isOpen,
    setOpen,
    isSidebarOpen,
    messages,
    isLoading,
    isThinking,
    error,
    activeToolCall,
    activeConversationId,
    setError,
  } = useAiStore()

  const { sendMessage, connect, disconnect, loadConversations } = useAiConversation()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isConnectedRef = useRef(false)

  // Connect socket when modal opens
  useEffect(() => {
    if (isOpen && !isConnectedRef.current) {
      connect()
      isConnectedRef.current = true
      loadConversations()
    }
  }, [isOpen, connect, loadConversations])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isThinking])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setOpen])

  const handleSend = useCallback(
    (message: string) => {
      setError(null)
      sendMessage(message, activeConversationId || undefined)
    },
    [sendMessage, activeConversationId, setError],
  )

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setOpen(false)
    }
  }

  const showWelcome = messages.length === 0 && !isLoading && !isThinking

  return (
    <div
      className={`ai-modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-label="AI Assistant"
    >
      <div
        className={`ai-modal ${isOpen ? 'open' : ''} ${isSidebarOpen ? 'sidebar-open' : ''}`}
        id="ai-chat-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <HistorySidebar />

        {/* Main Content Area */}
        <div className="ai-chat-main">
          {/* Header */}
          <ChatHeader onClose={() => setOpen(false)} />

          {/* Error Banner */}
          {error && (
            <div className="ai-error-banner" role="alert">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
              <button
                onClick={() => setError(null)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
              >
                ×
              </button>
            </div>
          )}

          {/* Messages or Welcome */}
          {showWelcome ? (
            <>
              <div className="ai-welcome">
                <div className="ai-welcome-logo">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="ai-welcome-title">AgenticAI Assistant</div>
                <div className="ai-welcome-desc">
                  Ask me anything about your system — database insights, codebase analysis, user management, API structure, and more.
                </div>
              </div>
              <PromptSuggestions onSelect={handleSend} />
            </>
          ) : (
            <div className="ai-messages" role="log" aria-live="polite" aria-label="Conversation">
              <div className="ai-messages-inner">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Tool call indicator */}
                {activeToolCall && (
                  <div style={{ paddingLeft: '2.375rem' }}>
                    <ToolCallIndicator toolCall={activeToolCall} />
                  </div>
                )}

                {/* Typing indicator */}
                {isThinking && !activeToolCall && <TypingIndicator />}
              </div>

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={false} />
        </div>
      </div>
    </div>
  )
}
