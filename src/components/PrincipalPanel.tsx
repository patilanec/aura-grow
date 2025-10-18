import { useState } from 'react'
import { formatCurrency } from '../lib/format'

interface PrincipalPanelProps {
  principal: number
  source: 'AURA' | 'Manual'
  cached?: boolean
  isWalletConnected?: boolean
  onUpdatePrincipal: (newPrincipal: number) => void
  onChangeAddress: () => void
}

export function PrincipalPanel({
  principal,
  source,
  cached = false,
  isWalletConnected = false,
  onUpdatePrincipal,
  onChangeAddress,
}: PrincipalPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(principal.toString())

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
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Starting amount: {formatCurrency(principal)}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  source === 'AURA'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {source === 'AURA' ? 'Loaded from AURA' : 'Manual amount'}
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
            <button
              onClick={onChangeAddress}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Change Address
            </button>
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2">
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
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(principal)}
              </span>
              {source === 'Manual' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Adjust Amount
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        This simulation is for educational purposes only — not financial advice.
      </p>
    </div>
  )
}
