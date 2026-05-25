import React from 'react'
import { useAiStore } from '../store/aiStore'
import '../styles/ai.css'

export function FloatingButton() {
  const { isOpen, setOpen } = useAiStore()

  return (
    <button
      id="ai-floating-btn"
      className="ai-float-btn"
      onClick={() => setOpen(!isOpen)}
      aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
      aria-expanded={isOpen}
      aria-controls="ai-chat-modal"
      title="AgenticAI Assistant"
    >
      {isOpen ? (
        /* X icon when open */
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        /* AI sparkle icon when closed */
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      )}
    </button>
  )
}
