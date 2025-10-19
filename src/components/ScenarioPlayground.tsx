import { useState, useEffect } from 'react'
import { getAuraStrategies } from '../lib/aura'

interface ScenarioPlaygroundProps {
  principalUsd: number
  address?: string
  ratePct: 4 | 11 | 21
  years: number
}

export function ScenarioPlayground({ address }: ScenarioPlaygroundProps) {
  const [auraStrategies, setAuraStrategies] = useState<{
    low: string[]
    moderate: string[]
    high: string[]
  } | null>(null)
  const [strategiesLoading, setStrategiesLoading] = useState(false)

  // Fetch AURA strategies when address is available
  useEffect(() => {
    if (address) {
      setStrategiesLoading(true)
      const apiKey = import.meta.env.VITE_AURA_API_KEY
      getAuraStrategies(address, apiKey)
        .then(({ strategies }) => {
          setAuraStrategies(strategies)
        })
        .catch(() => {
          // Silently fail - will use default strategies
        })
        .finally(() => {
          setStrategiesLoading(false)
        })
    }
  }, [address])

  // Default strategies fallback
  const defaultStrategies = {
    low: ['Lido staking, USDC lending — lower risk, steady returns'],
    moderate: ['Aave, Balancer, Uniswap — moderate risk, proven protocols'],
    high: ['Yield vaults, LSDfi — higher risk, bull market opportunities'],
  }

  const strategies = auraStrategies || defaultStrategies

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-semibold mb-2">Explore Growth Scenarios</h2>
        <p className="text-gray-600 mb-3">
          Move the sliders and see how time and interest rate change your
          outcome. Compounding means your gains also earn gains — small
          percentages make a big difference over years.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">
              Example annual rates to help you understand how compounding works
            </h4>
            {strategiesLoading && (
              <div className="text-xs text-blue-600">Loading strategies...</div>
            )}
          </div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              <strong>4% (conservative):</strong>{' '}
              {strategies.low.length > 0
                ? strategies.low[0]
                : 'Lido staking, USDC lending — lower risk, steady returns'}
            </li>
            <li>
              <strong>11% (balanced):</strong>{' '}
              {strategies.moderate.length > 0
                ? strategies.moderate[0]
                : 'Aave, Balancer, Uniswap — moderate risk, proven protocols'}
            </li>
            <li>
              <strong>21% (aggressive):</strong>{' '}
              {strategies.high.length > 0
                ? strategies.high[0]
                : 'Yield vaults, LSDfi — higher risk, bull market opportunities'}
            </li>
          </ul>
          {auraStrategies && (
            <div className="mt-2 text-xs text-blue-600">
              ✨ Strategies personalized based on your portfolio
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
