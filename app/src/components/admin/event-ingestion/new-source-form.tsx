'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createSource, type SourceType } from '@/lib/actions/event-ingestion'

interface FormData {
  sourceType: SourceType
  url: string
  title: string
  sourceName: string
  rawContent: string
}

const sourceTypes: { value: SourceType; label: string }[] = [
  { value: 'news', label: 'News Article' },
  { value: 'official_gazette', label: 'Official Gazette' },
  { value: 'press_release', label: 'Press Release' },
  { value: 'council_minutes', label: 'Council Minutes' },
  { value: 'social', label: 'Social Media' },
  { value: 'manual', label: 'Manual Entry' },
]

export function NewSourceForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      sourceType: 'news',
      url: '',
      title: '',
      sourceName: '',
      rawContent: '',
    },
  })

  const sourceType = watch('sourceType')
  const isManual = sourceType === 'manual'

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const result = await createSource({
        sourceType: data.sourceType,
        url: data.url || undefined,
        title: data.title || undefined,
        sourceName: data.sourceName || undefined,
        rawContent: data.rawContent || undefined,
      })

      if (result.ok && result.data) {
        toast({
          title: 'Source created',
          description: 'Redirecting to source details...',
        })
        router.push(`/admin/event-ingestion/sources/${result.data.id}`)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to create source',
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
        <Label htmlFor="sourceType">Source Type</Label>
        <select
          id="sourceType"
          {...register('sourceType', { required: 'Please select a source type' })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {sourceTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.sourceType && (
          <p className="text-sm text-destructive">{errors.sourceType.message}</p>
        )}
      </div>

      {!isManual && (
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/article"
            {...register('url')}
          />
          <p className="text-xs text-gray-500">
            The URL will be fetched to extract content
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title {isManual && <span className="text-red-500">*</span>}</Label>
        <Input
          id="title"
          placeholder="Article or document title"
          {...register('title', {
            required: isManual ? 'Title is required for manual entries' : false,
          })}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceName">Source Name</Label>
        <Input
          id="sourceName"
          placeholder="e.g., ANSA, Gazzetta Ufficiale, Comune di Milano"
          {...register('sourceName')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rawContent">
          Content {isManual && <span className="text-red-500">*</span>}
        </Label>
        <Textarea
          id="rawContent"
          placeholder={isManual ? 'Paste the content here...' : 'Optional: paste content if URL cannot be fetched'}
          {...register('rawContent', {
            required: isManual ? 'Content is required for manual entries' : false,
          })}
          rows={8}
        />
        {errors.rawContent && (
          <p className="text-sm text-destructive">{errors.rawContent.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Add Source'}
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
