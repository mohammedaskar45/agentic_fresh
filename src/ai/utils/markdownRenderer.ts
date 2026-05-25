/**
 * markdownRenderer.ts
 * Utility helpers for working with AI markdown content.
 */

/**
 * Strip markdown syntax from a string for use in plain-text contexts
 * (e.g., conversation titles, notifications).
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')       // headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1')     // italic
    .replace(/`{3}[\s\S]*?`{3}/g, '[code]') // fenced code blocks
    .replace(/`(.+?)`/g, '$1')       // inline code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
    .replace(/>\s+/g, '')            // blockquotes
    .replace(/\n{2,}/g, ' ')         // multiple newlines
    .trim()
}

/**
 * Extract the first line of a markdown string (for titles).
 */
export function firstLine(text: string): string {
  const stripped = stripMarkdown(text)
  const line = stripped.split('\n')[0]?.trim() || ''
  return line.length > 80 ? line.slice(0, 80) + '…' : line
}

/**
 * Count approximate tokens in a string (1 token ≈ 4 characters).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Format token count for display.
 */
export function formatTokens(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k tokens`
  return `${count} tokens`
}
