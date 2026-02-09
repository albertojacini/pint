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
  { id: '1', title: 'Aggiornamento Zone 30km/h', action: 'updated' as const, type: 'regulation', date: '2 days ago', relevance: 8 },
  { id: '2', title: 'Nuova tariffa parcheggi Area C', action: 'created' as const, type: 'taxation', date: '5 days ago', relevance: 7 },
  { id: '3', title: 'Piano Scuole 2025-2030', action: 'created' as const, type: 'allocation', date: '1 week ago', relevance: 6 },
  { id: '4', title: 'Regolamento dehors', action: 'updated' as const, type: 'regulation', date: '2 weeks ago', relevance: 5 },
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

// ── Wireframe components ─────────────────────────────────────────────

function WireframeBox({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`border border-dashed border-muted-foreground/30 rounded-lg p-4 ${className}`}>{children}</div>
}

function BlockLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground/60 mb-3">{children}</div>
}

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
      <WireframeBox>
        <BlockLabel>2 · Changes — "What's happening?"</BlockLabel>

        <div className="space-y-1">
          {mockChanges.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-muted/40 transition-colors cursor-pointer">
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                c.action === 'created' ? 'bg-green-100 text-green-700' :
                c.action === 'updated' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {c.action}
              </span>
              <span className="text-sm">{c.title}</span>
              <span className="text-xs text-muted-foreground ml-auto">{c.date}</span>
            </div>
          ))}
        </div>
      </WireframeBox>

      {/* ─── Block 3: Community ─── */}
      <WireframeBox>
        <BlockLabel>3 · Community — "What are people discussing?"</BlockLabel>

        <div className="space-y-1">
          {mockCommunity.map((p) => (
            <div key={p.id} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-muted/40 transition-colors cursor-pointer">
              {p.trend === 'hot' && <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-medium">hot</span>}
              {p.trend === 'rising' && <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">rising</span>}
              <span className="text-sm">{p.title}</span>
              <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
                <span>💬 {p.comments}</span>
                <span>👍 {p.reactions}</span>
              </div>
            </div>
          ))}
        </div>
      </WireframeBox>

      {/* ─── Block 4: Highlights ─── */}
      <WireframeBox>
        <BlockLabel>4 · Highlights — "What's noteworthy?"</BlockLabel>

        <div className="space-y-2">
          {mockHighlights.map((h) => (
            <div key={h.id} className="flex items-start gap-3 py-2 px-2 rounded hover:bg-muted/40 transition-colors cursor-pointer">
              <div className="w-1 h-8 bg-amber-400 rounded-full shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium">{h.title}</div>
                <div className="text-xs text-muted-foreground">{h.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </WireframeBox>

    </div>
  )
}
