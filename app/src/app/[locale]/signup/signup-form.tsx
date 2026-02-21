'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

export function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const t = useTranslations('requestAccess')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('acc_access_requests')
        .insert({ name, email, message: message || null })

      if (error) {
        if (error.code === '23505') {
          toast({
            title: t('alreadyRequested'),
            description: t('alreadyRequestedDescription'),
          })
          setSubmitted(true)
        } else {
          toast({
            variant: 'destructive',
            title: t('error'),
            description: error.message,
          })
        }
      } else {
        setSubmitted(true)
        toast({
          title: t('success'),
          description: t('successDescription'),
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('unexpectedError'),
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <p className="text-lg font-medium">{t('thankYou')}</p>
        <p className="text-muted-foreground mt-2">{t('weWillBeInTouch')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t('name')}</Label>
        <Input
          id="name"
          type="text"
          placeholder={t('namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">{t('message')}</Label>
        <Textarea
          id="message"
          placeholder={t('messagePlaceholder')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t('submitting') : t('requestAccess')}
      </Button>
    </form>
  )
}
