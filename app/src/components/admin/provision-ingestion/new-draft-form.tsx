'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createDraft } from '@/lib/actions/provision-drafts'

interface Entity {
  id: string
  name: string
  type: string
}

interface NewDraftFormProps {
  entities: Entity[]
}

interface FormData {
  entityId: string
  description: string
}

export function NewDraftForm({ entities }: NewDraftFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      entityId: entities[0]?.id || '',
      description: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const result = await createDraft({
        entityId: data.entityId,
        description: data.description,
      })

      if (result.ok && result.data) {
        toast({
          title: 'Draft created',
          description: 'Redirecting to classification...',
        })
        router.push(`/admin/provision-ingestion/${result.data.id}`)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to create draft',
        })
      }
    } catch {
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
        <Label htmlFor="entityId">Political Entity</Label>
        <select
          id="entityId"
          {...register('entityId', { required: 'Please select an entity' })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {entities.map((entity) => (
            <option key={entity.id} value={entity.id}>
              {entity.name} ({entity.type})
            </option>
          ))}
        </select>
        {errors.entityId && (
          <p className="text-sm text-destructive">{errors.entityId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="e.g., Ownership of ATM (Milan public transport company)"
          {...register('description', {
            required: 'Please enter a description',
            minLength: {
              value: 5,
              message: 'Description must be at least 5 characters',
            },
          })}
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
        <p className="text-xs text-gray-500">
          Briefly describe the provision. Include the entity name for better
          results.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Draft'}
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
