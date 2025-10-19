import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatCurrency } from '../lib/format'

interface DataPoint {
  year: number
  simple: number
  compound: number
}

interface CompoundChartProps {
  data: DataPoint[]
}

export function CompoundChart({ data }: CompoundChartProps) {
  const formatTooltipValue = (value: number) => formatCurrency(value)

  // Calculate the extra growth from compounding
  const dataWithExtra = data.map((point) => ({
    ...point,
    invested: data[0]?.simple || 0, // Always show the initial investment amount
    extraGrowth: point.compound - (data[0]?.simple || 0), // Extra growth from compounding
  }))

  return (
    <div className="card bg-gradient-to-br from-white to-blue-50/30 border-0 shadow-xl">
      <div className="relative">
        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
          💎 The Magic of Compound Interest
        </h3>
        <p className="text-gray-600 mb-6 text-sm">
          Watch how your money grows exponentially over time
        </p>

        {/* Floating stats overlay - moved above chart */}
        <div className="mb-4 flex justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/20">
            <div className="text-xs text-gray-600 mb-1">
              Final Year Comparison
            </div>
            <div className="text-sm font-bold text-green-600">
              +
              {(
                (data[data.length - 1]?.compound / (data[0]?.simple || 1) - 1) *
                100
              ).toFixed(0)}
              %<span className="text-gray-500 text-xs ml-1">total growth</span>
            </div>
          </div>
        </div>

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

                {/* Gradient for extra growth */}
                <linearGradient
                  id="extraGrowthGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
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

        {/* Key insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatCurrency(data[0]?.simple || 0)}
            </div>
            <div className="text-sm text-blue-800">Initial Investment</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatCurrency(
                (data[data.length - 1]?.compound || 0) - (data[0]?.simple || 0)
              )}
            </div>
            <div className="text-sm text-green-800">Extra from Compounding</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatCurrency(data[data.length - 1]?.compound || 0)}
            </div>
            <div className="text-sm text-purple-800">Final Value</div>
          </div>
        </div>
      </div>
    </div>
  )
}
