import Link from 'next/link'
import { entityPath } from '@/lib/utils'

interface RelatedEntityCardProps {
  entity: {
    id: string
    name: string
    slug: string
    type: string
    avatarUrl: string | null
    identityData: {
      coatOfArmsUrl?: string
    } | null
  }
}

export function RelatedEntityCard({ entity }: RelatedEntityCardProps) {
  return (
    <Link href={entityPath(entity)}>
      <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all">
        <div className="flex items-center gap-3">
          {/* Avatar / Coat of Arms */}
          <div className="flex-shrink-0">
            {entity.identityData?.coatOfArmsUrl ? (
              <img
                src={entity.identityData.coatOfArmsUrl}
                alt={`${entity.name} coat of arms`}
                className="w-10 h-10 object-contain"
              />
            ) : entity.avatarUrl ? (
              <img
                src={entity.avatarUrl}
                alt={entity.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-400">
                  {entity.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Entity Info */}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {entity.name}
            </h4>
            <span className="text-xs text-gray-500 capitalize">
              {entity.type}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
