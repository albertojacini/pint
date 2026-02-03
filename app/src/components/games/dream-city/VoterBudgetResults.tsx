'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Lightbulb, Heart, ThumbsDown, Euro, ChevronLeft, Share2, RotateCcw, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type Dimension = 'ideas' | 'likes' | 'dislikes'

export interface UserItem {
  text: string
  dimension: Dimension
  notes: string
  amount: number
}

export interface CommunityItem {
  id: string
  text: string
  dimension: Dimension
  totalAmount: number
  voterCount: number
}

interface DimensionConfig {
  id: Dimension
  title: string
  icon: React.ReactNode
  color: string
  bgColor: string
  barColor: string
}

const dimensionConfigs: Record<Dimension, DimensionConfig> = {
  ideas: {
    id: 'ideas',
    title: 'Ideas',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    barColor: 'bg-amber-400',
  },
  likes: {
    id: 'likes',
    title: 'Likes',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    barColor: 'bg-emerald-400',
  },
  dislikes: {
    id: 'dislikes',
    title: 'Dislikes',
    icon: <ThumbsDown className="w-5 h-5" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    barColor: 'bg-rose-400',
  },
}

interface VoterBudgetResultsProps {
  cityName?: string
  userItems: UserItem[]
  communityItems: CommunityItem[]
  totalParticipants: number
  onBack?: () => void
  onShare?: () => void
  onPlayAgain?: () => void
}

export function VoterBudgetResults({
  cityName = 'Comune di Milano',
  userItems,
  communityItems,
  totalParticipants,
  onBack,
  onShare,
  onPlayAgain,
}: VoterBudgetResultsProps) {
  const [activeTab, setActiveTab] = useState<'you' | 'community'>('community')
  const [activeDimension, setActiveDimension] = useState<Dimension | 'all'>('all')

  const userSpentByDimension = {
    ideas: userItems.filter((i) => i.dimension === 'ideas').reduce((sum, i) => sum + i.amount, 0),
    likes: userItems.filter((i) => i.dimension === 'likes').reduce((sum, i) => sum + i.amount, 0),
    dislikes: userItems.filter((i) => i.dimension === 'dislikes').reduce((sum, i) => sum + i.amount, 0),
  }

  const filteredCommunityItems = activeDimension === 'all'
    ? communityItems
    : communityItems.filter((i) => i.dimension === activeDimension)

  const topCommunityItems = [...filteredCommunityItems]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10)

  const maxAmount = topCommunityItems[0]?.totalAmount || 1

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

      {/* Summary Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-slate-900">Results</h1>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Users className="w-4 h-4" />
            <span>{totalParticipants.toLocaleString()} participants</span>
          </div>
        </div>

        {/* Your allocation bar */}
        <div className="mb-2">
          <p className="text-xs text-slate-500 mb-1">Your allocation</p>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
            {userSpentByDimension.ideas > 0 && (
              <div
                className="h-full bg-amber-400"
                style={{ width: `${(userSpentByDimension.ideas / 100) * 100}%` }}
              />
            )}
            {userSpentByDimension.likes > 0 && (
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${(userSpentByDimension.likes / 100) * 100}%` }}
              />
            )}
            {userSpentByDimension.dislikes > 0 && (
              <div
                className="h-full bg-rose-400"
                style={{ width: `${(userSpentByDimension.dislikes / 100) * 100}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5">
            <div className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-600">€{userSpentByDimension.ideas} ideas</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-600">€{userSpentByDimension.likes} likes</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-slate-600">€{userSpentByDimension.dislikes} dislikes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: You / Community */}
      <div className="flex bg-white border-b border-slate-200">
        <button
          onClick={() => setActiveTab('community')}
          className={cn(
            'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'community'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          Community
        </button>
        <button
          onClick={() => setActiveTab('you')}
          className={cn(
            'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'you'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          Your Choices
        </button>
      </div>

      {/* Dimension Filter (for Community tab) */}
      {activeTab === 'community' && (
        <div className="flex gap-2 px-4 py-3 bg-white border-b border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveDimension('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeDimension === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            All
          </button>
          {Object.values(dimensionConfigs).map((dim) => (
            <button
              key={dim.id}
              onClick={() => setActiveDimension(dim.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                activeDimension === dim.id
                  ? `${dim.bgColor} ${dim.color}`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {dim.icon}
              {dim.title}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {activeTab === 'community' ? (
          <div className="space-y-2">
            {topCommunityItems.map((item, index) => {
              const config = dimensionConfigs[item.dimension]
              const barWidth = (item.totalAmount / maxAmount) * 100
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-sm text-slate-400 w-5 tabular-nums">{index + 1}</span>
                    <div className={cn('p-1.5 rounded-lg', config.bgColor, config.color)}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-900 font-medium">{item.text}</span>
                    </div>
                  </div>
                  <div className="ml-8">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                      <div
                        className={cn('h-full rounded-full transition-all', config.barColor)}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Euro className="w-3 h-3" />
                        {item.totalAmount.toLocaleString()}
                      </span>
                      <span>{item.voterCount} voters · €{Math.round(item.totalAmount / item.voterCount)} avg</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {userItems.map((item, index) => {
              const config = dimensionConfigs[item.dimension]
              return (
                <div
                  key={index}
                  className={cn(
                    'bg-white rounded-xl border p-3',
                    config.bgColor.replace('bg-', 'border-').replace('-50', '-200')
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('p-1.5 rounded-lg', config.bgColor, config.color)}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-900 font-medium">{item.text}</span>
                      {item.notes && (
                        <p className="text-sm text-slate-500 mt-0.5">{item.notes}</p>
                      )}
                    </div>
                    <span className="font-semibold text-slate-700 tabular-nums">€{item.amount}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-slate-200 px-4 py-4 flex gap-3">
        <Button
          onClick={onShare}
          variant="outline"
          className="flex-1 h-12 rounded-xl"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button
          onClick={onPlayAgain}
          className="flex-1 h-12 rounded-xl"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Play Again
        </Button>
      </div>
    </div>
  )
}
