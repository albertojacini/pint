'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Search, Filter } from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description: string | null
  type: string
  createdAt: Date
  administrationId: string | null
  administrationName: string | null
}

interface Administration {
  id: string
  name: string
}

interface EventsClientProps {
  events: Event[]
  administrations: Administration[]
}

export function EventsClient({ events, administrations }: EventsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedAdministration, setSelectedAdministration] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique event types
  const eventTypes = useMemo(() => {
    const types = new Set(events.map(e => e.type))
    return Array.from(types).sort()
  }, [events])

  // Get unique years
  const years = useMemo(() => {
    const yearSet = new Set(events.map(e => new Date(e.createdAt).getFullYear()))
    return Array.from(yearSet).sort((a, b) => b - a) // Descending order
  }, [events])

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = event.title.toLowerCase().includes(query)
        const matchesDescription = event.description?.toLowerCase().includes(query) || false
        if (!matchesTitle && !matchesDescription) return false
      }

      // Type filter
      if (selectedType !== 'all' && event.type !== selectedType) {
        return false
      }

      // Year filter
      if (selectedYear !== 'all') {
        const eventYear = new Date(event.createdAt).getFullYear()
        if (eventYear !== parseInt(selectedYear)) return false
      }

      // Administration filter
      if (selectedAdministration !== 'all') {
        if (selectedAdministration === 'none') {
          if (event.administrationId !== null) return false
        } else {
          if (event.administrationId !== selectedAdministration) return false
        }
      }

      return true
    })
  }, [events, searchQuery, selectedType, selectedYear, selectedAdministration])

  return (
    <>
      {/* Filters Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Filters</h2>
            <Badge variant="secondary">{filteredEvents.length} events</Badge>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-blue-600 hover:underline md:hidden"
          >
            {showFilters ? 'Hide' : 'Show'} filters
          </button>
        </div>

        <div className={`space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter controls */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Event Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All types</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All years</option>
                {years.map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>

            {/* Administration Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Administration
              </label>
              <select
                value={selectedAdministration}
                onChange={(e) => setSelectedAdministration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All administrations</option>
                <option value="none">No administration</option>
                {administrations.map(admin => (
                  <option key={admin.id} value={admin.id}>{admin.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear filters */}
          {(searchQuery || selectedType !== 'all' || selectedYear !== 'all' || selectedAdministration !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedType('all')
                setSelectedYear('all')
                setSelectedAdministration('all')
              }}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Events List - Blog Style */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs font-mono">EVENT</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm whitespace-nowrap">
                    {format(new Date(event.createdAt), 'PPP')}
                  </CardDescription>
                </div>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {event.description && (
                  <p className="text-base text-gray-700 mb-4 leading-relaxed">
                    {event.description}
                  </p>
                )}

                {event.administrationName && event.administrationId && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-sm">
                      <span className="text-gray-500">Administration: </span>
                      <Link
                        href={`/administrations/${event.administrationId}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {event.administrationName}
                      </Link>
                    </div>
                  </div>
                )}

                {!event.administrationName && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Independent event (no administration)
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500">No events match your filters.</p>
        </div>
      )}
    </>
  )
}
