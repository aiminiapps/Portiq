import { defaultWagmiConfig } from '@web3modal/wagmi/react'
import { http } from 'wagmi'
import { mainnet, polygon, arbitrum, base, optimism, sepolia, bsc } from 'wagmi/chains'

// WalletConnect Project ID (from https://cloud.walletconnect.com)
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
if (!projectId) throw new Error('Missing NEXT_PUBLIC_WC_PROJECT_ID')

// Define supported chains
export const chains = [mainnet, polygon, arbitrum, base, optimism, bsc, sepolia]

// Optional: your own RPC transports (recommended for production)
const transports = {
  [mainnet.id]: http(),
  [polygon.id]: http(),
  [arbitrum.id]: http(),
  [base.id]: http(),
  [optimism.id]: http(),
  [bsc.id]: http(),
  [sepolia.id]: http()
}

// App metadata (shows in wallet during connection)
export const metadata = {
  name: 'MyDApp',
  description: 'Web3 app that works on Desktop, Mobile & Telegram',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://example.com',
  icons: [process.env.NEXT_PUBLIC_APP_ICON || 'https://example.com/icon.png']
}

// ✅ wagmi config (already complete, no createConfig needed)
export const config = defaultWagmiConfig({
  projectId,
  chains,
  metadata,
  transports
})
