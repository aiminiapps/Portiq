'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { WagmiProvider } from 'wagmi'
import { config, projectId, chains } from '../lib/wagmi'

// Optimized QueryClient for caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, cacheTime: 10 * 60 * 1000 }
  }
})

// ✅ Create Web3Modal once at module level (not inside React component)
if (typeof window !== 'undefined' && !window.__WEB3MODAL_INITIALIZED__) {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    chains,
    enableAnalytics: true,
    enableOnramp: true,
    enableSwaps: true,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-z-index': 99999,
      '--w3m-accent': '#00FFAA'
    }
  })
  window.__WEB3MODAL_INITIALIZED__ = true // prevent duplicate init
}

export default function Web3Provider({ children, initialState }) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
