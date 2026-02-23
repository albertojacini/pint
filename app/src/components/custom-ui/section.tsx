import { cn } from '@/lib/utils'
import { Lead, PageTitle, SectionL1Title, SectionL2Title, SectionL3Title } from './typography'

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

interface SectionL1Props {
  children: React.ReactNode
  title?: React.ReactNode
  action?: React.ReactNode
  className?: string
  id?: string
}

export function SectionL1({ children, title, action, className, id }: SectionL1Props) {
  return (
    <section id={id} className={cn('mb-10 scroll-mt-32 lg:scroll-mt-20', className)}>
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

interface SectionL2Props {
  children: React.ReactNode
  title?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function SectionL2({ children, title, action, className }: SectionL2Props) {
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

interface SectionL3Props {
  children: React.ReactNode
  title?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function SectionL3({ children, title, action, className }: SectionL3Props) {
  return (
    <div className={cn('mb-4', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-1">
          {title && <SectionL3Title className="mb-0">{title}</SectionL3Title>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
