interface ErrorCardProps {
  message: string
  onRetry: () => void
  onUseManual: () => void
  onChangeAddress: () => void
}

export function ErrorCard({
  message,
  onRetry,
  onUseManual,
  onChangeAddress,
}: ErrorCardProps) {
  return (
    <div className="card border-red-200 bg-red-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Couldn't Load from AURA
          </h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          <p className="mt-2 text-sm text-gray-600">
            Don't worry — you can still explore how compound interest works!
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={onRetry} className="btn-primary text-sm">
              Try Again
            </button>
            <button onClick={onUseManual} className="btn-secondary text-sm">
              Use Manual Amount & Keep Learning
            </button>
            <button onClick={onChangeAddress} className="btn-secondary text-sm">
              Try Different Address
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
