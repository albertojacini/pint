import { cn } from '@/lib/utils'

type AsElement = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'

interface TypographyProps {
  children: React.ReactNode
  className?: string
  as?: AsElement
}

export function PageTitle({ children, className, as: Tag = 'h1' }: TypographyProps) {
  return <Tag className={cn('text-2xl font-semibold', className)}>{children}</Tag>
}

export function SectionTitle({ children, className, as: Tag = 'h2' }: TypographyProps) {
  return <Tag className={cn('text-xl font-medium', className)}>{children}</Tag>
}

export function SubsectionTitle({ children, className, as: Tag = 'h3' }: TypographyProps) {
  return (
    <Tag className={cn('text-sm font-medium text-muted-foreground mb-2', className)}>
      {children}
    </Tag>
  )
}

export function SubsubsectionTitle({ children, className, as: Tag = 'h4' }: TypographyProps) {
  return (
    <Tag
      className={cn(
        'text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1',
        className
      )}
    >
      {children}
    </Tag>
  )
}

export function Lead({ children, className, as: Tag = 'p' }: TypographyProps) {
  return <Tag className={cn('text-lg text-muted-foreground', className)}>{children}</Tag>
}

export function Muted({ children, className, as: Tag = 'p' }: TypographyProps) {
  return <Tag className={cn('text-sm text-muted-foreground', className)}>{children}</Tag>
}
