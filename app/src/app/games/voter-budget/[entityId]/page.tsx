'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  VoterBudgetIntro,
  VoterBudgetInput,
  VoterBudgetResults,
  type CommunityStats,
  type BudgetItem,
  type ExistingItem,
  type UserItem,
  type CommunityItem,
} from '@/components/games/voter-budget'

type GamePhase = 'intro' | 'input' | 'results'

interface Session {
  id: string
  entityId: string
  status: string
}

export default function VoterBudgetPage() {
  const params = useParams<{ entityId: string }>()
  const router = useRouter()
  const entityId = params.entityId

  const [phase, setPhase] = useState<GamePhase>('intro')
  const [cityName, setCityName] = useState<string>('Loading...')
  const [stats, setStats] = useState<CommunityStats | undefined>()
  const [existingItems, setExistingItems] = useState<ExistingItem[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [userItems, setUserItems] = useState<UserItem[]>([])
  const [communityItems, setCommunityItems] = useState<CommunityItem[]>([])
  const [totalParticipants, setTotalParticipants] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch intro data
  useEffect(() => {
    async function fetchIntroData() {
      const res = await fetch(`/api/games/voter-budget/${entityId}`)
      if (!res.ok) return

      const data = await res.json()
      setCityName(data.entityName || 'Your City')
      setStats({
        participants: data.stats?.participants || 0,
        totalInvested: data.stats?.totalInvested || 0,
        topItems: (data.topItems || []).map((item: { text: string; totalAmount: number }) => ({
          text: item.text,
          totalAmount: item.totalAmount,
        })),
      })
      setLoading(false)
    }
    fetchIntroData()
  }, [entityId])

  // Search items for autocomplete
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setExistingItems([])
        return
      }
      const res = await fetch(
        `/api/games/voter-budget/${entityId}/items?q=${encodeURIComponent(query)}`
      )
      if (!res.ok) return

      const data = await res.json()
      setExistingItems(
        data.items.map((item: { id: string; text: string; voteCount: number }) => ({
          id: item.id,
          text: item.text,
          popularity: item.voteCount,
        }))
      )
    },
    [entityId]
  )

  // Start game - create session
  const handleStart = async () => {
    const anonymousId = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

    const res = await fetch(`/api/games/voter-budget/${entityId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonymousId }),
    })
    if (!res.ok) return

    const data = await res.json()
    setSession(data.session)
    setPhase('input')
  }

  // Add vote to API
  const handleAddItem = useCallback(
    async (item: BudgetItem): Promise<BudgetItem> => {
      if (!session) return item

      const res = await fetch(`/api/games/voter-budget/sessions/${session.id}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: item.text,
          notes: item.notes || null,
          amount: item.amount,
        }),
      })

      if (!res.ok) return item

      const data = await res.json()
      return {
        ...item,
        id: data.vote.id,
      }
    },
    [session]
  )

  // Remove vote from API
  const handleRemoveItem = useCallback(
    async (id: string) => {
      if (!session) return

      await fetch(`/api/games/voter-budget/sessions/${session.id}/votes/${id}`, {
        method: 'DELETE',
      })
    },
    [session]
  )

  // Complete session and show results
  const handleComplete = async (items: BudgetItem[]) => {
    if (!session) return

    // Complete the session
    const res = await fetch(`/api/games/voter-budget/sessions/${session.id}/complete`, {
      method: 'POST',
    })
    if (!res.ok) return

    // Save user items for results display
    setUserItems(
      items.map((item) => ({
        text: item.text,
        notes: item.notes,
        amount: item.amount,
      }))
    )

    // Fetch results
    const resultsRes = await fetch(`/api/games/voter-budget/${entityId}/results`)
    if (resultsRes.ok) {
      const data = await resultsRes.json()
      setCommunityItems(data.items)
      setTotalParticipants(data.stats.participants)
    }

    setPhase('results')
  }

  const handleBack = () => {
    if (phase === 'input') {
      setPhase('intro')
    } else if (phase === 'results') {
      setPhase('input')
    } else {
      router.back()
    }
  }

  const handlePlayAgain = () => {
    setSession(null)
    setUserItems([])
    setPhase('intro')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Voter Budget - ${cityName}`,
        text: 'I just voted on my city priorities!',
        url: window.location.href,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <VoterBudgetIntro
        cityName={cityName}
        stats={stats}
        onBack={() => router.back()}
        onStart={handleStart}
      />
    )
  }

  if (phase === 'input') {
    return (
      <VoterBudgetInput
        cityName={cityName}
        existingItems={existingItems}
        onBack={handleBack}
        onComplete={handleComplete}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onSearch={handleSearch}
      />
    )
  }

  return (
    <VoterBudgetResults
      cityName={cityName}
      userItems={userItems}
      communityItems={communityItems}
      totalParticipants={totalParticipants}
      onBack={handleBack}
      onShare={handleShare}
      onPlayAgain={handlePlayAgain}
    />
  )
}
