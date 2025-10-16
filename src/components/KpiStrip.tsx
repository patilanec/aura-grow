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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="card text-center">
        <div className="text-sm text-gray-600 mb-1">Final Simple</div>
        <div className="text-xl font-bold text-gray-900">
          {formatCurrency(finalSimple)}
        </div>
      </div>
      
      <div className="card text-center">
        <div className="text-sm text-gray-600 mb-1">Final Compound</div>
        <div className="text-xl font-bold text-green-600">
          {formatCurrency(finalCompound)}
        </div>
      </div>
      
      <div className="card text-center">
        <div className="text-sm text-gray-600 mb-1">Uplift ($)</div>
        <div className="text-xl font-bold text-blue-600">
          {formatCurrency(upliftAbs)}
        </div>
      </div>
      
      <div className="card text-center">
        <div className="text-sm text-gray-600 mb-1">Uplift (%)</div>
        <div className="text-xl font-bold text-purple-600">
          {formatPercent(upliftPct)}
        </div>
      </div>
    </div>
  )
}
