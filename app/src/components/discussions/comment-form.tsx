'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { createComment } from '@/lib/actions/discussions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CommentFormProps {
  postId: string
  parentId?: string
  authorId: string
  onCancel?: () => void
}

export function CommentForm({ postId, parentId, authorId, onCancel }: CommentFormProps) {
  const t = useTranslations('discussions')
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    startTransition(async () => {
      await createComment(postId, authorId, body.trim(), parentId)
      setBody('')
      onCancel?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? t('writeReply') : t('writeComment')}
        rows={3}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!body.trim() || isPending}>
          {isPending ? t('posting') : t('post')}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {t('cancel')}
          </Button>
        )}
      </div>
    </form>
  )
}
