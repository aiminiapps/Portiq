import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, polygon, arbitrum, base, optimism } from 'wagmi/chains'

// Get projectId from https://cloud.walletconnect.com (free)
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

const metadata = {
  name: 'Portiq AI Agent',
  description: 'Real Web3 Portfolio Intelligence',
  url: 'https://portiq.ai',
  icons: ['https://portiq.ai/icon.png']
}

const chains = [mainnet, polygon, arbitrum, base, optimism]

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  })
})
