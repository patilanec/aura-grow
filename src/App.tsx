import { useState, useRef, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { getPrincipalUsd } from './lib/aura'
import { AddressInput } from './components/AddressInput'
import { PrincipalPanel } from './components/PrincipalPanel'
import { ScenarioPlayground } from './components/ScenarioPlayground'
import { ErrorCard } from './components/ErrorCard'
import { PrincipalSkeleton, ChartSkeleton } from './components/Skeleton'
import { Web3Provider } from './components/Web3Provider'
import { WalletAccountListener } from './components/WalletAccountListener'

type PrincipalSource = 'AURA' | 'Manual'

interface AppState {
  address: string
  principalUsd: number | null
  source: PrincipalSource
  cached: boolean
  loading: boolean
  error: string | null
  isWalletConnected: boolean
  isChangingAddress: boolean
  ratePct: 4 | 11 | 21
  years: number
}

function AppContent() {
  const { address: wagmiAddress, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [state, setState] = useState<AppState>(() => {
    // Try to restore state from localStorage on initial load
    try {
      const saved = localStorage.getItem('aura-grow-state')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Restore state if we have an address
        if (parsed.address) {
          return {
            address: parsed.address,
            principalUsd: parsed.principalUsd,
            source: parsed.source || 'Manual',
            cached: false, // Reset cache status
            loading: false,
            error: null,
            isWalletConnected: parsed.isWalletConnected || false,
            isChangingAddress: false,
            ratePct: parsed.ratePct || 11,
            years: parsed.years || 30,
          }
        }
      }
    } catch (error) {
      console.warn('Failed to restore state from localStorage:', error)
    }

    // Default state
    return {
      address: '',
      principalUsd: null,
      source: 'Manual',
      cached: false,
      loading: false,
      error: null,
      isWalletConnected: false,
      isChangingAddress: false,
      ratePct: 11,
      years: 30,
    }
  })
  const isProcessingRef = useRef<boolean>(false)

  // Save state to localStorage whenever it changes (except for loading/error states)
  useEffect(() => {
    if (state.address && !state.loading && !state.error) {
      try {
        localStorage.setItem(
          'aura-grow-state',
          JSON.stringify({
            address: state.address,
            principalUsd: state.principalUsd,
            source: state.source,
            isWalletConnected: state.isWalletConnected,
            ratePct: state.ratePct,
            years: state.years,
          })
        )
      } catch (error) {
        console.warn('Failed to save state to localStorage:', error)
      }
    }
  }, [
    state.address,
    state.principalUsd,
    state.source,
    state.isWalletConnected,
    state.ratePct,
    state.years,
    state.loading,
    state.error,
  ])

  // Sync with wagmi when it connects/disconnects
  useEffect(() => {
    if (isConnected && wagmiAddress && !state.isWalletConnected) {
      // Wagmi connected but our state doesn't know about it
      // This happens when wallet auto-connects on page load
      setState((prev) => ({
        ...prev,
        address: wagmiAddress,
        isWalletConnected: true,
        source: 'AURA',
        // Don't clear other state, just update the connection info
      }))
    } else if (!isConnected && state.isWalletConnected) {
      // Wagmi disconnected but our state still thinks it's connected
      // This happens when wallet is disconnected externally
      setState((prev) => ({
        ...prev,
        address: '',
        principalUsd: null,
        source: 'Manual',
        cached: false,
        isWalletConnected: false,
      }))
      try {
        localStorage.removeItem('aura-grow-state')
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
    }
  }, [isConnected, wagmiAddress, state.isWalletConnected])

  const handleAddressSubmit = async (
    address: string,
    isWalletConnected: boolean = false
  ) => {
    // Prevent processing if we're already processing
    if (isProcessingRef.current) {
      return
    }

    // Prevent processing if we're already loading or if it's the same address
    if (
      state.loading ||
      (state.address === address &&
        state.isWalletConnected === isWalletConnected)
    ) {
      return
    }

    isProcessingRef.current = true
    setState((prev) => ({
      ...prev,
      address,
      isWalletConnected,
      isChangingAddress: false,
      loading: true,
      error: null,
    }))

    try {
      const apiKey = import.meta.env.VITE_AURA_API_KEY
      const result = await getPrincipalUsd(address, apiKey)

      if (result.principal !== null) {
        setState((prev) => ({
          ...prev,
          principalUsd: result.principal,
          source: 'AURA',
          cached: result.cached,
          loading: false,
          error: null,
        }))
      } else {
        // AURA returned data but couldn't extract USD value
        setState((prev) => ({
          ...prev,
          principalUsd: 1000,
          source: 'Manual',
          cached: false,
          loading: false,
          error: null,
        }))
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch balance',
      }))
    } finally {
      isProcessingRef.current = false
    }
  }

  const handleRetry = () => {
    if (state.address) {
      handleAddressSubmit(state.address, state.isWalletConnected)
    }
  }

  const handleUseManual = () => {
    setState((prev) => ({
      ...prev,
      principalUsd: 1000,
      source: 'Manual',
      cached: false,
      error: null,
    }))
  }

  const handleChangeAddress = () => {
    // Clear localStorage when user explicitly changes address
    try {
      localStorage.removeItem('aura-grow-state')
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }

    setState((prev) => ({
      ...prev,
      address: '',
      principalUsd: null,
      source: 'Manual',
      cached: false,
      error: null,
      isWalletConnected: false,
      isChangingAddress: true,
    }))
  }

  const handleDisconnectWallet = () => {
    // Disconnect the wallet first
    disconnect()

    // Clear localStorage when user explicitly disconnects wallet
    try {
      localStorage.removeItem('aura-grow-state')
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }

    setState((prev) => ({
      ...prev,
      address: '',
      principalUsd: null,
      source: 'Manual',
      cached: false,
      error: null,
      isWalletConnected: false,
      isChangingAddress: false,
    }))
  }

  // Handle wallet address changes
  const handleWalletAddressChange = (newAddress: string) => {
    // Only process if the address is actually different from current
    if (newAddress !== state.address) {
      handleAddressSubmit(newAddress, true)
    }
  }

  const handleUpdatePrincipal = (newPrincipal: number) => {
    setState((prev) => ({
      ...prev,
      principalUsd: newPrincipal,
    }))
  }

  const handleUpdateRatePct = (newRatePct: 4 | 11 | 21) => {
    setState((prev) => ({
      ...prev,
      ratePct: newRatePct,
    }))
  }

  const handleUpdateYears = (newYears: number) => {
    setState((prev) => ({
      ...prev,
      years: newYears,
    }))
  }

  return (
    <>
      <WalletAccountListener
        onAddressChange={handleWalletAddressChange}
        currentAddress={state.address}
        isWalletConnected={state.isWalletConnected}
        isChangingAddress={state.isChangingAddress}
        onDisconnect={() => {
          // Additional cleanup if needed
          console.log('Wallet disconnected')
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Show hero section only when no address is connected or when changing address */}
        {(!state.address || state.isChangingAddress) && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-green-600/10"></div>
            <div className="relative container mx-auto px-4 py-12 max-w-6xl">
              <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                  🚀 Hackathon Project
                </div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-6">
                  AuraGrow
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto">
                  Discover the{' '}
                  <span className="font-semibold text-green-600">
                    magic of compound interest
                  </span>{' '}
                  with your real crypto portfolio
                </p>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Powered by AdEx AURA — we use your wallet balance as a
                  starting point to visualize how time amplifies growth.
                </p>
              </div>

              {/* Ready to Explore Section - Call to Action */}
              <div className="text-center mb-20">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {state.isChangingAddress
                    ? 'Enter new address'
                    : 'Ready to explore?'}
                </h2>
                <p className="text-sm text-gray-600 mb-4 max-w-lg mx-auto">
                  {state.isChangingAddress
                    ? 'Enter a new wallet address to explore different scenarios'
                    : 'Connect your wallet or enter your address to get started'}
                </p>

                {/* Integrated Form */}
                <div className="max-w-lg mx-auto mb-4">
                  <AddressInput
                    onSubmit={handleAddressSubmit}
                    loading={state.loading}
                  />

                  {/* Cancel button when changing address */}
                  {state.isChangingAddress && (
                    <div className="mt-3">
                      <button
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            isChangingAddress: false,
                          }))
                        }
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-xs text-gray-500">
                  <div className="flex items-center">
                    <svg
                      className="w-3 h-3 mr-1 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    No transactions required
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-3 h-3 mr-1 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Educational simulation
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-3 h-3 mr-1 text-purple-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Powered by AdEx AURA
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Real Portfolio Data
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Connect your wallet and see projections based on your actual
                    AdEx AURA balance
                  </p>
                </div>

                <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Interactive Charts
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Visualize how compound interest grows your wealth over time
                    with beautiful charts
                  </p>
                </div>

                <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Educational Focus
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Learn the power of compounding with realistic scenarios and
                    clear explanations
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Minimal Header - shown when address is connected */}
        {state.address && (
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
            <div className="container mx-auto px-4 py-4 max-w-6xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                    AuraGrow
                  </h1>
                  <div className="hidden sm:flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {state.isWalletConnected
                      ? 'Wallet Connected'
                      : 'Manual Entry'}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600 font-mono">
                    {state.address.includes('.eth')
                      ? state.address
                      : `${state.address.slice(0, 6)}...${state.address.slice(-4)}`}
                  </div>
                  <button
                    onClick={
                      state.isWalletConnected
                        ? handleDisconnectWallet
                        : handleChangeAddress
                    }
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    {state.isWalletConnected
                      ? 'Disconnect Wallet'
                      : 'Change Address'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <main className="space-y-6">
            {/* Loading State */}
            {state.loading && (
              <div className="space-y-6">
                <PrincipalSkeleton />
                <ChartSkeleton />
              </div>
            )}

            {/* Error State */}
            {state.error && (
              <ErrorCard
                message={state.error}
                onRetry={handleRetry}
                onUseManual={handleUseManual}
                onChangeAddress={handleChangeAddress}
              />
            )}

            {/* Main Content */}
            {state.principalUsd && !state.loading && (
              <div className="space-y-4">
                <PrincipalPanel
                  principal={state.principalUsd}
                  source={state.source}
                  cached={state.cached}
                  isWalletConnected={state.isWalletConnected}
                  ratePct={state.ratePct}
                  years={state.years}
                  address={state.address}
                  onUpdatePrincipal={handleUpdatePrincipal}
                  onRatePctChange={handleUpdateRatePct}
                  onYearsChange={handleUpdateYears}
                />

                <ScenarioPlayground
                  principalUsd={state.principalUsd}
                  address={state.address}
                  ratePct={state.ratePct}
                  years={state.years}
                />
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="mt-4 text-center text-sm text-gray-500 space-y-4">
            <div className="pt-1 pb-4">
              <p className="text-gray-600">
                This is an educational tool powered by AdEx AURA. It's not
                financial advice — it's here to help you understand how time and
                interest shape results.
              </p>
              {state.principalUsd && (
                <p className="mt-2 text-gray-500">
                  Starting amount{' '}
                  {state.source === 'AURA'
                    ? 'loaded from AdEx AURA'
                    : 'entered manually for learning'}
                </p>
              )}
              <div className="mt-4 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs text-gray-400">
                <a
                  href="https://guide.adex.network/aura-hackathon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                >
                  Built for the AdEx AURA Hackathon
                </a>
                <span className="hidden sm:inline">•</span>
                <a
                  href="https://github.com/patilanec/aura-grow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-600 transition-colors"
                >
                  📂 Open Source
                </a>
                <span className="hidden sm:inline">•</span>
                <span>Made with 💜 for the crypto community</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  )
}

export default App
