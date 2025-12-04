import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProvisionById } from '@/lib/actions/provisions'
import { ProvisionCardRow4 } from '@/components/provisions/provision-card-row4'

interface PageProps {
  params: Promise<{
    id: string
    provisionId: string
  }>
}

// Helper function to get type colors
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
  return Math.ceil(significance / 2)
}

// Get color based on significance score (0-10 scale)
function getSignificanceColor(score: number | null): string {
  if (score === null || score === undefined) return 'rgb(209 213 219)'
  if (score >= 7) return 'rgb(34 197 94)'
  if (score >= 4) return 'rgb(234 179 8)'
  return 'rgb(239 68 68)'
}

export default async function ProvisionDetailPage({ params }: PageProps) {
  const { id: entityId, provisionId } = await params
  const provision = await getProvisionById(provisionId)

  if (!provision) {
    notFound()
  }

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back link */}
      <Link
        href={`/entities/${entityId}/provisions`}
        className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block"
      >
        ← Back to provisions
      </Link>

      <div className="border border-border/50 rounded-lg p-6 bg-card">
        {/* Row 1: Type Badge + Tags */}
        <div className="flex items-center gap-2 mb-4">
          {/* Type badge */}
          <span
            className="px-3 py-1.5 rounded text-sm font-medium border-0"
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
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold flex-1">{provision.title}</h1>

          {/* Significance indicator with 5 dots (0-10 scale mapped) */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {[1, 2, 3, 4, 5].map((dot) => (
              <div
                key={dot}
                className="w-2.5 h-2.5 rounded-full transition-colors"
                style={{
                  backgroundColor: dot <= significanceDots ? significanceColor : 'rgb(229 231 235)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Row 3: Avatar Image + Description */}
        <div className="flex gap-4 mb-6">
          {/* Avatar image (only show if exists) */}
          {provision.avatarUrl && (
            <img
              src={provision.avatarUrl}
              alt={provision.title}
              className="w-16 h-16 flex-shrink-0 rounded-lg object-cover"
            />
          )}

          {/* Description */}
          <p className="text-base text-muted-foreground flex-1">
            {provision.descriptionShort || 'No description available'}
          </p>
        </div>

        {/* Row 4: Type-Specific Content */}
        <ProvisionCardRow4 type={provision.type} extraData={provision.extraData} />

        {/* Row 5: Stats + Info */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {/* Left: Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(provision.status)}`} />
              <span className="capitalize">{provision.status}</span>
            </div>

            {/* Effective year */}
            {provision.effectiveFrom && (
              <span>Since {new Date(provision.effectiveFrom).getFullYear()}</span>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex items-center gap-2 text-sm">
            {/* Linked idea */}
            {provision.ideaTitle && provision.ideaId && (
              <Link
                href={`/ideas/${provision.ideaId}`}
                className="text-primary hover:underline flex items-center gap-1.5"
              >
                <span>💡</span>
                <span className="max-w-[150px] truncate">{provision.ideaTitle}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
