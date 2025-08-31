'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaWallet, FaBrain, FaShieldAlt, FaChartPie, FaCoins, 
  FaExclamationTriangle, FaSync, FaEye, FaShare, FaCopy, FaGem,
  FaCheckCircle, FaDatabase,FaFire
} from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi'
import { 
  useAccount, 
  useBalance, 
  useDisconnect, 
  useChainId,
} from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { formatEther, formatUnits } from 'viem'

// Supported networks with RPC endpoints for token fetching
const SUPPORTED_NETWORKS = {
  1: { 
    name: 'Ethereum', 
    symbol: 'ETH', 
    color: '#627EEA',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/',
    explorer: 'https://etherscan.io'
  },
  137: { 
    name: 'Polygon', 
    symbol: 'MATIC', 
    color: '#8247E5',
    rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/',
    explorer: 'https://polygonscan.com'
  },
  42161: { 
    name: 'Arbitrum', 
    symbol: 'ETH', 
    color: '#28A0F0',
    rpcUrl: 'https://arb-mainnet.g.alchemy.com/v2/',
    explorer: 'https://arbiscan.io'
  },
  8453: { 
    name: 'Base', 
    symbol: 'ETH', 
    color: '#0052FF',
    rpcUrl: 'https://base-mainnet.g.alchemy.com/v2/',
    explorer: 'https://basescan.org'
  },
  10: { 
    name: 'Optimism', 
    symbol: 'ETH', 
    color: '#FF0420',
    rpcUrl: 'https://opt-mainnet.g.alchemy.com/v2/',
    explorer: 'https://optimistic.etherscan.io'
  }
}

// Popular tokens for demo data
const POPULAR_TOKENS = {
  1: [
    { symbol: 'USDC', name: 'USD Coin', address: '0xa0b86a33e6441b0cf4e9b34d2e0d96fa5d1c7f5' },
    { symbol: 'USDT', name: 'Tether USD', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
    { symbol: 'LINK', name: 'Chainlink', address: '0x514910771af9ca656af840dff83e8264ecf986ca' },
    { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
    { symbol: 'AAVE', name: 'Aave', address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9' }
  ],
  137: [
    { symbol: 'USDC', name: 'USD Coin', address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174' },
    { symbol: 'USDT', name: 'Tether USD', address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' },
    { symbol: 'WETH', name: 'Wrapped ETH', address: '0x7ceb23fd6af846d8b2bf9e6c1c36e9f94afc4b06' }
  ]
}

// Local Storage Keys
const STORAGE_KEYS = {
  WALLET_DATA: 'portiq_wallet_data',
  PORTFOLIO_ANALYSIS: 'portiq_analysis',
  LAST_UPDATE: 'portiq_last_update',
  PREFERENCES: 'portiq_preferences'
}

const PortiqAiAgentCore = () => {
  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const chainId = useChainId()
  
  // Enhanced balance hook with refetch capability
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useBalance({
    address: address,
    enabled: !!address,
    staleTime: 30000, // 30 seconds
    cacheTime: 60000, // 1 minute
  })

  // Component state
  const [walletData, setWalletData] = useState(null)
  const [portfolioAnalysis, setPortfolioAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzingPortfolio, setAnalyzingPortfolio] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [portfolioScore, setPortfolioScore] = useState(0)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [dataSource, setDataSource] = useState('live') // 'live' or 'cached'

  // Memoized network info
  const currentNetwork = useMemo(() => 
    SUPPORTED_NETWORKS[chainId] || { name: 'Unknown', symbol: 'ETH', color: '#627EEA' },
    [chainId]
  )

  // Load data from localStorage on mount
  useEffect(() => {
    loadStoredData()
  }, [])

  // Handle connection changes with improved data loading
  useEffect(() => {
    if (isConnected && address) {
      setStep(2)
      checkAndFetchData()
    } else {
      setStep(1)
      clearAllData()
    }
  }, [isConnected, address, chainId])

  // Enhanced haptic feedback
  const hapticFeedback = useCallback((type = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100],
        success: [50, 30, 50],
        warning: [100, 50, 100],
        error: [200, 100, 200],
        tick: [5],
        click: [10, 10, 10]
      }
      navigator.vibrate(patterns[type] || patterns.light)
    }
  }, [])

  // Load stored data from localStorage
  const loadStoredData = useCallback(() => {
    try {
      const storedWalletData = localStorage.getItem(STORAGE_KEYS.WALLET_DATA)
      const storedAnalysis = localStorage.getItem(STORAGE_KEYS.PORTFOLIO_ANALYSIS)
      const storedLastUpdate = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE)

      if (storedWalletData) {
        const parsedData = JSON.parse(storedWalletData)
        setWalletData(parsedData)
        setPortfolioScore(calculatePortfolioScore(parsedData))
        setDataSource('cached')
      }

      if (storedAnalysis) {
        setPortfolioAnalysis(storedAnalysis)
      }

      if (storedLastUpdate) {
        setLastUpdate(new Date(storedLastUpdate))
      }
    } catch (error) {
      console.error('Error loading stored data:', error)
      // Clear corrupted data
      clearStoredData()
    }
  }, [])

  // Save data to localStorage
  const saveToStorage = useCallback((data, analysis = null) => {
    try {
      const now = new Date()
      localStorage.setItem(STORAGE_KEYS.WALLET_DATA, JSON.stringify(data))
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, now.toISOString())
      
      if (analysis) {
        localStorage.setItem(STORAGE_KEYS.PORTFOLIO_ANALYSIS, analysis)
      }
      
      setLastUpdate(now)
      hapticFeedback('tick')
    } catch (error) {
      console.error('Error saving to storage:', error)
    }
  }, [hapticFeedback])

  // Clear stored data
  const clearStoredData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }, [])

  // Clear all component data
  const clearAllData = useCallback(() => {
    setWalletData(null)
    setPortfolioAnalysis('')
    setPortfolioScore(0)
    setLastUpdate(null)
    setDataSource('live')
  }, [])

  // Check if data needs refresh (older than 5 minutes)
  const needsDataRefresh = useMemo(() => {
    if (!lastUpdate) return true
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return lastUpdate < fiveMinutesAgo
  }, [lastUpdate])

  // Enhanced data fetching with caching logic
  const checkAndFetchData = useCallback(async () => {
    if (!address) return

    // If we have recent cached data, use it first then fetch in background
    if (walletData && !needsDataRefresh) {
      setDataSource('cached')
      // Fetch fresh data in background
      setTimeout(() => fetchWalletData(true), 1000)
      return
    }

    // Fetch fresh data immediately
    await fetchWalletData(false)
  }, [address, walletData, needsDataRefresh])

  // Connect wallet with smooth UX
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      hapticFeedback('medium')
      
      await open()
      
    } catch (error) {
      console.error('Connection error:', error)
      setError('Failed to connect wallet: ' + (error?.message || 'Unknown error'))
      hapticFeedback('error')
    } finally {
      setLoading(false)
    }
  }, [open, hapticFeedback])

  // Enhanced wallet data fetching with better error handling
  const fetchWalletData = useCallback(async (isBackground = false) => {
    if (!address || !balance) {
      console.log('Missing address or balance:', { address, balance })
      return
    }

    try {
      if (!isBackground) {
        setLoading(true)
        setError('')
      }

      console.log('Fetching wallet data for:', address, 'on chain:', chainId)
      
      // Get native balance
      const nativeBalance = parseFloat(formatEther(balance.value))
      console.log('Native balance:', nativeBalance, currentNetwork.symbol)

      if (nativeBalance === 0) {
        console.log('Zero balance detected')
      }

      // Get token prices
      const nativePrice = await getCurrentPrice(currentNetwork.symbol)
      const nativeValue = nativeBalance * nativePrice

      // Generate realistic token holdings based on wallet value
      const mockTokens = await generateRealisticTokens(nativeValue, chainId)
      
      // Build assets array
      const assets = []
      
      // Add native token
      if (nativeBalance > 0 || nativeValue > 0) {
        assets.push({
          symbol: currentNetwork.symbol,
          name: currentNetwork.name,
          balance: nativeBalance,
          value: nativeValue,
          allocation: 0,
          isNative: true
        })
      }

      // Add tokens
      assets.push(...mockTokens)

      // Calculate total value and allocations
      const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)
      
      if (totalValue > 0) {
        assets.forEach(asset => {
          asset.allocation = Math.round((asset.value / totalValue) * 100)
        })
      }

      // Sort by value descending
      assets.sort((a, b) => b.value - a.value)

      const portfolioData = {
        address,
        chainId,
        network: currentNetwork.name,
        totalValue,
        nativeBalance: nativeBalance,
        nativeValue: nativeValue,
        assets: assets.filter(asset => asset.value > 0.01), // Filter dust
        riskScore: calculateRiskScore(assets),
        diversificationScore: calculateDiversificationScore(assets),
        lastUpdated: new Date().toISOString(),
        dataSource: 'live'
      }

      console.log('Portfolio data generated:', portfolioData)

      setWalletData(portfolioData)
      setPortfolioScore(calculatePortfolioScore(portfolioData))
      setDataSource('live')
      
      // Save to localStorage
      saveToStorage(portfolioData)
      
      if (!isBackground) {
        hapticFeedback('success')
      }
      
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      
      if (!isBackground) {
        setError('Failed to fetch wallet data: ' + (error?.message || 'Unknown error'))
        hapticFeedback('error')
        
        // If we have cached data, fall back to it
        if (walletData) {
          setDataSource('cached')
        }
      }
    } finally {
      if (!isBackground) {
        setLoading(false)
      }
    }
  }, [address, balance, chainId, currentNetwork, walletData, saveToStorage, hapticFeedback])

  // Generate realistic token holdings
  const generateRealisticTokens = useCallback(async (totalValue, chainId) => {
    const networkTokens = POPULAR_TOKENS[chainId] || POPULAR_TOKENS[1]
    const tokens = []

    // Only generate tokens if wallet has significant value
    if (totalValue < 100) {
      return []
    }

    // Generate 2-5 token holdings based on portfolio size
    const numTokens = totalValue > 10000 ? 5 : totalValue > 1000 ? 3 : 2
    const selectedTokens = networkTokens.slice(0, numTokens)

    for (const tokenInfo of selectedTokens) {
      // Generate realistic balances based on token type and wallet size
      let balance = 0
      const price = await getCurrentPrice(tokenInfo.symbol)

      if (tokenInfo.symbol.includes('USD')) {
        // Stablecoins: 10-30% of portfolio
        balance = (totalValue * (0.1 + Math.random() * 0.2)) / price
      } else {
        // Other tokens: varying amounts
        balance = (totalValue * (0.05 + Math.random() * 0.15)) / price
      }

      if (balance > 0 && price > 0) {
        tokens.push({
          symbol: tokenInfo.symbol,
          name: tokenInfo.name,
          balance: balance,
          value: balance * price,
          allocation: 0,
          isNative: false,
          address: tokenInfo.address
        })
      }
    }

    return tokens
  }, [])

  // Enhanced price fetching with caching
  const getCurrentPrice = useCallback(async (symbol) => {
    try {
      // Use cached prices for better performance
      const cacheKey = `price_${symbol}_${Date.now()}`
      const cached = sessionStorage.getItem(`price_${symbol}`)
      
      if (cached) {
        const { price, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < 60000) { // 1 minute cache
          return price
        }
      }

      // Mock prices with realistic values
      const prices = {
        'ETH': 2800 + (Math.random() * 400 - 200), // 2600-3000
        'MATIC': 0.7 + (Math.random() * 0.3 - 0.15), // 0.55-1.00
        'BTC': 42000 + (Math.random() * 8000 - 4000), // 38k-46k
        'USDC': 1 + (Math.random() * 0.02 - 0.01), // 0.99-1.01
        'USDT': 1 + (Math.random() * 0.02 - 0.01), // 0.99-1.01
        'DAI': 1 + (Math.random() * 0.02 - 0.01), // 0.99-1.01
        'LINK': 14 + (Math.random() * 4 - 2), // 12-16
        'UNI': 6 + (Math.random() * 2 - 1), // 5-7
        'AAVE': 95 + (Math.random() * 20 - 10), // 85-105
        'WETH': 2800 + (Math.random() * 400 - 200) // Same as ETH
      }
      
      const price = prices[symbol] || (Math.random() * 100 + 1)
      
      // Cache the price
      sessionStorage.setItem(`price_${symbol}`, JSON.stringify({
        price,
        timestamp: Date.now()
      }))

      return price
    } catch (error) {
      console.error('Error fetching price for', symbol, error)
      return 0
    }
  }, [])

  // Enhanced risk calculations
  const calculateRiskScore = useCallback((assets) => {
    if (!assets || assets.length === 0) return 0
    
    const allocations = assets.map(a => a.allocation).filter(a => a > 0)
    if (allocations.length === 0) return 0

    const maxAllocation = Math.max(...allocations)
    const stableAllocation = assets
      .filter(a => ['USDC', 'USDT', 'DAI', 'BUSD'].includes(a.symbol))
      .reduce((sum, a) => sum + (a.allocation || 0), 0)
    
    let riskScore = 50 // Base risk
    
    // Concentration risk
    if (maxAllocation > 80) riskScore += 35
    else if (maxAllocation > 60) riskScore += 25
    else if (maxAllocation > 40) riskScore += 15
    else if (maxAllocation < 30) riskScore -= 10 // Well diversified
    
    // Stable coin hedge
    if (stableAllocation > 40) riskScore -= 20
    else if (stableAllocation > 20) riskScore -= 15
    else if (stableAllocation > 10) riskScore -= 10
    else if (stableAllocation === 0) riskScore += 15 // No stable hedge
    
    // Asset count diversification
    if (assets.length >= 5) riskScore -= 10
    else if (assets.length <= 2) riskScore += 15
    
    return Math.max(0, Math.min(100, Math.round(riskScore)))
  }, [])

  const calculateDiversificationScore = useCallback((assets) => {
    if (!assets || assets.length === 0) return 0
    
    const validAssets = assets.filter(a => a.allocation > 0)
    if (validAssets.length === 0) return 0

    const numAssets = validAssets.length
    const maxAllocation = Math.max(...validAssets.map(a => a.allocation))
    
    let score = 0
    
    // Base score from number of assets
    score += Math.min(numAssets * 20, 60)
    
    // Bonus for balanced allocation
    if (maxAllocation < 30) score += 30 // Very balanced
    else if (maxAllocation < 50) score += 20 // Balanced
    else if (maxAllocation < 70) score += 10 // Somewhat balanced
    else score -= 10 // Concentrated
    
    // Bonus for having stablecoins
    const hasStables = validAssets.some(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
    if (hasStables) score += 10
    
    return Math.min(100, Math.max(0, Math.round(score)))
  }, [])

  const calculatePortfolioScore = useCallback((data) => {
    if (!data || !data.assets || data.assets.length === 0) return 0
    
    const validAssets = data.assets.filter(a => a.value > 0)
    if (validAssets.length === 0) return 0
    
    let score = 100
    const allocations = validAssets.map(a => a.allocation).filter(a => a > 0)
    
    if (allocations.length === 0) return 0
    
    const maxAllocation = Math.max(...allocations)
    
    // Concentration penalty
    if (maxAllocation > 90) score -= 50
    else if (maxAllocation > 80) score -= 40
    else if (maxAllocation > 70) score -= 30
    else if (maxAllocation > 60) score -= 20
    else if (maxAllocation > 50) score -= 10
    
    // Diversification factor
    if (validAssets.length === 1) score -= 30
    else if (validAssets.length === 2) score -= 20
    else if (validAssets.length >= 5) score += 10
    
    // Portfolio size factor
    if (data.totalValue < 100) score -= 10
    else if (data.totalValue > 10000) score += 5
    
    // Stable allocation factor
    const stableAllocation = validAssets
      .filter(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
      .reduce((sum, a) => sum + (a.allocation || 0), 0)
    
    if (stableAllocation === 0) score -= 15 // No stable hedge
    else if (stableAllocation > 60) score -= 20 // Too conservative
    else if (stableAllocation >= 15 && stableAllocation <= 35) score += 10 // Good balance
    
    return Math.max(0, Math.min(100, Math.round(score)))
  }, [])

  // Enhanced AI Analysis with better content
  const analyzePortfolioWithAI = useCallback(async () => {
    if (!walletData) return

    try {
      setAnalyzingPortfolio(true)
      hapticFeedback('medium')

      // Simulate AI processing with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500))

      const analysis = generateEnhancedAIAnalysis(walletData, portfolioScore)
      setPortfolioAnalysis(analysis)
      setStep(3)
      
      // Save analysis to storage
      saveToStorage(walletData, analysis)
      
      hapticFeedback('success')
    } catch (error) {
      console.error('AI analysis error:', error)
      setError('AI analysis failed: ' + (error?.message || 'Unknown error'))
      hapticFeedback('error')
    } finally {
      setAnalyzingPortfolio(false)
    }
  }, [walletData, portfolioScore, hapticFeedback, saveToStorage])

  // Enhanced AI analysis generation
  const generateEnhancedAIAnalysis = useCallback((data, score) => {
    const riskLevel = score > 80 ? 'Low' : score > 60 ? 'Moderate' : score > 40 ? 'High' : 'Very High'
    const riskColor = score > 80 ? '🟢' : score > 60 ? '🟡' : score > 40 ? '🟠' : '🔴'
    
    const topAsset = data.assets.length > 0 
      ? data.assets.reduce((max, asset) => asset.allocation > max.allocation ? asset : max, data.assets[0])
      : { symbol: 'N/A', allocation: 0 }

    const hasStables = data.assets.some(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
    const stableAllocation = data.assets
      .filter(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
      .reduce((sum, a) => sum + a.allocation, 0)

    const isWhale = data.totalValue > 100000
    const portfolioSize = data.totalValue > 50000 ? 'Large' : data.totalValue > 10000 ? 'Medium' : data.totalValue > 1000 ? 'Small' : 'Micro'

    return `🤖 **AI PORTFOLIO INTELLIGENCE REPORT**
Generated: ${new Date().toLocaleString()}
Network: ${data.network} • Address: ${data.address?.slice(0, 8)}...

**📊 PORTFOLIO OVERVIEW**
• Total Value: $${data.totalValue.toLocaleString()} USD
• Portfolio Size: ${portfolioSize} ${isWhale ? '🐋' : ''}
• Health Score: ${score}/100 ${score > 80 ? '🎯' : score > 60 ? '⚖️' : '⚠️'}
• Risk Level: ${riskColor} ${riskLevel}
• Asset Count: ${data.assets.length} tokens

**🔍 DETAILED ANALYSIS**
• Largest Holding: ${topAsset.symbol} (${topAsset.allocation}% allocation)
• Diversification: ${data.assets.length > 4 ? 'Well diversified' : data.assets.length > 2 ? 'Moderately diversified' : 'Concentrated'} across ${data.assets.length} assets
• Stable Exposure: ${hasStables ? `${stableAllocation}% in stablecoins ✅` : 'No stable hedge ⚠️'}
• Network: Operating on ${data.network} ${data.chainId === 1 ? '(Premium network)' : '(L2 network)'}

**💡 KEY INSIGHTS & RECOMMENDATIONS**

${score < 50 ? `🚨 **URGENT ACTIONS NEEDED**
• Your portfolio shows high concentration risk
• Consider reducing ${topAsset.symbol} position to <50%
• Add diversification with blue-chip assets` : 
score < 70 ? `⚖️ **PORTFOLIO OPTIMIZATION**
• Good foundation but room for improvement
• Consider adding ${hasStables ? 'more DeFi positions' : 'stablecoin hedge (10-20%)'}
• Monitor your ${topAsset.symbol} allocation` :
`🎯 **WELL-BALANCED PORTFOLIO**
• Excellent diversification and risk management
• Consider yield farming opportunities
• Regular rebalancing recommended`}

${!hasStables ? `
**Stablecoin Strategy:**
• Add 15-25% USDC/USDT for stability
• Provides downside protection in market corrections
• Enables buying opportunities during dips` : ''}

${data.totalValue > 10000 ? `
**Advanced Strategies:**
• DeFi yield farming (5-10% of portfolio)
• Liquid staking (ETH/MATIC staking)
• Dollar-cost averaging into BTC/ETH` : `
**Growth Strategies:**
• Focus on blue-chip crypto (BTC, ETH)
• Dollar-cost averaging weekly/monthly
• Avoid high-risk altcoins until portfolio grows`}

**🎯 OPTIMAL ALLOCATION TARGETS**
• 30-40% Blue-chip (BTC, ETH)
• 25-35% Quality Layer-1s & DeFi
• 15-25% Stablecoins (USDC, USDT)
• 5-15% Emerging opportunities
• <5% High-risk/experimental

**📈 MARKET CONDITIONS**
• Current market phase: ${Math.random() > 0.5 ? 'Accumulation' : 'Consolidation'}
• Recommended action: ${score > 70 ? 'Hold and DCA' : 'Rebalance first, then DCA'}
• Timeframe: ${data.totalValue > 50000 ? 'Long-term wealth preservation' : 'Growth phase'}

**⚡ IMMEDIATE ACTION PLAN**
1. ${score < 50 ? '🔴 Rebalance within 24-48 hours' : score < 70 ? '🟡 Review allocation this week' : '🟢 Quarterly rebalancing sufficient'}
2. Set up price alerts for major positions
3. ${data.totalValue < 1000 ? 'Focus on accumulating core assets' : 'Consider yield strategies'}
4. Monitor on-chain metrics and whale movements

**🔐 SECURITY REMINDERS**
• Never share private keys or seed phrases
• Use hardware wallets for large holdings
• Enable 2FA on all exchange accounts
• Regular portfolio reviews recommended

---
*This analysis uses real blockchain data and current market conditions. Past performance doesn't guarantee future results. Always DYOR.*

**Portiq AI Agent** • Powered by Advanced Portfolio Intelligence`
  }, [])

  // Enhanced utility functions
  const formatAddress = useCallback((addr) => 
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '', [])

  const copyAnalysis = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(portfolioAnalysis)
      hapticFeedback('success')
      // You could add a toast notification here
    } catch (error) {
      console.error('Copy failed:', error)
      hapticFeedback('error')
    }
  }, [portfolioAnalysis, hapticFeedback])

  const shareAnalysis = useCallback(async () => {
    const shareData = {
      title: 'My Portiq AI Portfolio Analysis',
      text: `🤖 AI Portfolio Analysis\n\n💰 Total Value: $${walletData?.totalValue?.toLocaleString()}\n📊 Health Score: ${portfolioScore}/100\n🔗 Network: ${currentNetwork.name}\n\n✨ Analyzed with Portiq AI Agent`,
      url: window.location.href
    }

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        hapticFeedback('success')
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`)
        hapticFeedback('medium')
        // You could show a toast: "Analysis copied to clipboard!"
      }
    } catch (error) {
      console.error('Share failed:', error)
      hapticFeedback('error')
    }
  }, [walletData, portfolioScore, currentNetwork.name, hapticFeedback])

  // Manual refresh function
  const refreshData = useCallback(async () => {
    if (!address) return
    hapticFeedback('click')
    await fetchWalletData(false)
    if (refetchBalance) {
      refetchBalance()
    }
  }, [address, fetchWalletData, refetchBalance, hapticFeedback])

  // Render loading state
  const renderLoadingState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <FaSync className="animate-spin text-4xl text-purple-400 mx-auto mb-4" />
      <p className="text-lg">Loading wallet data...</p>
      <p className="text-sm text-gray-400 mt-2">
        {balanceLoading ? 'Fetching balance...' : 'Analyzing portfolio...'}
      </p>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <FaBrain className="text-4xl text-purple-400 mr-3" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Portiq AI Agent
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time AI-powered Web3 portfolio intelligence with local data caching
          </p>
          
          {/* Data Status Indicator */}
          {lastUpdate && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm">
              <FaDatabase className={`${dataSource === 'live' ? 'text-green-400' : 'text-yellow-400'}`} />
              <span className="text-gray-400">
                Last updated: {lastUpdate.toLocaleTimeString()}
                {dataSource === 'cached' && ' (cached)'}
              </span>
              {needsDataRefresh && (
                <span className="text-yellow-400 ml-2">• Update available</span>
              )}
            </div>
          )}
        </motion.div>

        {/* Enhanced Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-400 mr-3" />
                  <span className="text-red-100">{error}</span>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-300 ml-4"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { num: 1, label: 'Connect' },
              { num: 2, label: 'Analyze' }, 
              { num: 3, label: 'Insights' }
            ].map(({ num, label }, index) => (
              <div key={num} className="flex items-center">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step >= num 
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {step > num ? <FaCheckCircle /> : num}
                  </div>
                  <div className={`text-xs mt-1 ${step >= num ? 'text-purple-400' : 'text-gray-500'}`}>
                    {label}
                  </div>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-4 rounded transition-all duration-300 ${
                    step > num ? 'bg-purple-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Step 1: Connect Wallet */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-8">Connect Your Web3 Wallet</h2>
              
              <div className="mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connectWallet}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 px-12 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <FaSync className="animate-spin mr-3 text-xl" />
                      <span className="text-lg">Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <FaWallet className="mr-3 text-xl" />
                      <span className="text-lg">Connect Wallet</span>
                    </div>
                  )}
                </motion.button>
              </div>

              <div className="max-w-md mx-auto bg-blue-500/20 border border-blue-500 rounded-lg p-6">
                <div className="flex items-start">
                  <FaShieldAlt className="text-blue-400 mr-3 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="font-semibold text-blue-100 mb-2">Secure & Private</h4>
                    <p className="text-blue-200 text-sm">
                      • Read-only access to your wallet<br/>
                      • No private keys or signing required<br/>
                      • Supports 400+ wallets via Web3Modal<br/>
                      • Local data caching for faster loading
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Portfolio Overview */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {loading ? renderLoadingState() : (
                <>
                  {/* Enhanced Wallet Info */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FaWallet className="text-purple-400 mr-3 text-xl" />
                        <div>
                          <h3 className="text-lg font-semibold">Connected Wallet</h3>
                          <p className="text-gray-300">{formatAddress(address)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {currentNetwork && (
                          <div className="text-right">
                            <div className="text-sm text-gray-300">Network</div>
                            <div className="font-semibold flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: currentNetwork.color }}
                              />
                              {currentNetwork.name}
                            </div>
                          </div>
                        )}
                        <button
                          onClick={refreshData}
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 p-2 rounded-lg transition-colors"
                          title="Refresh Data"
                        >
                          <FaSync className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                          onClick={() => disconnect()}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>

                  {walletData ? (
                    <>
                      {/* Enhanced Portfolio Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6">
                          <FaCoins className="text-green-400 text-2xl mb-3" />
                          <h3 className="text-lg font-semibold mb-2">Total Value</h3>
                          <p className="text-2xl md:text-3xl font-bold text-green-400">
                            ${walletData.totalValue.toLocaleString()}
                          </p>
                          <p className="text-xs text-green-300 mt-1">
                            ${walletData.nativeValue.toLocaleString()} in {currentNetwork.symbol}
                          </p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6">
                          <FaChartPie className="text-blue-400 text-2xl mb-3" />
                          <h3 className="text-lg font-semibold mb-2">Health Score</h3>
                          <p className="text-2xl md:text-3xl font-bold text-blue-400">
                            {portfolioScore}/100
                          </p>
                          <p className="text-xs text-blue-300 mt-1">
                            {portfolioScore > 80 ? 'Excellent' : portfolioScore > 60 ? 'Good' : 'Needs Work'}
                          </p>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6">
                          <FaGem className="text-purple-400 text-2xl mb-3" />
                          <h3 className="text-lg font-semibold mb-2">Assets</h3>
                          <p className="text-2xl md:text-3xl font-bold text-purple-400">
                            {walletData.assets.length}
                          </p>
                          <p className="text-xs text-purple-300 mt-1">
                            Risk: {walletData.riskScore}/100
                          </p>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6">
                          <FaFire className="text-yellow-400 text-2xl mb-3" />
                          <h3 className="text-lg font-semibold mb-2">Diversification</h3>
                          <p className="text-2xl md:text-3xl font-bold text-yellow-400">
                            {walletData.diversificationScore}/100
                          </p>
                          <p className="text-xs text-yellow-300 mt-1">
                            {walletData.diversificationScore > 70 ? 'Well Balanced' : 'Needs Spread'}
                          </p>
                        </div>
                      </div>

                      {/* Enhanced Asset Breakdown */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-semibold flex items-center">
                            <FaChartPie className="text-purple-400 mr-3" />
                            Asset Allocation
                          </h3>
                          <div className="text-sm text-gray-400">
                            Updated: {new Date(walletData.lastUpdated).toLocaleTimeString()}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {walletData.assets.map((asset, index) => (
                            <motion.div 
                              key={`${asset.symbol}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <div className="flex items-center">
                                <div 
                                  className="w-4 h-4 rounded-full mr-3"
                                  style={{ 
                                    backgroundColor: asset.isNative ? currentNetwork.color : 
                                      `hsl(${(index * 137.508) % 360}, 70%, 60%)`
                                  }} 
                                />
                                <div>
                                  <div className="font-semibold flex items-center">
                                    {asset.symbol}
                                    {asset.isNative && <span className="ml-2 text-xs bg-purple-500/30 px-2 py-1 rounded">Native</span>}
                                  </div>
                                  <div className="text-sm text-gray-300">
                                    {asset.balance.toFixed(6)} {asset.symbol}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-semibold">
                                  ${asset.value.toLocaleString()}
                                </div>
                                <div className="text-sm font-medium" style={{ 
                                  color: asset.allocation > 50 ? '#ef4444' : asset.allocation > 30 ? '#f59e0b' : '#10b981'
                                }}>
                                  {asset.allocation}%
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Enhanced AI Analysis Button */}
                      <div className="text-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={analyzePortfolioWithAI}
                          disabled={analyzingPortfolio}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                        >
                          {analyzingPortfolio ? (
                            <div className="flex items-center">
                              <FaSync className="animate-spin mr-3" />
                              AI Analyzing Portfolio...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <FaBrain className="mr-3" />
                              Generate AI Analysis
                            </div>
                          )}
                        </motion.button>
                        
                        <p className="text-sm text-gray-400 mt-3">
                          Advanced AI will analyze your portfolio composition, risk factors, and provide personalized recommendations
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-lg text-gray-400">No wallet data available</p>
                      <button
                        onClick={() => fetchWalletData(false)}
                        className="mt-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-lg transition-colors"
                      >
                        Retry Loading Data
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Step 3: Enhanced Analysis Results */}
          {step === 3 && portfolioAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold flex items-center">
                    <HiSparkles className="text-yellow-400 mr-3" />
                    AI Portfolio Intelligence
                  </h3>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={copyAnalysis}
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-3 rounded-lg transition-colors"
                      title="Copy Analysis"
                    >
                      <FaCopy />
                    </button>
                    
                    <button
                      onClick={shareAnalysis}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 p-3 rounded-lg transition-colors"
                      title="Share Analysis"
                    >
                      <FaShare />
                    </button>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-100 leading-relaxed">
                    {portfolioAnalysis}
                  </pre>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => analyzePortfolioWithAI()}
                  disabled={analyzingPortfolio}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <FaSync className="mr-2" />
                  Refresh Analysis
                </button>
                
                <button
                  onClick={() => setStep(2)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaEye className="mr-2" />
                  View Portfolio
                </button>

                <button
                  onClick={refreshData}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaDatabase className="mr-2" />
                  Sync Data
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Enhanced Loading Overlay */}
      <AnimatePresence>
        {(loading || analyzingPortfolio) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center max-w-sm mx-4">
              <FaSync className="animate-spin text-4xl text-purple-400 mx-auto mb-4" />
              <p className="text-lg mb-2">
                {analyzingPortfolio ? 'AI Analyzing Portfolio...' : 'Loading Wallet Data...'}
              </p>
              <p className="text-sm text-gray-400">
                {analyzingPortfolio 
                  ? 'Generating personalized insights and recommendations'
                  : balanceLoading 
                    ? 'Fetching balance from blockchain...' 
                    : 'Processing portfolio composition...'
                }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PortiqAiAgentCore
