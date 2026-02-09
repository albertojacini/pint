'use client'

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Heart, Star, ThumbsUp, Bookmark, Grid, List, LayoutGrid,
  GitBranch, ArrowRight, ExternalLink, Sparkles, Telescope, Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  LoadingButton,
  IconButton,
  ButtonGroup,
  ToggleButtonGroup,
} from './buttons'

const meta: Meta = {
  title: 'Custom-UI/ButtonsExperiments',
  parameters: {
    layout: 'padded',
  },
}

export default meta

// Base experiment - playground for button variations
function ButtonsPlayground() {
  const [loading, setLoading] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set(['active']))
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid')
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const handleAsyncAction = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
  }

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev)
      if (next.has(filter)) {
        next.delete(filter)
      } else {
        next.add(filter)
      }
      return next
    })
  }

  const filters = ['active', 'pending', 'completed', 'archived']

  return (
    <div className="space-y-8">
      {/* Loading Button Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Loading States</h3>
        <div className="flex gap-4 items-center">
          <LoadingButton loading={loading} loadingText="Processing..." onClick={handleAsyncAction}>
            Submit Form
          </LoadingButton>
          <LoadingButton loading={loading} variant="outline" onClick={handleAsyncAction}>
            Save Draft
          </LoadingButton>
          <LoadingButton loading={loading} variant="secondary" onClick={handleAsyncAction}>
            Update
          </LoadingButton>
        </div>
      </section>

      {/* Interactive Icon Buttons */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Interactive Actions</h3>
        <div className="flex gap-2 items-center">
          <IconButton
            icon={<Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />}
            onClick={() => setLiked(!liked)}
          />
          <IconButton
            icon={<Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />}
            onClick={() => setBookmarked(!bookmarked)}
          />
          <IconButton icon={<ThumbsUp className="h-4 w-4" />} label="123" />
          <IconButton icon={<Star className="h-4 w-4" />} label="Rate" />
        </div>
      </section>

      {/* Filter Buttons Section - Original Pill Style */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Filter Variants</h3>

        {/* Variant 1: Pill (Original) */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Pill (rounded-full)</p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  flex items-center gap-2
                  ${selectedFilters.has(filter)
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                <span className={`w-2 h-2 rounded-full ${
                  filter === 'active' ? 'bg-green-500' :
                  filter === 'pending' ? 'bg-yellow-500' :
                  filter === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Variant 2: Squared */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Squared (rounded-md)</p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  flex items-center gap-2
                  ${selectedFilters.has(filter)
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                <span className={`w-2 h-2 rounded-sm ${
                  filter === 'active' ? 'bg-green-500' :
                  filter === 'pending' ? 'bg-yellow-500' :
                  filter === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Variant 3: Sharp corners */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Sharp (no rounding)</p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`
                  px-3 py-1.5 text-sm font-medium transition-all
                  flex items-center gap-2
                  ${selectedFilters.has(filter)
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Variant 4: Outlined Pill */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Outlined Pill</p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  flex items-center gap-2 border
                  ${selectedFilters.has(filter)
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-transparent text-muted-foreground hover:border-foreground/50'
                  }
                `}
              >
                <span className={`w-2 h-2 rounded-full ${
                  filter === 'active' ? 'bg-green-500' :
                  filter === 'pending' ? 'bg-yellow-500' :
                  filter === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Variant 5: Outlined Squared */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Outlined Squared</p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  flex items-center gap-2 border
                  ${selectedFilters.has(filter)
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-transparent text-muted-foreground hover:border-foreground/50'
                  }
                `}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Variant 6: Left Border Accent */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Left Border Accent</p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`
                  px-3 py-1.5 text-sm font-medium transition-all
                  flex items-center gap-2 border-l-2
                  ${selectedFilters.has(filter)
                    ? `bg-muted ${
                        filter === 'active' ? 'border-l-green-500' :
                        filter === 'pending' ? 'border-l-yellow-500' :
                        filter === 'completed' ? 'border-l-blue-500' : 'border-l-gray-500'
                      } text-foreground`
                    : 'border-l-transparent bg-transparent text-muted-foreground hover:bg-muted/50'
                  }
                `}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Variant 7: Underline Style */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Underline</p>
          <div className="flex flex-wrap gap-4">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`
                  px-1 py-1.5 text-sm font-medium transition-all
                  border-b-2
                  ${selectedFilters.has(filter)
                    ? 'border-b-foreground text-foreground'
                    : 'border-b-transparent text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Variant 8: Colored Underline */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Colored Underline</p>
          <div className="flex flex-wrap gap-4">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`
                  px-1 py-1.5 text-sm font-medium transition-all
                  border-b-2
                  ${selectedFilters.has(filter)
                    ? `text-foreground ${
                        filter === 'active' ? 'border-b-green-500' :
                        filter === 'pending' ? 'border-b-yellow-500' :
                        filter === 'completed' ? 'border-b-blue-500' : 'border-b-gray-500'
                      }`
                    : 'border-b-transparent text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Variant 9: Ghost with colored text */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Ghost Colored</p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${selectedFilters.has(filter)
                    ? `${
                        filter === 'active' ? 'bg-green-500/10 text-green-600' :
                        filter === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                        filter === 'completed' ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-500/10 text-gray-600'
                      }`
                    : 'bg-transparent text-muted-foreground hover:bg-muted'
                  }
                `}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Variant 10: Outlined with colored border */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Outlined Colored</p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-all border
                  ${selectedFilters.has(filter)
                    ? `${
                        filter === 'active' ? 'border-green-500 bg-green-500/10 text-green-600' :
                        filter === 'pending' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-600' :
                        filter === 'completed' ? 'border-blue-500 bg-blue-500/10 text-blue-600' : 'border-gray-500 bg-gray-500/10 text-gray-600'
                      }`
                    : 'border-border bg-transparent text-muted-foreground hover:border-muted-foreground'
                  }
                `}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Variant 11: Compact Tags - Multiple Sub-variants */}
        <div className="mb-6 p-4 border border-border rounded-lg">
          <p className="text-sm font-semibold mb-4">Compact Tags Variants</p>

          {/* 11a: Basic Compact */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Basic</p>
            <div className="flex flex-wrap gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    px-2 py-0.5 rounded text-xs font-medium transition-all
                    ${selectedFilters.has(filter)
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 11b: Compact with Left Dot */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">With Left Dot</p>
            <div className="flex flex-wrap gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    px-2 py-0.5 rounded text-xs font-medium transition-all
                    flex items-center gap-1.5
                    ${selectedFilters.has(filter)
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    filter === 'active' ? 'bg-green-500' :
                    filter === 'pending' ? 'bg-yellow-500' :
                    filter === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
                  } ${selectedFilters.has(filter) ? 'opacity-80' : ''}`} />
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 11c: Compact Outlined */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Outlined</p>
            <div className="flex flex-wrap gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    px-2 py-0.5 rounded text-xs font-medium transition-all border
                    ${selectedFilters.has(filter)
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-transparent text-muted-foreground hover:border-muted-foreground'
                    }
                  `}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 11d: Compact Outlined with Dot */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Outlined with Dot</p>
            <div className="flex flex-wrap gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    px-2 py-0.5 rounded text-xs font-medium transition-all border
                    flex items-center gap-1.5
                    ${selectedFilters.has(filter)
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-transparent text-muted-foreground hover:border-muted-foreground'
                    }
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    filter === 'active' ? 'bg-green-500' :
                    filter === 'pending' ? 'bg-yellow-500' :
                    filter === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
                  } ${selectedFilters.has(filter) ? 'opacity-80' : ''}`} />
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 11e: Compact Colored Background */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Colored Background</p>
            <div className="flex flex-wrap gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    px-2 py-0.5 rounded text-xs font-medium transition-all
                    ${selectedFilters.has(filter)
                      ? `${
                          filter === 'active' ? 'bg-green-500 text-white' :
                          filter === 'pending' ? 'bg-yellow-500 text-white' :
                          filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                        }`
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 11f: Compact Soft Colored */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Soft Colored</p>
            <div className="flex flex-wrap gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    px-2 py-0.5 rounded text-xs font-medium transition-all
                    ${selectedFilters.has(filter)
                      ? `${
                          filter === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          filter === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          filter === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 11g: Compact Soft Colored with Dot */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Soft Colored with Dot</p>
            <div className="flex flex-wrap gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    px-2 py-0.5 rounded text-xs font-medium transition-all
                    flex items-center gap-1.5
                    ${selectedFilters.has(filter)
                      ? `${
                          filter === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          filter === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          filter === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    filter === 'active' ? 'bg-green-500' :
                    filter === 'pending' ? 'bg-yellow-500' :
                    filter === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 11h: Compact Outlined Colored */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Outlined Colored</p>
            <div className="flex flex-wrap gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    px-2 py-0.5 rounded text-xs font-medium transition-all border
                    ${selectedFilters.has(filter)
                      ? `${
                          filter === 'active' ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' :
                          filter === 'pending' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' :
                          filter === 'completed' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'border-gray-500 bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                        }`
                      : 'border-border bg-transparent text-muted-foreground hover:border-muted-foreground'
                    }
                  `}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 11i: Compact Outlined Colored with Dot */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Outlined Colored with Dot</p>
            <div className="flex flex-wrap gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    px-2 py-0.5 rounded text-xs font-medium transition-all border
                    flex items-center gap-1.5
                    ${selectedFilters.has(filter)
                      ? `${
                          filter === 'active' ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' :
                          filter === 'pending' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' :
                          filter === 'completed' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'border-gray-500 bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                        }`
                      : 'border-border bg-transparent text-muted-foreground hover:border-muted-foreground'
                    }
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    filter === 'active' ? 'bg-green-500' :
                    filter === 'pending' ? 'bg-yellow-500' :
                    filter === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 11j: Compact Pill Shape */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Pill Shape with Dot</p>
            <div className="flex flex-wrap gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    px-2 py-0.5 rounded-full text-xs font-medium transition-all
                    flex items-center gap-1.5
                    ${selectedFilters.has(filter)
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    filter === 'active' ? 'bg-green-500' :
                    filter === 'pending' ? 'bg-yellow-500' :
                    filter === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
                  } ${selectedFilters.has(filter) ? 'opacity-80' : ''}`} />
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 11k: Compact Pill Outlined with Dot */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Pill Outlined with Dot</p>
            <div className="flex flex-wrap gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    px-2 py-0.5 rounded-full text-xs font-medium transition-all border
                    flex items-center gap-1.5
                    ${selectedFilters.has(filter)
                      ? `${
                          filter === 'active' ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' :
                          filter === 'pending' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' :
                          filter === 'completed' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'border-gray-500 bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                        }`
                      : 'border-border bg-transparent text-muted-foreground hover:border-muted-foreground'
                    }
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    filter === 'active' ? 'bg-green-500' :
                    filter === 'pending' ? 'bg-yellow-500' :
                    filter === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 11l: Squared - No border unselected, 1px black border selected */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Squared - Black Border on Select</p>
            <div className="flex flex-wrap gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    px-2 py-0.5 rounded text-xs font-medium transition-all
                    flex items-center gap-1.5
                    ${selectedFilters.has(filter)
                      ? 'bg-muted text-foreground border border-black dark:border-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground border border-transparent'
                    }
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    filter === 'active' ? 'bg-green-500' :
                    filter === 'pending' ? 'bg-yellow-500' :
                    filter === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 11m: No background, no rounding, no dot - just border on select */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">No Background, No Dot - Border on Select</p>
            <div className="flex flex-wrap gap-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`
                    px-2 py-0.5 rounded-sm text-xs font-medium transition-all
                    ${selectedFilters.has(filter)
                      ? 'text-foreground border border-black dark:border-white'
                      : 'text-muted-foreground hover:text-foreground border border-transparent'
                    }
                  `}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Variant 12: Large Buttons */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Large</p>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`
                  px-4 py-2.5 rounded-lg text-base font-medium transition-all
                  flex items-center gap-2 border
                  ${selectedFilters.has(filter)
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-transparent text-muted-foreground hover:border-foreground/50'
                  }
                `}
              >
                <span className={`w-3 h-3 rounded-full ${
                  filter === 'active' ? 'bg-green-500' :
                  filter === 'pending' ? 'bg-yellow-500' :
                  filter === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Selected: {Array.from(selectedFilters).join(', ') || 'none'}
        </p>
      </section>

      {/* Button Groups */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Grouped Actions</h3>
        <div className="flex gap-6">
          <ButtonGroup>
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Today
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </ButtonGroup>

          <ButtonGroup>
            <Button variant="outline" size="sm">
              Day
            </Button>
            <Button variant="outline" size="sm">
              Week
            </Button>
            <Button variant="outline" size="sm">
              Month
            </Button>
            <Button variant="outline" size="sm">
              Year
            </Button>
          </ButtonGroup>
        </div>
      </section>

      {/* Toggle Button Group */}
      <section>
        <h3 className="text-lg font-semibold mb-4">View Mode Toggle</h3>
        <ToggleButtonGroup
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'grid', label: 'Grid', icon: <Grid className="h-4 w-4" /> },
            { value: 'list', label: 'List', icon: <List className="h-4 w-4" /> },
            { value: 'compact', label: 'Compact', icon: <LayoutGrid className="h-4 w-4" /> },
          ]}
        />
        <p className="text-sm text-muted-foreground mt-2">Current view: {viewMode}</p>
      </section>
    </div>
  )
}

export const Base: StoryObj = {
  render: () => <ButtonsPlayground />,
}

// ── Special Buttons ──────────────────────────────────────────────────

const specialButtons = [
  { label: 'View tree', icon: GitBranch },
  { label: 'Explore', icon: Telescope },
  { label: 'View all', icon: ArrowRight },
  { label: 'Open source', icon: ExternalLink },
  { label: 'New provision', icon: Plus },
  { label: 'AI summary', icon: Sparkles },
]

function SpecialButtonsPlayground() {
  return (
    <div className="space-y-10">
      {/* 1: Outlined — border + bg on hover */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Outlined</p>
        <div className="flex flex-wrap gap-2">
          {specialButtons.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* 2: Ghost — no border, bg on hover */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Ghost</p>
        <div className="flex flex-wrap gap-2">
          {specialButtons.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* 3: Soft — muted bg, no border */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Soft</p>
        <div className="flex flex-wrap gap-2">
          {specialButtons.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-muted/60 hover:bg-muted transition-colors"
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* 4: Pill outlined */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Pill outlined</p>
        <div className="flex flex-wrap gap-2">
          {specialButtons.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-border bg-background hover:bg-muted transition-colors"
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* 5: Pill soft */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Pill soft</p>
        <div className="flex flex-wrap gap-2">
          {specialButtons.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-muted/60 hover:bg-muted transition-colors"
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* 6: Solid dark */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Solid dark</p>
        <div className="flex flex-wrap gap-2">
          {specialButtons.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-foreground text-background hover:bg-foreground/80 transition-colors"
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* 7: Underline ghost — icon + text, underline on hover */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Underline ghost</p>
        <div className="flex flex-wrap gap-3">
          {specialButtons.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors"
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* 8: Icon trailing — label first, icon after */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Icon trailing (outlined)</p>
        <div className="flex flex-wrap gap-2">
          {specialButtons.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-border bg-background hover:bg-muted transition-colors"
            >
              {label}
              <Icon className="w-3 h-3 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      {/* Size comparison — same style, 3 sizes */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">Size comparison (outlined)</p>
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded border border-border bg-background hover:bg-muted transition-colors">
            <GitBranch className="w-2.5 h-2.5" />
            View tree
          </button>
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-border bg-background hover:bg-muted transition-colors">
            <GitBranch className="w-3 h-3" />
            View tree
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded border border-border bg-background hover:bg-muted transition-colors">
            <GitBranch className="w-3.5 h-3.5" />
            View tree
          </button>
        </div>
      </section>
    </div>
  )
}

export const SpecialButtons: StoryObj = {
  render: () => <SpecialButtonsPlayground />,
}
