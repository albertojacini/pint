import { db } from '@/lib/db/client'
import { posts, userProfiles } from '@/lib/db/schema'
import { desc, eq, or } from 'drizzle-orm'
import { getUser } from '@/lib/auth'
import { PostCard } from '@/components/posts/post-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export default async function PostsPage() {
  const user = await getUser()

  // Get all published posts OR posts authored by current user
  const allPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      status: posts.status,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: {
        id: userProfiles.id,
        fullName: userProfiles.fullName,
        email: userProfiles.email,
      },
    })
    .from(posts)
    .leftJoin(userProfiles, eq(posts.authorId, userProfiles.id))
    .where(
      user ? or(eq(posts.status, 'published'), eq(posts.authorId, user.id)) : eq(posts.status, 'published')
    )
    .orderBy(desc(posts.createdAt))

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Posts</h1>
          <p className="mt-2 text-muted-foreground">
            Public policies and political collaboration
          </p>
        </div>
        {user && (
          <Button asChild>
            <Link href="/posts/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isAuthor={user?.id === post.author?.id}
          />
        ))}
      </div>

      {allPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No posts yet</p>
          {user && (
            <Button asChild className="mt-4">
              <Link href="/posts/new">Create the first post</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
