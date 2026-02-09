'use client'

import {
  Coins,
  FileText,
  Scale,
  Landmark,
  BarChart3,
  HardHat,
  Tag,
} from 'lucide-react'
import { ProvisionLandscape } from '@/components/provisions/provision-landscape'
import { ProvisionChangeLandscape } from '@/components/provisions/provision-change-landscape'

interface ProvisionsSectionProps {
  entity: { id: string; slug: string }
}

// ── Mock data for wireframing ────────────────────────────────────────

const mockLandscape = {
  total: 54,
  types: [
    { type: 'taxation', icon: Coins, label: 'Taxation', count: 12 },
    { type: 'contract', icon: FileText, label: 'Contracts', count: 8 },
    { type: 'regulation', icon: Scale, label: 'Regulations', count: 15 },
    { type: 'ownership', icon: Landmark, label: 'Ownership', count: 5 },
    { type: 'allocation', icon: BarChart3, label: 'Allocations', count: 7 },
    { type: 'infrastructure', icon: HardHat, label: 'Infrastructure', count: 3 },
    { type: 'designation', icon: Tag, label: 'Designations', count: 4 },
  ],
  topProvisions: [
    { title: 'Piano Urbanistico Generale', type: 'regulation' },
    { title: 'Bilancio Comunale 2025', type: 'allocation' },
    { title: 'Regolamento Edilizio', type: 'regulation' },
    { title: 'Contratto Servizio TPL', type: 'contract' },
    { title: 'TARI - Tariffa Rifiuti', type: 'taxation' },
    { title: 'Area C - Congestion Charge', type: 'taxation' },
  ],
}

const mockChanges = [
  { date: '2 days ago', provisionTitle: 'Zone 30km/h', changeTitle: 'Aggiornamento limiti velocità' },
  { date: '5 days ago', provisionTitle: 'Area C', changeTitle: 'Nuova tariffa parcheggi' },
  { date: '1 week ago', provisionTitle: 'Piano Scuole', changeTitle: 'Piano 2025-2030 approvato' },
  { date: '2 weeks ago', provisionTitle: 'Regolamento dehors', changeTitle: 'Aggiornamento requisiti' },
  { date: '3 weeks ago', provisionTitle: 'TARI', changeTitle: 'Nuove tariffe 2025' },
  { date: '1 month ago', provisionTitle: 'Bilancio Comunale', changeTitle: 'Variazione di bilancio Q1' },
]

const mockCommunity = [
  { id: '1', title: 'Area C - Congestion Charge', comments: 34, reactions: 89, trend: 'hot' as const },
  { id: '2', title: 'Regolamento Affitti Brevi', comments: 22, reactions: 56, trend: 'hot' as const },
  { id: '3', title: 'Piano Parcheggi Residenti', comments: 18, reactions: 41, trend: 'rising' as const },
]

const mockHighlights = [
  { id: '1', title: 'Piano Aria e Clima', reason: 'Recently enriched with new impact data', type: 'regulation' },
  { id: '2', title: 'Regolamento Verde Pubblico', reason: 'New community proposals linked', type: 'regulation' },
]

// ── Section ──────────────────────────────────────────────────────────

export function ProvisionsSection({ entity }: ProvisionsSectionProps) {
  return (
    <div className="space-y-6">

      {/* ─── Block 1: Landscape ─── */}
      <ProvisionLandscape
        total={mockLandscape.total}
        types={mockLandscape.types}
        topProvisions={mockLandscape.topProvisions}
        treeLink={`/pe/${entity.slug}/pr/tree`}
      />

      {/* ─── Block 2: Recent Changes ─── */}
      <ProvisionChangeLandscape
        total={mockChanges.length}
        changes={mockChanges}
      />

      {/* ─── Block 3: Community ─── */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Community</div>
        <div className="flex items-center gap-3 overflow-x-auto">
          {mockCommunity.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5 text-xs shrink-0">
              {p.trend === 'hot' && <span className="px-1 py-0.5 rounded bg-orange-100 text-orange-700 font-medium text-[10px]">hot</span>}
              {p.trend === 'rising' && <span className="px-1 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium text-[10px]">rising</span>}
              <span className="truncate">{p.title}</span>
              <span className="text-muted-foreground">{p.comments}c</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Block 4: Highlights ─── */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">Highlights</div>
        <div className="flex items-center gap-3 overflow-x-auto">
          {mockHighlights.map((h) => (
            <div key={h.id} className="flex items-center gap-1.5 text-xs shrink-0">
              <div className="w-1 h-3 bg-amber-400 rounded-full shrink-0" />
              <span>{h.title}</span>
              <span className="text-muted-foreground truncate">{h.reason}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
