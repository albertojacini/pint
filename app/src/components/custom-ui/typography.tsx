import { cn } from '@/lib/utils'

type AsElement = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'

interface TypographyProps {
  children: React.ReactNode
  className?: string
  as?: AsElement
}

export function PageTitle({ children, className, as: Tag = 'h1' }: TypographyProps) {
  return <Tag className={cn('text-4xl font-bold', className)}>{children}</Tag>
}

export function SectionTitle({ children, className, as: Tag = 'h2' }: TypographyProps) {
  return <Tag className={cn('text-2xl font-semibold', className)}>{children}</Tag>
}

export function SubsectionTitle({ children, className, as: Tag = 'h3' }: TypographyProps) {
  return <Tag className={cn('text-xl font-semibold', className)}>{children}</Tag>
}

export function Lead({ children, className, as: Tag = 'p' }: TypographyProps) {
  return <Tag className={cn('text-lg text-muted-foreground', className)}>{children}</Tag>
}

export function Muted({ children, className, as: Tag = 'p' }: TypographyProps) {
  return <Tag className={cn('text-sm text-muted-foreground', className)}>{children}</Tag>
}
