import { getCache, setCache } from './cache'

export type AuraBalancesResponse = unknown

export type AuraStrategiesResponse = {
  address: string
  strategies: Array<{
    llm: {
      provider: string
      model: string
    }
    response: Array<{
      name: string
      risk: 'low' | 'moderate' | 'high' | 'opportunistic'
      actions: Array<{
        tokens: string
        description: string
        platforms: Array<{
          name: string
          url: string
        }>
        networks: string[]
        operations: string[]
        apy: string
        flags: string[]
      }>
    }>
    responseTime: number
    error: string | null
    hash: string
  }>
  portfolio: any[]
  cached: boolean
  version: string
}

export async function fetchAuraBalances(
  address: string,
  apiKey?: string
): Promise<AuraBalancesResponse> {
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

export async function fetchAuraStrategies(
  address: string,
  apiKey?: string
): Promise<AuraStrategiesResponse> {
  const url = new URL('https://aura.adex.network/api/portfolio/strategies')
  url.searchParams.set('address', address)
  if (apiKey) {
    url.searchParams.set('apiKey', apiKey)
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(
      `AURA Strategies API error: ${response.status} ${response.statusText}`
    )
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

  // New AURA API structure: sum all balanceUSD from all tokens across all networks
  if (Array.isArray(data.portfolio)) {
    let total = 0
    for (const network of data.portfolio) {
      if (Array.isArray(network.tokens)) {
        for (const token of network.tokens) {
          if (typeof token.balanceUSD === 'number') {
            total += token.balanceUSD
          }
        }
      }
    }
    if (total > 0) {
      return total
    }
  }

  // Try to sum from assets array (legacy format)
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
): Promise<{
  principal: number | null
  cached: boolean
  responseTimeMs: number
}> {
  const cacheKey = `balances:${address}:${apiKey ?? ''}`

  // Check cache first
  const cached = getCache<AuraBalancesResponse>(cacheKey)
  if (cached) {
    const principal = extractTotalUsd(cached)
    console.log({
      address,
      cached: true,
      responseTimeMs: 0,
      principalUsd: principal,
    })
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
    console.log({
      address,
      cached: false,
      responseTimeMs,
      principalUsd: principal,
    })

    return { principal, cached: false, responseTimeMs }
  } catch (error) {
    const responseTimeMs = Date.now() - startTime
    console.log({
      address,
      cached: false,
      responseTimeMs,
      principalUsd: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    throw error
  }
}

export function extractStrategiesByRisk(data: AuraStrategiesResponse): {
  low: string[]
  moderate: string[]
  high: string[]
} {
  const strategies = {
    low: [] as string[],
    moderate: [] as string[],
    high: [] as string[],
  }

  if (!data?.strategies?.[0]?.response) {
    return strategies
  }

  for (const strategy of data.strategies[0].response) {
    const risk = strategy.risk
    const name = strategy.name

    if (risk === 'low' && strategies.low.length < 2) {
      strategies.low.push(name)
    } else if (risk === 'moderate' && strategies.moderate.length < 2) {
      strategies.moderate.push(name)
    } else if (
      (risk === 'high' || risk === 'opportunistic') &&
      strategies.high.length < 2
    ) {
      strategies.high.push(name)
    }
  }

  return strategies
}

export async function getAuraStrategies(
  address: string,
  apiKey?: string
): Promise<{
  strategies: ReturnType<typeof extractStrategiesByRisk>
  cached: boolean
}> {
  const cacheKey = `strategies:${address}:${apiKey ?? ''}`

  // Check cache first
  const cached = getCache<AuraStrategiesResponse>(cacheKey)
  if (cached) {
    const strategies = extractStrategiesByRisk(cached)
    return { strategies, cached: true }
  }

  try {
    const data = await fetchAuraStrategies(address, apiKey)

    // Cache the response
    setCache(cacheKey, data)

    const strategies = extractStrategiesByRisk(data)
    return { strategies, cached: false }
  } catch (error) {
    // Return empty strategies on error - will fallback to defaults
    return {
      strategies: { low: [], moderate: [], high: [] },
      cached: false,
    }
  }
}
