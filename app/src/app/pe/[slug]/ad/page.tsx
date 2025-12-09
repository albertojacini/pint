import { db } from '@/lib/db/client'
import { politicalEntities, administrations, administrationMembers, people } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { parseUrlSlug, idStartsWith } from '@/lib/utils'
import { AdministrationsSection } from '@/components/entities'

interface AdministrationsPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function AdministrationsPage({ params }: AdministrationsPageProps) {
  const { slug: urlSlug } = await params
  const { idPrefix } = parseUrlSlug(urlSlug)

  // Fetch the entity by ID prefix
  const [entity] = await db
    .select()
    .from(politicalEntities)
    .where(idStartsWith(politicalEntities.id, idPrefix))

  if (!entity) {
    notFound()
  }

  // Fetch administrations for this entity
  const entityAdministrations = await db
    .select({
      id: administrations.id,
      name: administrations.name,
      termStart: administrations.termStart,
      termEnd: administrations.termEnd,
      status: administrations.status,
      description: administrations.description,
    })
    .from(administrations)
    .where(eq(administrations.entityId, entity.id))
    .orderBy(desc(administrations.termStart))

  // For each administration, get the mayor
  const administrationsWithMayor = await Promise.all(
    entityAdministrations.map(async (admin) => {
      const [mayorMember] = await db
        .select({
          person: {
            fullName: people.fullName,
          },
        })
        .from(administrationMembers)
        .innerJoin(people, eq(administrationMembers.personId, people.id))
        .where(
          and(
            eq(administrationMembers.administrationId, admin.id),
            eq(administrationMembers.roleType, 'mayor')
          )
        )
        .limit(1)

      return {
        ...admin,
        mayor: mayorMember?.person || null,
      }
    })
  )

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{entity.name} - Administrations</h1>
      <AdministrationsSection administrations={administrationsWithMayor} />
    </div>
  )
}
