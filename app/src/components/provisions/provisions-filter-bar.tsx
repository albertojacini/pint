'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCallback, useEffect, useState } from 'react'
import { SlidersHorizontal, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const PROVISION_TYPES = [
  { value: 'ownership', label: 'Ownership' },
  { value: 'contract', label: 'Contract' },
  { value: 'regulation', label: 'Regulation' },
  { value: 'taxation', label: 'Taxation' },
  { value: 'allocation', label: 'Allocation' },
  { value: 'designation', label: 'Designation' },
  { value: 'infrastructure', label: 'Infrastructure' },
]

const PROVISION_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'repealed', label: 'Repealed' },
  { value: 'suspended', label: 'Suspended' },
]

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'title-asc', label: 'A-Z' },
]

export function ProvisionsFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  const currentType = searchParams.get('type')
  const currentStatus = searchParams.get('status')
  const currentSort = searchParams.get('sort') || 'date-desc'

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search: search || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  const clearFilters = () => {
    setSearch('')
    router.push('?', { scroll: false })
  }

  const hasActiveFilters = currentType || currentStatus || search
  const hasExpandedFilters = currentStatus || currentSort !== 'date-desc'

  return (
    <div className="space-y-3">
      {/* Search row with filter toggle and type tags */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className={cn(
            'shrink-0',
            (filtersExpanded || hasExpandedFilters) && 'bg-gray-100 border-gray-300'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Type tags - horizontal scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Button
            variant={!currentType ? 'default' : 'ghost'}
            size="sm"
            onClick={() => updateFilters({ type: undefined })}
            className={cn(
              'shrink-0 rounded-full',
              !currentType ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-gray-100'
            )}
          >
            All
          </Button>
          {PROVISION_TYPES.map((type) => (
            <Button
              key={type.value}
              variant={currentType === type.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => updateFilters({ type: type.value })}
              className={cn(
                'shrink-0 rounded-full',
                currentType === type.value
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'hover:bg-gray-100'
              )}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Expanded filters section */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          filtersExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={currentSort === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilters({ sort: option.value })}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <div className="flex gap-1">
              <Button
                variant={!currentStatus ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilters({ status: undefined })}
                className="text-xs"
              >
                All
              </Button>
              {PROVISION_STATUSES.map((status) => (
                <Button
                  key={status.value}
                  variant={currentStatus === status.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilters({ status: status.value })}
                  className="text-xs"
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Clear all filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
