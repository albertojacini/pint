import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// LoadingButton - Button with loading state
export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, loadingText, children, disabled, ...props }, ref) => {
    return (
      <Button ref={ref} disabled={disabled || loading} {...props}>
        {loading && <Loader2 className="animate-spin" />}
        {loading && loadingText ? loadingText : children}
      </Button>
    )
  }
)
LoadingButton.displayName = 'LoadingButton'

// IconButton - Compact button for icons with optional label
export interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode
  label?: string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size={label ? 'default' : 'icon'}
        className={cn('gap-2', className)}
        {...props}
      >
        {icon}
        {label && <span>{label}</span>}
      </Button>
    )
  }
)
IconButton.displayName = 'IconButton'

// FilterButton - Toggle button for filters
export interface FilterButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'> {
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
}

export const FilterButton = React.forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ selected, onSelectedChange, children, className, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onSelectedChange?.(!selected)
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={cn(
          'px-2 py-0.5 rounded-sm text-xs font-medium transition-all',
          selected
            ? 'text-foreground border border-black dark:border-white'
            : 'text-muted-foreground hover:text-foreground border border-transparent',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
FilterButton.displayName = 'FilterButton'

// SpecialButton - Small solid dark action button with icon
export interface SpecialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  href?: string
}

export const SpecialButton = React.forwardRef<HTMLButtonElement, SpecialButtonProps>(
  ({ icon, href, children, className, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-foreground text-background hover:bg-foreground/80 transition-colors',
      className
    )

    if (href) {
      return (
        <a href={href} className={classes}>
          {icon}
          {children}
        </a>
      )
    }

    return (
      <button ref={ref} type="button" className={classes} {...props}>
        {icon}
        {children}
      </button>
    )
  }
)
SpecialButton.displayName = 'SpecialButton'

// QuickActionButton - Compact pill-outlined button for contextual quick actions
export interface QuickActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  href?: string
}

export const QuickActionButton = React.forwardRef<HTMLButtonElement, QuickActionButtonProps>(
  ({ icon, href, children, className, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-border bg-background hover:bg-muted transition-colors',
      className
    )

    if (href) {
      return (
        <a href={href} className={classes}>
          {icon}
          {children}
        </a>
      )
    }

    return (
      <button ref={ref} type="button" className={classes} {...props}>
        {icon}
        {children}
      </button>
    )
  }
)
QuickActionButton.displayName = 'QuickActionButton'

// ButtonGroup - Group of related buttons
export interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function ButtonGroup({ children, className, orientation = 'horizontal' }: ButtonGroupProps) {
  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal'
          ? '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:last-child)]:border-r-0'
          : 'flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:last-child)]:border-b-0',
        className
      )}
    >
      {children}
    </div>
  )
}

// ToggleButtonGroup - Group of mutually exclusive toggle buttons
export interface ToggleButtonGroupProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string; icon?: React.ReactNode }>
  className?: string
}

export function ToggleButtonGroup<T extends string>({
  value,
  onChange,
  options,
  className,
}: ToggleButtonGroupProps<T>) {
  return (
    <div className={cn('inline-flex rounded-md border border-input', className)}>
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'px-3 py-2 text-sm font-medium transition-colors',
            'flex items-center gap-2',
            index === 0 && 'rounded-l-md',
            index === options.length - 1 && 'rounded-r-md',
            index !== options.length - 1 && 'border-r border-input',
            value === option.value
              ? 'bg-accent text-accent-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted'
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  )
}
