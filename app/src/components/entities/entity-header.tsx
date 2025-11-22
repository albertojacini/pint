import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Search, MessageCircle } from 'lucide-react'

// Helper function to convert country code to flag emoji
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Helper function to get country name from code
function getCountryName(countryCode?: string): string | undefined {
  if (!countryCode) return undefined
  const countries: Record<string, string> = {
    IT: 'Italy',
    DE: 'Germany',
    FR: 'France',
    ES: 'Spain',
    AT: 'Austria',
    GB: 'United Kingdom',
    US: 'United States',
  }
  return countries[countryCode.toUpperCase()]
}

interface EntityHeaderProps {
  entity: {
    id: string
    name: string
    type: string
    avatarUrl: string | null
    identityData: {
      countryCode?: string
      regionName?: string
      cityType?: string
      officialWebsite?: string
      sisterCities?: number
      coatOfArmsUrl?: string
    } | null
  }
}

export function EntityHeader({ entity }: EntityHeaderProps) {
  return (
    <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
      {/* Left: Coat of Arms or Avatar */}
      <div className="flex-shrink-0">
        {entity.identityData?.coatOfArmsUrl ? (
          <img
            src={entity.identityData.coatOfArmsUrl}
            alt={`${entity.name} coat of arms`}
            className="w-24 h-24 object-contain"
          />
        ) : entity.avatarUrl ? (
          <img
            src={entity.avatarUrl}
            alt={entity.name}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-400">
              {entity.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Center: Name, Location, Classification */}
      <div className="flex-1">
        <div className="flex items-start gap-3 mb-2">
          <h1 className="text-4xl font-bold">{entity.name}</h1>
          {entity.identityData?.countryCode && (
            <span className="text-3xl" title={entity.identityData.countryCode}>
              {getFlagEmoji(entity.identityData.countryCode)}
            </span>
          )}
        </div>

        {/* Location breadcrumb */}
        {(entity.identityData?.regionName || entity.identityData?.countryCode) && (
          <p className="text-lg text-gray-600 mb-3">
            {[entity.identityData?.regionName, getCountryName(entity.identityData?.countryCode)]
              .filter(Boolean)
              .join(', ')}
          </p>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-sm">
            {entity.type}
          </Badge>
          {entity.identityData?.cityType && (
            <Badge variant="outline" className="text-sm">
              {entity.identityData.cityType}
            </Badge>
          )}
          {entity.identityData?.sisterCities && (
            <Badge variant="outline" className="text-sm">
              {entity.identityData.sisterCities} sister cities
            </Badge>
          )}
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex-shrink-0 flex flex-col gap-2">
        {entity.identityData?.officialWebsite && (
          <a
            href={entity.identityData.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-center"
          >
            Official Website
          </a>
        )}
        <div className="flex gap-2">
          <button
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            title="Chat"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
        <Link
          href={`/entities/${entity.id}/compare`}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-center"
        >
          Compare
        </Link>
      </div>
    </div>
  )
}
