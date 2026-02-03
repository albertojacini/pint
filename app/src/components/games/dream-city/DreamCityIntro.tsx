'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Lightbulb, Heart, ThumbsDown, Users, Euro, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type DreamDimension = 'ideas' | 'likes' | 'dislikes'

interface DimensionInfo {
  id: DreamDimension
  title: string
  description: string
  hint?: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

const dimensions: DimensionInfo[] = [
  {
    id: 'ideas',
    title: 'Ideas',
    description: 'What would you love to see in your city?',
    hint: 'Seen something great elsewhere? Steal it!',
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'likes',
    title: 'Likes',
    description: 'What do you appreciate about your city?',
    icon: <Heart className="w-6 h-6" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'dislikes',
    title: 'Dislikes',
    description: 'What would you change or remove?',
    icon: <ThumbsDown className="w-6 h-6" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
]

export interface CommunityStats {
  participants: number
  totalInvested: number
  topIdeas: string[]
}

interface DreamCityIntroProps {
  cityName?: string
  stats?: CommunityStats
  onStart?: (dimension: DreamDimension) => void
}

const defaultStats: CommunityStats = {
  participants: 847,
  totalInvested: 84700,
  topIdeas: [
    'More bike lanes in the center',
    'Free public transport for students',
    '24h metro on weekends',
  ],
}

export function DreamCityIntro({
  cityName = 'Comune di Milano',
  stats = defaultStats,
  onStart,
}: DreamCityIntroProps) {
  const [selectedDimension, setSelectedDimension] = useState<DreamDimension | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-200 rounded-full text-sm text-slate-600 mb-4">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          {cityName}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Design Your Dream City
        </h1>
        <p className="text-slate-600 max-w-xs mx-auto">
          Share your vision for a better city. What would you keep, change, or create?
        </p>
      </div>

      {/* Dimensions List */}
      <div className="flex flex-col gap-3 mb-8">
        {dimensions.map((dim) => (
          <button
            key={dim.id}
            onClick={() => setSelectedDimension(dim.id)}
            className={cn(
              'flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
              'hover:scale-[1.01] active:scale-[0.99]',
              selectedDimension === dim.id
                ? `${dim.bgColor} ${dim.borderColor} ${dim.color}`
                : 'bg-white border-slate-200 hover:border-slate-300'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                dim.bgColor,
                dim.color
              )}
            >
              {dim.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-slate-900 block mb-0.5">
                {dim.title}
              </span>
              <span className="text-sm text-slate-500 block leading-snug">
                {dim.description}
              </span>
              {dim.hint && (
                <span className="text-xs text-slate-400 block mt-1 italic">
                  {dim.hint}
                </span>
              )}
            </div>
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 shrink-0 transition-all',
                selectedDimension === dim.id
                  ? `${dim.borderColor} bg-current`
                  : 'border-slate-300'
              )}
            />
          </button>
        ))}
      </div>

      {/* Community Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Community so far</span>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 text-center p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xl font-bold text-slate-900">{stats.participants.toLocaleString()}</span>
            </div>
            <span className="text-xs text-slate-500">participants</span>
          </div>
          <div className="flex-1 text-center p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Euro className="w-4 h-4 text-slate-400" />
              <span className="text-xl font-bold text-slate-900">{(stats.totalInvested / 1000).toFixed(0)}k</span>
            </div>
            <span className="text-xs text-slate-500">invested</span>
          </div>
        </div>

        {/* Top ideas preview */}
        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-400 mb-2">Popular ideas</p>
          <div className="space-y-1.5">
            {stats.topIdeas.slice(0, 3).map((idea, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <span className="truncate">{idea}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={() => selectedDimension && onStart?.(selectedDimension)}
        className="w-full h-14 text-lg font-semibold rounded-xl"
        disabled={!selectedDimension}
      >
        {selectedDimension ? 'Start Building' : 'Select a dimension to start'}
      </Button>

      {/* Footer hint */}
      <p className="text-center text-xs text-slate-400 mt-4">
        Takes about 2 minutes • Your ideas help shape real policies
      </p>
    </div>
  )
}
