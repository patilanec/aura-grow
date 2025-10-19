import { useState, useEffect } from 'react'
import { getAuraStrategies } from '../lib/aura'

interface ScenarioPlaygroundProps {
  principalUsd: number
  address?: string
  ratePct: 4 | 11 | 21
  years: number
}

type StrategyData = {
  name: string
  apy?: string
  platforms?: string[]
  description?: string
}

export function ScenarioPlayground({ address }: ScenarioPlaygroundProps) {
  const [auraStrategies, setAuraStrategies] = useState<{
    low: StrategyData[]
    moderate: StrategyData[]
    high: StrategyData[]
  } | null>(null)
  const [strategiesLoading, setStrategiesLoading] = useState(false)
  const [strategiesError, setStrategiesError] = useState<string | null>(null)

  // Fetch AURA strategies when address is available
  useEffect(() => {
    if (address) {
      setStrategiesLoading(true)
      setStrategiesError(null)
      const apiKey = import.meta.env.VITE_AURA_API_KEY
      getAuraStrategies(address, apiKey)
        .then(({ strategies }) => {
          setAuraStrategies(strategies)
        })
        .catch((error) => {
          console.warn('Failed to fetch AURA strategies:', error)
          setStrategiesError('Failed to load personalized strategies')
        })
        .finally(() => {
          setStrategiesLoading(false)
        })
    }
  }, [address])

  // Default strategies fallback
  const defaultStrategies = {
    low: [
      {
        name: 'Conservative DeFi',
        description: 'Lido staking, USDC lending — lower risk, steady returns',
        apy: '4-6%',
        platforms: ['Lido', 'Aave'],
      },
    ],
    moderate: [
      {
        name: 'Balanced Portfolio',
        description:
          'Aave, Balancer, Uniswap — moderate risk, proven protocols',
        apy: '8-12%',
        platforms: ['Aave', 'Balancer', 'Uniswap'],
      },
    ],
    high: [
      {
        name: 'Growth Opportunities',
        description:
          'Yield vaults, LSDfi — higher risk, bull market opportunities',
        apy: '15-25%',
        platforms: ['Various Yield Vaults', 'LSDfi Protocols'],
      },
    ],
  }

  const strategies = auraStrategies || defaultStrategies

  const renderStrategyCard = (
    rate: number,
    label: string,
    riskLevel: 'low' | 'moderate' | 'high',
    strategies: StrategyData[]
  ) => {
    const primaryStrategy = strategies[0]
    const hasMultipleStrategies = strategies.length > 1

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">{rate}%</span>
            <span className="text-sm font-medium text-gray-600">({label})</span>
          </div>
          {primaryStrategy.apy && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {primaryStrategy.apy} APY
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <h5 className="font-medium text-gray-900">
              {primaryStrategy.name}
            </h5>
            <p className="text-sm text-gray-600">
              {primaryStrategy.description}
            </p>
            {primaryStrategy.platforms &&
              primaryStrategy.platforms.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {primaryStrategy.platforms
                    .slice(0, 3)
                    .map((platform, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                      >
                        {platform}
                      </span>
                    ))}
                  {primaryStrategy.platforms.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{primaryStrategy.platforms.length - 3} more
                    </span>
                  )}
                </div>
              )}
          </div>

          {hasMultipleStrategies && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">
                Alternative strategies:
              </p>
              <div className="space-y-1">
                {strategies.slice(1).map((strategy, idx) => (
                  <div key={idx} className="text-xs text-gray-600">
                    • {strategy.name}
                    {strategy.apy && (
                      <span className="text-gray-500 ml-1">
                        ({strategy.apy})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-semibold mb-2">Explore Growth Scenarios</h2>
        <p className="text-gray-600 mb-4">
          You can now see how varying APY rates (4%, 11%, 21%) dramatically
          affect long-term returns. The panel below presents real strategies
          powered by AdEx AURA - personalized for your address or shown as
          educational examples to illustrate the power of compound interest in
          decentralized finance.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-900">
              Example strategies to help you understand how compounding works
            </h4>
            <div className="flex items-center space-x-2">
              {strategiesLoading && (
                <div className="text-xs text-blue-600 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                  Loading strategies...
                </div>
              )}
              {strategiesError && (
                <div className="text-xs text-orange-600">
                  ⚠️ Using default strategies
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            {renderStrategyCard(4, 'conservative', 'low', strategies.low)}
            {renderStrategyCard(
              11,
              'balanced',
              'moderate',
              strategies.moderate
            )}
            {renderStrategyCard(21, 'aggressive', 'high', strategies.high)}
          </div>

          <div className="mt-3 pt-3 border-t border-blue-200">
            {auraStrategies ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-blue-600">
                  <span className="mr-1">✨</span>
                  Strategies personalized based on your portfolio
                </div>
                <div className="flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  <span className="mr-1">📊</span>
                  Loaded from AdEx AURA
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-1">📚</span>
                  Showing example strategies for educational purposes
                </div>
                <div className="flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  <span className="mr-1">🎯</span>
                  Default examples
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
