import Link from 'next/link'
import type { Tag } from '@/lib/actions/provisions'
import { ProvisionCardRow4 } from './provision-card-row4'

interface ProvisionCardProps {
  provision: {
    id: string
    title: string
    descriptionShort: string | null
    avatarUrl: string | null
    type: string
    status: string
    significance: number | null
    effectiveFrom: string | null
    effectiveUntil: string | null
    ideaId: string | null
    ideaTitle: string | null
    extraData: Record<string, unknown> | null
    tags: Tag[]
  }
}

// Helper function to get type colors (Polymarket-inspired, dark mode compatible)
const getTypeColor = (type: string) => {
  const colors: Record<string, { color: string; bgColor: string }> = {
    ownership: {
      color: 'rgb(147 51 234)',
      bgColor: 'rgb(243 232 255)',
    },
    contract: {
      color: 'rgb(37 99 235)',
      bgColor: 'rgb(219 234 254)',
    },
    regulation: {
      color: 'rgb(234 88 12)',
      bgColor: 'rgb(254 243 199)',
    },
    taxation: {
      color: 'rgb(22 163 74)',
      bgColor: 'rgb(220 252 231)',
    },
    allocation: {
      color: 'rgb(219 39 119)',
      bgColor: 'rgb(252 231 243)',
    },
    designation: {
      color: 'rgb(71 85 105)',
      bgColor: 'rgb(241 245 249)',
    },
  }
  return colors[type] || colors.designation
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


// Map 0-10 significance to 1-5 dots
function getSignificanceDots(significance: number | null): number {
  if (significance === null || significance === undefined) return 0
  return Math.ceil(significance / 2) // 0→0, 1-2→1, 3-4→2, 5-6→3, 7-8→4, 9-10→5
}

// Get color based on significance score (0-10 scale)
function getSignificanceColor(score: number | null): string {
  if (score === null || score === undefined) return 'rgb(209 213 219)' // gray-300 for unknown
  if (score >= 7) return 'rgb(34 197 94)' // green-500 (high: 7-10)
  if (score >= 4) return 'rgb(234 179 8)' // yellow-500 (medium: 4-6)
  return 'rgb(239 68 68)' // red-500 (low: 0-3)
}

export function ProvisionCard({ provision }: ProvisionCardProps) {
  const typeConfig = getTypeColor(provision.type)
  const significanceDots = getSignificanceDots(provision.significance)
  const significanceColor = getSignificanceColor(provision.significance)

  // Filter tags to only show policy-topic and impact-area categories
  const visibleTags = provision.tags.filter(
    (tag) => tag.category === 'policy-topic' || tag.category === 'impact-area'
  )
  const displayedTags = visibleTags.slice(0, 3)
  const extraTagsCount = Math.max(0, visibleTags.length - 3)

  return (
    <div className="border border-border/50 rounded-lg p-4 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-200">
      {/* Row 1: Type Badge + Tags */}
      <div className="flex items-center gap-2 mb-3">
        {/* Type badge */}
        <span
          className="px-2 py-1 rounded text-xs font-medium border-0"
          style={{
            color: typeConfig.color,
          }}
        >
          {provision.type}
        </span>

        {/* Tags */}
        {visibleTags.length > 0 && (
          <div className="flex gap-1.5">
            {displayedTags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
            {extraTagsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                +{extraTagsCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Row 2: Title + Importance Dots */}
      <div className="flex items-center gap-3 mb-3">
        <h4 className="text-lg font-semibold line-clamp-2 flex-1">{provision.title}</h4>

        {/* Significance indicator with 5 dots (0-10 scale mapped) */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                backgroundColor: dot <= significanceDots ? significanceColor : 'rgb(229 231 235)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Row 3: Avatar Image + Description */}
      <div className="flex gap-3 mb-3">
        {/* Avatar image (only show if exists) */}
        {provision.avatarUrl && (
          <img
            src={provision.avatarUrl}
            alt={provision.title}
            className="w-10 h-10 flex-shrink-0 rounded-lg object-cover"
          />
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {provision.descriptionShort || 'No description available'}
        </p>
      </div>

      {/* Row 4: Type-Specific Content */}
      <ProvisionCardRow4 type={provision.type} extraData={provision.extraData} />

      {/* Row 5: Mini Stats + Mini Info */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        {/* Left: Mini stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(provision.status)}`} />
            <span className="capitalize">{provision.status}</span>
          </div>

          {/* Effective year */}
          {provision.effectiveFrom && (
            <span>Since {new Date(provision.effectiveFrom).getFullYear()}</span>
          )}
        </div>

        {/* Right: Mini info */}
        <div className="flex items-center gap-2 text-xs">
          {/* Linked idea */}
          {provision.ideaTitle && provision.ideaId && (
            <Link
              href={`/ideas/${provision.ideaId}`}
              className="text-primary hover:underline flex items-center gap-1"
            >
              <span>💡</span>
              <span className="max-w-[100px] truncate">{provision.ideaTitle}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
