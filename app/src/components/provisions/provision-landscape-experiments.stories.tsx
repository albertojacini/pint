import type { Meta, StoryObj } from '@storybook/react'
import {
  Coins,
  FileText,
  Scale,
  Landmark,
  BarChart3,
  HardHat,
  Tag,
} from 'lucide-react'
import { ProvisionLandscape } from './provision-landscape'

const meta: Meta = {
  title: 'Provisions/ProvisionLandscape/Experiments',
  parameters: {
    layout: 'padded',
  },
}

export default meta

const allTypes = [
  { type: 'taxation', icon: Coins, label: 'Taxation', count: 12 },
  { type: 'contract', icon: FileText, label: 'Contracts', count: 8 },
  { type: 'regulation', icon: Scale, label: 'Regulations', count: 15 },
  { type: 'ownership', icon: Landmark, label: 'Ownership', count: 5 },
  { type: 'allocation', icon: BarChart3, label: 'Allocations', count: 7 },
  { type: 'infrastructure', icon: HardHat, label: 'Infrastructure', count: 3 },
  { type: 'designation', icon: Tag, label: 'Designations', count: 4 },
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
      <ProvisionLandscape
        total={54}
        types={allTypes}
        topProvisions={topProvisions}
        treeLink="/pe/milan/pr/tree"
      />
    </div>
  ),
}
