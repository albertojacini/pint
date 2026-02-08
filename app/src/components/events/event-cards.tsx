import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface EventCardData {
  id: string
  title: string
  descriptionShort: string | null
  type: string
  date: string
}

const typeColors: Record<string, string> = {
  election: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  legislation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  protest: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  policy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  appointment: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
}

function EventTypeBadge({ type }: { type: string }) {
  const colorClass = typeColors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', colorClass)}>
      {type}
    </span>
  )
}

interface EventCardSmallProps {
  event: EventCardData
  className?: string
}

export function EventCardSmall({ event, className }: EventCardSmallProps) {
  const formattedDate = format(new Date(event.date), 'MMM d, yyyy')

  return (
    <div
      className={cn(
        'border border-border/50 rounded-lg p-3 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200',
        className
      )}
    >
      {/* Row 1: Date + Type badge */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
        <EventTypeBadge type={event.type} />
      </div>

      {/* Row 2: Title */}
      <h4 className="text-sm font-semibold line-clamp-2">{event.title}</h4>
    </div>
  )
}

interface EventCardMediumProps {
  event: EventCardData
  className?: string
}

export function EventCardMedium({ event, className }: EventCardMediumProps) {
  const formattedDate = format(new Date(event.date), 'MMM d, yyyy')

  return (
    <div
      className={cn(
        'border border-border/50 rounded-lg p-4 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-200',
        className
      )}
    >
      {/* Row 1: Type badge + Date */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <EventTypeBadge type={event.type} />
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </div>

      {/* Row 2: Title */}
      <h3 className="text-base font-semibold line-clamp-2 mb-2">{event.title}</h3>

      {/* Row 3: Short description */}
      {event.descriptionShort && (
        <p className="text-sm text-muted-foreground line-clamp-3">
          {event.descriptionShort}
        </p>
      )}
    </div>
  )
}
