import { getPosts } from '@/lib/actions/posts'
import Link from 'next/link'

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Posts</h1>
          <p className="text-gray-600">Simple content for testing forms and UI</p>
        </div>
        <Link
          href="/posts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">No posts yet</p>
          <Link
            href="/posts/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-semibold">{post.title}</h2>
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
              <p className="text-gray-600 line-clamp-2 mb-4">{post.content}</p>
              <div className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
