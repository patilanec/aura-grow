import { useEffect, useRef } from 'react'
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
  const lastProcessedAddress = useRef<string>('')
  const isProcessing = useRef<boolean>(false)
  const processedInThisSession = useRef<Set<string>>(new Set())

  useEffect(() => {
    console.log('WalletAccountListener useEffect triggered:', {
      isConnected,
      address,
      currentAddress,
      isChangingAddress,
      isProcessing: isProcessing.current,
      lastProcessed: lastProcessedAddress.current,
      processedInSession: Array.from(processedInThisSession.current),
    })

    // Prevent any processing if we're already processing or changing address
    if (isProcessing.current || isChangingAddress) {
      console.log('Skipping - already processing or changing address')
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
      console.log('Processing address change:', address)
      isProcessing.current = true
      lastProcessedAddress.current = address
      processedInThisSession.current.add(address)

      // Use setTimeout to break the synchronous call chain
      setTimeout(() => {
        onAddressChange(address)
        isProcessing.current = false
      }, 0)
    } else {
      console.log('Not processing - conditions not met')
    }
  }, [address, isConnected, currentAddress, isChangingAddress, onAddressChange])

  // Reset when current address changes
  useEffect(() => {
    console.log('Current address changed:', {
      currentAddress,
      lastProcessed: lastProcessedAddress.current,
    })
    if (currentAddress !== lastProcessedAddress.current) {
      lastProcessedAddress.current = currentAddress
      // Clear the processed set when address changes
      processedInThisSession.current.clear()
      console.log(
        'Reset lastProcessedAddress to:',
        currentAddress,
        'and cleared processed set'
      )
    }
  }, [currentAddress])

  // This component doesn't render anything
  return null
}
