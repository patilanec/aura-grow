import { useEffect, useRef } from 'react'
import { useAccount, useDisconnect } from 'wagmi'

interface WalletAccountListenerProps {
  onAddressChange: (address: string) => void
  currentAddress: string
  isWalletConnected: boolean
  isChangingAddress: boolean
  onDisconnect?: () => void
}

export function WalletAccountListener({
  onAddressChange,
  currentAddress,
  isWalletConnected,
  isChangingAddress,
  onDisconnect,
}: WalletAccountListenerProps) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const lastProcessedAddress = useRef<string>('')
  const isProcessing = useRef<boolean>(false)
  const processedInThisSession = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Prevent any processing if we're already processing, changing address, or wallet is not connected
    if (isProcessing.current || isChangingAddress || !isWalletConnected) {
      return
    }

    // Only process if:
    // 1. Wallet is connected
    // 2. We have a wallet address
    // 3. The address is different from what we last processed
    // 4. The address is different from current address
    // 5. We haven't processed this address in this session
    if (
      isConnected &&
      address &&
      address !== lastProcessedAddress.current &&
      address !== currentAddress &&
      !processedInThisSession.current.has(address)
    ) {
      isProcessing.current = true
      lastProcessedAddress.current = address
      processedInThisSession.current.add(address)

      // Use setTimeout to break the synchronous call chain
      setTimeout(() => {
        onAddressChange(address)
        isProcessing.current = false
      }, 0)
    }
  }, [
    address,
    isConnected,
    currentAddress,
    isChangingAddress,
    isWalletConnected,
    onAddressChange,
  ])

  // Reset when current address changes
  useEffect(() => {
    if (currentAddress !== lastProcessedAddress.current) {
      lastProcessedAddress.current = currentAddress
      // Clear the processed set when address changes
      processedInThisSession.current.clear()
    }
  }, [currentAddress])

  // Clear processed addresses when wallet is disconnected
  useEffect(() => {
    if (!isWalletConnected) {
      processedInThisSession.current.clear()
      lastProcessedAddress.current = ''
    }
  }, [isWalletConnected])

  // Don't automatically disconnect wallet - let the user control this
  // The disconnect should only happen when user explicitly clicks "Disconnect Wallet"

  // This component doesn't render anything
  return null
}
