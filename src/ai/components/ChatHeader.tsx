import React from 'react'
import { useAiStore } from '../store/aiStore'

interface ChatHeaderProps {
  onClose: () => void
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  const { isSidebarOpen, setSidebarOpen, isLoading, activeConversationId } = useAiStore()

  return (
    <div className="ai-header">
      {/* History toggle */}
      <button
        id="ai-history-btn"
        className="ai-icon-btn"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle conversation history"
        title="Conversation History"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Logo + title */}
      <div className="ai-header-logo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>

      <div style={{ flex: 1 }}>
        <div className="ai-header-title">AgenticAI</div>
        <div className="ai-header-subtitle">Enterprise Intelligence</div>
      </div>

      {/* Status badge */}
      <div className="ai-status-badge">
        <div className="ai-status-dot" />
        {isLoading ? 'Thinking' : 'Online'}
      </div>

      {/* New conversation */}
      <button
        id="ai-new-chat-btn"
        className="ai-icon-btn"
        onClick={() => {
          useAiStore.getState().clearMessages()
        }}
        aria-label="New conversation"
        title="New Conversation"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Close */}
      <button
        id="ai-close-btn"
        className="ai-icon-btn"
        onClick={onClose}
        aria-label="Close AI assistant"
        title="Close"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
