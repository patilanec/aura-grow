import { useState } from 'react'
import { makeSeries } from '../lib/compound'
import { CompoundChart } from './CompoundChart'
import { KpiStrip } from './KpiStrip'

interface ScenarioPlaygroundProps {
  principalUsd: number
}

export function ScenarioPlayground({ principalUsd }: ScenarioPlaygroundProps) {
  const [ratePct, setRatePct] = useState<4 | 11 | 21>(11)
  const [years, setYears] = useState(30)

  const data = makeSeries(principalUsd, ratePct, years)

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
          <h4 className="font-medium text-blue-900 mb-2">
            Realistic Crypto Strategies:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              <strong>4% (Stable Yields):</strong> Lido staking, USDC lending —
              lower risk, steady returns
            </li>
            <li>
              <strong>11% (DeFi Pools):</strong> Aave, Balancer, Uniswap —
              moderate risk, proven protocols
            </li>
            <li>
              <strong>21% (Aggressive Farming):</strong> Yield vaults, LSDfi —
              higher risk, bull market opportunities
            </li>
          </ul>
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
