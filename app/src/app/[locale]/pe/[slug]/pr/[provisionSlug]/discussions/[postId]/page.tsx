import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { db } from '@/lib/db/client'
import { entities, provisions } from '@/lib/db/schema'
import { parseUrlSlug, idStartsWith } from '@/lib/utils'
import { getUser } from '@/lib/auth'
import { getPostWithComments } from '@/lib/actions/discussions'
import { PostDetail } from '@/components/discussions/post-detail'
import { Breadcrumbs } from '@/components/custom-ui/breadcrumbs'

interface PageProps {
  params: Promise<{ slug: string; provisionSlug: string; postId: string }>
}

export default async function PostDetailPage({ params }: PageProps) {
  const t = await getTranslations('discussions')
  const te = await getTranslations('entities')
  const { slug: entityUrlSlug, provisionSlug: provisionUrlSlug, postId } = await params

  const { idPrefix: entityIdPrefix } = parseUrlSlug(entityUrlSlug)
  const { idPrefix: provisionIdPrefix } = parseUrlSlug(provisionUrlSlug)

  const [entity] = await db.select().from(entities).where(idStartsWith(entities.id, entityIdPrefix))
  if (!entity) notFound()

  const [provision] = await db
    .select({ id: provisions.id, title: provisions.title, slug: provisions.slug })
    .from(provisions)
    .where(idStartsWith(provisions.id, provisionIdPrefix))
  if (!provision) notFound()

  const post = await getPostWithComments(postId)
  if (!post) notFound()

  const user = await getUser()
  const basePath = `/pe/${entityUrlSlug}/pr/${provisionUrlSlug}/discussions`

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: te('breadcrumb'), href: '/pe' },
          { label: entity.name, href: `/pe/${entityUrlSlug}` },
          { label: provision.title, href: `/pe/${entityUrlSlug}/pr/${provisionUrlSlug}` },
          { label: t('title'), href: basePath },
          { label: post.title },
        ]}
      />

      <PostDetail post={post} userId={user?.id} />
    </div>
  )
}
