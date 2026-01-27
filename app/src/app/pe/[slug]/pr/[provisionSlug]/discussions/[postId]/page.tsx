import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import { entities, provisions } from '@/lib/db/schema'
import { parseUrlSlug, idStartsWith } from '@/lib/utils'
import { getUser } from '@/lib/auth'
import { getPostWithComments } from '@/lib/actions/discussions'
import { PostDetail } from '@/components/discussions/post-detail'

interface PageProps {
  params: Promise<{ slug: string; provisionSlug: string; postId: string }>
}

export default async function PostDetailPage({ params }: PageProps) {
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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link
          href={basePath}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Back to discussions
        </Link>
      </div>

      <PostDetail post={post} userId={user?.id} />
    </div>
  )
}
