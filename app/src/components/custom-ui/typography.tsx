import { cn } from '@/lib/utils'

interface TypographyProps {
  children: React.ReactNode
  className?: string
}

export function PageH1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn('text-4xl font-bold', className)}>
      {children}
    </h1>
  )
}

export function PageH2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn('text-3xl font-bold', className)}>
      {children}
    </h2>
  )
}

export function PageH3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn('text-2xl font-semibold', className)}>
      {children}
    </h3>
  )
}

export function PageH4({ children, className }: TypographyProps) {
  return (
    <h4 className={cn('text-xl font-semibold', className)}>
      {children}
    </h4>
  )
}

export function CardTitle({ children, className }: TypographyProps) {
  return (
    <h3 className={cn('text-xl font-semibold', className)}>
      {children}
    </h3>
  )
}
