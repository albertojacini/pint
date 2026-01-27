'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/lib/actions/discussions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface PostFormProps {
  targetType: 'provision' | 'entity' | 'idea'
  targetId: string
  authorId: string
  basePath: string
}

const postTypes = [
  { value: 'discussion', label: 'Discussion' },
  { value: 'question', label: 'Question' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'analysis', label: 'Analysis' },
] as const

export function PostForm({ targetType, targetId, authorId, basePath }: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [postType, setPostType] = useState<'discussion' | 'question' | 'proposal' | 'analysis'>('discussion')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    startTransition(async () => {
      const post = await createPost(targetType, targetId, authorId, title.trim(), body.trim() || null, postType)
      router.push(`${basePath}/${post.id}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="post-type" className="text-sm">Type</Label>
        <div className="flex gap-2 mt-1">
          {postTypes.map((pt) => (
            <Button
              key={pt.value}
              type="button"
              variant={postType === pt.value ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setPostType(pt.value)}
            >
              {pt.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="title" className="text-sm">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="body" className="text-sm">Body (Markdown)</Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your post..."
          rows={8}
          className="mt-1"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={!title.trim() || isPending}>
          {isPending ? 'Creating...' : 'Create Post'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
