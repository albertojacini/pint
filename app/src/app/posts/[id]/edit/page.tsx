import { db } from '@/lib/db/client'
import { posts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireUser } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { EditPostForm } from '@/components/posts/edit-post-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const user = await requireUser()

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, params.id))

  if (!post) {
    notFound()
  }

  // Check authorization
  if (post.authorId !== user.id) {
    redirect(`/posts/${params.id}`)
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
          <CardDescription>Make changes to your post</CardDescription>
        </CardHeader>
        <CardContent>
          <EditPostForm
            post={{
              id: post.id,
              title: post.title,
              content: post.content,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
