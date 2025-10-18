import { useEffect, useRef } from 'react'
import { useConnect, useAccount, useDisconnect } from 'wagmi'

interface WalletConnectProps {
  onAddressConnected: (address: string) => void
  onCancel: () => void
}

export function WalletConnect({
  onAddressConnected,
  onCancel,
}: WalletConnectProps) {
  const { connect, connectors, isPending, error } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const onAddressConnectedRef = useRef(onAddressConnected)

  // Keep the ref up to date
  onAddressConnectedRef.current = onAddressConnected

  useEffect(() => {
    if (isConnected && address) {
      onAddressConnectedRef.current(address)
    }
  }, [isConnected, address])

  const handleConnect = (connector: any) => {
    connect({ connector })
  }

  const handleDisconnect = () => {
    disconnect()
  }

  // Filter out duplicate connectors and prioritize installed wallets
  const sortedConnectors = connectors
    .filter(
      (connector, index, self) =>
        index === self.findIndex((c) => c.name === connector.name)
    )
    .filter((connector) => connector.name !== 'Injected') // Remove generic injected connector
    .sort((a, b) => {
      // Prioritize installed wallets (injected connectors that are ready)
      const aIsInstalled = a.type === 'injected' && a.name !== 'Injected'
      const bIsInstalled = b.type === 'injected' && b.name !== 'Injected'

      if (aIsInstalled && !bIsInstalled) return -1
      if (!aIsInstalled && bIsInstalled) return 1

      // Then sort by name alphabetically
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Connect Wallet</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Choose a wallet to connect and automatically load your balance from AdEx
        AURA:
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error.message}</p>
        </div>
      )}

      <div className="space-y-3">
        {sortedConnectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => handleConnect(connector)}
            disabled={isPending}
            className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connector.icon && (
              <img
                src={connector.icon}
                alt={connector.name}
                className="w-8 h-8 mr-3 rounded-full"
              />
            )}
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">{connector.name}</div>
            </div>
            {isPending && (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>
        ))}
      </div>

      {isConnected && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 font-medium">Connected!</p>
              <p className="text-green-600 text-sm font-mono">{address}</p>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          We only read your balance from AdEx AURA - no transactions are
          required.
        </p>
      </div>
    </div>
  )
}
