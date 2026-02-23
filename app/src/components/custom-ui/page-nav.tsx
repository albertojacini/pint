'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export interface PageNavSection {
  id: string
  label: string
}

function useActiveSection(sections: PageNavSection[]) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    )

    for (const section of sections) {
      const el = document.getElementById(section.id)
      if (el) observerRef.current.observe(el)
    }

    return () => observerRef.current?.disconnect()
  }, [sections])

  return activeId
}

interface PageNavProps {
  sections: PageNavSection[]
  className?: string
}

export function PageNav({ sections, className }: PageNavProps) {
  const activeId = useActiveSection(sections)

  return (
    <nav className={cn('flex flex-col gap-0.5', className)}>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={cn(
            'text-xs py-1 border-l-2 pl-3 transition-colors',
            activeId === section.id
              ? 'border-foreground text-foreground font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          )}
        >
          {section.label}
        </a>
      ))}
    </nav>
  )
}

interface PageNavLayoutProps {
  sections: PageNavSection[]
  children: React.ReactNode
  className?: string
}

export function PageNavLayout({ sections, children, className }: PageNavLayoutProps) {
  const activeId = useActiveSection(sections)

  return (
    <>
      {/* Mobile: sticky horizontal strip */}
      <div className="lg:hidden sticky top-14 z-40 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                'text-xs whitespace-nowrap py-1 transition-colors',
                activeId === section.id
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {section.label}
            </a>
          ))}
        </div>
      </div>

      <div className={cn('lg:grid lg:grid-cols-[1fr_180px] lg:gap-10', className)}>
        <div className="min-w-0">{children}</div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <PageNav sections={sections} />
          </div>
        </aside>
      </div>
    </>
  )
}
