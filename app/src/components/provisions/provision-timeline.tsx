'use client'

import type { ChangeWithContext } from '@/lib/actions/changes'
import { Badge } from '@/components/ui/badge'

interface ProvisionTimelineProps {
  changes: ChangeWithContext[]
}

// Format timestamp to readable date
function formatDate(date: Date | null): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ProvisionTimeline({ changes }: ProvisionTimelineProps) {
  if (changes.length === 0) return null

  // Changes are already sorted by effectiveDate DESC from the server
  return (
    <div className="space-y-4">
      {changes.map((change, index) => (
        <div key={change.id} className="flex gap-4">
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-background" />
            {index < changes.length - 1 && (
              <div className="w-0.5 h-full bg-border mt-1" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-6">
            {/* Date and Event Type */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-medium text-foreground">
                {formatDate(change.effectiveDate || change.createdAt)}
              </span>
              {change.eventType && (
                <Badge variant="secondary" className="text-xs">
                  {change.eventType}
                </Badge>
              )}
            </div>

            {/* Event Title (if available) */}
            {change.eventTitle && (
              <p className="text-sm font-medium text-foreground mb-1">
                {change.eventTitle}
              </p>
            )}

            {/* Change Description */}
            {change.description && (
              <p className="text-sm text-muted-foreground">{change.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
