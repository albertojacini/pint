import { db } from '@/lib/db/client'
import { politicalEntities } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import Link from 'next/link'

export default async function EntitiesPage() {
  // Fetch all political entities
  const entities = await db
    .select()
    .from(politicalEntities)
    .orderBy(desc(politicalEntities.createdAt))

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Political Entities</h1>
        <p className="text-gray-600">
          Browse public administrations and their information
        </p>
      </div>

      {entities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">No entities yet</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {entities.map((entity) => (
            <Link
              key={entity.id}
              href={`/entities/${entity.id}`}
              className="block p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                {entity.avatarUrl && (
                  <img
                    src={entity.avatarUrl}
                    alt={entity.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1">{entity.name}</h2>
                  {entity.nativeName && (
                    <p className="text-sm text-gray-500 mb-2">{entity.nativeName}</p>
                  )}
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {entity.type}
                  </span>
                </div>
              </div>

              {entity.description && (
                <p className="mt-4 text-gray-600 line-clamp-2">{entity.description}</p>
              )}

              <div className="mt-4 flex gap-4 text-sm">
                {entity.population && (
                  <div>
                    <span className="text-gray-500">Population:</span>{' '}
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
                      <span className="text-gray-500">Innovation:</span>{' '}
                      <span className="font-medium">{entity.scoreInnovation}/10</span>
                    </div>
                  )}
                  {entity.scoreSustainability !== null && (
                    <div>
                      <span className="text-gray-500">Sustainability:</span>{' '}
                      <span className="font-medium">{entity.scoreSustainability}/10</span>
                    </div>
                  )}
                  {entity.scoreImpact !== null && (
                    <div>
                      <span className="text-gray-500">Impact:</span>{' '}
                      <span className="font-medium">{entity.scoreImpact}/10</span>
                    </div>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
