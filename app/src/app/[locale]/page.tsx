export const dynamic = 'force-dynamic'

import { db } from '@/lib/db/client'
import { entities } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { PageTitle, SectionL1Title } from '@/components/custom-ui/typography'
import { getStorageUrl } from '@/lib/storage'
import { entityPath } from '@/lib/utils'

export default async function Home() {
  const t = await getTranslations('home')

  // Fetch Comune di Milano
  const [milanoEntity] = await db
    .select()
    .from(entities)
    .where(eq(entities.name, 'Comune di Milano'))

  const milanoAvatarUrl = milanoEntity ? getStorageUrl('avatars', milanoEntity.avatarUrl) : null

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <PageTitle className="mb-4">{t('title')}</PageTitle>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      {/* Featured Entity: Comune di Milano */}
      {milanoEntity ? (
        <div className="mb-12 border border-gray-200 rounded-lg p-6">
          <div className="flex gap-4 items-start">
            {milanoAvatarUrl ? (
              <img
                src={milanoAvatarUrl}
                alt={milanoEntity.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-300 rounded-full" />
            )}
            <div className="flex-1">
              <SectionL1Title className="mb-1">{milanoEntity.name}</SectionL1Title>
              {milanoEntity.population && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  {t('population', { count: milanoEntity.population.toLocaleString() })}
                </span>
              )}
            </div>
          </div>

          {milanoEntity.description && (
            <p className="mt-4 text-gray-700">
              {milanoEntity.description.length > 150
                ? milanoEntity.description.substring(0, 150) + '...'
                : milanoEntity.description}
            </p>
          )}

          {/* Scores */}
          {(milanoEntity.scoreInnovation || milanoEntity.scoreSustainability || milanoEntity.scoreImpact) && (
            <div className="mt-4 flex gap-3 flex-wrap">
              {milanoEntity.scoreInnovation && milanoEntity.scoreInnovation > 0 && (
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {t('innovation', { score: milanoEntity.scoreInnovation })}
                </span>
              )}
              {milanoEntity.scoreSustainability && milanoEntity.scoreSustainability > 0 && (
                <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  {t('sustainability', { score: milanoEntity.scoreSustainability })}
                </span>
              )}
              {milanoEntity.scoreImpact && milanoEntity.scoreImpact > 0 && (
                <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                  {t('impact', { score: milanoEntity.scoreImpact })}
                </span>
              )}
            </div>
          )}

          <div className="mt-6">
            <Button asChild size="lg">
              <Link href={entityPath(milanoEntity)}>{t('exploreMilano')}</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {/* Browse All Entities */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">{t('exploreOtherCities')}</p>
        <Button asChild variant="outline">
          <Link href="/entities">{t('browseAllEntities')}</Link>
        </Button>
      </div>
    </div>
  )
}
