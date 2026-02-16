import type { Meta, StoryObj } from '@storybook/react'
import { ProvisionCard, ProvisionCardExtraSmall } from './provision-cards'

const meta: Meta = {
  title: 'Provisions/ProvisionCards',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta

const mockEntity = { id: 'ent_milan_123', slug: 'milan' }

const sampleProvision = {
  id: 'prv_area_c_001',
  slug: 'area-c-congestion-charge',
  title: 'Area C - Congestion Charge',
  tagline: 'Daily access charge for vehicles entering the central restricted traffic zone of Milan.',
  avatarUrl: null,
  types: [
    { id: 'pt_1', code: 'taxation', label: 'Taxation', description: null, icon: null, color: null },
    { id: 'pt_2', code: 'regulation', label: 'Regulation', description: null, icon: null, color: null },
  ],
  status: 'active',
  relevance: 8,
  ideaId: null,
  ideaTitle: null,
  highlights: {
    items: [
      { label: 'Daily charge', value: '€7.50' },
      { label: 'Vehicles/day', value: '~80k' },
      { label: 'Revenue/year', value: '€30M' },
      { label: 'Traffic reduction', value: '-30%' },
    ],
  },
  changelog: {
    items: [
      { timestamp: '2025-11-01', label: 'Rate increased to €7.50' },
      { timestamp: '2025-06-15', label: 'Extended to Saturdays' },
      { timestamp: '2025-01-10', label: 'Euro 5 diesel vehicles included' },
      { timestamp: '2024-09-01', label: 'Exemption for electric vehicles renewed' },
    ],
  },
  tags: [
    { id: 't1', name: 'Mobility', slug: 'mobility', category: 'policy-topic', color: null },
    { id: 't2', name: 'Environment', slug: 'environment', category: 'impact-area', color: null },
  ],
}

const minimalProvision = {
  id: 'prv_minimal_001',
  slug: 'minimal-provision',
  title: 'Regolamento Verde Pubblico',
  tagline: null,
  avatarUrl: null,
  types: [
    { id: 'pt_3', code: 'regulation', label: 'Regulation', description: null, icon: null, color: null },
  ],
  status: 'active',
  relevance: 4,
  ideaId: null,
  ideaTitle: null,
  highlights: null,
  changelog: null,
  tags: [],
}

const withIdeaProvision = {
  ...sampleProvision,
  id: 'prv_idea_001',
  slug: 'piano-aria-clima',
  title: 'Piano Aria e Clima',
  tagline: 'Comprehensive climate action plan targeting carbon neutrality by 2050.',
  ideaId: 'idea_001',
  ideaTitle: 'Expand green corridors network',
  status: 'active',
  relevance: 9,
}

export const Default: StoryObj = {
  render: () => (
    <div className="max-w-sm">
      <ProvisionCard provision={sampleProvision} entity={mockEntity} />
    </div>
  ),
}

export const Minimal: StoryObj = {
  render: () => (
    <div className="max-w-sm">
      <ProvisionCard provision={minimalProvision} entity={mockEntity} />
    </div>
  ),
}

export const WithLinkedIdea: StoryObj = {
  render: () => (
    <div className="max-w-sm">
      <ProvisionCard provision={withIdeaProvision} entity={mockEntity} />
    </div>
  ),
}

export const Grid: StoryObj = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <ProvisionCard provision={sampleProvision} entity={mockEntity} />
      <ProvisionCard provision={minimalProvision} entity={mockEntity} />
      <ProvisionCard provision={withIdeaProvision} entity={mockEntity} />
    </div>
  ),
}

// ── Extra Small ──────────────────────────────────────────────────────

const extraSmallProvisions = [
  { title: 'Area C - Congestion Charge', type: 'taxation', avatarUrl: null },
  { title: 'Piano Urbanistico Generale', type: 'regulation', avatarUrl: null },
  { title: 'Contratto Servizio TPL', type: 'contract', avatarUrl: null },
]

export const ExtraSmall: StoryObj = {
  render: () => (
    <div className="flex flex-col max-w-xs">
      {extraSmallProvisions.map((p) => (
        <ProvisionCardExtraSmall key={p.title} provision={p} />
      ))}
    </div>
  ),
}
