'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCallback, useEffect, useState } from 'react'

const PROVISION_TYPES = [
  { value: 'ownership', label: 'Ownership' },
  { value: 'contract', label: 'Contract' },
  { value: 'regulation', label: 'Regulation' },
  { value: 'taxation', label: 'Taxation' },
  { value: 'allocation', label: 'Allocation' },
  { value: 'designation', label: 'Designation' },
]

const PROVISION_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'repealed', label: 'Repealed' },
  { value: 'suspended', label: 'Suspended' },
]

export function ProvisionsFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')

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

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex gap-3 items-center">
        <Input
          type="text"
          placeholder="Search provisions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Type filters - horizontal chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-700 mr-2">Type:</span>
        <Button
          variant={!currentType ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilters({ type: undefined })}
        >
          All
        </Button>
        {PROVISION_TYPES.map((type) => (
          <Button
            key={type.value}
            variant={currentType === type.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilters({ type: type.value })}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Status filters - horizontal chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
        <Button
          variant={!currentStatus ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilters({ status: undefined })}
        >
          All
        </Button>
        {PROVISION_STATUSES.map((status) => (
          <Button
            key={status.value}
            variant={currentStatus === status.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilters({ status: status.value })}
          >
            {status.label}
          </Button>
        ))}
      </div>

      {/* Sort options */}
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium text-gray-700 mr-2">Sort:</span>
        <Button
          variant={currentSort === 'date-desc' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilters({ sort: 'date-desc' })}
        >
          Newest first
        </Button>
        <Button
          variant={currentSort === 'date-asc' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilters({ sort: 'date-asc' })}
        >
          Oldest first
        </Button>
        <Button
          variant={currentSort === 'title-asc' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateFilters({ sort: 'title-asc' })}
        >
          A-Z
        </Button>
      </div>
    </div>
  )
}
