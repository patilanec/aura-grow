import { formatCurrency, formatPercent } from '../lib/format'
import { simpleGrowth, compoundGrowth } from '../lib/compound'

interface KpiStripProps {
  principal: number
  ratePct: number
  years: number
}

export function KpiStrip({ principal, ratePct, years }: KpiStripProps) {
  const finalSimple = simpleGrowth(principal, ratePct, years)
  const finalCompound = compoundGrowth(principal, ratePct, years)
  const upliftAbs = finalCompound - finalSimple
  const upliftPct = ((finalCompound - finalSimple) / finalSimple) * 100

  return (
    <div className="space-y-4 mb-6">
      {/* Main compound result - WOW factor */}
      <div className="card text-center bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
        <div className="text-lg font-semibold text-green-800 mb-2">
          🚀 Balance after {years} {years === 1 ? 'year' : 'years'} (compound)
        </div>
        <div className="text-4xl font-bold text-green-600 mb-2">
          {formatCurrency(finalCompound)}
        </div>
        <div className="text-sm text-green-700">
          Starting from {formatCurrency(principal)} at {ratePct}% annually
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card text-center">
          <div className="text-sm text-gray-600 mb-1">
            Balance after {years} {years === 1 ? 'year' : 'years'} (simple)
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(finalSimple)}
          </div>
        </div>

        <div className="card text-center">
          <div className="text-sm text-gray-600 mb-1">
            Extra growth from compounding
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(upliftAbs)}
          </div>
        </div>
      </div>
    </div>
  )
}
