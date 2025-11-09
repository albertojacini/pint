import { db } from '@/lib/db/client'
import { politicalEntities, administrations, administrationMembers, people } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { AdministrationsSection } from '@/components/entities/administrations-section'
import { getProvisionsByEntity } from '@/lib/actions/provisions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface EntityPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { id } = await params

  // Fetch the entity
  const [entity] = await db
    .select()
    .from(politicalEntities)
    .where(eq(politicalEntities.id, id))

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
    .where(eq(administrations.entityId, id))
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
        .where(eq(administrationMembers.administrationId, admin.id))
        .where(eq(administrationMembers.roleType, 'mayor'))
        .limit(1)

      return {
        ...admin,
        mayor: mayorMember?.person || null,
      }
    })
  )

  // Fetch provisions for this entity
  const provisions = await getProvisionsByEntity(id)

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/entities" className="text-blue-600 hover:underline">
          ← Back to entities
        </Link>
      </div>

      {/* Entity header */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
        <div className="flex items-start gap-6 mb-6">
          {entity.avatarUrl && (
            <img
              src={entity.avatarUrl}
              alt={entity.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{entity.name}</h1>
            {entity.nativeName && (
              <p className="text-xl text-gray-600 mb-3">{entity.nativeName}</p>
            )}
            <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded">
              {entity.type}
            </span>
          </div>
        </div>

        {entity.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{entity.description}</p>
          </div>
        )}

        {/* Basic information */}
        <div className="grid md:grid-cols-2 gap-6">
          {entity.population && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Population</h3>
              <p className="text-lg font-semibold">{entity.population.toLocaleString()}</p>
            </div>
          )}

          {entity.scoreInnovation !== null && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Innovation Score</h3>
              <p className="text-lg font-semibold">{entity.scoreInnovation}/10</p>
            </div>
          )}

          {entity.scoreSustainability !== null && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Sustainability Score</h3>
              <p className="text-lg font-semibold">{entity.scoreSustainability}/10</p>
            </div>
          )}

          {entity.scoreImpact !== null && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Impact Score</h3>
              <p className="text-lg font-semibold">{entity.scoreImpact}/10</p>
            </div>
          )}
        </div>
      </div>

      {/* Administrations Section */}
      <AdministrationsSection administrations={administrationsWithMayor} />

      {/* Provisions Section */}
      {provisions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Provisions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {provisions.map((provision) => (
              <Card key={provision.id}>
                <CardHeader>
                  <div className="mb-2 flex gap-2">
                    <Badge variant="outline" className="text-xs font-mono">PROVISION</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {provision.type}
                    </Badge>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{provision.title}</CardTitle>
                    <Badge variant={
                      provision.status === 'active' ? 'default' :
                      provision.status === 'repealed' ? 'destructive' :
                      'outline'
                    }>
                      {provision.status}
                    </Badge>
                  </div>
                  {provision.ideaTitle && (
                    <div className="text-sm text-muted-foreground">
                      Inspired by: <Link href={`/ideas/${provision.ideaId}`} className="text-blue-600 hover:underline">
                        {provision.ideaTitle}
                      </Link>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {provision.description && (
                    <p className="text-sm text-muted-foreground mb-3">{provision.description}</p>
                  )}
                  <div className="space-y-1 text-sm">
                    {provision.effectiveFrom && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Effective From:</span>
                        <span>{provision.effectiveFrom}</span>
                      </div>
                    )}
                    {provision.effectiveUntil && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Effective Until:</span>
                        <span>{provision.effectiveUntil}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Metadata</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Created:</span>{' '}
            <span className="font-medium">
              {format(new Date(entity.createdAt), 'PPP')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Last Updated:</span>{' '}
            <span className="font-medium">
              {format(new Date(entity.updatedAt), 'PPP')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">ID:</span>{' '}
            <span className="font-mono text-xs">{entity.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
