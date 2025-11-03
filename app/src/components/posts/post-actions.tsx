'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePost, publishPost } from '@/lib/actions/posts'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Edit, Trash, Send } from 'lucide-react'
import Link from 'next/link'

interface PostActionsProps {
  postId: string
  status: string
}

export function PostActions({ postId, status }: PostActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    setLoading(true)
    const result = await deletePost(postId)

    if (result.ok) {
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      })
      router.push('/posts')
      router.refresh()
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to delete post',
      })
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    const result = await publishPost(postId)

    if (result.ok) {
      toast({
        title: 'Success',
        description: 'Post published successfully',
      })
      router.refresh()
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to publish post',
      })
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      {status === 'draft' && (
        <Button size="sm" onClick={handlePublish} disabled={loading}>
          <Send className="mr-2 h-4 w-4" />
          Publish
        </Button>
      )}
      <Button size="sm" variant="outline" asChild disabled={loading}>
        <Link href={`/posts/${postId}/edit`}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  )
}
