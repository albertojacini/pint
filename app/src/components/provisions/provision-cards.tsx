'use client'

import { Link } from '@/i18n/navigation'
import { cn, provisionPath } from '@/lib/utils'
import type { Tag, ProvisionType } from '@/lib/actions/provisions'
import { getProvisionTypeColor, ProvisionClassificationBadge } from '@/components/custom-ui/classification-badge'
import { Tags } from '@/components/custom-ui/tags'
import { SectionL2Title } from '@/components/custom-ui/typography'
import { RelevanceDots } from '@/components/custom-ui/relevance-dots'
import { getStorageUrl } from '@/lib/storage'
import { ProvisionChangesDensity } from './provision-changes-density'

// Formats a date string (YYYY-MM-DD) into a short display label (e.g. "Feb 2026")
function formatShortDate(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en', { month: 'short', year: 'numeric' })
}

// Builds a compact date range label from optional start/end dates
export function formatDateRange(startsOn?: string | null, endsOn?: string | null): string | null {
  if (!startsOn && !endsOn) return null
  if (startsOn && endsOn) return `${formatShortDate(startsOn)} – ${formatShortDate(endsOn)}`
  if (startsOn) return `From ${formatShortDate(startsOn)}`
  return `Until ${formatShortDate(endsOn!)}`
}

interface ProvisionCardProps {
  provision: {
    id: string
    slug: string
    title: string
    tagline: string | null
    avatarUrl: string | null
    types: ProvisionType[]
    status: string
    relevance: number | null
    startsOn?: string | null
    endsOn?: string | null
    ideaId: string | null
    ideaTitle: string | null
    highlights: { items: Array<{ label: string; value: string }> } | null
    changelog: { items: Array<{ timestamp: string; label: string }> } | null
    tags: Tag[]
  }
  entity: { id: string; slug: string }
}

export function ProvisionCard({ provision, entity }: ProvisionCardProps) {
  const mediaUrl = getStorageUrl('avatars', provision.avatarUrl)

  // Filter tags to only show policy-topic and impact-area categories
  const visibleTags = provision.tags.filter(
    (tag) => tag.category === 'policy-topic' || tag.category === 'impact-area'
  )

  return (
    <div className="border border-border/50 rounded-lg p-4 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-200 flex flex-col h-full">
      {/* Row 1: Type Badges + Date + Tags */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {/* Type badges */}
        {provision.types.map((type) => (
          <ProvisionClassificationBadge key={type.id} type={type.code as any} />
        ))}

        {/* Temporal date range */}
        {formatDateRange(provision.startsOn, provision.endsOn) && (
          <span className="text-[10px] text-muted-foreground/70">
            {formatDateRange(provision.startsOn, provision.endsOn)}
          </span>
        )}

        {/* Tags */}
        <Tags tags={visibleTags} maxTags={3} className="ml-auto" />
      </div>

      {/* Row 2: Title + Relevance Dots */}
      <div className="flex items-start gap-3 mb-3">
        <Link
          href={provisionPath(entity, provision)}
          className="line-clamp-2 flex-1 hover:text-primary hover:underline transition-colors"
        >
          <SectionL2Title>{provision.title}</SectionL2Title>
        </Link>

        {/* Relevance indicator (5 dots) */}
        <div className="flex-shrink-0">
          <RelevanceDots score={provision.relevance} />
        </div>
      </div>

      {/* Row 3: Avatar Image + Description */}
      <div className="flex gap-3 mb-6">
        {/* Avatar image (only show if exists) */}
        {mediaUrl && (
          <img
            src={mediaUrl}
            alt={provision.title}
            className="w-10 h-10 flex-shrink-0 rounded-lg object-cover"
          />
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {provision.tagline || 'No description available'}
        </p>
      </div>

      {/* Row 4: Highlights - stretches to push footer down */}
      <div className="flex-1">
        {provision.highlights?.items && provision.highlights.items.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {provision.highlights.items.map((item, index) => (
              <div key={index}>
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="text-sm font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 4.5: Change Density Diagram */}
      {provision.changelog?.items && provision.changelog.items.length > 0 && (
        <ProvisionChangesDensity
          changes={provision.changelog.items as any}
          maxMonths={12}
        />
      )}

      {/* Row 5: Interaction Stats + Actions */}
      <div className="flex items-center justify-between pt-3">
        {/* Left: Interaction stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {/* Likes */}
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            <span>12k</span>
          </div>

          {/* Dislikes */}
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
              />
            </svg>
            <span>3.2k</span>
          </div>

          {/* Reviews */}
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>156</span>
          </div>
        </div>

        {/* Right: Action indicators */}
        <div className="flex items-center gap-2 text-xs">
          {/* Lightbulb if has linked idea */}
          {provision.ideaId && (
            <Link
              href={`/ideas/${provision.ideaId}`}
              className="hover:opacity-70 transition-opacity text-muted-foreground"
              title="Has linked idea"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </Link>
          )}

          {/* Status icon */}
          {provision.status === 'active' ? (
            <svg
              className="w-3.5 h-3.5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Active"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Inactive"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Extra Small ──────────────────────────────────────────────────────

interface ProvisionCardExtraSmallProps {
  provision: {
    title: string
    type: string // primary provision type code (e.g. 'taxation', 'regulation')
    avatarUrl?: string | null
  }
  className?: string
}

export function ProvisionCardExtraSmall({ provision, className }: ProvisionCardExtraSmallProps) {
  const dotColor = getProvisionTypeColor(provision.type)
  const mediaUrl = getStorageUrl('avatars', provision.avatarUrl ?? null)

  return (
    <div className={cn('flex items-center gap-1.5 py-0.5', className)}>
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      {mediaUrl ? (
        <img
          src={mediaUrl}
          alt=""
          className="w-4 h-4 rounded object-cover shrink-0"
        />
      ) : (
        <div className="w-4 h-4 rounded bg-muted shrink-0" />
      )}
      <span className="text-xs truncate">{provision.title}</span>
    </div>
  )
}
