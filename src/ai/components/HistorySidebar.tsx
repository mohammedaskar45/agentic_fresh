import React, { useEffect, useCallback } from 'react'
import { useAiStore } from '../store/aiStore'
import { aiApi } from '../services/aiApi'
import { formatDistanceToNow } from 'date-fns'

export function HistorySidebar() {
  const {
    isSidebarOpen,
    setSidebarOpen,
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    setMessages,
    setLoading,
  } = useAiStore()

  const loadConversations = useCallback(async () => {
    try {
      const convs = await aiApi.getConversations()
      setConversations(convs)
    } catch {
      // silent
    }
  }, [setConversations])

  useEffect(() => {
    if (isSidebarOpen) {
      loadConversations()
    }
  }, [isSidebarOpen, loadConversations])

  const handleSelectConversation = async (id: string) => {
    if (id === activeConversationId) {
      setSidebarOpen(false)
      return
    }
    try {
      setLoading(true)
      const conv = await aiApi.getConversation(id)
      setActiveConversationId(id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMessages((conv as any).messages || [])
      setSidebarOpen(false)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const handleNewConversation = () => {
    setActiveConversationId(null)
    setMessages([])
    setSidebarOpen(false)
  }

  const handlePin = async (e: React.MouseEvent, id: string, isPinned: boolean) => {
    e.stopPropagation()
    try {
      await aiApi.updateConversation(id, { is_pinned: !isPinned })
      loadConversations()
    } catch {
      // silent
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await aiApi.deleteConversation(id)
      if (activeConversationId === id) {
        setActiveConversationId(null)
        setMessages([])
      }
      loadConversations()
    } catch {
      // silent
    }
  }

  const pinnedConvs = conversations.filter((c) => c.is_pinned)
  const unpinnedConvs = conversations.filter((c) => !c.is_pinned)

  return (
    <div className={`ai-sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="ai-sidebar-header">
        <span className="ai-sidebar-title">Conversation History</span>
        <button className="ai-icon-btn" onClick={() => setSidebarOpen(false)} id="ai-sidebar-close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <button className="ai-new-conv-btn" onClick={handleNewConversation} id="ai-new-conversation-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Conversation
      </button>

      <div className="ai-sidebar-list">
        {conversations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#475569', fontSize: '0.8125rem' }}>
            No conversations yet. Start chatting!
          </div>
        )}

        {pinnedConvs.length > 0 && (
          <>
            <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.6875rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
              📌 Pinned
            </div>
            {pinnedConvs.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={activeConversationId === conv.id}
                onSelect={handleSelectConversation}
                onPin={handlePin}
                onDelete={handleDelete}
              />
            ))}
            <div style={{ height: '0.5rem' }} />
          </>
        )}

        {unpinnedConvs.length > 0 && (
          <>
            {pinnedConvs.length > 0 && (
              <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.6875rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                Recent
              </div>
            )}
            {unpinnedConvs.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={activeConversationId === conv.id}
                onSelect={handleSelectConversation}
                onPin={handlePin}
                onDelete={handleDelete}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

interface ConvItemProps {
  conv: import('../store/aiStore').Conversation
  isActive: boolean
  onSelect: (id: string) => void
  onPin: (e: React.MouseEvent, id: string, isPinned: boolean) => void
  onDelete: (e: React.MouseEvent, id: string) => void
}

function ConversationItem({ conv, isActive, onSelect, onPin, onDelete }: ConvItemProps) {
  return (
    <div
      className={`ai-conv-item ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(conv.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(conv.id)}
    >
      <svg className="ai-conv-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <div className="ai-conv-info">
        <div className="ai-conv-title">{conv.title}</div>
        <div className="ai-conv-date">
          {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.125rem', opacity: 0, transition: 'opacity 0.15s' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0' }}
      >
        <button
          className="ai-icon-btn"
          style={{ width: '1.5rem', height: '1.5rem' }}
          onClick={(e) => onPin(e, conv.id, conv.is_pinned)}
          title={conv.is_pinned ? 'Unpin' : 'Pin'}
        >
          <span style={{ fontSize: '0.625rem' }}>{conv.is_pinned ? '📌' : '📎'}</span>
        </button>
        <button
          className="ai-icon-btn"
          style={{ width: '1.5rem', height: '1.5rem', color: '#ef4444' }}
          onClick={(e) => onDelete(e, conv.id)}
          title="Delete"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
