import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import { entities, provisions } from '@/lib/db/schema'
import { parseUrlSlug, entityPath, idStartsWith } from '@/lib/utils'
import { getPosts } from '@/lib/actions/discussions'
import { PostList } from '@/components/discussions/post-list'
import { PageTitle } from '@/components/custom-ui/typography'

interface PageProps {
  params: Promise<{ slug: string; provisionSlug: string }>
  searchParams: Promise<{ sort?: string; type?: string }>
}

export default async function DiscussionsPage({ params, searchParams }: PageProps) {
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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link
          href={`/pe/${entityUrlSlug}/pr/${provisionUrlSlug}`}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← {provision.title}
        </Link>
        <PageTitle className="mt-2">Discussions</PageTitle>
      </div>

      <PostList posts={posts} basePath={basePath} />
    </div>
  )
}
