interface ClassificationBadgeProps {
  type: string
  color: string
  className?: string
}

export function ClassificationBadge({ type, color, className = '' }: ClassificationBadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium border-b-2 pb-0.5 font-mono-ui ${className}`}
      style={{ color, borderBottomColor: color }}
    >
      {type}
    </span>
  )
}

const PROVISION_TYPE_COLORS: Record<string, string> = {
  ownership: 'hsl(var(--tag-purple))',
  contract: 'hsl(var(--tag-blue))',
  regulation: 'hsl(var(--tag-orange))',
  taxation: 'hsl(var(--tag-green))',
  allocation: 'hsl(var(--tag-pink))',
  designation: 'hsl(var(--tag-slate))',
  infrastructure: 'hsl(var(--tag-cyan))',
}

export function getProvisionTypeColor(type: string): string {
  return PROVISION_TYPE_COLORS[type] || PROVISION_TYPE_COLORS.designation
}

interface ProvisionClassificationBadgeProps {
  type: 'ownership' | 'contract' | 'regulation' | 'taxation' | 'allocation' | 'designation' | 'infrastructure'
  className?: string
}

export function ProvisionClassificationBadge({ type, className }: ProvisionClassificationBadgeProps) {
  const color = getProvisionTypeColor(type)
  return <ClassificationBadge type={type} color={color} className={className} />
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  neighborhood: 'hsl(var(--tag-purple))',
  district: 'hsl(var(--tag-blue))',
  borough: 'hsl(var(--tag-cyan))',
  city: 'hsl(var(--tag-teal))',
  region: 'hsl(var(--tag-orange))',
  country: 'hsl(var(--tag-pink))',
  supranational: 'hsl(var(--tag-slate))',
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
