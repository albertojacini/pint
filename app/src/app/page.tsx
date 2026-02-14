export const dynamic = 'force-dynamic'

import { db } from '@/lib/db/client'
import { entities } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageTitle, SectionTitle } from '@/components/custom-ui/typography'
import { getStorageUrl } from '@/lib/storage'
import { entityPath } from '@/lib/utils'

export default async function Home() {
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
        <PageTitle className="mb-4">Pint - Public Interface</PageTitle>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A public policies platform providing up-to-date, UX-rich information
          about public administrations and their policies. Explore how cities
          are governed, their political landscapes, and the provisions they enact.
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
              <SectionTitle className="mb-1">{milanoEntity.name}</SectionTitle>
              {milanoEntity.population && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  Population: {milanoEntity.population.toLocaleString()}
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
                  Innovation: {milanoEntity.scoreInnovation}/10
                </span>
              )}
              {milanoEntity.scoreSustainability && milanoEntity.scoreSustainability > 0 && (
                <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  Sustainability: {milanoEntity.scoreSustainability}/10
                </span>
              )}
              {milanoEntity.scoreImpact && milanoEntity.scoreImpact > 0 && (
                <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                  Impact: {milanoEntity.scoreImpact}/10
                </span>
              )}
            </div>
          )}

          <div className="mt-6">
            <Button asChild size="lg">
              <Link href={entityPath(milanoEntity)}>Explore Milano</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {/* Browse All Entities */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">Want to explore other cities?</p>
        <Button asChild variant="outline">
          <Link href="/pe">Browse all entities</Link>
        </Button>
      </div>
    </div>
  )
}
