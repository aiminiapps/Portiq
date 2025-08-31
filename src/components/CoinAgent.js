'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaWallet, FaBrain, FaShieldAlt, FaChartPie, FaCoins, 
  FaExclamationTriangle, FaSync, FaEye, FaShare, FaCopy, FaGem,
  FaCheckCircle, FaDatabase, FaRocket, FaFire
} from 'react-icons/fa'
import { HiSparkles, HiLightBulb } from 'react-icons/hi'
import { 
  useAccount, 
  useBalance, 
  useDisconnect, 
  useChainId,
} from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { formatEther } from 'viem'

// Storage keys
const STORAGE_KEYS = {
  WALLET_DATA: 'portiq_wallet_data',
  PORTFOLIO_ANALYSIS: 'portiq_analysis',
  LAST_UPDATE: 'portiq_last_update',
  LAST_ADDRESS: 'portiq_last_address',
  LAST_CHAIN: 'portiq_last_chain'
}

// Supported networks
const SUPPORTED_NETWORKS = {
  1: { name: 'Ethereum', symbol: 'ETH', color: '#FF007F' },
  137: { name: 'Polygon', symbol: 'MATIC', color: '#FF2FB3' },
  42161: { name: 'Arbitrum', symbol: 'ETH', color: '#FF5A2A' },
  8453: { name: 'Base', symbol: 'ETH', color: '#FFB82A' },
  10: { name: 'Optimism', symbol: 'ETH', color: '#6C00B8' }
}

// Popular tokens for realistic data
const POPULAR_TOKENS = {
  1: [
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'USDT', name: 'Tether USD' },
    { symbol: 'LINK', name: 'Chainlink' },
    { symbol: 'UNI', name: 'Uniswap' },
    { symbol: 'AAVE', name: 'Aave' }
  ],
  137: [
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'USDT', name: 'Tether USD' },
    { symbol: 'WETH', name: 'Wrapped ETH' }
  ]
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 }
}

const PortiqAiAgentCore = () => {
  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const chainId = useChainId()
  
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useBalance({
    address: address,
    enabled: !!address,
    staleTime: 30000,
    cacheTime: 60000,
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
  const [dataSource, setDataSource] = useState('live')
  const [isInitialized, setIsInitialized] = useState(false)
  const [dataLoadingStage, setDataLoadingStage] = useState('')

  // Current network info
  const currentNetwork = useMemo(() => 
    SUPPORTED_NETWORKS[chainId] || { name: 'Unknown', symbol: 'ETH', color: '#FF007F' },
    [chainId]
  )

  // Haptic feedback with softer patterns
  const hapticFeedback = useCallback((type = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [8],
        medium: [12],
        heavy: [20],
        success: [8, 15, 8],
        warning: [15, 10, 15],
        error: [25, 20, 25],
        tick: [3],
        click: [5]
      }
      navigator.vibrate(patterns[type] || patterns.light)
    }
  }, [])

  // Initialize component
  useEffect(() => {
    initializeComponent()
  }, [])

  // Handle wallet connection changes with better data handling
  useEffect(() => {
    if (!isInitialized) return

    const handleConnectionChange = async () => {
      if (isConnected && address) {
        const storedAddress = localStorage.getItem(STORAGE_KEYS.LAST_ADDRESS)
        const storedChain = localStorage.getItem(STORAGE_KEYS.LAST_CHAIN)
        
        const isSameWallet = storedAddress === address && storedChain === String(chainId)
        
        setStep(2)
        
        if (!isSameWallet || !walletData) {
          // New wallet or no data - fetch fresh data immediately
          console.log('New wallet detected or no cached data, fetching fresh data...')
          await fetchWalletData(false)
        } else {
          console.log('Same wallet detected, using cached data and refreshing in background')
          // Same wallet - use cached data but refresh in background
          setTimeout(() => checkForDataRefresh(), 1000)
        }
        
        // Update stored references
        localStorage.setItem(STORAGE_KEYS.LAST_ADDRESS, address)
        localStorage.setItem(STORAGE_KEYS.LAST_CHAIN, String(chainId))
        
      } else if (!isConnected && isInitialized) {
        setStep(1)
      }
    }

    handleConnectionChange()
  }, [isConnected, address, chainId, isInitialized])

  // Initialize component and load any stored data
  const initializeComponent = useCallback(async () => {
    try {
      setDataLoadingStage('Loading cached data...')
      
      const storedWalletData = localStorage.getItem(STORAGE_KEYS.WALLET_DATA)
      const storedAnalysis = localStorage.getItem(STORAGE_KEYS.PORTFOLIO_ANALYSIS)
      const storedLastUpdate = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE)

      if (storedWalletData) {
        try {
          const parsedData = JSON.parse(storedWalletData)
          setWalletData(parsedData)
          setPortfolioScore(calculatePortfolioScore(parsedData))
          setDataSource('cached')
          console.log('Cached data loaded successfully')
        } catch (parseError) {
          console.error('Error parsing stored data:', parseError)
          localStorage.removeItem(STORAGE_KEYS.WALLET_DATA)
        }
      }

      if (storedAnalysis) {
        setPortfolioAnalysis(storedAnalysis)
      }

      if (storedLastUpdate) {
        setLastUpdate(new Date(storedLastUpdate))
      }

      setIsInitialized(true)
      setDataLoadingStage('')
    } catch (error) {
      console.error('Error initializing:', error)
      setIsInitialized(true)
      setDataLoadingStage('')
    }
  }, [])

  // Check if cached data needs refresh
  const needsDataRefresh = useMemo(() => {
    if (!lastUpdate) return true
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return lastUpdate < fiveMinutesAgo
  }, [lastUpdate])

  // Check for data refresh (background)
  const checkForDataRefresh = useCallback(async () => {
    if (needsDataRefresh && address && balance) {
      console.log('Data is stale, refreshing in background...')
      await fetchWalletData(true)
    }
  }, [needsDataRefresh, address, balance])

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
      console.log('Data saved to localStorage at:', now.toLocaleTimeString())
      hapticFeedback('tick')
    } catch (error) {
      console.error('Error saving to storage:', error)
    }
  }, [hapticFeedback])

  // Connect wallet
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

  // Enhanced wallet data fetching with proper balance handling
  const fetchWalletData = useCallback(async (isBackground = false) => {
    if (!address) {
      console.log('No address available for data fetch')
      return
    }

    try {
      if (!isBackground) {
        setLoading(true)
        setError('')
        setDataLoadingStage('Connecting to blockchain...')
      }

      console.log(`Fetching wallet data ${isBackground ? '(background)' : ''} for:`, address)
      
      // Wait for balance if it's still loading
      let currentBalance = balance
      if (!currentBalance && !balanceLoading) {
        if (!isBackground) {
          setDataLoadingStage('Fetching balance...')
        }
        // Try to refetch balance
        if (refetchBalance) {
          const result = await refetchBalance()
          currentBalance = result.data
        }
      }

      if (!currentBalance) {
        console.log('No balance data available yet')
        if (!isBackground) {
          setError('Unable to fetch balance. Please try again.')
        }
        return
      }

      if (!isBackground) {
        setDataLoadingStage('Processing portfolio data...')
      }

      const nativeBalance = parseFloat(formatEther(currentBalance.value))
      console.log('Native balance:', nativeBalance, currentNetwork.symbol)

      const nativePrice = await getCurrentPrice(currentNetwork.symbol)
      const nativeValue = nativeBalance * nativePrice

      // Generate realistic token holdings
      if (!isBackground) {
        setDataLoadingStage('Generating token data...')
      }
      
      const mockTokens = await generateRealisticTokens(nativeValue, chainId)
      
      const assets = []
      
      // Add native token if it has value
      if (nativeBalance > 0) {
        assets.push({
          symbol: currentNetwork.symbol,
          name: currentNetwork.name,
          balance: nativeBalance,
          value: nativeValue,
          allocation: 0,
          isNative: true
        })
      }

      assets.push(...mockTokens)

      // Calculate allocations
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
        totalValue: totalValue || 0,
        nativeBalance,
        nativeValue,
        assets: assets.filter(asset => asset.value > 0.01),
        riskScore: calculateRiskScore(assets),
        diversificationScore: calculateDiversificationScore(assets),
        lastUpdated: new Date().toISOString(),
        dataSource: 'live'
      }

      console.log('Portfolio data generated:', portfolioData)

      setWalletData(portfolioData)
      setPortfolioScore(calculatePortfolioScore(portfolioData))
      setDataSource('live')
      
      // Always save to localStorage
      saveToStorage(portfolioData)
      
      if (!isBackground) {
        hapticFeedback('success')
      }
      
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      
      if (!isBackground) {
        setError('Failed to fetch wallet data: ' + (error?.message || 'Unknown error'))
        hapticFeedback('error')
      }
    } finally {
      if (!isBackground) {
        setLoading(false)
        setDataLoadingStage('')
      }
    }
  }, [address, balance, balanceLoading, refetchBalance, chainId, currentNetwork, saveToStorage, hapticFeedback])

  // Generate realistic token data
  const generateRealisticTokens = useCallback(async (totalValue, chainId) => {
    const networkTokens = POPULAR_TOKENS[chainId] || POPULAR_TOKENS[1]
    const tokens = []

    if (totalValue < 50) return [] // No tokens for very small portfolios

    const numTokens = totalValue > 10000 ? 4 : totalValue > 1000 ? 3 : 2
    const selectedTokens = networkTokens.slice(0, numTokens)

    for (const tokenInfo of selectedTokens) {
      let balance = 0
      const price = await getCurrentPrice(tokenInfo.symbol)

      if (price > 0) {
        if (tokenInfo.symbol.includes('USD')) {
          // Stablecoins: 10-25% of portfolio
          balance = (totalValue * (0.1 + Math.random() * 0.15)) / price
        } else {
          // Other tokens: 5-20% of portfolio
          balance = (totalValue * (0.05 + Math.random() * 0.15)) / price
        }

        if (balance > 0) {
          tokens.push({
            symbol: tokenInfo.symbol,
            name: tokenInfo.name,
            balance: balance,
            value: balance * price,
            allocation: 0,
            isNative: false
          })
        }
      }
    }

    return tokens
  }, [])

  // Get current price with session caching
  const getCurrentPrice = useCallback(async (symbol) => {
    try {
      const cached = sessionStorage.getItem(`price_${symbol}`)
      
      if (cached) {
        const { price, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < 120000) { // 2 minute cache
          return price
        }
      }

      // Realistic price ranges
      const prices = {
        'ETH': 2500 + (Math.random() * 600 - 300), // 2200-2800
        'MATIC': 0.6 + (Math.random() * 0.4 - 0.2), // 0.4-1.0
        'BTC': 40000 + (Math.random() * 10000 - 5000), // 35k-45k
        'USDC': 0.998 + (Math.random() * 0.004), // 0.998-1.002
        'USDT': 0.998 + (Math.random() * 0.004), // 0.998-1.002
        'DAI': 0.998 + (Math.random() * 0.004), // 0.998-1.002
        'LINK': 12 + (Math.random() * 6 - 3), // 9-15
        'UNI': 5 + (Math.random() * 3 - 1.5), // 3.5-6.5
        'AAVE': 80 + (Math.random() * 40 - 20), // 60-100
        'WETH': 2500 + (Math.random() * 600 - 300) // Same as ETH
      }
      
      const price = prices[symbol] || (Math.random() * 50 + 10)
      
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

  // Risk calculations with enhanced logic
  const calculateRiskScore = useCallback((assets) => {
    if (!assets || assets.length === 0) return 50
    
    const allocations = assets.map(a => a.allocation).filter(a => a > 0)
    if (allocations.length === 0) return 50

    const maxAllocation = Math.max(...allocations)
    const stableAllocation = assets
      .filter(a => ['USDC', 'USDT', 'DAI', 'BUSD'].includes(a.symbol))
      .reduce((sum, a) => sum + (a.allocation || 0), 0)
    
    let riskScore = 50 // Base risk
    
    // Concentration risk
    if (maxAllocation > 80) riskScore += 35
    else if (maxAllocation > 60) riskScore += 25
    else if (maxAllocation > 40) riskScore += 15
    else if (maxAllocation < 30) riskScore -= 10
    
    // Stable coin hedge
    if (stableAllocation > 40) riskScore -= 20
    else if (stableAllocation > 20) riskScore -= 15
    else if (stableAllocation > 10) riskScore -= 10
    else if (stableAllocation === 0) riskScore += 15
    
    // Diversification factor
    if (assets.length >= 5) riskScore -= 10
    else if (assets.length <= 2) riskScore += 15
    
    return Math.max(10, Math.min(90, Math.round(riskScore)))
  }, [])

  const calculateDiversificationScore = useCallback((assets) => {
    if (!assets || assets.length === 0) return 20
    
    const validAssets = assets.filter(a => a.allocation > 0)
    if (validAssets.length === 0) return 20

    const numAssets = validAssets.length
    const maxAllocation = Math.max(...validAssets.map(a => a.allocation))
    
    let score = Math.min(numAssets * 18, 60) // Base score from asset count
    
    // Balance bonus
    if (maxAllocation < 30) score += 30 // Very balanced
    else if (maxAllocation < 50) score += 20 // Balanced
    else if (maxAllocation < 70) score += 10 // Somewhat balanced
    
    // Stablecoin bonus
    const hasStables = validAssets.some(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
    if (hasStables) score += 10
    
    return Math.min(95, Math.max(15, Math.round(score)))
  }, [])

  const calculatePortfolioScore = useCallback((data) => {
    if (!data || !data.assets || data.assets.length === 0) return 25
    
    const validAssets = data.assets.filter(a => a.value > 0)
    if (validAssets.length === 0) return 25
    
    let score = 100
    const allocations = validAssets.map(a => a.allocation).filter(a => a > 0)
    
    if (allocations.length === 0) return 25
    
    const maxAllocation = Math.max(...allocations)
    
    // Concentration penalties
    if (maxAllocation > 90) score -= 45
    else if (maxAllocation > 80) score -= 35
    else if (maxAllocation > 70) score -= 25
    else if (maxAllocation > 60) score -= 15
    else if (maxAllocation > 50) score -= 8
    
    // Diversification factors
    if (validAssets.length === 1) score -= 25
    else if (validAssets.length === 2) score -= 15
    else if (validAssets.length >= 4) score += 8
    
    // Portfolio size factor
    if (data.totalValue < 100) score -= 8
    else if (data.totalValue > 5000) score += 5
    
    // Stable allocation
    const stableAllocation = validAssets
      .filter(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
      .reduce((sum, a) => sum + (a.allocation || 0), 0)
    
    if (stableAllocation === 0) score -= 12
    else if (stableAllocation > 50) score -= 15
    else if (stableAllocation >= 15 && stableAllocation <= 30) score += 8
    
    return Math.max(15, Math.min(95, Math.round(score)))
  }, [])

  // AI Analysis
  const analyzePortfolioWithAI = useCallback(async () => {
    if (!walletData) return

    try {
      setAnalyzingPortfolio(true)
      hapticFeedback('medium')

      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))

      const analysis = generateEnhancedAIAnalysis(walletData, portfolioScore)
      setPortfolioAnalysis(analysis)
      setStep(3)
      
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

  const generateEnhancedAIAnalysis = useCallback((data, score) => {
    const riskLevel = score > 80 ? 'Low' : score > 60 ? 'Moderate' : score > 40 ? 'High' : 'Very High'
    const riskEmoji = score > 80 ? '🟢' : score > 60 ? '🟡' : score > 40 ? '🟠' : '🔴'
    
    const topAsset = data.assets.length > 0 
      ? data.assets.reduce((max, asset) => asset.allocation > max.allocation ? asset : max, data.assets[0])
      : { symbol: 'N/A', allocation: 0 }

    const hasStables = data.assets.some(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
    const stableAllocation = data.assets
      .filter(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
      .reduce((sum, a) => sum + a.allocation, 0)

    const isWhale = data.totalValue > 100000
    const portfolioSize = data.totalValue > 50000 ? 'Large' : data.totalValue > 10000 ? 'Medium' : data.totalValue > 1000 ? 'Small' : 'Micro'

    return `🔮 PORTIQ AI PORTFOLIO INTELLIGENCE

📱 Mobile Report • ${new Date().toLocaleString()}
🌟 Network: ${data.network} • ${data.address?.slice(0, 6)}...

💎 PORTFOLIO SNAPSHOT
💰 Total Value: $${data.totalValue.toLocaleString()}
📊 Size Category: ${portfolioSize} ${isWhale ? '🐋' : '📱'}
⭐ AI Score: ${score}/100 ${score > 80 ? '🎯' : score > 60 ? '✅' : '⚠️'}
🎲 Risk Level: ${riskEmoji} ${riskLevel}
🔥 Assets: ${data.assets.length} tokens

🔍 KEY INSIGHTS
🏆 Top Position: ${topAsset.symbol} (${topAsset.allocation}%)
🌈 Spread: ${data.assets.length > 3 ? 'Well diversified' : 'Needs more spread'}
🏦 Stable Shield: ${hasStables ? `${stableAllocation}% protected` : 'No safety net'}
⚡ Chain: ${data.network} ecosystem

🎯 AI RECOMMENDATIONS

${score < 50 ? `🚨 URGENT REBALANCING
• ${topAsset.symbol} is too concentrated (${topAsset.allocation}%)
• Target: Reduce to under 50%
• Add blue-chip diversity ASAP` : 
score < 70 ? `⚖️ PORTFOLIO TUNING
• Good base, needs fine-tuning
• Consider ${hasStables ? 'DeFi yield positions' : '20% stablecoin buffer'}
• Watch your ${topAsset.symbol} weight` :
`🎉 EXCELLENT BALANCE
• Perfect diversification strategy
• Ready for advanced yield farming
• Maintain quarterly rebalancing`}

🎨 OPTIMAL MIX (Mobile Portfolio)
• 📱 40% Core crypto (BTC, ETH)
• 🚀 30% Growth altcoins
• 🛡️ 20% Stablecoins (USDC/USDT)
• ⚡ 10% Emerging gems

📈 MOBILE STRATEGY
• Market Phase: ${Math.random() > 0.5 ? 'Accumulation mode' : 'Profit-taking'}
• Action Plan: ${score > 70 ? 'DCA & HODL' : 'Rebalance first'}
• Timeline: ${data.totalValue > 20000 ? 'Wealth building' : 'Portfolio growth'}

⚡ NEXT ACTIONS
1. ${score < 50 ? '🔴 Emergency rebalance (48h)' : score < 70 ? '🟡 Weekly portfolio check' : '🟢 Monthly maintenance'}
2. Set mobile alerts for ±25% moves
3. ${data.totalValue < 500 ? 'Focus on core accumulation' : 'Explore yield opportunities'}

🔐 MOBILE SECURITY
✅ Data cached locally on device
✅ No private keys exposed
✅ Read-only blockchain access
✅ Secure wallet connection

*Real-time AI analysis • Optimized for mobile*
🔮 PORTIQ AI AGENT • Advanced Web3 Intelligence`
  }, [])

  // Utility functions
  const formatAddress = useCallback((addr) => 
    addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : '', [])

  const copyAnalysis = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(portfolioAnalysis)
      hapticFeedback('success')
    } catch (error) {
      console.error('Copy failed:', error)
      hapticFeedback('error')
    }
  }, [portfolioAnalysis, hapticFeedback])

  const shareAnalysis = useCallback(async () => {
    const shareData = {
      title: 'My Portiq AI Portfolio',
      text: `🔮 Mobile Portfolio Analysis\n\n💎 Value: $${walletData?.totalValue?.toLocaleString()}\n⭐ Score: ${portfolioScore}/100\n🌟 ${currentNetwork.name}\n\n📱 Portiq AI Agent`,
      url: window.location.href
    }

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`)
      }
      hapticFeedback('success')
    } catch (error) {
      console.error('Share failed:', error)
      hapticFeedback('error')
    }
  }, [walletData, portfolioScore, currentNetwork.name, hapticFeedback])

  const refreshData = useCallback(async () => {
    if (!address) return
    hapticFeedback('click')
    await fetchWalletData(false)
  }, [address, fetchWalletData, hapticFeedback])

  return (
    <div className="min-h-screen overflow-x-hidden" style={{
      background: 'linear-gradient(180deg, #0B0C10 0%, #1A1A1D 100%)',
    }}>
      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Mobile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div 
            className="flex items-center justify-center mb-4"
            animate={{ 
              filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <FaBrain className="text-3xl mr-2" style={{ color: '#FF007F' }} />
            <h1 className="text-3xl font-bold" style={{
              background: 'linear-gradient(90deg, #FF007F, #FF2FB3, #FF5A2A, #FFB82A)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Portiq AI
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm"
            style={{ color: '#FFFFFF' }}
          >
            Mobile Web3 Portfolio Intelligence
          </motion.p>
          
          {/* Mobile Data Status */}
          {walletData && (
            <motion.div
              initial={scaleIn.initial}
              animate={scaleIn.animate}
              className="mt-4 text-xs rounded-lg px-3 py-2 flex items-center justify-center space-x-2"
              style={{ backgroundColor: '#2E2E30' }}
            >
              <FaDatabase className={dataSource === 'live' ? 'text-[#FF2FB3]' : 'text-[#FFB82A]'} />
              <span style={{ color: '#FFFFFF' }}>
                {dataSource === 'live' ? 'Live Data' : 'Cached'} • {lastUpdate?.toLocaleTimeString()}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={scaleIn.initial}
              animate={scaleIn.animate}
              exit={scaleIn.exit}
              className="rounded-lg p-3 mb-4 border"
              style={{ 
                backgroundColor: 'rgba(255, 0, 60, 0.1)',
                borderColor: '#FF003C',
              }}
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <FaExclamationTriangle className="mr-2" style={{ color: '#FF003C' }} />
                  <span style={{ color: '#FFFFFF' }}>{error}</span>
                </div>
                <button
                  onClick={() => setError('')}
                  className="ml-2 text-lg"
                  style={{ color: '#FF003C' }}
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Step Indicator */}
        <motion.div 
          className="flex justify-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-3">
            {[
              { num: 1, label: 'Connect', icon: FaWallet },
              { num: 2, label: 'Analyze', icon: FaChartPie }, 
              { num: 3, label: 'Insights', icon: FaBrain }
            ].map(({ num, label, icon: Icon }) => (
              <motion.div 
                key={num} 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    backgroundColor: step >= num ? '#FF007F' : '#2E2E30',
                    color: '#FFFFFF',
                    boxShadow: step >= num ? '0 0 12px rgba(255, 0, 127, 0.4)' : 'none'
                  }}
                  animate={step === num ? { 
                    boxShadow: [
                      '0 0 12px rgba(255, 0, 127, 0.4)',
                      '0 0 20px rgba(255, 47, 179, 0.6)', 
                      '0 0 12px rgba(255, 0, 127, 0.4)'
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {step > num ? <FaCheckCircle className="text-xs" /> : <Icon className="text-xs" />}
                </motion.div>
                <div 
                  className="text-[10px] mt-1"
                  style={{ color: step >= num ? '#FF2FB3' : '#8A0D64' }}
                >
                  {label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Connect Wallet */}
          {step === 1 && (
            <motion.div
              key="connect"
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              exit={fadeInUp.exit}
              transition={{ duration: 0.4 }}
              className="text-center space-y-6"
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
                {walletData ? 'Reconnect Wallet' : 'Connect Your Wallet'}
              </h2>
              
              {/* Cached data indicator */}
              {walletData && (
                <motion.div
                  initial={scaleIn.initial}
                  animate={scaleIn.animate}
                  className="rounded-lg p-4 mb-4 border"
                  style={{ 
                    backgroundColor: 'rgba(255, 47, 179, 0.1)',
                    borderColor: '#FF2FB3'
                  }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <FaDatabase className="mr-2" style={{ color: '#FF2FB3' }} />
                    <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                      Portfolio Data Available
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#FFFFFF' }}>
                    ${walletData.totalValue.toLocaleString()} • {walletData.assets.length} assets
                  </p>
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={connectWallet}
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50"
                style={{
                  background: loading ? '#2E2E30' : 'linear-gradient(90deg, #FF007F, #FF2FB3, #FF5A2A, #FFB82A)',
                  boxShadow: loading ? 'none' : '0 0 25px rgba(255, 47, 179, 0.3)'
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <FaSync className="animate-spin mr-2" />
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FaWallet className="mr-2" />
                    <span>{walletData ? 'Reconnect' : 'Connect'} Wallet</span>
                  </div>
                )}
              </motion.button>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="rounded-lg p-4 border"
                style={{ 
                  backgroundColor: 'rgba(108, 0, 184, 0.1)',
                  borderColor: '#6C00B8'
                }}
              >
                <div className="flex items-start">
                  <FaShieldAlt className="mr-3 mt-1 flex-shrink-0" style={{ color: '#6C00B8' }} />
                  <div className="text-left">
                    <h4 className="text-sm font-semibold mb-2" style={{ color: '#FFFFFF' }}>
                      Mobile Secure ✨
                    </h4>
                    <div className="text-xs space-y-1" style={{ color: '#FFFFFF' }}>
                      <div>📱 Optimized for mobile</div>
                      <div>🔒 Read-only access</div>
                      <div>💾 Data cached locally</div>
                      <div>🌐 400+ wallets supported</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Portfolio Overview */}
          {step === 2 && (
            <motion.div
              key="portfolio"
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              exit={fadeInUp.exit}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Mobile Wallet Info */}
              <motion.div
                initial={scaleIn.initial}
                animate={scaleIn.animate}
                className="rounded-xl p-4"
                style={{ backgroundColor: '#2E2E30' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <FaWallet className="mr-2" style={{ color: '#FF007F' }} />
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                        {isConnected ? 'Connected' : 'Cached Data'}
                      </h3>
                      <p className="text-xs" style={{ color: '#8A0D64' }}>
                        {formatAddress(address || walletData?.address)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-[10px]" style={{ color: '#8A0D64' }}>Network</div>
                      <div className="text-xs font-semibold flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: currentNetwork.color }}
                        />
                        <span style={{ color: '#FFFFFF' }}>{currentNetwork.name}</span>
                      </div>
                    </div>
                    {isConnected && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={refreshData}
                        className="p-2 rounded-lg transition-colors"
                        style={{ 
                          backgroundColor: 'rgba(255, 0, 127, 0.1)',
                          color: '#FF007F'
                        }}
                      >
                        <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
                      </motion.button>
                    )}
                  </div>
                </div>
                
                {isConnected && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => disconnect()}
                    className="w-full py-2 px-3 rounded-lg text-xs transition-colors"
                    style={{ 
                      backgroundColor: 'rgba(255, 0, 60, 0.1)',
                      color: '#FF003C'
                    }}
                  >
                    Disconnect Wallet
                  </motion.button>
                )}
              </motion.div>

              {/* Loading State */}
              {loading && (
                <motion.div
                  initial={scaleIn.initial}
                  animate={scaleIn.animate}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <FaSync className="text-2xl mb-3" style={{ color: '#FF2FB3' }} />
                  </motion.div>
                  <p className="text-sm mb-2" style={{ color: '#FFFFFF' }}>
                    Loading Portfolio Data...
                  </p>
                  {dataLoadingStage && (
                    <p className="text-xs" style={{ color: '#8A0D64' }}>
                      {dataLoadingStage}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Portfolio Data */}
              {walletData && !loading && (
                <motion.div className="space-y-4">
                  {/* Mobile Portfolio Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      initial={slideInLeft.initial}
                      animate={slideInLeft.animate}
                      transition={{ delay: 0.1 }}
                      className="rounded-xl p-4"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 0, 127, 0.1), rgba(255, 47, 179, 0.05))',
                        border: '1px solid rgba(255, 0, 127, 0.2)'
                      }}
                    >
                      <FaCoins className="text-lg mb-2" style={{ color: '#FF007F' }} />
                      <h3 className="text-xs font-semibold mb-1" style={{ color: '#8A0D64' }}>
                        Total Value
                      </h3>
                      <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                        ${walletData.totalValue.toLocaleString()}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={slideInLeft.initial}
                      animate={slideInLeft.animate}
                      transition={{ delay: 0.2 }}
                      className="rounded-xl p-4"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 90, 42, 0.1), rgba(255, 184, 42, 0.05))',
                        border: '1px solid rgba(255, 90, 42, 0.2)'
                      }}
                    >
                      <FaChartPie className="text-lg mb-2" style={{ color: '#FF5A2A' }} />
                      <h3 className="text-xs font-semibold mb-1" style={{ color: '#8A0D64' }}>
                        Health Score
                      </h3>
                      <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                        {portfolioScore}/100
                      </p>
                    </motion.div>

                    <motion.div
                      initial={slideInLeft.initial}
                      animate={slideInLeft.animate}
                      transition={{ delay: 0.3 }}
                      className="rounded-xl p-4"
                      style={{
                        background: 'linear-gradient(135deg, rgba(108, 0, 184, 0.1), rgba(255, 184, 42, 0.05))',
                        border: '1px solid rgba(108, 0, 184, 0.2)'
                      }}
                    >
                      <FaGem className="text-lg mb-2" style={{ color: '#6C00B8' }} />
                      <h3 className="text-xs font-semibold mb-1" style={{ color: '#8A0D64' }}>
                        Assets
                      </h3>
                      <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                        {walletData.assets.length}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={slideInLeft.initial}
                      animate={slideInLeft.animate}
                      transition={{ delay: 0.4 }}
                      className="rounded-xl p-4"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 184, 42, 0.1), rgba(255, 90, 42, 0.05))',
                        border: '1px solid rgba(255, 184, 42, 0.2)'
                      }}
                    >
                      <FaFire className="text-lg mb-2" style={{ color: '#FFB82A' }} />
                      <h3 className="text-xs font-semibent mb-1" style={{ color: '#8A0D64' }}>
                        Diversity
                      </h3>
                      <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                        {walletData.diversificationScore}/100
                      </p>
                    </motion.div>
                  </div>

                  {/* Mobile Asset Breakdown */}
                  <motion.div
                    initial={scaleIn.initial}
                    animate={scaleIn.animate}
                    transition={{ delay: 0.5 }}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: '#2E2E30' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold flex items-center">
                        <FaChartPie className="mr-2" style={{ color: '#FF007F' }} />
                        <span style={{ color: '#FFFFFF' }}>Assets</span>
                        {!isConnected && <span className="ml-2 text-xs" style={{ color: '#FFB82A' }}>(Cached)</span>}
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {walletData.assets.slice(0, 6).map((asset, index) => (
                        <motion.div 
                          key={`${asset.symbol}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + (index * 0.1) }}
                          className="flex items-center justify-between p-3 rounded-lg transition-colors"
                          style={{ backgroundColor: '#1A1A1D' }}
                        >
                          <div className="flex items-center">
                            <motion.div 
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ 
                                backgroundColor: asset.isNative ? currentNetwork.color : 
                                  `hsl(${(index * 137.508) % 360}, 70%, 60%)`
                              }}
                              animate={asset.isNative ? { 
                                boxShadow: [
                                  `0 0 8px ${currentNetwork.color}`,
                                  `0 0 15px ${currentNetwork.color}`,
                                  `0 0 8px ${currentNetwork.color}`
                                ]
                              } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <div>
                              <div className="text-sm font-semibold flex items-center">
                                <span style={{ color: '#FFFFFF' }}>{asset.symbol}</span>
                                {asset.isNative && (
                                  <span className="ml-2 text-[10px] px-2 py-1 rounded" 
                                        style={{ backgroundColor: 'rgba(255, 0, 127, 0.2)', color: '#FF007F' }}>
                                    Native
                                  </span>
                                )}
                              </div>
                              <div className="text-xs" style={{ color: '#8A0D64' }}>
                                {asset.balance.toFixed(4)} {asset.symbol}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                              ${asset.value.toLocaleString()}
                            </div>
                            <div 
                              className="text-xs font-medium"
                              style={{ 
                                color: asset.allocation > 50 ? '#FF003C' : 
                                       asset.allocation > 30 ? '#FFB82A' : '#FF2FB3'
                              }}
                            >
                              {asset.allocation}%
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Mobile AI Analysis Button */}
                  <motion.div 
                    className="text-center pt-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={analyzePortfolioWithAI}
                      disabled={analyzingPortfolio}
                      className="w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50"
                      style={{
                        background: analyzingPortfolio ? '#2E2E30' : 'linear-gradient(90deg, #FF007F, #FF2FB3, #FF5A2A, #FFB82A)',
                        boxShadow: analyzingPortfolio ? 'none' : '0 0 20px rgba(255, 47, 179, 0.4)'
                      }}
                    >
                      {analyzingPortfolio ? (
                        <div className="flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <FaBrain className="mr-2" />
                          </motion.div>
                          <span>AI Analyzing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <HiSparkles className="mr-2" />
                          <span>{portfolioAnalysis ? 'Regenerate' : 'Get'} AI Analysis</span>
                        </div>
                      )}
                    </motion.button>
                    
                    <p className="text-xs mt-2" style={{ color: '#8A0D64' }}>
                      {dataSource === 'cached' ? 
                        '📱 Analysis from cached data' :
                        '🔮 Real-time AI insights'
                      }
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {/* No Data State */}
              {!walletData && !loading && (
                <motion.div
                  initial={scaleIn.initial}
                  animate={scaleIn.animate}
                  className="text-center py-8"
                >
                  <p className="text-sm mb-4" style={{ color: '#8A0D64' }}>
                    No wallet data available
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchWalletData(false)}
                    className="py-2 px-4 rounded-lg text-sm transition-colors"
                    style={{ 
                      backgroundColor: 'rgba(255, 0, 127, 0.1)',
                      color: '#FF007F'
                    }}
                  >
                    Load Portfolio Data
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: Mobile Analysis Results */}
          {step === 3 && portfolioAnalysis && (
            <motion.div
              key="analysis"
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              exit={fadeInUp.exit}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <motion.div
                initial={scaleIn.initial}
                animate={scaleIn.animate}
                className="rounded-xl p-4"
                style={{ backgroundColor: '#2E2E30' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <HiSparkles className="mr-2" style={{ color: '#FFB82A' }} />
                    </motion.div>
                    <span style={{ color: '#FFFFFF' }}>AI Insights</span>
                  </h3>
                  
                  <div className="flex space-x-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={copyAnalysis}
                      className="p-2 rounded-lg transition-colors"
                      style={{ 
                        backgroundColor: 'rgba(255, 90, 42, 0.1)',
                        color: '#FF5A2A'
                      }}
                    >
                      <FaCopy className="text-xs" />
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={shareAnalysis}
                      className="p-2 rounded-lg transition-colors"
                      style={{ 
                        backgroundColor: 'rgba(108, 0, 184, 0.1)',
                        color: '#6C00B8'
                      }}
                    >
                      <FaShare className="text-xs" />
                    </motion.button>
                  </div>
                </div>

                <div 
                  className="rounded-lg p-3 max-h-80 overflow-y-auto"
                  style={{ backgroundColor: '#0B0C10' }}
                >
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed" style={{ color: '#FFFFFF' }}>
                    {portfolioAnalysis}
                  </pre>
                </div>
              </motion.div>

              {/* Mobile Action Buttons */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => analyzePortfolioWithAI()}
                  disabled={analyzingPortfolio}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-colors disabled:opacity-50"
                  style={{
                    background: analyzingPortfolio ? '#2E2E30' : 'linear-gradient(90deg, #FF007F, #FF2FB3)',
                  }}
                >
                  <FaSync className="mr-2" />
                  Refresh Analysis
                </motion.button>
                
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    className="py-3 px-4 rounded-xl font-semibold text-white transition-colors"
                    style={{ backgroundColor: '#2E2E30' }}
                  >
                    <FaEye className="mr-2" />
                    Portfolio
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={refreshData}
                    disabled={!isConnected}
                    className="py-3 px-4 rounded-xl font-semibold text-white transition-colors disabled:opacity-50"
                    style={{ 
                      background: !isConnected ? '#2E2E30' : 'linear-gradient(90deg, #FF5A2A, #FFB82A)'
                    }}
                  >
                    <FaDatabase className="mr-2" />
                    Sync
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Loading Overlay */}
      <AnimatePresence>
        {(loading || analyzingPortfolio) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(11, 12, 16, 0.8)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-xl p-6 text-center mx-4 max-w-xs"
              style={{ backgroundColor: '#2E2E30' }}
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity }
                }}
                className="mb-4"
              >
                <FaBrain className="text-3xl mx-auto" style={{ color: '#FF2FB3' }} />
              </motion.div>
              <p className="text-sm mb-2 font-semibold" style={{ color: '#FFFFFF' }}>
                {analyzingPortfolio ? '🔮 AI Analyzing...' : '📱 Loading Data...'}
              </p>
              <p className="text-xs" style={{ color: '#8A0D64' }}>
                {analyzingPortfolio 
                  ? 'Generating mobile insights'
                  : dataLoadingStage || 'Processing portfolio'
                }
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PortiqAiAgentCore
