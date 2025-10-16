# Aura Grow

A tiny educational app that visualizes compound vs simple interest growth using your wallet balance as the initial principal.

## Features

- **Web3 Wallet Connection**: Connect directly with popular wallets (MetaMask, Coinbase Wallet, WalletConnect)
- **Auto Wallet Sync**: Automatically updates when you switch accounts in your connected wallet
- **Wallet Integration**: Fetches total USD balance from AURA API using any EVM address or ENS name
- **Interactive Scenarios**: Compare compound vs simple interest across different rates (3%, 6%, 10%) and time periods (1-10 years)
- **Real-time Visualization**: Clean line chart showing growth over time
- **Smart Caching**: 1-hour cache for API responses to improve performance
- **Fallback Options**: Manual amount input when API is unavailable

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Optional: Set API Keys** (for enhanced functionality):

   ```bash
   # Create .env file
   echo "VITE_AURA_API_KEY=your_api_key_here" > .env
   echo "VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here" >> .env
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Usage

1. **Connect Wallet** (Recommended): Click "Connect Wallet" to connect directly with your Web3 wallet
2. **Manual Entry**: Alternatively, enter an EVM wallet address (0x...) or ENS name manually
3. The app fetches your total USD balance from AURA
4. Use the scenario controls to explore different interest rates and time periods
5. Compare simple vs compound interest growth in the interactive chart

## API Integration

The app integrates with the AURA API to fetch wallet balances:

- **Endpoint**: `https://aura.adex.network/api/portfolio/balances?address=<addr>[&apiKey=<key>]`
- **Caching**: Responses are cached for 1 hour in memory + localStorage
- **Fallback**: If API fails, you can enter a manual amount

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Web3**: Wagmi + Viem for wallet connections
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **State**: Local component state (no Redux)
- **Linting**: ESLint + Prettier

## Disclaimer

This is an educational simulation tool. It is not financial advice. The calculations are simplified and do not account for fees, taxes, or real-world market conditions.
