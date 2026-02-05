import { cn } from '@/lib/utils'

type AsElement = 'div' | 'section' | 'article' | 'aside'
type BoxVariant = 'muted' | 'highlighted' | 'default'
type BoxPadding = 'none' | 'sm' | 'md' | 'lg'

interface BoxProps {
  children: React.ReactNode
  variant?: BoxVariant
  padding?: BoxPadding
  className?: string
  as?: AsElement
}

const variantClasses: Record<BoxVariant, string> = {
  default: 'rounded-lg border bg-card',
  muted: 'bg-muted/30 rounded-lg',
  highlighted: 'rounded-lg border-2 border-dashed border-amber-400/70',
}

const paddingClasses: Record<BoxPadding, string> = {
  none: '',
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
}

export function Box({
  children,
  variant = 'default',
  padding = 'md',
  className,
  as: Component = 'div',
}: BoxProps) {
  return (
    <Component
      className={cn(variantClasses[variant], paddingClasses[padding], className)}
    >
      {children}
    </Component>
  )
}
