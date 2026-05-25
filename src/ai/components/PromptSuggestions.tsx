import React from 'react'

interface PromptSuggestionsProps {
  onSelect: (prompt: string) => void
}

const SUGGESTIONS = [
  { icon: '👥', text: 'How many users are registered?' },
  { icon: '🏗️', text: 'Explain user registration flow' },
  { icon: '➕', text: 'Create a new user' },
  { icon: '📊', text: 'Show latest active users' },
  { icon: '🏢', text: 'Explain company module' },
  { icon: '🔍', text: 'Analyze API structure' },
  { icon: '🗺️', text: 'Find all API endpoints' },
  { icon: '💾', text: 'Generate a SQL report query' },
  { icon: '⚛️', text: 'Explain frontend architecture' },
  { icon: '🔧', text: 'Analyze backend structure' },
]

export function PromptSuggestions({ onSelect }: PromptSuggestionsProps) {
  return (
    <div className="ai-suggestions">
      <div className="ai-suggestions-title">Quick Prompts</div>
      <div className="ai-suggestions-grid">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            id={`ai-suggestion-${i}`}
            className="ai-suggestion-chip"
            onClick={() => onSelect(s.text)}
          >
            <span className="ai-suggestion-icon">{s.icon}</span>
            {s.text}
          </button>
        ))}
      </div>
    </div>
  )
}
