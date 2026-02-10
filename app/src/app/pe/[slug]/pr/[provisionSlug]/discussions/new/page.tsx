import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db/client'
import { entities, provisions } from '@/lib/db/schema'
import { parseUrlSlug, idStartsWith } from '@/lib/utils'
import { getUser } from '@/lib/auth'
import { PostForm } from '@/components/discussions/post-form'
import { PageHeader } from '@/components/custom-ui/section'

interface PageProps {
  params: Promise<{ slug: string; provisionSlug: string }>
}

export default async function NewPostPage({ params }: PageProps) {
  const user = await getUser()
  if (!user) redirect('/login')

  const { slug: entityUrlSlug, provisionSlug: provisionUrlSlug } = await params
  const { idPrefix: entityIdPrefix } = parseUrlSlug(entityUrlSlug)
  const { idPrefix: provisionIdPrefix } = parseUrlSlug(provisionUrlSlug)

  const [entity] = await db.select().from(entities).where(idStartsWith(entities.id, entityIdPrefix))
  if (!entity) notFound()

  const [provision] = await db
    .select({ id: provisions.id, title: provisions.title, slug: provisions.slug })
    .from(provisions)
    .where(idStartsWith(provisions.id, provisionIdPrefix))
  if (!provision) notFound()

  const basePath = `/pe/${entityUrlSlug}/pr/${provisionUrlSlug}/discussions`

  return (
    <div className="py-8">
      <Link
        href={basePath}
        className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
      >
        ← Back to discussions
      </Link>
      <PageHeader title="New Post" />

      <PostForm
        targetType="provision"
        targetId={provision.id}
        authorId={user.id}
        basePath={basePath}
      />
    </div>
  )
}
