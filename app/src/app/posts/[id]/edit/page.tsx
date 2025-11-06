import { getPost } from '@/lib/actions/posts'
import { EditPostForm } from '@/components/posts/edit-post-form'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <Link href={`/posts/${post.id}`} className="text-blue-600 hover:underline">
          ← Back to post
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
        <EditPostForm post={{ id: post.id, title: post.title, content: post.content }} />
      </div>
    </div>
  )
}
