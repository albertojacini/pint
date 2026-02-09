import type { Meta, StoryObj } from '@storybook/react'
import { ProvisionCardExtraSmall } from './provision-cards'

const meta: Meta = {
  title: 'Provisions/ProvisionCards/Experiments',
  parameters: {
    layout: 'padded',
  },
}

export default meta

const provisions = [
  { title: 'Area C - Congestion Charge', type: 'taxation' },
  { title: 'Piano Urbanistico Generale', type: 'regulation' },
  { title: 'Contratto Servizio TPL', type: 'contract' },
  { title: 'Bilancio Comunale 2025', type: 'allocation' },
  { title: 'Azienda Trasporti Milanesi', type: 'ownership' },
  { title: 'TARI - Tariffa Rifiuti', type: 'taxation' },
  { title: 'Regolamento Edilizio', type: 'regulation' },
  { title: 'Piano Aria e Clima', type: 'regulation' },
  { title: 'Zona 30 - Traffic Calming', type: 'designation' },
  { title: 'Rete Metropolitana M4', type: 'infrastructure' },
]

function Playground() {
  return (
    <div className="space-y-10">
      {/* Vertical list */}
      <section>
        <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Vertical List</h3>
        <div className="flex flex-col max-w-xs">
          {provisions.map((p) => (
            <ProvisionCardExtraSmall key={p.title} provision={p} />
          ))}
        </div>
      </section>

      {/* Horizontal scroll grid */}
      <section>
        <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Horizontal Scroll Grid (3 rows)</h3>
        <div className="overflow-x-auto">
          <div className="grid grid-flow-col auto-cols-max grid-rows-3 gap-x-6 gap-y-0 w-max">
            {provisions.map((p) => (
              <ProvisionCardExtraSmall key={p.title} provision={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 2-column grid */}
      <section>
        <h3 className="text-lg font-semibold mb-4 pb-2 border-b">2-Column Grid</h3>
        <div className="grid grid-cols-2 gap-x-6 max-w-lg">
          {provisions.map((p) => (
            <ProvisionCardExtraSmall key={p.title} provision={p} />
          ))}
        </div>
      </section>
    </div>
  )
}

export const Base: StoryObj = {
  render: () => <Playground />,
}
