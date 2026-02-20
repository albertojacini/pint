import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { db } from '@/lib/db/client'
import { entities, provisions } from '@/lib/db/schema'
import { parseUrlSlug, idStartsWith } from '@/lib/utils'
import { getPosts } from '@/lib/actions/discussions'
import { PostList } from '@/components/discussions/post-list'
import { PageHeader } from '@/components/custom-ui/section'
import { Breadcrumbs } from '@/components/custom-ui/breadcrumbs'

interface PageProps {
  params: Promise<{ slug: string; provisionSlug: string }>
  searchParams: Promise<{ sort?: string; type?: string }>
}

export default async function DiscussionsPage({ params, searchParams }: PageProps) {
  const t = await getTranslations('discussions')
  const te = await getTranslations('entities')
  const { slug: entityUrlSlug, provisionSlug: provisionUrlSlug } = await params
  const { sort, type } = await searchParams
  const { idPrefix: entityIdPrefix } = parseUrlSlug(entityUrlSlug)
  const { idPrefix: provisionIdPrefix } = parseUrlSlug(provisionUrlSlug)

  const [entity] = await db.select().from(entities).where(idStartsWith(entities.id, entityIdPrefix))
  if (!entity) notFound()

  const [provision] = await db
    .select({ id: provisions.id, title: provisions.title, slug: provisions.slug })
    .from(provisions)
    .where(idStartsWith(provisions.id, provisionIdPrefix))
  if (!provision) notFound()

  const sortBy = (sort === 'score' || sort === 'active') ? sort : 'recent'
  const filterType = (type === 'discussion' || type === 'question' || type === 'proposal' || type === 'analysis') ? type : undefined

  const posts = await getPosts('provision', provision.id, sortBy, filterType)

  const basePath = `/pe/${entityUrlSlug}/pr/${provisionUrlSlug}/discussions`

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: te('breadcrumb'), href: '/pe' },
          { label: entity.name, href: `/pe/${entityUrlSlug}` },
          { label: provision.title, href: `/pe/${entityUrlSlug}/pr/${provisionUrlSlug}` },
          { label: t('title') },
        ]}
      />

      <PageHeader title={t('title')} />

      <PostList posts={posts} basePath={basePath} />
    </div>
  )
}
