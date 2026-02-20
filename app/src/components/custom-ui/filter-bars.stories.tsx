import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FilterBarSmall } from './filter-bars'

const meta = {
  title: 'Custom-UI/FilterBars',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj

const policyTypes = ['Education', 'Healthcare', 'Housing', 'Transport', 'Environment']

export const Default: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<Set<string>>(() => new Set(policyTypes))
    return <FilterBarSmall items={policyTypes} selected={selected} onSelectedChange={setSelected} />
  },
}

export const NoneSelected: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<Set<string>>(() => new Set())
    return <FilterBarSmall items={policyTypes} selected={selected} onSelectedChange={setSelected} />
  },
}

export const WithoutAll: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<Set<string>>(() => new Set(policyTypes))
    return (
      <FilterBarSmall
        items={policyTypes}
        selected={selected}
        onSelectedChange={setSelected}
        showAll={false}
      />
    )
  },
}

export const CustomAllLabel: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<Set<string>>(() => new Set(policyTypes))
    return (
      <FilterBarSmall
        items={policyTypes}
        selected={selected}
        onSelectedChange={setSelected}
        allLabel="Select all"
      />
    )
  },
}

export const WithLabelFn: Story = {
  render: function Render() {
    const items = ['education', 'healthcare', 'housing']
    const [selected, setSelected] = useState<Set<string>>(() => new Set(items))
    return (
      <FilterBarSmall
        items={items}
        selected={selected}
        onSelectedChange={setSelected}
        labelFn={(item) => item.charAt(0).toUpperCase() + item.slice(1)}
      />
    )
  },
}

export const TwoItems: Story = {
  render: function Render() {
    const items = ['Active', 'Archived']
    const [selected, setSelected] = useState<Set<string>>(() => new Set(items))
    return <FilterBarSmall items={items} selected={selected} onSelectedChange={setSelected} />
  },
}

export const SingleItem: Story = {
  render: () => (
    <div>
      <p className="text-sm text-muted-foreground mb-2">Hidden when single item:</p>
      <FilterBarSmall items={['Only']} selected={new Set(['Only'])} onSelectedChange={() => {}} />
      <p className="text-sm text-muted-foreground mt-2">(nothing renders)</p>
    </div>
  ),
}
