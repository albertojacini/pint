'use client'

import { useRef, useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { Globe, ChevronDown, Check } from 'lucide-react'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('localeSwitcher')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function switchLocale(nextLocale: string) {
    setOpen(false)
    if (nextLocale !== locale) {
      router.replace(pathname, { locale: nextLocale })
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span>{t(locale as (typeof routing.locales)[number])}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-[140px] rounded-md border bg-popover p-1 shadow-md z-50">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              <Check className={`h-3.5 w-3.5 ${loc === locale ? 'opacity-100' : 'opacity-0'}`} />
              <span>{t(loc)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
