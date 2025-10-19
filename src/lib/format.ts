export const formatCurrency = (n: number, fiat = 'USD') =>
  new Intl.NumberFormat('en', { style: 'currency', currency: fiat }).format(n)

export const formatPercent = (n: number) => `${n.toFixed(2)}%`

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) {
    return 'just now'
  } else if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else {
    return `${days}d ago`
  }
}
