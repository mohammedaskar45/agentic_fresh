import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../store/aiStore'

interface CodeBlockProps {
  language?: string
  children: string
}

function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <div className="ai-code-block">
      <div className="ai-code-header">
        <span className="ai-code-lang">{language || 'code'}</span>
        <button className={`ai-code-copy ${copied ? 'copied' : ''}`} onClick={handleCopy}>
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div className="ai-code-content">
        <pre><code>{children}</code></pre>
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`ai-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="ai-message-avatar">
        {isUser ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        )}
      </div>
      <div className="ai-message-bubble">
        {isUser ? (
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
        ) : (
          <>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeString = String(children).replace(/\n$/, '')
                  const isBlock = codeString.includes('\n') || match

                  if (isBlock) {
                    return (
                      <CodeBlock language={match ? match[1] : undefined}>
                        {codeString}
                      </CodeBlock>
                    )
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {message.isStreaming && (
              <span className="ai-streaming-cursor" aria-hidden="true" />
            )}
          </>
        )}
      </div>
    </div>
  )
}
