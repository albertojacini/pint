'use client'

import Link from 'next/link'
import type { Tag } from '@/lib/actions/provisions'
import { ProvisionCardRow4 } from './provision-card-row4'
import { provisionPath } from '@/lib/utils'
import { ProvisionClassificationBadge } from '@/components/custom-ui/classification-badge'
import { Tags } from '@/components/custom-ui/tags'
import { SubsectionTitle } from '@/components/custom-ui/typography'
import { getMediaUrl } from '@/lib/storage'

interface ProvisionCardProps {
  provision: {
    id: string
    slug: string
    title: string
    descriptionShort: string | null
    avatarUrl: string | null
    type: string
    status: string
    relevance: number | null
    effectiveFrom: string | null
    effectiveUntil: string | null
    ideaId: string | null
    ideaTitle: string | null
    extraData: Record<string, unknown> | null
    tags: Tag[]
  }
  entity: { id: string; slug: string }
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-500',
    repealed: 'bg-red-500',
    suspended: 'bg-yellow-500',
  }
  return colors[status] || 'bg-gray-500'
}

// Map 0-10 to 1-5 dots
function getScoreDots(score: number | null): number {
  if (score === null || score === undefined) return 0
  return Math.ceil(score / 2) // 0→0, 1-2→1, 3-4→2, 5-6→3, 7-8→4, 9-10→5
}

// Get color based on score (0-10 scale) - green for high values
function getScoreColor(score: number | null): string {
  if (score === null || score === undefined) return 'rgb(209 213 219)' // gray-300 for unknown
  if (score >= 7) return 'rgb(34 197 94)' // green-500 (high: 7-10)
  if (score >= 4) return 'rgb(234 179 8)' // yellow-500 (medium: 4-6)
  return 'rgb(239 68 68)' // red-500 (low: 0-3)
}

export function ProvisionCard({ provision, entity }: ProvisionCardProps) {
  const relevanceDots = getScoreDots(provision.relevance)
  const relevanceColor = getScoreColor(provision.relevance)
  const mediaUrl = getMediaUrl(provision.avatarUrl)

  // Filter tags to only show policy-topic and impact-area categories
  const visibleTags = provision.tags.filter(
    (tag) => tag.category === 'policy-topic' || tag.category === 'impact-area'
  )

  return (
    <div className="border border-border/50 rounded-lg p-4 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-200 flex flex-col h-full">
      {/* Row 1: Type Badge + Tags */}
      <div className="flex items-center gap-2 mb-3">
        {/* Type badge */}
        <ProvisionClassificationBadge type={provision.type as any} />

        {/* Tags */}
        <Tags tags={visibleTags} maxTags={3} />
      </div>

      {/* Row 2: Title + Relevance Dots */}
      <div className="flex items-center gap-3 mb-3">
        <Link
          href={provisionPath(entity, provision)}
          className="line-clamp-2 flex-1 hover:text-primary hover:underline transition-colors"
        >
          <SubsectionTitle>{provision.title}</SubsectionTitle>
        </Link>

        {/* Relevance indicator (5 dots) */}
        <div className="flex items-center gap-0.5 flex-shrink-0" title="Relevance">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                backgroundColor: dot <= relevanceDots ? relevanceColor : 'rgb(229 231 235)',
              }}
            />
          ))}
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
          {provision.descriptionShort || 'No description available'}
        </p>
      </div>

      {/* Row 4: Type-Specific Content - stretches to push footer down */}
      <div className="flex-1">
        <ProvisionCardRow4 type={provision.type} extraData={provision.extraData} />
      </div>

      {/* Row 5: Interaction Stats + Actions */}
      <div className="flex items-center justify-between pt-3">
        {/* Left: Interaction stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {/* Likes */}
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>12k</span>
          </div>

          {/* Dislikes */}
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            <span>3.2k</span>
          </div>

          {/* Reviews */}
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </Link>
          )}

          {/* Status icon */}
          {provision.status === 'active' ? (
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Active">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Inactive">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
