interface ClassificationBadgeProps {
  type: string
  color: string
  className?: string
}

export function ClassificationBadge({ type, color, className = '' }: ClassificationBadgeProps) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium border-0 ${className}`}
      style={{ color }}
    >
      {type}
    </span>
  )
}

const PROVISION_TYPE_COLORS: Record<string, string> = {
  ownership: 'rgb(147 51 234)',    // purple
  contract: 'rgb(37 99 235)',       // blue
  regulation: 'rgb(234 88 12)',     // orange
  taxation: 'rgb(22 163 74)',       // green
  allocation: 'rgb(219 39 119)',    // pink
  designation: 'rgb(71 85 105)',    // slate (default)
}

function getProvisionTypeColor(type: string): string {
  return PROVISION_TYPE_COLORS[type] || PROVISION_TYPE_COLORS.designation
}

interface ProvisionClassificationBadgeProps {
  type: 'ownership' | 'contract' | 'regulation' | 'taxation' | 'allocation' | 'designation'
  className?: string
}

export function ProvisionClassificationBadge({ type, className }: ProvisionClassificationBadgeProps) {
  const color = getProvisionTypeColor(type)
  return <ClassificationBadge type={type} color={color} className={className} />
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  neighborhood: 'rgb(139 92 246)',  // violet
  district: 'rgb(59 130 246)',      // blue
  borough: 'rgb(14 165 233)',       // sky
  city: 'rgb(16 185 129)',          // emerald
  region: 'rgb(245 158 11)',        // amber
  country: 'rgb(239 68 68)',        // red
  supranational: 'rgb(168 85 247)', // purple
}

function getEntityTypeColor(type: string): string {
  return ENTITY_TYPE_COLORS[type] || ENTITY_TYPE_COLORS.city
}

interface EntityClassificationBadgeProps {
  type: 'neighborhood' | 'district' | 'borough' | 'city' | 'region' | 'country' | 'supranational'
  className?: string
}

export function EntityClassificationBadge({ type, className }: EntityClassificationBadgeProps) {
  const color = getEntityTypeColor(type)
  return <ClassificationBadge type={type} color={color} className={className} />
}
