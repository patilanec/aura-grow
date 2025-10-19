import { useState, useEffect } from 'react'
import { formatCurrency, formatTimeAgo } from '../lib/format'
import { simpleGrowth, compoundGrowth, makeSeries } from '../lib/compound'
import { getCacheInfo, refetchAuraData } from '../lib/aura'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface PrincipalPanelProps {
  principal: number
  source: 'AURA' | 'Manual'
  cached?: boolean
  isWalletConnected?: boolean
  ratePct: 4 | 11 | 21
  years: number
  address?: string
  onUpdatePrincipal: (newPrincipal: number) => void
  onRatePctChange: (ratePct: 4 | 11 | 21) => void
  onYearsChange: (years: number) => void
}

export function PrincipalPanel({
  principal,
  source,
  cached = false,
  isWalletConnected = false,
  ratePct,
  years,
  address,
  onUpdatePrincipal,
  onRatePctChange,
  onYearsChange,
}: PrincipalPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(principal.toString())
  const [isRefetching, setIsRefetching] = useState(false)
  const [lastFetched, setLastFetched] = useState<number | null>(null)

  // Calculate compound growth for wow effect
  const finalCompound = compoundGrowth(principal, ratePct, years)
  const finalSimple = simpleGrowth(principal, ratePct, years)
  const upliftAbs = finalCompound - finalSimple

  // Generate chart data
  const data = makeSeries(principal, ratePct, years)
  const dataWithExtra = data.map((point) => ({
    ...point,
    invested: data[0]?.simple || 0, // Always show the initial investment amount
    extraGrowth: point.compound - (data[0]?.simple || 0), // Extra growth from compounding
  }))

  // Get cache info when address changes
  useEffect(() => {
    if (address && source === 'AURA') {
      const apiKey = import.meta.env.VITE_AURA_API_KEY
      const cacheInfo = getCacheInfo(address, apiKey)
      setLastFetched(cacheInfo.balancesTimestamp)
    }
  }, [address, source])

  const handleRefetch = async () => {
    if (!address || source !== 'AURA' || isRefetching) return

    setIsRefetching(true)
    try {
      const apiKey = import.meta.env.VITE_AURA_API_KEY
      const result = await refetchAuraData(address, apiKey)

      if (result.principal !== null) {
        onUpdatePrincipal(result.principal)
        setLastFetched(Date.now())
      }
    } catch (error) {
      console.error('Failed to refetch AURA data:', error)
    } finally {
      setIsRefetching(false)
    }
  }

  const handleSave = () => {
    const numValue = parseFloat(editValue)
    if (!isNaN(numValue) && numValue > 0) {
      onUpdatePrincipal(numValue)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditValue(principal.toString())
    setIsEditing(false)
  }

  return (
    <div className="card bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-xl">
      {/* Header with combined title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
          💎 The Magic of Compound Interest
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Watch how your money grows exponentially over time
        </p>

        {/* Status badges */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span
            className={`px-3 py-1 text-xs rounded-full font-medium ${
              source === 'AURA'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {source === 'AURA'
              ? '📊 Loaded from AdEx AURA'
              : '✏️ Manual amount'}
          </span>
          {isWalletConnected && (
            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
              🔗 Wallet Connected
            </span>
          )}
          {cached && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                ⚡ Cached
              </span>
              {lastFetched && (
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(lastFetched)}
                </span>
              )}
              {address && source === 'AURA' && (
                <button
                  onClick={handleRefetch}
                  disabled={isRefetching}
                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh data from AURA API"
                >
                  {isRefetching ? '🔄' : '↻'} Refetch
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Initial Investment */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
          <div className="text-sm text-blue-800 mb-1">Initial Investment</div>
          <div className="text-xl font-bold text-blue-600 mb-2">
            {formatCurrency(principal)}
          </div>
          {source === 'Manual' && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              ✏️ Adjust
            </button>
          )}
        </div>

        {/* Growth Rate */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 text-center">
          <div className="text-sm text-purple-800 mb-1">Annual Rate</div>
          <div className="text-xl font-bold text-purple-600">{ratePct}%</div>
          <div className="text-xs text-purple-600 mt-1">
            {ratePct === 4
              ? 'Conservative'
              : ratePct === 11
                ? 'Balanced'
                : 'Aggressive'}
          </div>
        </div>

        {/* Time Period */}
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 text-center">
          <div className="text-sm text-indigo-800 mb-1">Time Period</div>
          <div className="text-xl font-bold text-indigo-600">
            {years} {years === 1 ? 'Year' : 'Years'}
          </div>
        </div>

        {/* Final Value */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
          <div className="text-sm text-green-800 mb-1">Final Value</div>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(finalCompound)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {(finalCompound / principal).toFixed(1)}x growth
          </div>
        </div>
      </div>

      {/* Key insight - Extra growth from compounding */}
      <div className="text-center mb-6">
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300 inline-block">
          <div className="text-sm text-green-700 mb-1">
            🎯 Extra Growth from Compounding
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(upliftAbs)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            That's the magic of compound interest!
          </div>
        </div>
      </div>

      {/* Chart integrated into the panel */}
      <div className="mb-6">
        <div className="h-80 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dataWithExtra}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                {/* Gradient for invested amount */}
                <linearGradient
                  id="investedGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>

                {/* Animated gradient for extra growth */}
                <linearGradient
                  id="extraGrowthAnimated"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}>
                    <animate
                      attributeName="stop-opacity"
                      values="0.8;1;0.8"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="50%" stopColor="#059669" stopOpacity={0.6}>
                    <animate
                      attributeName="stop-opacity"
                      values="0.6;0.9;0.6"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.3}>
                    <animate
                      attributeName="stop-opacity"
                      values="0.3;0.7;0.3"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </stop>
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                strokeOpacity={0.3}
              />

              <XAxis
                dataKey="year"
                tickFormatter={(value) => `Year ${value}`}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />

              <YAxis
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const invested = payload[0]?.value as number
                    const total = payload[1]?.value as number
                    const extra = total - invested

                    return (
                      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl p-4">
                        <p className="font-semibold text-gray-900 mb-2">
                          Year {label}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              <span className="text-sm text-gray-600">
                                Invested:
                              </span>
                            </div>
                            <span className="font-medium text-blue-600">
                              {formatCurrency(invested)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-sm text-gray-600">
                                Extra Growth:
                              </span>
                            </div>
                            <span className="font-medium text-green-600">
                              {formatCurrency(extra)}
                            </span>
                          </div>
                          <div className="border-t border-gray-200 pt-1 mt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                Total Value:
                              </span>
                              <span className="font-bold text-gray-900">
                                {formatCurrency(total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />

              <Legend
                content={({ payload }) => (
                  <div className="flex justify-center space-x-6 mt-4">
                    {payload?.map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />

              {/* Invested amount area (base layer) */}
              <Area
                type="monotone"
                dataKey="invested"
                stackId="1"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#investedGradient)"
                name="Invested"
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: '#3b82f6',
                  strokeWidth: 2,
                  fill: '#ffffff',
                }}
              />

              {/* Extra growth from compounding (top layer) */}
              <Area
                type="monotone"
                dataKey="extraGrowth"
                stackId="1"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#extraGrowthAnimated)"
                name="Extra growth from compounding"
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: '#10b981',
                  strokeWidth: 2,
                  fill: '#ffffff',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
          🎛️ Explore Growth Scenarios
        </h3>

        {/* Rate Selection */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-3 text-center">
            Choose your annual interest rate:
          </div>
          <div className="flex gap-2 justify-center">
            {([4, 11, 21] as const).map((rate) => (
              <button
                key={rate}
                onClick={() => onRatePctChange(rate)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  ratePct === rate
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
                }`}
                title={`${rate}% annual rate - ${rate === 4 ? 'stable yields (Lido, USDC lending)' : rate === 11 ? 'DeFi pools (Aave, Balancer)' : 'aggressive farming (vaults, LSDfi)'}`}
              >
                {rate}%{' '}
                {rate === 4
                  ? '(conservative)'
                  : rate === 11
                    ? '(balanced)'
                    : '(aggressive)'}
              </button>
            ))}
          </div>
        </div>

        {/* Years Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Time Period: {years} {years === 1 ? 'year' : 'years'}
          </label>
          <div className="max-w-md mx-auto">
            <input
              type="range"
              min="1"
              max="35"
              value={years}
              onChange={(e) => onYearsChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 year</span>
              <span>35 years</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editing controls */}
      {isEditing && (
        <div className="flex items-center justify-center gap-2 mb-4 p-4 bg-white/70 rounded-lg border border-blue-300">
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="input-field w-32"
            min="0"
            step="0.01"
            placeholder="Enter amount"
          />
          <button onClick={handleSave} className="btn-primary text-sm">
            Save
          </button>
          <button onClick={handleCancel} className="btn-secondary text-sm">
            Cancel
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        This simulation is for educational purposes only — not financial advice.
      </p>
    </div>
  )
}
