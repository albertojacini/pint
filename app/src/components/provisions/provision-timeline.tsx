'use client'

interface ChangeItem {
  timestamp: string
  label: string
}

interface ProvisionTimelineProps {
  changes: ChangeItem[]
}

// Format timestamp to readable date
function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ProvisionTimeline({ changes }: ProvisionTimelineProps) {
  if (changes.length === 0) return null

  // Sort changes by timestamp (newest first)
  const sortedChanges = [...changes].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="space-y-4">
      {sortedChanges.map((change, index) => (
        <div key={index} className="flex gap-4">
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-background" />
            {index < sortedChanges.length - 1 && (
              <div className="w-0.5 h-full bg-border mt-1" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-6">
            {/* Date */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-foreground">
                {formatDate(change.timestamp)}
              </span>
            </div>

            {/* Label */}
            <p className="text-sm text-muted-foreground">{change.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
