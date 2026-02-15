'use client'

import { Sparkles } from 'lucide-react'
import { MarkdownContent } from './markdown-content'
import { cn } from '@/lib/utils'

interface SectionInsightProps {
  content: string
  className?: string
}

export function SectionInsight({ content, className }: SectionInsightProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-amber-50/50 border border-amber-200/60 p-3',
        'dark:bg-amber-950/20 dark:border-amber-800/40',
        className
      )}
    >
      <div className="flex gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
        <MarkdownContent
          content={content}
          className="prose prose-sm max-w-none text-muted-foreground [&>*:last-child]:mb-0"
        />
      </div>
    </div>
  )
}
