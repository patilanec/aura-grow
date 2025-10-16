import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import {
  injected,
  metaMask,
  walletConnect,
  coinbaseWallet,
} from 'wagmi/connectors'

// Create wagmi config with standard connectors
export function createWalletConfig() {
  const connectors = [
    metaMask(),
    coinbaseWallet({
      appName: 'AuraGrow',
      appLogoUrl: 'https://aura.adex.network/favicon.ico',
    }),
    walletConnect({
      projectId:
        import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
    injected(), // This will automatically detect all installed wallets
  ]

  return createConfig({
    chains: [mainnet, sepolia],
    connectors,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  })
}

export const config = createWalletConfig()
