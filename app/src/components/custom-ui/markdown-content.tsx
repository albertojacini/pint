'use client'

import Markdown from 'react-markdown'

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={className ?? 'prose prose-sm max-w-none text-muted-foreground'}>
      <Markdown>{content}</Markdown>
    </div>
  )
}
