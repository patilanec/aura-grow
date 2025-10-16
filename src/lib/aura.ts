import { getCache, setCache } from './cache'

export type AuraBalancesResponse = unknown

export async function fetchAuraBalances(address: string, apiKey?: string): Promise<AuraBalancesResponse> {
  const url = new URL('https://aura.adex.network/api/portfolio/balances')
  url.searchParams.set('address', address)
  if (apiKey) {
    url.searchParams.set('apiKey', apiKey)
  }

  const response = await fetch(url.toString())
  
  if (!response.ok) {
    throw new Error(`AURA API error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

export function extractTotalUsd(data: any): number | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  // Try common shapes first
  if (typeof data.total?.usd === 'number') {
    return data.total.usd
  }
  if (typeof data.totalUsd === 'number') {
    return data.totalUsd
  }
  if (typeof data.usdTotal === 'number') {
    return data.usdTotal
  }

  // Try to sum from assets array
  if (Array.isArray(data.assets)) {
    let total = 0
    for (const asset of data.assets) {
      if (typeof asset.usdValue === 'number') {
        total += asset.usdValue
      } else if (typeof asset.usd === 'number') {
        total += asset.usd
      } else if (typeof asset.valueUsd === 'number') {
        total += asset.valueUsd
      }
    }
    if (total > 0) {
      return total
    }
  }

  return null
}

export async function getPrincipalUsd(
  address: string, 
  apiKey?: string
): Promise<{ principal: number | null; cached: boolean; responseTimeMs: number }> {
  const cacheKey = `balances:${address}:${apiKey ?? ''}`
  
  // Check cache first
  const cached = getCache<AuraBalancesResponse>(cacheKey)
  if (cached) {
    const principal = extractTotalUsd(cached)
    console.log({ address, cached: true, responseTimeMs: 0, principalUsd: principal })
    return { principal, cached: true, responseTimeMs: 0 }
  }

  // Fetch from API
  const startTime = Date.now()
  try {
    const data = await fetchAuraBalances(address, apiKey)
    const responseTimeMs = Date.now() - startTime
    
    // Cache the response
    setCache(cacheKey, data)
    
    const principal = extractTotalUsd(data)
    console.log({ address, cached: false, responseTimeMs, principalUsd: principal })
    
    return { principal, cached: false, responseTimeMs }
  } catch (error) {
    const responseTimeMs = Date.now() - startTime
    console.log({ address, cached: false, responseTimeMs, principalUsd: null, error: error instanceof Error ? error.message : 'Unknown error' })
    throw error
  }
}
