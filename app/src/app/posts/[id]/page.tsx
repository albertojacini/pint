import { db } from '@/lib/db/client'
import { posts, userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { PostActions } from '@/components/posts/post-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

export default async function PostPage({ params }: { params: { id: string } }) {
  const user = await getUser()

  const [post] = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      status: posts.status,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorId: posts.authorId,
      author: {
        id: userProfiles.id,
        fullName: userProfiles.fullName,
        email: userProfiles.email,
      },
    })
    .from(posts)
    .leftJoin(userProfiles, eq(posts.authorId, userProfiles.id))
    .where(eq(posts.id, params.id))

  if (!post) {
    notFound()
  }

  // Check if user can view this post (published OR is author)
  const canView = post.status === 'published' || post.authorId === user?.id
  if (!canView) {
    notFound()
  }

  const isAuthor = user?.id === post.authorId

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl">{post.title}</CardTitle>
              <CardDescription className="mt-2">
                By {post.author?.fullName || post.author?.email || 'Unknown'} •{' '}
                {format(new Date(post.createdAt), 'PPP')}
                {post.status !== 'published' && (
                  <span className="ml-2 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                    {post.status}
                  </span>
                )}
              </CardDescription>
            </div>
            {isAuthor && <PostActions postId={post.id} status={post.status} />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate max-w-none">
            {post.content.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
