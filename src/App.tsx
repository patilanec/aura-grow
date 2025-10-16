import { useState } from 'react'
import { getPrincipalUsd } from './lib/aura'
import { AddressInput } from './components/AddressInput'
import { PrincipalPanel } from './components/PrincipalPanel'
import { ScenarioPlayground } from './components/ScenarioPlayground'
import { ErrorCard } from './components/ErrorCard'
import { PrincipalSkeleton, ChartSkeleton } from './components/Skeleton'

type PrincipalSource = 'AURA' | 'Manual'

interface AppState {
  address: string
  principalUsd: number | null
  source: PrincipalSource
  cached: boolean
  loading: boolean
  error: string | null
}

function App() {
  const [state, setState] = useState<AppState>({
    address: '',
    principalUsd: null,
    source: 'Manual',
    cached: false,
    loading: false,
    error: null,
  })

  const handleAddressSubmit = async (address: string) => {
    setState((prev) => ({
      ...prev,
      address,
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
    }
  }

  const handleRetry = () => {
    if (state.address) {
      handleAddressSubmit(state.address)
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
    setState((prev) => ({
      ...prev,
      address: '',
      principalUsd: null,
      source: 'Manual',
      cached: false,
      error: null,
    }))
  }

  const handleUpdatePrincipal = (newPrincipal: number) => {
    setState((prev) => ({
      ...prev,
      principalUsd: newPrincipal,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aura Grow</h1>
          <p className="text-gray-600">
            Visualize compound vs simple interest growth using your wallet
            balance
          </p>
        </header>

        <main className="space-y-6">
          {/* Address Input */}
          {!state.principalUsd && !state.loading && !state.error && (
            <AddressInput
              onSubmit={handleAddressSubmit}
              loading={state.loading}
            />
          )}

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
            <div className="space-y-6">
              <PrincipalPanel
                principal={state.principalUsd}
                source={state.source}
                cached={state.cached}
                onUpdatePrincipal={handleUpdatePrincipal}
              />

              <ScenarioPlayground principalUsd={state.principalUsd} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 space-y-2">
          <p>
            <strong>Educational simulation.</strong> Not financial advice.
          </p>
          {state.principalUsd && (
            <p>
              Initial amount{' '}
              {state.source === 'AURA'
                ? 'from AURA balances'
                : 'entered manually'}
            </p>
          )}
        </footer>
      </div>
    </div>
  )
}

export default App
