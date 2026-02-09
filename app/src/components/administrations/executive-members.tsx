import {
  Crown,
  GraduationCap,
  Briefcase,
  User,
  Building2,
  Shield,
  Car,
  Heart,
  Home,
  Wallet,
  Trophy,
  Palette,
  Leaf,
  Hammer,
  ShoppingBag,
  Plane,
  Users,
  Lightbulb,
  Scale,
  Megaphone,
  Map,
  Building,
  FileCheck,
  Siren,
  type LucideIcon,
} from 'lucide-react'

export interface ExecutiveMember {
  name: string
  role: 'mayor' | 'councilor' | 'minister' | 'president' | 'governor' | 'member'
  roleTitle?: string
  icon?: string
  party?: string
}

export interface ExecutiveMembersProps {
  members: ExecutiveMember[]
  variant?: 'inline' | 'inline-with-role' | 'grid' | 'grid-minimal' | 'list' | 'compact'
}

// Map icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  crown: Crown,
  'graduation-cap': GraduationCap,
  briefcase: Briefcase,
  building: Building2,
}

// Fallback icons by role
const ROLE_ICONS: Record<string, LucideIcon> = {
  mayor: Crown,
  councilor: Building2,
  minister: Briefcase,
  president: Crown,
  governor: Crown,
  member: User,
}

// Topic-specific icons based on roleTitle keywords
const TOPIC_ICONS: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ['istruzione', 'scuola', 'educazione'], icon: GraduationCap },
  { keywords: ['sicurezza', 'polizia'], icon: Shield },
  { keywords: ['mobilità', 'trasport', 'traffic'], icon: Car },
  { keywords: ['welfare', 'sociale', 'servizi sociali'], icon: Heart },
  { keywords: ['casa', 'abitaz', 'housing'], icon: Home },
  { keywords: ['bilancio', 'finanz', 'budget'], icon: Wallet },
  { keywords: ['sport'], icon: Trophy },
  { keywords: ['cultura', 'musei', 'arte'], icon: Palette },
  { keywords: ['ambiente', 'verde', 'ecolog'], icon: Leaf },
  { keywords: ['urbanistic', 'rigeneraz', 'territorio'], icon: Building },
  { keywords: ['lavori pubblici', 'infrastruttur'], icon: Hammer },
  { keywords: ['commercio', 'attività produttive'], icon: ShoppingBag },
  { keywords: ['turismo'], icon: Plane },
  { keywords: ['giovani', 'gioventù'], icon: Users },
  { keywords: ['innovazione', 'digital', 'smart'], icon: Lightbulb },
  { keywords: ['pari opportunità', 'inclusione'], icon: Scale },
  { keywords: ['partecipazione', 'cittadin'], icon: Megaphone },
  { keywords: ['decentramento', 'municipi', 'periferi'], icon: Map },
  { keywords: ['servizi civici', 'anagrafe'], icon: FileCheck },
  { keywords: ['trasparenza', 'legalità', 'anticorruz'], icon: Scale },
  { keywords: ['protezione civile', 'emergenz'], icon: Siren },
]

const ROLE_LABELS: Record<string, string> = {
  mayor: 'Sindaco',
  councilor: 'Consigliere',
  minister: 'Ministro',
  president: 'Presidente',
  governor: 'Governatore',
  member: 'Membro',
}

function getMemberIcon(member: ExecutiveMember): LucideIcon {
  // First check explicit icon
  if (member.icon && ICON_MAP[member.icon]) {
    return ICON_MAP[member.icon]
  }

  // Then check roleTitle for topic-specific icon
  if (member.roleTitle) {
    const lowerTitle = member.roleTitle.toLowerCase()
    for (const { keywords, icon } of TOPIC_ICONS) {
      if (keywords.some((kw) => lowerTitle.includes(kw))) {
        return icon
      }
    }
  }

  // Fallback to role-based icon
  return ROLE_ICONS[member.role] || User
}

// Variant: Inline (icon + name)
function InlineVariant({ members }: { members: ExecutiveMember[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {members.map((member, idx) => {
        const Icon = getMemberIcon(member)
        return (
          <div key={idx} className="flex items-center gap-1.5">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{member.name}</span>
          </div>
        )
      })}
    </div>
  )
}

// Variant: Inline with role (icon + name + role label)
function InlineWithRoleVariant({ members }: { members: ExecutiveMember[] }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {members.map((member, idx) => {
        const Icon = getMemberIcon(member)
        const roleLabel = member.roleTitle || ROLE_LABELS[member.role]
        return (
          <div key={idx} className="flex items-center gap-1.5">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{member.name}</span>
            <span className="text-xs text-muted-foreground">({roleLabel})</span>
          </div>
        )
      })}
    </div>
  )
}

// Variant: Grid (cards with icon, name, role)
function GridVariant({ members }: { members: ExecutiveMember[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {members.map((member, idx) => {
        const Icon = getMemberIcon(member)
        const roleLabel = member.roleTitle || ROLE_LABELS[member.role]
        return (
          <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
            <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{member.name}</div>
              <div className="text-xs text-muted-foreground truncate">{roleLabel}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Variant: Grid Minimal (no cards, just icon + name + role)
function GridMinimalVariant({ members }: { members: ExecutiveMember[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-2 gap-y-2">
      {members.map((member, idx) => {
        const Icon = getMemberIcon(member)
        const roleLabel = member.roleTitle || ROLE_LABELS[member.role]
        return (
          <div key={idx} className="flex items-start gap-2">
            <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{member.name}</div>
              <div className="text-xs text-muted-foreground truncate">{roleLabel}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Variant: List (vertical list with full details)
function ListVariant({ members }: { members: ExecutiveMember[] }) {
  return (
    <div className="space-y-2">
      {members.map((member, idx) => {
        const Icon = getMemberIcon(member)
        const roleLabel = member.roleTitle || ROLE_LABELS[member.role]
        return (
          <div key={idx} className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium text-foreground">{member.name}</span>
            <span className="text-xs text-muted-foreground">{roleLabel}</span>
            {member.party && (
              <span className="text-xs text-muted-foreground">· {member.party}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Variant: Compact (small chips, no icons)
function CompactVariant({ members }: { members: ExecutiveMember[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {members.map((member, idx) => {
        const roleLabel = member.roleTitle || ROLE_LABELS[member.role]
        return (
          <div
            key={idx}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted text-xs"
          >
            <span className="font-medium text-foreground">{member.name}</span>
            <span className="text-muted-foreground">{roleLabel}</span>
          </div>
        )
      })}
    </div>
  )
}

export function ExecutiveMembers({ members, variant = 'inline' }: ExecutiveMembersProps) {
  if (!members || members.length === 0) return null

  switch (variant) {
    case 'inline-with-role':
      return <InlineWithRoleVariant members={members} />
    case 'grid':
      return <GridVariant members={members} />
    case 'grid-minimal':
      return <GridMinimalVariant members={members} />
    case 'list':
      return <ListVariant members={members} />
    case 'compact':
      return <CompactVariant members={members} />
    default:
      return <InlineVariant members={members} />
  }
}
