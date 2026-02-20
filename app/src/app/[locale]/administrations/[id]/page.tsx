import { db } from '@/lib/db/client'
import { administrations, members, people, entities } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { format } from 'date-fns'
import { getStorageUrl } from '@/lib/storage'
import { PageHeader, SectionL1, SectionL2 } from '@/components/custom-ui/section'
import { getTranslations } from 'next-intl/server'

interface AdministrationPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdministrationPage({ params }: AdministrationPageProps) {
  const t = await getTranslations('administrations')
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
        id: entities.id,
        name: entities.name,
        type: entities.type,
      },
    })
    .from(administrations)
    .innerJoin(entities, eq(administrations.entityId, entities.id))
    .where(eq(administrations.id, id))

  if (!administration) {
    notFound()
  }

  // Fetch all members with their person details
  const adminMembers = await db
    .select({
      id: members.id,
      roleType: members.roleType,
      roleTitle: members.roleTitle,
      appointedAt: members.appointedAt,
      leftAt: members.leftAt,
      status: members.status,
      person: {
        id: people.id,
        fullName: people.fullName,
        avatarUrl: people.avatarUrl,
      },
    })
    .from(members)
    .innerJoin(people, eq(members.personId, people.id))
    .where(eq(members.administrationId, id))

  const termPeriod = administration.termEnd
    ? `${format(new Date(administration.termStart), 'MMMM dd, yyyy')} - ${format(new Date(administration.termEnd), 'MMMM dd, yyyy')}`
    : `${format(new Date(administration.termStart), 'MMMM dd, yyyy')} - ${t('present')}`

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    historical: 'bg-gray-100 text-gray-800',
    upcoming: 'bg-blue-100 text-blue-800',
  }

  const statusColor = statusColors[administration.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'

  // Group members by role type
  const mayor = adminMembers.find(m => m.roleType === 'mayor')
  const otherMembers = adminMembers.filter(m => m.roleType !== 'mayor')

  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <Link href={`/entities/${administration.entity.id}`} className="text-link hover:underline">
          {t('backTo', { name: administration.entity.name })}
        </Link>
      </div>

      {/* Administration header */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
        <PageHeader
          title={administration.name}
          description={termPeriod}
          action={
            <span className={`shrink-0 px-3 py-1 text-sm font-medium rounded ${statusColor}`}>
              {administration.status}
            </span>
          }
          className="mb-6"
        >
          <Link
            href={`/entities/${administration.entity.id}`}
            className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded hover:bg-blue-200 mt-2"
          >
            {administration.entity.name} ({administration.entity.type})
          </Link>
        </PageHeader>

        {administration.description && (
          <SectionL1 title={t('description')} className="mb-0">
            <p className="text-gray-700">{administration.description}</p>
          </SectionL1>
        )}
      </div>

      {/* Members */}
      {adminMembers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
          <SectionL1 title={t('administrationMembers')} className="mb-0">
            {mayor && (
              <SectionL2 title={t('mayor')}>
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  {getStorageUrl('avatars', mayor.person.avatarUrl) && (
                    <img
                      src={getStorageUrl('avatars', mayor.person.avatarUrl)!}
                      alt={mayor.person.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-lg font-medium">{mayor.person.fullName}</p>
                    <p className="text-sm text-gray-600">{mayor.roleTitle || mayor.roleType}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(mayor.appointedAt), 'MMM yyyy')} -{' '}
                      {mayor.leftAt ? format(new Date(mayor.leftAt), 'MMM yyyy') : t('present')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    mayor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {mayor.status}
                  </span>
                </div>
              </SectionL2>
            )}

            {otherMembers.length > 0 && (
              <SectionL2 title={t('councilMembers')} className="mb-0">
                <div className="grid gap-4 md:grid-cols-2">
                  {otherMembers.map((member) => (
                    <div key={member.id} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                      {getStorageUrl('avatars', member.person.avatarUrl) && (
                        <img
                          src={getStorageUrl('avatars', member.person.avatarUrl)!}
                          alt={member.person.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{member.person.fullName}</p>
                        <p className="text-sm text-gray-600 truncate">{member.roleTitle || member.roleType}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(member.appointedAt), 'MMM yyyy')} -{' '}
                          {member.leftAt ? format(new Date(member.leftAt), 'MMM yyyy') : t('present')}
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
              </SectionL2>
            )}
          </SectionL1>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <SectionL1 title={t('metadata')} className="mb-0">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">{t('created')}</span>{' '}
              <span className="font-medium">
                {format(new Date(administration.createdAt), 'PPP')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">{t('lastUpdated')}</span>{' '}
              <span className="font-medium">
                {format(new Date(administration.updatedAt), 'PPP')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">{t('id')}</span>{' '}
              <span className="font-mono text-xs">{administration.id}</span>
            </div>
          </div>
        </SectionL1>
      </div>
    </div>
  )
}
