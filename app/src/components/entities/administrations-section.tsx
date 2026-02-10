import Link from 'next/link'
import { db } from '@/lib/db/client'
import { administrations, members, people } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { Section, Subsection } from '@/components/custom-ui/section'
import { CouncilDots } from '@/components/administrations/council-dots'
import { ExecutiveMembers } from '@/components/administrations/executive-members'
import { ElectionsSection } from '@/components/administrations/election-cards'

interface AdministrationsSectionProps {
  entity: { id: string; slug: string }
}

export async function AdministrationsSection({ entity }: AdministrationsSectionProps) {
  // Fetch administrations for this entity
  const entityAdministrations = await db
    .select({
      id: administrations.id,
      name: administrations.name,
      termStart: administrations.termStart,
      termEnd: administrations.termEnd,
      status: administrations.status,
      description: administrations.description,
      councilComposition: administrations.councilComposition,
      electionData: administrations.electionData,
    })
    .from(administrations)
    .where(eq(administrations.entityId, entity.id))
    .orderBy(desc(administrations.termStart))

  // Get active administration
  const [activeAdmin] = entityAdministrations.filter((a) => a.status === 'active')

  // Fetch executive members for active administration
  let executiveMembers: Array<{
    name: string
    role: string
    roleTitle: string | null
    icon: string | null
    party: string | null
  }> = []

  if (activeAdmin) {
    executiveMembers = await db
      .select({
        name: people.fullName,
        role: members.roleType,
        roleTitle: members.roleTitle,
        icon: members.icon,
        party: members.party,
      })
      .from(members)
      .innerJoin(people, eq(members.personId, people.id))
      .where(and(eq(members.administrationId, activeAdmin.id), eq(members.status, 'active')))
  }

  // Build data for sub-components
  const councilComposition = activeAdmin?.councilComposition || undefined
  const mappedMembers = executiveMembers.map((m) => ({
    name: m.name,
    role: m.role as 'mayor' | 'councilor' | 'minister' | 'president' | 'governor' | 'member',
    roleTitle: m.roleTitle || undefined,
    icon: m.icon || undefined,
    party: m.party || undefined,
  }))
  const nextElection = activeAdmin?.electionData?.nextElection
    ? { date: activeAdmin.electionData.nextElection }
    : undefined
  const electionHistory = entityAdministrations
    .filter((admin) => admin.electionData?.electionDate)
    .map((admin) => ({
      date: admin.electionData!.electionDate!,
      turnout: admin.electionData!.turnout,
      results: admin.electionData!.results || [],
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const hasContent =
    (councilComposition && councilComposition.length > 0) ||
    mappedMembers.length > 0 ||
    nextElection ||
    electionHistory.length > 0

  if (!hasContent) return null

  return (
    <Section
      title="Politics"
      action={
        <Link href={`/pe/${entity.slug}/ad`} className="text-sm text-link hover:underline">
          View all
        </Link>
      }
    >
      <div className="space-y-6">
        <Subsection title="Consiglio comunale" className="mb-0">
          {councilComposition && councilComposition.length > 0 && (
            <CouncilDots composition={councilComposition} />
          )}
        </Subsection>

        <Subsection title="Giunta comunale" className="mb-0">
          {mappedMembers.length > 0 && (
            <ExecutiveMembers members={mappedMembers} variant="grid-minimal" />
          )}
        </Subsection>

        <ElectionsSection nextElection={nextElection} history={electionHistory} />
      </div>
    </Section>
  )
}
