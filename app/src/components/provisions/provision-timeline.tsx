'use client'

import type { ChangeWithContext } from '@/lib/actions/changes'

interface ProvisionTimelineProps {
  changes: ChangeWithContext[]
}

function formatDateCompact(date: Date | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('it-IT', {
    year: '2-digit',
    month: 'short',
  })
}

export function ProvisionTimeline({ changes }: ProvisionTimelineProps) {
  if (changes.length === 0) return null

  return (
    <div className="max-h-72 overflow-y-auto space-y-1">
      {changes.map((change) => (
        <div
          key={change.id}
          className="flex items-baseline gap-2 px-2 py-1 rounded hover:bg-muted/50 transition-colors"
        >
          <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
            {formatDateCompact(change.date || change.createdAt)}
          </span>
          <span className="text-xs truncate">
            {change.eventTitle || change.description || 'Modifica'}
          </span>
        </div>
      ))}
    </div>
  )
}
