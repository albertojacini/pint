export function formatTimeUntil(dateStr: string): { text: string; isPast: boolean; isNear: boolean } {
  const target = new Date(dateStr)
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()

  if (diffMs < 0) return { text: 'passate', isPast: true, isNear: false }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  const isNear = months < 6

  if (years > 0) {
    const yearText = years === 1 ? '1 anno' : `${years} anni`
    const monthText = remainingMonths > 0 ? ` e ${remainingMonths} ${remainingMonths === 1 ? 'mese' : 'mesi'}` : ''
    return { text: `tra ${yearText}${monthText}`, isPast: false, isNear }
  } else if (months > 0) {
    return { text: `tra ${months} ${months === 1 ? 'mese' : 'mesi'}`, isPast: false, isNear }
  } else if (days > 1) {
    return { text: `tra ${days} giorni`, isPast: false, isNear: true }
  } else if (days === 1) {
    return { text: 'domani', isPast: false, isNear: true }
  } else {
    return { text: 'oggi', isPast: false, isNear: true }
  }
}

export function formatElectionDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function formatFullElectionDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}
