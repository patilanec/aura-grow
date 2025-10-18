import { useState } from 'react'
import { WalletConnect } from './WalletConnect'

interface AddressInputProps {
  onSubmit: (address: string, isWalletConnected?: boolean) => void
  loading?: boolean
}

export function AddressInput({ onSubmit, loading = false }: AddressInputProps) {
  const [address, setAddress] = useState('')
  const [showWalletConnect, setShowWalletConnect] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = address.trim()
    if (trimmed) {
      onSubmit(trimmed, false) // Manual entry, not wallet connected
    }
  }

  const handleWalletConnect = (connectedAddress: string) => {
    onSubmit(connectedAddress, true) // Wallet connected
  }

  const handleCancelWalletConnect = () => {
    setShowWalletConnect(false)
  }

  if (showWalletConnect) {
    return (
      <WalletConnect
        onAddressConnected={handleWalletConnect}
        onCancel={handleCancelWalletConnect}
      />
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-sm rounded-2xl border-2 border-blue-200 shadow-xl p-4">
      {/* Horizontal Layout for Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <button
          onClick={() => setShowWalletConnect(true)}
          disabled={loading}
          className="flex-1 flex flex-col items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
        >
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Connect Wallet
          </div>
          <div className="text-xs opacity-90 mt-1">(Recommended)</div>
        </button>

        <div className="flex items-center justify-center text-sm text-gray-500 sm:hidden">
          or
        </div>

        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x... or ENS name"
              className="input-field text-sm"
              disabled={loading}
              aria-label="Enter wallet address"
            />
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-sm"
            >
              {loading ? 'Loading...' : 'Enter manually'}
            </button>
          </form>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        No transactions are made. This is a learning simulation.
      </p>
    </div>
  )
}
