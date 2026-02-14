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

export const Base: StoryObj = {
  render: () => (
    <div className="max-w-2xl">
      <ProvisionsOverview
        total={54}
        types={allTypes}
        treeLink="/pe/milan/pr/tree"
      />
    </div>
  ),
}
