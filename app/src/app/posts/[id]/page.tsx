import { getPost } from '@/lib/actions/posts'
import { PostActions } from '@/components/posts/post-actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/posts" className="text-blue-600 hover:underline">
          ← Back to posts
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span>•</span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  post.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : post.status === 'archived'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {post.status}
              </span>
            </div>
          </div>
          <PostActions postId={post.id} status={post.status} />
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <div className="flex gap-6">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(post.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Updated:</span>{' '}
              {new Date(post.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
