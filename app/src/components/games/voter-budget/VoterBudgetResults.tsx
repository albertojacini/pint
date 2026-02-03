'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Euro, ChevronLeft, Share2, RotateCcw, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface UserItem {
  text: string
  notes: string
  amount: number
}

export interface CommunityItem {
  id: string
  text: string
  totalAmount: number
  voterCount: number
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

  const userTotalSpent = userItems.reduce((sum, i) => sum + i.amount, 0)

  const topCommunityItems = [...communityItems]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 15)

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

        {/* Your allocation summary */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>You invested</span>
          <span className="font-semibold text-slate-900">€{userTotalSpent}</span>
          <span>across</span>
          <span className="font-semibold text-slate-900">{userItems.length} priorities</span>
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
          Community Rankings
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

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {activeTab === 'community' ? (
          <div className="space-y-2">
            {topCommunityItems.map((item, index) => {
              const barWidth = (item.totalAmount / maxAmount) * 100
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-sm text-slate-400 w-5 tabular-nums">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-900 font-medium">{item.text}</span>
                    </div>
                  </div>
                  <div className="ml-8">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
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
            {topCommunityItems.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No community data yet</p>
                <p className="text-xs mt-1">Be the first to vote!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {userItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-900 font-medium">{item.text}</span>
                    {item.notes && (
                      <p className="text-sm text-slate-500 mt-0.5">{item.notes}</p>
                    )}
                  </div>
                  <span className="font-semibold text-slate-700 tabular-nums">€{item.amount}</span>
                </div>
              </div>
            ))}
            {userItems.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No choices recorded</p>
              </div>
            )}
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
