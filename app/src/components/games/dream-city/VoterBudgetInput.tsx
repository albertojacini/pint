'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/cn'
import { Lightbulb, Heart, ThumbsDown, Euro, ChevronLeft, Search, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type Dimension = 'ideas' | 'likes' | 'dislikes'

export interface BudgetItem {
  id: string
  text: string
  dimension: Dimension
  notes: string
  amount: number
}

export interface ExistingItem {
  id: string
  text: string
  dimension: Dimension
  popularity: number // number of users who added this
}

interface DimensionConfig {
  id: Dimension
  title: string
  placeholder: string
  notesPlaceholder: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  barColor: string
}

const dimensionConfigs: Record<Dimension, DimensionConfig> = {
  ideas: {
    id: 'ideas',
    title: 'Ideas',
    placeholder: 'What would you like to see?',
    notesPlaceholder: 'Why is this important to you?',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    barColor: 'bg-amber-400',
  },
  likes: {
    id: 'likes',
    title: 'Likes',
    placeholder: 'What do you appreciate?',
    notesPlaceholder: 'What makes this great?',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    barColor: 'bg-emerald-400',
  },
  dislikes: {
    id: 'dislikes',
    title: 'Dislikes',
    placeholder: 'What would you change?',
    notesPlaceholder: "What's the problem?",
    icon: <ThumbsDown className="w-5 h-5" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    barColor: 'bg-rose-400',
  },
}

const TOTAL_BUDGET = 100
const MIN_AMOUNT = 5
const MIN_TO_SUBMIT = 80
const AMOUNT_OPTIONS = [5, 10, 15, 20, 25]

interface VoterBudgetInputProps {
  cityName?: string
  existingItems?: ExistingItem[]
  onBack?: () => void
  onComplete?: (items: BudgetItem[]) => void
}

// Mock existing items for demo
const defaultExistingItems: ExistingItem[] = [
  { id: '1', text: 'More bike lanes', dimension: 'ideas', popularity: 234 },
  { id: '2', text: 'Free public transport for students', dimension: 'ideas', popularity: 189 },
  { id: '3', text: 'Night metro service', dimension: 'ideas', popularity: 156 },
  { id: '4', text: 'Car-free Sundays', dimension: 'ideas', popularity: 142 },
  { id: '5', text: 'Public parks', dimension: 'likes', popularity: 298 },
  { id: '6', text: 'Cultural events', dimension: 'likes', popularity: 187 },
  { id: '7', text: 'Public libraries', dimension: 'likes', popularity: 165 },
  { id: '8', text: 'Traffic congestion', dimension: 'dislikes', popularity: 312 },
  { id: '9', text: 'Air pollution', dimension: 'dislikes', popularity: 276 },
  { id: '10', text: 'Lack of parking', dimension: 'dislikes', popularity: 198 },
]

export function VoterBudgetInput({
  cityName = 'Comune di Milano',
  existingItems = defaultExistingItems,
  onBack,
  onComplete,
}: VoterBudgetInputProps) {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [currentDimension, setCurrentDimension] = useState<Dimension>('ideas')
  const [searchText, setSearchText] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedAmount, setSelectedAmount] = useState(10)
  const [showDropdown, setShowDropdown] = useState(false)

  const spentBudget = items.reduce((sum, item) => sum + item.amount, 0)
  const remainingBudget = TOTAL_BUDGET - spentBudget
  const canSubmit = spentBudget >= MIN_TO_SUBMIT

  const spentByDimension = useMemo(() => ({
    ideas: items.filter((i) => i.dimension === 'ideas').reduce((sum, i) => sum + i.amount, 0),
    likes: items.filter((i) => i.dimension === 'likes').reduce((sum, i) => sum + i.amount, 0),
    dislikes: items.filter((i) => i.dimension === 'dislikes').reduce((sum, i) => sum + i.amount, 0),
  }), [items])

  const countByDimension = useMemo(() => ({
    ideas: items.filter((i) => i.dimension === 'ideas').length,
    likes: items.filter((i) => i.dimension === 'likes').length,
    dislikes: items.filter((i) => i.dimension === 'dislikes').length,
  }), [items])

  const config = dimensionConfigs[currentDimension]

  // Filter existing items for current dimension that match search
  const filteredExisting = useMemo(() => {
    if (!searchText.trim()) return []
    const query = searchText.toLowerCase()
    return existingItems
      .filter((item) =>
        item.dimension === currentDimension &&
        item.text.toLowerCase().includes(query) &&
        !items.some((i) => i.text.toLowerCase() === item.text.toLowerCase() && i.dimension === currentDimension)
      )
      .slice(0, 5)
  }, [searchText, existingItems, currentDimension, items])

  const showCreateOption = searchText.trim().length > 2 &&
    !filteredExisting.some((i) => i.text.toLowerCase() === searchText.toLowerCase())

  const handleAddItem = (text: string) => {
    if (!text.trim() || selectedAmount > remainingBudget) return

    const newItem: BudgetItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      text: text.trim(),
      dimension: currentDimension,
      notes: notes.trim(),
      amount: selectedAmount,
    }

    setItems([...items, newItem])
    setSearchText('')
    setNotes('')
    setShowDropdown(false)
    setSelectedAmount(Math.min(10, remainingBudget - selectedAmount))
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleSelectExisting = (item: ExistingItem) => {
    setSearchText(item.text)
    setShowDropdown(false)
  }

  const dimensionItems = items.filter((item) => item.dimension === currentDimension)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Navbar */}
      <div className="flex items-center h-12 px-2 border-b border-slate-200 bg-white shrink-0">
        <button
          onClick={onBack}
          className="p-2 -ml-1 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2 text-sm">
          <span className="font-semibold text-slate-900">Voter Budget</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">{cityName}</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Budget Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">
            {canSubmit ? 'Ready to submit!' : `Spend €${MIN_TO_SUBMIT - spentBudget} more to see results`}
          </span>
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

        {/* Budget bar */}
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
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
        {spentBudget > 0 && (
          <div className="flex items-center gap-3 mt-2">
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
          </div>
        )}
      </div>

      {/* Dimension Tabs */}
      <div className="flex gap-2 px-4 py-3 bg-white border-b border-slate-100">
        {Object.values(dimensionConfigs).map((dim) => (
          <button
            key={dim.id}
            onClick={() => setCurrentDimension(dim.id)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-sm font-medium transition-all',
              currentDimension === dim.id
                ? `${dim.bgColor} ${dim.color}`
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            )}
          >
            <div className="flex items-center gap-1.5">
              {dim.icon}
              <span>{dim.title}</span>
            </div>
            {countByDimension[dim.id] > 0 && (
              <span className="text-xs opacity-75">
                {countByDimension[dim.id]} · €{spentByDimension[dim.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {/* Search/Input Area */}
        <div className={cn(
          'rounded-2xl border-2 p-4 mb-4',
          config.bgColor,
          config.borderColor
        )}>
          {/* Search input */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={config.placeholder}
              className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            {searchText && (
              <button
                onClick={() => {
                  setSearchText('')
                  setShowDropdown(false)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown */}
            {showDropdown && (filteredExisting.length > 0 || showCreateOption) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-10">
                {filteredExisting.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectExisting(item)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
                  >
                    <span className="flex-1 text-slate-900">{item.text}</span>
                    <span className="text-xs text-slate-400">{item.popularity} votes</span>
                  </button>
                ))}
                {showCreateOption && (
                  <button
                    onClick={() => handleAddItem(searchText)}
                    className={cn(
                      'w-full flex items-center gap-2 px-4 py-3 text-left',
                      config.bgColor,
                      config.color
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add "{searchText}"</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notes input */}
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={config.notesPlaceholder}
            className="w-full bg-white/50 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 border border-slate-200/50 focus:outline-none focus:bg-white focus:border-slate-200 mb-3"
          />

          {/* Amount selector */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {AMOUNT_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  disabled={amount > remainingBudget}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    selectedAmount === amount
                      ? `${config.color} ${config.bgColor} ring-2 ring-current`
                      : 'bg-white text-slate-600 hover:bg-slate-50',
                    amount > remainingBudget && 'opacity-30 cursor-not-allowed'
                  )}
                >
                  €{amount}
                </button>
              ))}
            </div>
            <Button
              onClick={() => handleAddItem(searchText)}
              disabled={!searchText.trim() || selectedAmount > remainingBudget}
              size="sm"
              className="rounded-lg"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Current dimension items */}
        {dimensionItems.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-xs text-slate-500 font-medium px-1">Your {config.title.toLowerCase()}</p>
            {dimensionItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl bg-white border',
                  config.borderColor
                )}
              >
                <div className={cn('p-1.5 rounded-lg mt-0.5', config.bgColor, config.color)}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-slate-900 font-medium">{item.text}</span>
                  {item.notes && (
                    <p className="text-sm text-slate-500 mt-0.5">{item.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-slate-700 tabular-nums">€{item.amount}</span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {dimensionItems.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">No {config.title.toLowerCase()} yet</p>
            <p className="text-xs mt-1">Search or type to add one</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-4 py-4">
        <Button
          onClick={() => onComplete?.(items)}
          disabled={!canSubmit}
          className="w-full h-12 text-base font-semibold rounded-xl"
        >
          {canSubmit
            ? 'See Results'
            : `Spend €${MIN_TO_SUBMIT - spentBudget} more to continue`}
        </Button>
      </div>
    </div>
  )
}
