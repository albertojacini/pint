import Link from 'next/link'
import type { Tag } from '@/lib/actions/provisions'
import { ProvisionImpactChart } from './provision-impact-chart'
import { ProvisionCardRow4 } from './provision-card-row4'

interface ProvisionCardProps {
  provision: {
    id: string
    title: string
    description: string | null
    type: string
    status: string
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
    'ownership': {
      color: 'rgb(147 51 234)',
      bgColor: 'rgb(243 232 255)',
    },
    'contract': {
      color: 'rgb(37 99 235)',
      bgColor: 'rgb(219 234 254)',
    },
    'regulation': {
      color: 'rgb(234 88 12)',
      bgColor: 'rgb(254 243 199)',
    },
    'taxation': {
      color: 'rgb(22 163 74)',
      bgColor: 'rgb(220 252 231)',
    },
    'allocation': {
      color: 'rgb(219 39 119)',
      bgColor: 'rgb(252 231 243)',
    },
    'designation': {
      color: 'rgb(71 85 105)',
      bgColor: 'rgb(241 245 249)',
    },
  }
  return colors[type] || colors.designation
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'active': 'bg-green-500',
    'repealed': 'bg-red-500',
    'suspended': 'bg-yellow-500',
  }
  return colors[status] || 'bg-gray-500'
}

// Helper function to get type emoji
const getTypeEmoji = (type: string) => {
  const emojis: Record<string, string> = {
    'ownership': '🏢',
    'contract': '📄',
    'regulation': '⚖️',
    'taxation': '💰',
    'allocation': '📊',
    'designation': '🏛️',
  }
  return emojis[type] || '📋'
}

// Helper function to get type gradient
const getTypeGradient = (type: string) => {
  const gradients: Record<string, string> = {
    'ownership': 'from-purple-500 to-indigo-600',
    'contract': 'from-blue-500 to-cyan-600',
    'regulation': 'from-amber-500 to-orange-600',
    'taxation': 'from-green-500 to-emerald-600',
    'allocation': 'from-pink-500 to-rose-600',
    'designation': 'from-slate-500 to-gray-600',
  }
  return gradients[type] || 'from-gray-500 to-slate-600'
}

export function ProvisionCard({ provision }: ProvisionCardProps) {
  const typeConfig = getTypeColor(provision.type)
  const emoji = getTypeEmoji(provision.type)
  const gradient = getTypeGradient(provision.type)

  // Filter tags to only show policy-topic and impact-area categories
  const visibleTags = provision.tags.filter(
    tag => tag.category === 'policy-topic' || tag.category === 'impact-area'
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
            color: typeConfig.color
          }}
        >
          {provision.type}
        </span>

        {/* Tags */}
        {visibleTags.length > 0 && (
          <div className="flex gap-1.5">
            {displayedTags.map(tag => (
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

      {/* Row 2: Title + Impact Diagram */}
      <div className="flex items-center gap-3 mb-3">
        <h4 className="text-lg font-semibold line-clamp-2 flex-1">
          {provision.title}
        </h4>

        <ProvisionImpactChart provisionId={provision.id} />
      </div>

      {/* Row 3: Placeholder Image + Description */}
      <div className="flex gap-3 mb-3">
        {/* Placeholder image with emoji + gradient */}
        <div className={`w-20 h-20 flex-shrink-0 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl`}>
          {emoji}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {provision.description || 'No description available'}
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
