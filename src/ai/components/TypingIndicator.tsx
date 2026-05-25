import React from 'react'

export function TypingIndicator() {
  return (
    <div className="ai-typing">
      <div
        className="ai-message-avatar"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          width: '1.75rem',
          height: '1.75rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '0.125rem',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <div className="ai-typing-dots">
        <div className="ai-typing-dot" />
        <div className="ai-typing-dot" />
        <div className="ai-typing-dot" />
      </div>
    </div>
  )
}
