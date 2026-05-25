import React from 'react'
import type { ToolCallInfo } from '../store/aiStore'

interface ToolCallIndicatorProps {
  toolCall: ToolCallInfo
}

const TOOL_LABELS: Record<string, string> = {
  query_database: 'Querying database',
  read_schema: 'Reading database schema',
  read_file: 'Reading source file',
  list_directory: 'Exploring codebase',
  analyze_dto: 'Analyzing DTO',
  analyze_controller: 'Analyzing API routes',
  analyze_react_form: 'Analyzing React form',
  create_user: 'Creating user',
  get_available_roles: 'Fetching roles',
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  query_database: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  read_schema: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  read_file: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  list_directory: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  create_user: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
}

export function ToolCallIndicator({ toolCall }: ToolCallIndicatorProps) {
  const label = TOOL_LABELS[toolCall.name] || toolCall.name
  const icon = TOOL_ICONS[toolCall.name] || (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  )

  return (
    <div className="ai-tool-call">
      {toolCall.status === 'executing' ? (
        <div className="ai-tool-spinner" />
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {icon}
      <span>{label}…</span>
    </div>
  )
}
