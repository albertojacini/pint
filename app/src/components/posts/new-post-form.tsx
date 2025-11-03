'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreatePostSchema } from '@pint/types'
import type { CreatePost } from '@pint/types'
import { createPost } from '@/lib/actions/posts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

export function NewPostForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePost>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      title: '',
      content: '',
      status: 'draft',
    },
  })

  const onSubmit = async (data: CreatePost) => {
    setLoading(true)

    try {
      const result = await createPost(data)

      if (result.ok && result.data) {
        toast({
          title: 'Success',
          description: 'Post created successfully',
        })
        router.push(`/posts/${result.data.id}`)
        router.refresh()
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to create post',
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
        <Input id="title" placeholder="Enter post title" {...register('title')} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          rows={12}
          placeholder="Write your post content..."
          {...register('content')}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Post'}
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
