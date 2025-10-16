import { useEffect } from 'react'
import { useAccount } from 'wagmi'

interface WalletAccountListenerProps {
  onAddressChange: (address: string) => void
  currentAddress: string
  isWalletConnected: boolean
  isChangingAddress: boolean
}

export function WalletAccountListener({
  onAddressChange,
  currentAddress,
  isWalletConnected,
  isChangingAddress,
}: WalletAccountListenerProps) {
  const { address, isConnected } = useAccount()

  useEffect(() => {
    // Only trigger if:
    // 1. Wallet is connected
    // 2. We have a wallet address
    // 3. The address has changed
    // 4. The current session was started with a wallet connection
    if (
      isConnected &&
      address &&
      address !== currentAddress &&
      isWalletConnected &&
      !isChangingAddress
    ) {
      onAddressChange(address)
    }
  }, [
    address,
    isConnected,
    currentAddress,
    isWalletConnected,
    isChangingAddress,
    onAddressChange,
  ])

  // This component doesn't render anything
  return null
}
