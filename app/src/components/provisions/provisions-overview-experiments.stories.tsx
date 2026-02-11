import type { Meta, StoryObj } from '@storybook/react'
import { ProvisionsOverview } from './provisions-overview'

const meta: Meta = {
  title: 'Provisions/ProvisionsOverview/Experiments',
  parameters: {
    layout: 'padded',
  },
}

export default meta

const allTypes = [
  { type: 'taxation', count: 12 },
  { type: 'contract', count: 8 },
  { type: 'regulation', count: 15 },
  { type: 'ownership', count: 5 },
  { type: 'allocation', count: 7 },
  { type: 'infrastructure', count: 3 },
  { type: 'designation', count: 4 },
]

const topProvisions = [
  { title: 'Piano Urbanistico Generale', type: 'regulation' },
  { title: 'Bilancio Comunale 2025', type: 'allocation' },
  { title: 'Regolamento Edilizio', type: 'regulation' },
  { title: 'Contratto Servizio TPL', type: 'contract' },
  { title: 'TARI - Tariffa Rifiuti', type: 'taxation' },
  { title: 'Area C - Congestion Charge', type: 'taxation' },
]

export const Base: StoryObj = {
  render: () => (
    <div className="max-w-2xl">
      <ProvisionsOverview
        total={54}
        types={allTypes}
        topProvisions={topProvisions}
        treeLink="/pe/milan/pr/tree"
      />
    </div>
  ),
}
