'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PostEditSchema } from '@pint/types'
import type { PostEdit } from '@pint/types'
import { updatePost } from '@/lib/actions/posts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface EditPostFormProps {
  post: PostEdit
}

export function EditPostForm({ post }: EditPostFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostEdit>({
    resolver: zodResolver(PostEditSchema),
    defaultValues: post,
  })

  const onSubmit = async (data: PostEdit) => {
    setLoading(true)

    try {
      const result = await updatePost(data)

      if (result.ok) {
        toast({
          title: 'Success',
          description: 'Post updated successfully',
        })
        router.push(`/posts/${post.id}`)
        router.refresh()
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to update post',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" rows={12} {...register('content')} />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
