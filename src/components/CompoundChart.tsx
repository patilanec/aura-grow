import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Growth Comparison</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              tickFormatter={(value) => `Year ${value}`}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number) => [formatTooltipValue(value), '']}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="simple" 
              stroke="#6b7280" 
              strokeWidth={2}
              name="Simple Interest"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="compound" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Compound Interest"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
