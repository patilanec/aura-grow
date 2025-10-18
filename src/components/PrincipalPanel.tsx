import { useState } from 'react'
import { formatCurrency } from '../lib/format'
import { simpleGrowth, compoundGrowth } from '../lib/compound'

interface PrincipalPanelProps {
  principal: number
  source: 'AURA' | 'Manual'
  cached?: boolean
  isWalletConnected?: boolean
  ratePct: 4 | 11 | 21
  years: number
  onUpdatePrincipal: (newPrincipal: number) => void
}

export function PrincipalPanel({
  principal,
  source,
  cached = false,
  isWalletConnected = false,
  ratePct,
  years,
  onUpdatePrincipal,
}: PrincipalPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(principal.toString())

  // Calculate compound growth for wow effect
  const finalCompound = compoundGrowth(principal, ratePct, years)
  const finalSimple = simpleGrowth(principal, ratePct, years)
  const upliftAbs = finalCompound - finalSimple

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
    <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
      {/* Header with title and badges */}
      <div className="text-center mb-4">
        <div className="text-lg font-semibold text-green-800 mb-2">
          🚀 Your Portfolio Growth Potential
        </div>
        <div className="flex items-center justify-center gap-2">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              source === 'AURA'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {source === 'AURA' ? 'Loaded from AdEx AURA' : 'Manual amount'}
          </span>
          {isWalletConnected && (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              🔗 Wallet Connected
            </span>
          )}
          {cached && (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              cached
            </span>
          )}
        </div>
      </div>

      {/* Main comparison - clean and focused */}
      <div className="text-center mb-4">
        {/* Visual comparison with wow effect */}
        <div className="flex items-center justify-center gap-6 mb-3">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Starting amount</div>
            <div className="text-2xl font-bold text-gray-700">
              {formatCurrency(principal)}
            </div>
            {source === 'Manual' && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                Adjust
              </button>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="text-2xl text-green-600">→</div>
            <div className="text-xs text-gray-500">at {ratePct}% annually</div>
          </div>

          <div className="text-center">
            <div className="text-sm text-green-600 mb-1">
              After {years} years
            </div>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(finalCompound)}
            </div>
          </div>
        </div>

        {/* Growth multiplier - prominent */}
        <div className="bg-white/70 rounded-xl p-3 border-2 border-green-300 inline-block">
          <div className="text-sm text-green-700 mb-1">Growth multiplier</div>
          <div className="text-2xl font-bold text-green-600">
            {(finalCompound / principal).toFixed(1)}x
          </div>
        </div>
      </div>

      {/* Editing controls */}
      {isEditing && (
        <div className="flex items-center justify-center gap-2 mb-3 p-3 bg-white/70 rounded-lg border border-green-300">
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="input-field w-32"
            min="0"
            step="0.01"
          />
          <button onClick={handleSave} className="btn-primary text-sm">
            Save
          </button>
          <button onClick={handleCancel} className="btn-secondary text-sm">
            Cancel
          </button>
        </div>
      )}

      {/* Single metric - extra growth from compounding */}
      <div className="text-center mb-3">
        <div className="bg-white/70 rounded-lg p-3 border border-green-300 inline-block">
          <div className="text-sm text-gray-600 mb-1">
            Extra growth from compounding
          </div>
          <div className="text-xl font-bold text-purple-600">
            {formatCurrency(upliftAbs)}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        This simulation is for educational purposes only — not financial advice.
      </p>
    </div>
  )
}
