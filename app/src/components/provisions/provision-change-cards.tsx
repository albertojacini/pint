'use client'

import { cn } from '@/lib/utils'

interface ProvisionChangeCardExtraSmallProps {
  change: {
    date: string
    provisionTitle: string
    changeTitle: string
  }
  className?: string
}

export function ProvisionChangeCardExtraSmall({ change, className }: ProvisionChangeCardExtraSmallProps) {
  return (
    <div className={cn('flex items-center gap-2 py-0.5', className)}>
      <span className="text-xs text-muted-foreground shrink-0">{change.date}</span>
      <span className="text-xs text-muted-foreground shrink-0">&middot;</span>
      <span className="text-xs truncate">{change.provisionTitle}</span>
      <span className="text-xs text-muted-foreground truncate">{change.changeTitle}</span>
    </div>
  )
}
