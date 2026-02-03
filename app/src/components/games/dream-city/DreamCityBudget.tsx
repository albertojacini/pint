'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Lightbulb, Heart, ThumbsDown, Plus, Minus, Euro } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type DreamDimension = 'ideas' | 'likes' | 'dislikes'

interface BudgetItem {
  id: string
  dimension: DreamDimension
  text: string
  amount: number
}

interface DimensionConfig {
  id: DreamDimension
  title: string
  placeholder: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

const dimensionConfigs: Record<DreamDimension, DimensionConfig> = {
  ideas: {
    id: 'ideas',
    title: 'Ideas',
    placeholder: 'What would you love to see?',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  likes: {
    id: 'likes',
    title: 'Likes',
    placeholder: 'What do you appreciate?',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  dislikes: {
    id: 'dislikes',
    title: 'Dislikes',
    placeholder: 'What would you change?',
    icon: <ThumbsDown className="w-5 h-5" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
}

const TOTAL_BUDGET = 100
const MIN_AMOUNT = 5
const AMOUNT_STEP = 5

interface DreamCityBudgetProps {
  cityName?: string
  initialDimension?: DreamDimension
  onComplete?: (items: BudgetItem[]) => void
}

export function DreamCityBudget({
  cityName = 'Comune di Milano',
  initialDimension = 'ideas',
  onComplete,
}: DreamCityBudgetProps) {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [currentDimension, setCurrentDimension] = useState<DreamDimension>(initialDimension)
  const [inputText, setInputText] = useState('')
  const [inputAmount, setInputAmount] = useState(10)

  const spentBudget = items.reduce((sum, item) => sum + item.amount, 0)
  const remainingBudget = TOTAL_BUDGET - spentBudget
  const spentByDimension = {
    ideas: items.filter((i) => i.dimension === 'ideas').reduce((sum, i) => sum + i.amount, 0),
    likes: items.filter((i) => i.dimension === 'likes').reduce((sum, i) => sum + i.amount, 0),
    dislikes: items.filter((i) => i.dimension === 'dislikes').reduce((sum, i) => sum + i.amount, 0),
  }

  const config = dimensionConfigs[currentDimension]

  const handleAddItem = () => {
    if (!inputText.trim() || inputAmount > remainingBudget) return

    const newItem: BudgetItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      dimension: currentDimension,
      text: inputText.trim(),
      amount: inputAmount,
    }

    setItems([...items, newItem])
    setInputText('')
    setInputAmount(Math.min(10, remainingBudget - inputAmount))
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const adjustAmount = (delta: number) => {
    const newAmount = inputAmount + delta
    if (newAmount >= MIN_AMOUNT && newAmount <= remainingBudget) {
      setInputAmount(newAmount)
    }
  }

  const dimensionItems = items.filter((item) => item.dimension === currentDimension)
  const otherItems = items.filter((item) => item.dimension !== currentDimension)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Header with Budget */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            {cityName}
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <Euro className="w-4 h-4 text-slate-400" />
            <span className={cn(
              'text-xl tabular-nums',
              remainingBudget < 20 ? 'text-rose-600' : 'text-slate-900'
            )}>
              {remainingBudget}
            </span>
            <span className="text-slate-400 text-sm">left</span>
          </div>
        </div>

        {/* Budget bar with dimension breakdown */}
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
          {spentByDimension.ideas > 0 && (
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${(spentByDimension.ideas / TOTAL_BUDGET) * 100}%` }}
            />
          )}
          {spentByDimension.likes > 0 && (
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${(spentByDimension.likes / TOTAL_BUDGET) * 100}%` }}
            />
          )}
          {spentByDimension.dislikes > 0 && (
            <div
              className="h-full bg-rose-400 transition-all duration-300"
              style={{ width: `${(spentByDimension.dislikes / TOTAL_BUDGET) * 100}%` }}
            />
          )}
        </div>

        {/* Dimension breakdown */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            {spentByDimension.ideas > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-500">€{spentByDimension.ideas}</span>
              </div>
            )}
            {spentByDimension.likes > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-500">€{spentByDimension.likes}</span>
              </div>
            )}
            {spentByDimension.dislikes > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-slate-500">€{spentByDimension.dislikes}</span>
              </div>
            )}
            {spentBudget === 0 && (
              <span className="text-xs text-slate-400">€{TOTAL_BUDGET} to spend</span>
            )}
          </div>
          <span className="text-xs text-slate-400 tabular-nums">€{spentBudget}/€{TOTAL_BUDGET}</span>
        </div>
      </div>

      {/* Dimension Tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {Object.values(dimensionConfigs).map((dim) => {
          const count = items.filter((i) => i.dimension === dim.id).length
          return (
            <button
              key={dim.id}
              onClick={() => setCurrentDimension(dim.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                currentDimension === dim.id
                  ? `${dim.bgColor} ${dim.color} ${dim.borderColor} border`
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {dim.icon}
              {dim.title}
              {count > 0 && (
                <span className={cn(
                  'w-5 h-5 rounded-full text-xs flex items-center justify-center',
                  currentDimension === dim.id ? 'bg-white/50' : 'bg-slate-100'
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pb-4">
        {/* Input Area */}
        <div className={cn(
          'rounded-2xl border-2 p-4 mb-4',
          config.bgColor,
          config.borderColor
        )}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={config.placeholder}
            className="w-full bg-white rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 mb-3"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddItem()
            }}
          />

          {/* Amount selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">Invest:</span>
              <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200">
                <button
                  onClick={() => adjustAmount(-AMOUNT_STEP)}
                  disabled={inputAmount <= MIN_AMOUNT}
                  className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold tabular-nums">
                  €{inputAmount}
                </span>
                <button
                  onClick={() => adjustAmount(AMOUNT_STEP)}
                  disabled={inputAmount >= remainingBudget}
                  className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <Button
              onClick={handleAddItem}
              disabled={!inputText.trim() || inputAmount > remainingBudget}
              size="sm"
              className={cn('rounded-lg', config.color.replace('text-', 'bg-').replace('-600', '-500'))}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Current dimension items */}
        {dimensionItems.length > 0 && (
          <div className="space-y-2 mb-4">
            {dimensionItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl bg-white border',
                  config.borderColor
                )}
              >
                <div className={cn('p-1.5 rounded-lg', config.bgColor, config.color)}>
                  {config.icon}
                </div>
                <span className="flex-1 text-slate-900">{item.text}</span>
                <span className="font-semibold text-slate-600 tabular-nums">€{item.amount}</span>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Other dimension items (collapsed) */}
        {otherItems.length > 0 && (
          <div className="border-t border-slate-200 pt-4 mt-4">
            <p className="text-xs text-slate-400 mb-2">Other items</p>
            <div className="space-y-2">
              {otherItems.map((item) => {
                const itemConfig = dimensionConfigs[item.dimension]
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-slate-50"
                  >
                    <div className={cn('p-1 rounded', itemConfig.bgColor, itemConfig.color)}>
                      {itemConfig.icon}
                    </div>
                    <span className="flex-1 text-sm text-slate-600 truncate">{item.text}</span>
                    <span className="text-sm text-slate-500 tabular-nums">€{item.amount}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">Start adding your ideas!</p>
            <p className="text-xs mt-1">You have €{TOTAL_BUDGET} to invest in your dream city</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 px-4 py-4">
        <Button
          onClick={() => onComplete?.(items)}
          disabled={items.length === 0}
          className="w-full h-12 text-base font-semibold rounded-xl"
        >
          {items.length === 0
            ? 'Add at least one item'
            : remainingBudget > 0
              ? `Continue (€${remainingBudget} unspent)`
              : 'Submit your dream city'}
        </Button>
      </div>
    </div>
  )
}
