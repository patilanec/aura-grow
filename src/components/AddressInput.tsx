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
    <div className="card">
      <h2 className="text-lg font-semibold mb-2">
        Start Your Learning Journey
      </h2>
      <p className="text-gray-600 mb-4">
        Connect your wallet or enter your address to fetch your total balance
        from AURA. We'll use it as your starting point to explore how compound
        interest works.
      </p>

      {/* Wallet Connect Option */}
      <div className="mb-4">
        <button
          onClick={() => setShowWalletConnect(true)}
          disabled={loading}
          className="w-full flex items-center justify-center p-4 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Connect Wallet (Recommended)
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Manual Address Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter Wallet Address Manually
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x... or ENS name"
            className="input-field"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !address.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Loading from AURA...'
            : 'Load My Balance & Start Learning'}
        </button>
      </form>
    </div>
  )
}
