'use client'

import type { Meta, StoryObj } from '@storybook/react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { EventCardSmall } from './event-cards'

const meta: Meta = {
  title: 'Events/EventCardsExperiments',
  parameters: {
    layout: 'padded',
  },
}

export default meta

const sampleEvents = [
  { id: '1', title: 'National General Election 2025', descriptionShort: 'Voters head to the polls to elect representatives for the national parliament.', type: 'election', date: '2025-06-15' },
  { id: '2', title: 'Climate Action Bill Signed Into Law', descriptionShort: 'Landmark legislation introducing binding carbon emission targets for 2030 and 2040.', type: 'legislation', date: '2025-03-22' },
  { id: '3', title: 'March for Housing Rights', descriptionShort: 'Thousands gather in the capital to demand affordable housing reforms.', type: 'protest', date: '2025-05-01' },
  { id: '4', title: 'Universal Pre-K Policy Announcement', descriptionShort: 'Government announces free pre-kindergarten for all children aged 3-5.', type: 'policy', date: '2025-04-10' },
  { id: '5', title: 'New Minister of Digital Affairs Appointed', descriptionShort: null, type: 'appointment', date: '2025-02-28' },
  { id: '6', title: 'Municipal Budget Vote for Infrastructure Renewal', descriptionShort: 'City council votes on a multi-year infrastructure plan.', type: 'legislation', date: '2025-07-05' },
  { id: '7', title: 'Regional Referendum on Transport Funding', descriptionShort: 'Citizens vote on a proposed regional tax to fund public transit expansion.', type: 'election', date: '2025-09-12' },
  { id: '8', title: 'Data Privacy Reform Act Passed', descriptionShort: 'New rules on personal data collection and processing by tech companies.', type: 'legislation', date: '2025-01-18' },
  { id: '9', title: 'Teachers Union Strike', descriptionShort: 'Nationwide strike over wages and class size caps.', type: 'protest', date: '2025-02-05' },
  { id: '10', title: 'National Minimum Wage Increase', descriptionShort: 'Minimum wage raised by 8% effective next fiscal year.', type: 'policy', date: '2025-08-01' },
  { id: '11', title: 'Chief Justice Nomination', descriptionShort: null, type: 'appointment', date: '2025-04-22' },
  { id: '12', title: 'Green Energy Subsidy Extension', descriptionShort: 'Solar and wind subsidies extended through 2030.', type: 'legislation', date: '2025-05-30' },
  { id: '13', title: 'Anti-Corruption Rally in Capital', descriptionShort: 'Tens of thousands demand transparency in government contracts.', type: 'protest', date: '2025-03-15' },
  { id: '14', title: 'Healthcare Access Expansion Policy', descriptionShort: 'Free primary care extended to uninsured adults under 30.', type: 'policy', date: '2025-06-20' },
  { id: '15', title: 'Ambassador to the EU Appointed', descriptionShort: 'Veteran diplomat named as new EU ambassador.', type: 'appointment', date: '2025-07-14' },
  { id: '16', title: 'Local Council Elections — Northern Region', descriptionShort: 'Voters choose representatives for 12 municipal councils.', type: 'election', date: '2025-10-05' },
  { id: '17', title: 'Rent Control Amendment Approved', descriptionShort: 'Annual rent increases capped at 3% in major metropolitan areas.', type: 'legislation', date: '2025-11-02' },
  { id: '18', title: 'Student Debt Relief March', descriptionShort: 'University students march for loan forgiveness programs.', type: 'protest', date: '2025-09-20' },
  { id: '19', title: 'National Broadband Strategy Released', descriptionShort: 'Plan to bring fiber-optic internet to 95% of households by 2028.', type: 'policy', date: '2025-08-15' },
  { id: '20', title: 'Secretary of Transportation Replaced', descriptionShort: null, type: 'appointment', date: '2025-10-28' },
  { id: '21', title: 'Constitutional Amendment Referendum', descriptionShort: 'Public vote on lowering the voting age to 16.', type: 'election', date: '2025-11-15' },
  { id: '22', title: 'Emergency Housing Act Passed', descriptionShort: 'Fast-track construction permits for affordable housing projects.', type: 'legislation', date: '2025-12-01' },
  { id: '23', title: 'Climate Strike — Youth Coalition', descriptionShort: 'Students walk out in 200 cities demanding faster emissions cuts.', type: 'protest', date: '2025-04-25' },
  { id: '24', title: 'Free School Meals Program Launched', descriptionShort: 'All public primary school students now eligible for free lunch.', type: 'policy', date: '2025-09-01' },
  { id: '25', title: 'Head of National Cybersecurity Agency Named', descriptionShort: 'Former tech executive takes over the newly created agency.', type: 'appointment', date: '2025-06-08' },
  { id: '26', title: 'Snap Election Called for Southern District', descriptionShort: 'Early election triggered after incumbent resignation.', type: 'election', date: '2025-07-22' },
  { id: '27', title: 'Plastic Packaging Ban Enacted', descriptionShort: 'Single-use plastic packaging prohibited for retail goods.', type: 'legislation', date: '2025-08-30' },
  { id: '28', title: 'Farmers Protest Against Trade Deal', descriptionShort: 'Agricultural workers block highways over import tariff reductions.', type: 'protest', date: '2025-10-12' },
  { id: '29', title: 'Universal Childcare Benefit Doubled', descriptionShort: 'Monthly childcare payments increased from €150 to €300 per child.', type: 'policy', date: '2025-12-15' },
  { id: '30', title: 'New Central Bank Governor Appointed', descriptionShort: 'Economist with 20 years of experience takes the helm.', type: 'appointment', date: '2025-11-20' },
]

function SmallCardsPlayground() {
  return (
    <div className="space-y-8">
      {/* Variant 1: Default - Single column list */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Single Column</h3>
        <div className="flex flex-col gap-2 max-w-sm">
          {sampleEvents.map((event) => (
            <EventCardSmall key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Variant 2: Grid layout */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Grid (3 columns)</h3>
        <div className="grid grid-cols-3 gap-3">
          {sampleEvents.map((event) => (
            <EventCardSmall key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Variant 3: Horizontal scroll */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Horizontal Scroll</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {sampleEvents.map((event) => (
            <EventCardSmall key={event.id} event={event} className="min-w-[220px] shrink-0" />
          ))}
        </div>
      </section>

      {/* Variant 4: Compact - tighter spacing */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Compact (no border, tighter)</h3>
        <div className="flex flex-col gap-1 max-w-sm">
          {sampleEvents.map((event) => (
            <EventCardSmall
              key={event.id}
              event={event}
              className="border-0 rounded-none px-2 py-1.5 hover:bg-muted/50"
            />
          ))}
        </div>
      </section>

      {/* Variant 5: With left color accent */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Left Color Accent</h3>
        <div className="flex flex-col gap-2 max-w-sm">
          {sampleEvents.map((event) => {
            const accentColors: Record<string, string> = {
              election: 'border-l-blue-500',
              legislation: 'border-l-purple-500',
              protest: 'border-l-red-500',
              policy: 'border-l-green-500',
              appointment: 'border-l-amber-500',
            }
            return (
              <EventCardSmall
                key={event.id}
                event={event}
                className={`border-l-2 ${accentColors[event.type] || 'border-l-gray-500'} rounded-l-none`}
              />
            )
          })}
        </div>
      </section>

      {/* Variant 6: Dense timeline-like */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Dense Timeline</h3>
        <div className="flex flex-col max-w-md divide-y divide-border">
          {sampleEvents.map((event) => (
            <EventCardSmall
              key={event.id}
              event={event}
              className="border-0 rounded-none py-2 px-0 hover:bg-transparent hover:shadow-none"
            />
          ))}
        </div>
      </section>

      {/* Variant 7: Ultra-compact inline — badge trails date, title on same row */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Ultra-Compact Inline</h3>
        <div className="flex flex-col gap-0 max-w-lg">
          {sampleEvents.map((event) => {
            const typeColors: Record<string, string> = {
              election: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
              legislation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
              protest: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
              policy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
              appointment: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
            }
            const colorClass = typeColors[event.type] || 'bg-gray-100 text-gray-800'
            return (
              <div
                key={event.id}
                className="flex items-center gap-2 px-1.5 py-1 hover:bg-muted/40 rounded-sm transition-colors"
              >
                <span className="text-[11px] text-muted-foreground shrink-0 w-[70px]">
                  {format(new Date(event.date), 'MMM d, yy')}
                </span>
                <span className={cn('rounded px-1.5 py-px text-[10px] font-medium shrink-0', colorClass)}>
                  {event.type}
                </span>
                <span className="text-xs font-medium truncate">{event.title}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Variant 8: Ultra-compact with left border accent */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Ultra-Compact Accented</h3>
        <div className="flex flex-col gap-px max-w-lg">
          {sampleEvents.map((event) => {
            const typeColors: Record<string, string> = {
              election: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
              legislation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
              protest: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
              policy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
              appointment: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
            }
            const accentColors: Record<string, string> = {
              election: 'border-l-blue-500',
              legislation: 'border-l-purple-500',
              protest: 'border-l-red-500',
              policy: 'border-l-green-500',
              appointment: 'border-l-amber-500',
            }
            const colorClass = typeColors[event.type] || 'bg-gray-100 text-gray-800'
            const accent = accentColors[event.type] || 'border-l-gray-400'
            return (
              <div
                key={event.id}
                className={cn(
                  'flex items-center gap-2 pl-2 pr-1.5 py-1 border-l-2 hover:bg-muted/40 transition-colors',
                  accent
                )}
              >
                <span className="text-[11px] text-muted-foreground shrink-0 w-[70px]">
                  {format(new Date(event.date), 'MMM d, yy')}
                </span>
                <span className={cn('rounded px-1.5 py-px text-[10px] font-medium shrink-0', colorClass)}>
                  {event.type}
                </span>
                <span className="text-xs font-medium truncate">{event.title}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Variant 9: Ultra-compact no badge, dot only */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Ultra-Compact Dot</h3>
        <div className="flex flex-col gap-0 max-w-lg">
          {sampleEvents.map((event) => {
            const dotColors: Record<string, string> = {
              election: 'bg-blue-500',
              legislation: 'bg-purple-500',
              protest: 'bg-red-500',
              policy: 'bg-green-500',
              appointment: 'bg-amber-500',
            }
            const dot = dotColors[event.type] || 'bg-gray-400'
            return (
              <div
                key={event.id}
                className="flex items-center gap-1.5 px-1 py-0.5 hover:bg-muted/40 rounded-sm transition-colors"
              >
                <span className="text-[11px] text-muted-foreground shrink-0 w-[70px]">
                  {format(new Date(event.date), 'MMM d, yy')}
                </span>
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />
                <span className="text-xs font-medium truncate">{event.title}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Variant 10: Ultra-compact dot — horizontal scrollable grid */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Ultra-Compact Dot — Horizontal Scroll Grid</h3>
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col auto-cols-max grid-rows-3 gap-x-6 gap-y-0 w-max">
            {sampleEvents.map((event) => {
              const dotColors: Record<string, string> = {
                election: 'bg-blue-500',
                legislation: 'bg-purple-500',
                protest: 'bg-red-500',
                policy: 'bg-green-500',
                appointment: 'bg-amber-500',
              }
              const dot = dotColors[event.type] || 'bg-gray-400'
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-1.5 px-1 py-0.5 hover:bg-muted/40 rounded-sm transition-colors"
                >
                  <span className="text-[11px] text-muted-foreground shrink-0 w-[70px]">
                    {format(new Date(event.date), 'MMM d, yy')}
                  </span>
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />
                  <span className="text-xs font-medium whitespace-nowrap">{event.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

export const Base: StoryObj = {
  render: () => <SmallCardsPlayground />,
}
