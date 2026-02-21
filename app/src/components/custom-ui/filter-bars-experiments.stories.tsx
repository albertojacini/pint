'use client'

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FilterBarSmall } from './filter-bars'

const meta: Meta = {
  title: 'Custom-UI/FilterBarsExperiments',
  parameters: {
    layout: 'padded',
  },
}

export default meta

const eventTypes = ['Election', 'Referendum', 'Policy Change', 'Budget', 'Census']
const statusTypes = ['Active', 'Pending', 'Completed', 'Archived']

function FilterBarPlayground() {
  const [eventSelected, setEventSelected] = useState<Set<string>>(() => new Set(eventTypes))
  const [statusSelected, setStatusSelected] = useState<Set<string>>(
    () => new Set(['Active', 'Pending'])
  )
  const [noAllSelected, setNoAllSelected] = useState<Set<string>>(
    () => new Set(['Election', 'Budget'])
  )

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-2">All selected</h3>
        <p className="text-sm text-muted-foreground mb-3">
          All items selected, &quot;All&quot; button appears active.
        </p>
        <FilterBarSmall
          items={eventTypes}
          selected={eventSelected}
          onSelectedChange={setEventSelected}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Selected: {Array.from(eventSelected).join(', ') || 'none'}
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Partial selection</h3>
        <p className="text-sm text-muted-foreground mb-3">Some items selected.</p>
        <FilterBarSmall
          items={statusTypes}
          selected={statusSelected}
          onSelectedChange={setStatusSelected}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Selected: {Array.from(statusSelected).join(', ') || 'none'}
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Without &quot;All&quot; button</h3>
        <p className="text-sm text-muted-foreground mb-3">
          No &quot;All&quot; toggle, just individual filters.
        </p>
        <FilterBarSmall
          items={eventTypes}
          selected={noAllSelected}
          onSelectedChange={setNoAllSelected}
          showAll={false}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Selected: {Array.from(noAllSelected).join(', ') || 'none'}
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Custom label function</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Using labelFn to uppercase items.
        </p>
        <FilterBarSmall
          items={statusTypes}
          selected={statusSelected}
          onSelectedChange={setStatusSelected}
          labelFn={(item) => item.toUpperCase()}
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Many items</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Wrapping behavior with many filter items.
        </p>
        <ManyItemsDemo />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">In narrow container</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Filter bar constrained to 300px width.
        </p>
        <div className="w-[300px] border border-dashed border-border p-3 rounded">
          <FilterBarSmall
            items={eventTypes}
            selected={eventSelected}
            onSelectedChange={setEventSelected}
          />
        </div>
      </section>
    </div>
  )
}

function ManyItemsDemo() {
  const manyItems = [
    'Education',
    'Healthcare',
    'Housing',
    'Transport',
    'Environment',
    'Defense',
    'Immigration',
    'Trade',
    'Agriculture',
    'Energy',
    'Labor',
    'Technology',
  ]
  const [selected, setSelected] = useState<Set<string>>(() => new Set(manyItems))

  return (
    <>
      <FilterBarSmall items={manyItems} selected={selected} onSelectedChange={setSelected} />
      <p className="text-xs text-muted-foreground mt-2">
        {selected.size}/{manyItems.length} selected
      </p>
    </>
  )
}

export const Base: StoryObj = {
  render: () => <FilterBarPlayground />,
}
