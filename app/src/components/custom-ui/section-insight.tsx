'use client'

import { Sparkles } from 'lucide-react'
import { MarkdownContent } from './markdown-content'
import { Box } from './box'
import { cn } from '@/lib/utils'

interface SectionInsightProps {
  content: string
  className?: string
}

export function SectionInsight({ content, className }: SectionInsightProps) {
  return (
    <Box variant="highlighted" className={cn('flex gap-2', className)}>
      <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
      <MarkdownContent
        content={content}
        className="prose prose-sm max-w-none text-muted-foreground [&>*:last-child]:mb-0"
      />
    </Box>
  )
}
