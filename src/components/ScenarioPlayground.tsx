import { useState, useEffect } from 'react'
import { makeSeries } from '../lib/compound'
import { getAuraStrategies } from '../lib/aura'
import { CompoundChart } from './CompoundChart'
import { KpiStrip } from './KpiStrip'

interface ScenarioPlaygroundProps {
  principalUsd: number
  address?: string
}

export function ScenarioPlayground({
  principalUsd,
  address,
}: ScenarioPlaygroundProps) {
  const [ratePct, setRatePct] = useState<4 | 11 | 21>(11)
  const [years, setYears] = useState(30)
  const [auraStrategies, setAuraStrategies] = useState<{
    low: string[]
    moderate: string[]
    high: string[]
  } | null>(null)
  const [strategiesLoading, setStrategiesLoading] = useState(false)

  const data = makeSeries(principalUsd, ratePct, years)

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
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold mb-2">Explore Growth Scenarios</h2>
        <p className="text-gray-600 mb-4">
          Move the sliders and see how time and interest rate change your
          outcome. Compounding means your gains also earn gains — small
          percentages make a big difference over years.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">
              {auraStrategies
                ? 'Your Personalized Strategies from AURA:'
                : 'Realistic Crypto Strategies:'}
            </h4>
            {strategiesLoading && (
              <div className="text-xs text-blue-600">Loading strategies...</div>
            )}
          </div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              <strong>4% (Stable Yields):</strong>{' '}
              {strategies.low.length > 0
                ? strategies.low[0]
                : 'Lido staking, USDC lending — lower risk, steady returns'}
            </li>
            <li>
              <strong>11% (DeFi Pools):</strong>{' '}
              {strategies.moderate.length > 0
                ? strategies.moderate[0]
                : 'Aave, Balancer, Uniswap — moderate risk, proven protocols'}
            </li>
            <li>
              <strong>21% (Aggressive Farming):</strong>{' '}
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

        {/* Rate Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Annual Growth Rate (examples to learn from)
          </label>
          <div className="flex gap-2">
            {([4, 11, 21] as const).map((rate) => (
              <button
                key={rate}
                onClick={() => setRatePct(rate)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  ratePct === rate
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={`${rate}% annual rate - ${rate === 4 ? 'stable yields (Lido, USDC lending)' : rate === 11 ? 'DeFi pools (Aave, Balancer)' : 'aggressive farming (vaults, LSDfi)'}`}
              >
                {rate}%{' '}
                {rate === 4
                  ? '(stable yields)'
                  : rate === 11
                    ? '(DeFi pools)'
                    : '(aggressive farming)'}
              </button>
            ))}
          </div>
        </div>

        {/* Years Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Time Period: {years} {years === 1 ? 'year' : 'years'}
          </label>
          <input
            type="range"
            min="1"
            max="35"
            value={years}
            onChange={(e) => setYears(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 year</span>
            <span>35 years</span>
          </div>
        </div>
      </div>

      <KpiStrip principal={principalUsd} ratePct={ratePct} years={years} />
      <CompoundChart data={data} />
    </div>
  )
}
