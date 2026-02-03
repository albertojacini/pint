'use client'

import { useState, useMemo, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { Euro, ChevronLeft, Search, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface BudgetItem {
  id: string
  text: string
  notes: string
  amount: number
}

export interface ExistingItem {
  id: string
  text: string
  popularity: number
}

const TOTAL_BUDGET = 100
const AMOUNT_OPTIONS = [5, 10, 15, 20, 25]

interface VoterBudgetInputProps {
  cityName?: string
  existingItems?: ExistingItem[]
  initialItems?: BudgetItem[]
  onBack?: () => void
  onComplete?: (items: BudgetItem[]) => void
  onAddItem?: (item: BudgetItem) => Promise<BudgetItem | void>
  onRemoveItem?: (id: string) => Promise<void>
  onSearch?: (query: string) => void
}

const defaultExistingItems: ExistingItem[] = [
  { id: '1', text: 'More bike lanes', popularity: 234 },
  { id: '2', text: 'Free public transport for students', popularity: 189 },
  { id: '3', text: 'Night metro service', popularity: 156 },
  { id: '4', text: 'Car-free Sundays', popularity: 142 },
  { id: '5', text: 'More public parks', popularity: 298 },
  { id: '6', text: 'Reduce traffic congestion', popularity: 312 },
  { id: '7', text: 'Improve air quality', popularity: 276 },
  { id: '8', text: 'More affordable housing', popularity: 198 },
]

export function VoterBudgetInput({
  cityName = 'Comune di Milano',
  existingItems = defaultExistingItems,
  initialItems = [],
  onBack,
  onComplete,
  onAddItem,
  onRemoveItem,
  onSearch,
}: VoterBudgetInputProps) {
  const [items, setItems] = useState<BudgetItem[]>(initialItems)
  const [searchText, setSearchText] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedAmount, setSelectedAmount] = useState(10)
  const [showDropdown, setShowDropdown] = useState(false)

  const spentBudget = items.reduce((sum, item) => sum + item.amount, 0)
  const remainingBudget = TOTAL_BUDGET - spentBudget
  const canSubmit = items.length > 0

  // Call onSearch when search text changes
  useEffect(() => {
    if (onSearch && searchText.trim()) {
      const timeout = setTimeout(() => {
        onSearch(searchText)
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [searchText, onSearch])

  // Filter existing items that match search
  const filteredExisting = useMemo(() => {
    if (!searchText.trim()) return []
    const query = searchText.toLowerCase()
    return existingItems
      .filter((item) =>
        item.text.toLowerCase().includes(query) &&
        !items.some((i) => i.text.toLowerCase() === item.text.toLowerCase())
      )
      .slice(0, 5)
  }, [searchText, existingItems, items])

  const showCreateOption = searchText.trim().length > 2 &&
    !filteredExisting.some((i) => i.text.toLowerCase() === searchText.toLowerCase())

  const handleAddItem = async (text: string) => {
    if (!text.trim() || selectedAmount > remainingBudget) return

    const newItem: BudgetItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      text: text.trim(),
      notes: notes.trim(),
      amount: selectedAmount,
    }

    if (onAddItem) {
      const result = await onAddItem(newItem)
      if (result) {
        setItems([...items, result])
      }
    } else {
      setItems([...items, newItem])
    }

    setSearchText('')
    setNotes('')
    setShowDropdown(false)
    setSelectedAmount(Math.min(10, remainingBudget - selectedAmount))
  }

  const handleRemoveItem = async (id: string) => {
    if (onRemoveItem) {
      await onRemoveItem(id)
    }
    setItems(items.filter((item) => item.id !== id))
  }

  const handleSelectExisting = (item: ExistingItem) => {
    setSearchText(item.text)
    setShowDropdown(false)
  }

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
            {items.length} {items.length === 1 ? 'priority' : 'priorities'} · €{spentBudget} invested
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
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(spentBudget / TOTAL_BUDGET) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {/* Search/Input Area */}
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 mb-4">
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
              placeholder="What matters most to you?"
              className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                    className="w-full flex items-center gap-2 px-4 py-3 text-left bg-blue-50 text-blue-600"
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
            placeholder="Why is this important? (optional)"
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
                      ? 'text-blue-600 bg-blue-50 ring-2 ring-blue-500'
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

        {/* Items list */}
        {items.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-xs text-slate-500 font-medium px-1">Your priorities</p>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200"
              >
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
        {items.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">No priorities yet</p>
            <p className="text-xs mt-1">Search or type to add what matters to you</p>
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
          {canSubmit ? 'See Results' : 'Add at least one priority'}
        </Button>
      </div>
    </div>
  )
}
