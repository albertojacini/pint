'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Search, Filter } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string | null
  type: string
  date: string
}

interface EventsClientProps {
  events: Event[]
}

export function EventsClient({ events }: EventsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique event types
  const eventTypes = useMemo(() => {
    const types = new Set(events.map(e => e.type))
    return Array.from(types).sort()
  }, [events])

  // Get unique years
  const years = useMemo(() => {
    const yearSet = new Set(events.map(e => new Date(e.date).getFullYear()))
    return Array.from(yearSet).sort((a, b) => b - a)
  }, [events])

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = event.title.toLowerCase().includes(query)
        const matchesDescription = event.description?.toLowerCase().includes(query) || false
        if (!matchesTitle && !matchesDescription) return false
      }

      if (selectedType !== 'all' && event.type !== selectedType) {
        return false
      }

      if (selectedYear !== 'all') {
        const eventYear = new Date(event.date).getFullYear()
        if (eventYear !== parseInt(selectedYear)) return false
      }

      return true
    })
  }, [events, searchQuery, selectedType, selectedYear])

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
            className="text-sm text-link hover:underline md:hidden"
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
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>

          {/* Clear filters */}
          {(searchQuery || selectedType !== 'all' || selectedYear !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedType('all')
                setSelectedYear('all')
              }}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
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
                    {format(new Date(event.date), 'PPP')}
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
