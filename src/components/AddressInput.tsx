import { useState } from 'react'

interface AddressInputProps {
  onSubmit: (address: string) => void
  loading?: boolean
}

export function AddressInput({ onSubmit, loading = false }: AddressInputProps) {
  const [address, setAddress] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = address.trim()
    if (trimmed) {
      onSubmit(trimmed)
    }
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-2">
        Start Your Learning Journey
      </h2>
      <p className="text-gray-600 mb-4">
        Enter your wallet address to fetch your total balance from AURA. We'll
        use it as your starting point to explore how compound interest works.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Wallet Address
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
