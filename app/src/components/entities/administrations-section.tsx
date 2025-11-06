import { AdministrationCard } from './administration-card'

interface AdministrationsSectionProps {
  administrations: Array<{
    id: string
    name: string
    termStart: Date
    termEnd: Date | null
    status: string
    description: string | null
    mayor?: {
      fullName: string
    } | null
  }>
}

export function AdministrationsSection({ administrations }: AdministrationsSectionProps) {
  if (administrations.length === 0) {
    return null
  }

  // Separate current/active and historical administrations
  const activeAdministration = administrations.find(a => a.status === 'active')
  const historicalAdministrations = administrations
    .filter(a => a.status === 'historical')
    .slice(0, 4) // Get up to 4 historical

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-2xl font-bold mb-4">Administrations</h2>

      {activeAdministration && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Current Administration</h3>
          <AdministrationCard
            administration={activeAdministration}
            isHighlighted={true}
          />
        </div>
      )}

      {historicalAdministrations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Recent Past Administrations</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {historicalAdministrations.map((administration) => (
              <AdministrationCard
                key={administration.id}
                administration={administration}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
