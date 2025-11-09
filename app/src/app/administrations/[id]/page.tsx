import { db } from '@/lib/db/client'
import { administrations, administrationMembers, people, politicalEntities } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { getEventsByAdministration } from '@/lib/actions/events'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AdministrationPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdministrationPage({ params }: AdministrationPageProps) {
  const { id } = await params

  // Fetch the administration with entity
  const [administration] = await db
    .select({
      id: administrations.id,
      name: administrations.name,
      termStart: administrations.termStart,
      termEnd: administrations.termEnd,
      status: administrations.status,
      description: administrations.description,
      createdAt: administrations.createdAt,
      updatedAt: administrations.updatedAt,
      entity: {
        id: politicalEntities.id,
        name: politicalEntities.name,
        type: politicalEntities.type,
      },
    })
    .from(administrations)
    .innerJoin(politicalEntities, eq(administrations.entityId, politicalEntities.id))
    .where(eq(administrations.id, id))

  if (!administration) {
    notFound()
  }

  // Fetch all members with their person details
  const members = await db
    .select({
      id: administrationMembers.id,
      roleType: administrationMembers.roleType,
      roleTitle: administrationMembers.roleTitle,
      appointedAt: administrationMembers.appointedAt,
      leftAt: administrationMembers.leftAt,
      status: administrationMembers.status,
      person: {
        id: people.id,
        fullName: people.fullName,
        avatarUrl: people.avatarUrl,
      },
    })
    .from(administrationMembers)
    .innerJoin(people, eq(administrationMembers.personId, people.id))
    .where(eq(administrationMembers.administrationId, id))

  // Fetch events for this administration
  const events = await getEventsByAdministration(id)

  const termPeriod = administration.termEnd
    ? `${format(new Date(administration.termStart), 'MMMM dd, yyyy')} - ${format(new Date(administration.termEnd), 'MMMM dd, yyyy')}`
    : `${format(new Date(administration.termStart), 'MMMM dd, yyyy')} - Present`

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    historical: 'bg-gray-100 text-gray-800',
    upcoming: 'bg-blue-100 text-blue-800',
  }

  const statusColor = statusColors[administration.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'

  // Group members by role type
  const mayor = members.find(m => m.roleType === 'mayor')
  const otherMembers = members.filter(m => m.roleType !== 'mayor')

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Back button */}
      <div className="mb-6">
        <Link href={`/entities/${administration.entity.id}`} className="text-blue-600 hover:underline">
          ← Back to {administration.entity.name}
        </Link>
      </div>

      {/* Administration header */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-4xl font-bold">{administration.name}</h1>
            <span className={`shrink-0 px-3 py-1 text-sm font-medium rounded ${statusColor}`}>
              {administration.status}
            </span>
          </div>
          <p className="text-xl text-gray-600 mb-4">{termPeriod}</p>
          <Link
            href={`/entities/${administration.entity.id}`}
            className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            {administration.entity.name} ({administration.entity.type})
          </Link>
        </div>

        {administration.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{administration.description}</p>
          </div>
        )}
      </div>

      {/* Members */}
      {members.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Administration Members</h2>

          {mayor && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Mayor</h3>
              <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                {mayor.person.avatarUrl && (
                  <img
                    src={mayor.person.avatarUrl}
                    alt={mayor.person.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{mayor.person.fullName}</h4>
                  <p className="text-sm text-gray-600">{mayor.roleTitle || mayor.roleType}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(mayor.appointedAt), 'MMM yyyy')} -{' '}
                    {mayor.leftAt ? format(new Date(mayor.leftAt), 'MMM yyyy') : 'Present'}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  mayor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {mayor.status}
                </span>
              </div>
            </div>
          )}

          {otherMembers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Council Members</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {otherMembers.map((member) => (
                  <div key={member.id} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                    {member.person.avatarUrl && (
                      <img
                        src={member.person.avatarUrl}
                        alt={member.person.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{member.person.fullName}</h4>
                      <p className="text-sm text-gray-600 truncate">{member.roleTitle || member.roleType}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(member.appointedAt), 'MMM yyyy')} -{' '}
                        {member.leftAt ? format(new Date(member.leftAt), 'MMM yyyy') : 'Present'}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2 py-1 text-xs font-medium rounded ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Events Section */}
      {events.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Events</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="mb-2 flex gap-2">
                    <Badge variant="outline" className="text-xs font-mono">EVENT</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(event.occurredAt), 'PPP')}
                  </div>
                </CardHeader>
                {event.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </CardContent>
                )}
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
              {format(new Date(administration.createdAt), 'PPP')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Last Updated:</span>{' '}
            <span className="font-medium">
              {format(new Date(administration.updatedAt), 'PPP')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">ID:</span>{' '}
            <span className="font-mono text-xs">{administration.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
