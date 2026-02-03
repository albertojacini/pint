'use client'

import { cn } from '@/lib/cn'
import { Users, Euro, TrendingUp, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface CommunityStats {
  participants: number
  totalInvested: number
  topItems: {
    text: string
    dimension: 'ideas' | 'likes' | 'dislikes'
    totalAmount: number
  }[]
}

interface VoterBudgetIntroProps {
  cityName?: string
  stats?: CommunityStats
  onBack?: () => void
  onStart?: () => void
}

const defaultStats: CommunityStats = {
  participants: 847,
  totalInvested: 84700,
  topItems: [
    { text: 'More bike lanes in the center', dimension: 'ideas', totalAmount: 4250 },
    { text: 'Public parks', dimension: 'likes', totalAmount: 3800 },
    { text: 'Traffic congestion', dimension: 'dislikes', totalAmount: 3420 },
    { text: 'Free public transport for students', dimension: 'ideas', totalAmount: 2890 },
    { text: 'Night metro service', dimension: 'ideas', totalAmount: 2540 },
  ],
}

const dimensionColors = {
  ideas: 'bg-amber-100 text-amber-700',
  likes: 'bg-emerald-100 text-emerald-700',
  dislikes: 'bg-rose-100 text-rose-700',
}

const dimensionLabels = {
  ideas: 'Idea',
  likes: 'Like',
  dislikes: 'Dislike',
}

export function VoterBudgetIntro({
  cityName = 'Comune di Milano',
  stats = defaultStats,
  onBack,
  onStart,
}: VoterBudgetIntroProps) {
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

      {/* Main content */}
      <div className="flex-1 px-4 py-6 flex flex-col">
        {/* Explanation */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            You have €100
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto">
            Invest in ideas you want to see, things you appreciate, and things you'd change about your city.
          </p>
        </div>

        {/* Community Stats */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Community so far</span>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 text-center p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-lg font-bold text-slate-900 tabular-nums">
                  {stats.participants.toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-slate-500">participants</span>
            </div>
            <div className="flex-1 text-center p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Euro className="w-4 h-4 text-slate-400" />
                <span className="text-lg font-bold text-slate-900 tabular-nums">
                  {(stats.totalInvested / 1000).toFixed(0)}k
                </span>
              </div>
              <span className="text-xs text-slate-500">invested</span>
            </div>
          </div>

          {/* Top items */}
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-400 mb-2">Trending</p>
            <div className="space-y-2">
              {stats.topItems.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-4 tabular-nums">{i + 1}</span>
                  <span className="flex-1 text-sm text-slate-700 truncate">{item.text}</span>
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded font-medium',
                    dimensionColors[item.dimension]
                  )}>
                    {dimensionLabels[item.dimension]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <Button
          onClick={onStart}
          className="w-full h-14 text-lg font-semibold rounded-xl"
        >
          Start
        </Button>

        <p className="text-center text-xs text-slate-400 mt-3">
          Takes about 2 minutes
        </p>
      </div>
    </div>
  )
}
