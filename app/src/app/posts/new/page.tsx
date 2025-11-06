import { NewPostForm } from '@/components/posts/new-post-form'
import Link from 'next/link'

export default function NewPostPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <Link href="/posts" className="text-blue-600 hover:underline">
          ← Back to posts
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
        <NewPostForm />
      </div>
    </div>
  )
}
