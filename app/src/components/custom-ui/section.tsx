import { cn } from '@/lib/utils'
import { SectionTitle } from './typography'

interface SectionProps {
  children: React.ReactNode
  title?: string
  action?: React.ReactNode
  className?: string
}

export function Section({ children, title, action, className }: SectionProps) {
  return (
    <section className={cn('mb-10', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && <SectionTitle>{title}</SectionTitle>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
