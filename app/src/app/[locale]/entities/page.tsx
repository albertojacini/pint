export const dynamic = 'force-dynamic'

import { db } from '@/lib/db/client'
import { entities as entitiesTable } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { Link } from '@/i18n/navigation'
import { entityPath } from '@/lib/utils'
import { EntityClassificationBadge } from '@/components/custom-ui/classification-badge'
import { SectionL1Title } from '@/components/custom-ui/typography'
import { PageHeader } from '@/components/custom-ui/section'
import { getStorageUrl } from '@/lib/storage'
import { getTranslations } from 'next-intl/server'

export default async function EntitiesPage() {
  const t = await getTranslations('entities')

  // Fetch all political entities
  const entities = await db
    .select()
    .from(entitiesTable)
    .orderBy(desc(entitiesTable.createdAt))

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      {entities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">{t('noEntities')}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {entities.map((entity) => {
            const avatarUrl = getStorageUrl('avatars', entity.avatarUrl)
            return (
              <Link
                key={entity.id}
                href={entityPath(entity)}
                className="block p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {avatarUrl && (
                    <img
                      src={avatarUrl}
                      alt={entity.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                  <SectionL1Title className="mb-1">{entity.name}</SectionL1Title>
                  {entity.nativeName && (
                    <p className="text-sm text-gray-500 mb-2">{entity.nativeName}</p>
                  )}
                  <EntityClassificationBadge type={entity.type as any} />
                </div>
              </div>

              {entity.description && (
                <p className="mt-4 text-gray-600 line-clamp-2">{entity.description}</p>
              )}

              <div className="mt-4 flex gap-4 text-sm">
                {entity.population && (
                  <div>
                    <span className="text-gray-500">{t('population')}</span>{' '}
                    <span className="font-medium">{entity.population.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {(entity.scoreInnovation !== null ||
                entity.scoreSustainability !== null ||
                entity.scoreImpact !== null) && (
                <div className="mt-4 flex gap-4 text-sm">
                  {entity.scoreInnovation !== null && (
                    <div>
                      <span className="text-gray-500">{t('innovation')}</span>{' '}
                      <span className="font-medium">{entity.scoreInnovation}/10</span>
                    </div>
                  )}
                  {entity.scoreSustainability !== null && (
                    <div>
                      <span className="text-gray-500">{t('sustainability')}</span>{' '}
                      <span className="font-medium">{entity.scoreSustainability}/10</span>
                    </div>
                  )}
                  {entity.scoreImpact !== null && (
                    <div>
                      <span className="text-gray-500">{t('impact')}</span>{' '}
                      <span className="font-medium">{entity.scoreImpact}/10</span>
                    </div>
                  )}
                </div>
              )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
