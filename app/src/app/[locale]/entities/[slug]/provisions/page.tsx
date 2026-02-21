import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getFilteredProvisions } from '@/lib/actions/provisions'
import { db } from '@/lib/db/client'
import { entities } from '@/lib/db/schema'
import { ProvisionCard } from '@/components/provisions/provision-cards'
import { ProvisionsFilterBar } from '@/components/provisions/provisions-filter-bar'
import { Breadcrumbs } from '@/components/custom-ui/breadcrumbs'
import { PageHeader } from '@/components/custom-ui/section'
import { parseUrlSlug, entityPath, idStartsWith } from '@/lib/utils'

interface ProvisionsPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    search?: string
    type?: string
    status?: string
    sort?: string
  }>
}

export default async function ProvisionsPage({
  params,
  searchParams,
}: ProvisionsPageProps) {
  const t = await getTranslations('provisions')
  const te = await getTranslations('entities')
  const { slug: urlSlug } = await params
  const { idPrefix } = parseUrlSlug(urlSlug)
  const filters = await searchParams

  // Fetch the entity to verify it exists
  const [entity] = await db
    .select()
    .from(entities)
    .where(idStartsWith(entities.id, idPrefix))

  if (!entity) {
    notFound()
  }

  // Fetch filtered provisions
  const provisions = await getFilteredProvisions(entity.id, {
    search: filters.search,
    type: filters.type,
    status: filters.status,
    sort: filters.sort || 'title-asc',
  })

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: te('breadcrumb'), href: '/entities' },
          { label: entity.name, href: entityPath(entity) },
          { label: t('breadcrumb') },
        ]}
      />

      <PageHeader
        title={t('title')}
        description={t('provisionCount', { name: entity.name, count: provisions.length })}
      />

      {/* Filter bar */}
      <div className="mb-8">
        <ProvisionsFilterBar />
      </div>

      {/* Provisions grid */}
      {provisions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {provisions.map((provision) => (
            <ProvisionCard key={provision.id} provision={provision} entity={entity} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <p className="text-gray-500 text-center">{t('noProvisionsFound')}</p>
        </div>
      )}
    </div>
  )
}
