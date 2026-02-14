import { cn } from '@/lib/utils'
import { Lead, PageTitle, SectionL1Title, SectionL2Title } from './typography'

interface PageHeaderProps {
  children?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  children,
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-8', className)}>
      <div className="flex items-center justify-between">
        <PageTitle>{title}</PageTitle>
        {action}
      </div>
      {description && <Lead className="mt-1">{description}</Lead>}
      {children}
    </header>
  )
}

interface SectionProps {
  children: React.ReactNode
  title?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function Section({ children, title, action, className }: SectionProps) {
  return (
    <section className={cn('mb-10', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && <SectionL1Title>{title}</SectionL1Title>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

interface SubsectionProps {
  children: React.ReactNode
  title?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function Subsection({ children, title, action, className }: SubsectionProps) {
  return (
    <div className={cn('mb-6', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-2">
          {title && <SectionL2Title className="mb-0">{title}</SectionL2Title>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
