export const formatCurrency = (n: number, fiat = 'USD') => 
  new Intl.NumberFormat('en', { style: 'currency', currency: fiat }).format(n)

export const formatPercent = (n: number) => `${n.toFixed(2)}%`
