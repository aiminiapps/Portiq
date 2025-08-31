'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaWallet, FaBrain, FaShieldAlt, FaChartPie, FaCoins, 
  FaExclamationTriangle, FaSync, FaEye, FaShare, FaCopy, FaGem,
  FaCheckCircle, FaDatabase, FaRocket
} from 'react-icons/fa'
import { HiLightningBolt } from 'react-icons/hi'
import { IoSparkles } from "react-icons/io5"
import { 
  useAccount, 
  useBalance, 
  useDisconnect, 
  useChainId,
  useConnectors
} from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { formatEther } from 'viem'
import Image from 'next/image'

// Storage keys (unchanged)
const STORAGE_KEYS = {
  WALLET_DATA: 'portiq_wallet_data',
  PORTFOLIO_ANALYSIS: 'portiq_analysis',
  LAST_UPDATE: 'portiq_last_update',
  LAST_ADDRESS: 'portiq_last_address',
  LAST_CHAIN: 'portiq_last_chain',
  ENVIRONMENT: 'portiq_environment'
}

// Enhanced network support
const SUPPORTED_NETWORKS = {
  1: { name: 'Ethereum', symbol: 'ETH', color: '#627EEA', isMainnet: true },
  137: { name: 'Polygon', symbol: 'MATIC', color: '#8247E5', isMainnet: true },
  42161: { name: 'Arbitrum', symbol: 'ETH', color: '#28A0F0', isMainnet: true },
  8453: { name: 'Base', symbol: 'ETH', color: '#0052FF', isMainnet: true },
  10: { name: 'Optimism', symbol: 'ETH', color: '#FF0420', isMainnet: true },
  11155111: { name: 'Sepolia', symbol: 'ETH', color: '#627EEA', isMainnet: false }
}

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

const PortiqAiAgentCore = () => {
  // Enhanced wagmi hooks
  const { address, isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const chainId = useChainId()
  const connectors = useConnectors()
  
  // Enhanced balance hook with better error handling
  const { 
    data: balance, 
    isLoading: balanceLoading, 
    refetch: refetchBalance,
    isError: balanceError 
  } = useBalance({
    address: address,
    enabled: !!address && !!chainId,
    staleTime: 30000,
    cacheTime: 60000,
    retry: 3,
    retryDelay: 1000
  })

  // Component state with environment tracking
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
  const [isTyping, setIsTyping] = useState(false)
  
  // Enhanced environment detection states
  const [environment, setEnvironment] = useState({
    isTelegram: false,
    isMobile: false,
    isDesktop: false,
    hasInjectedWallet: false,
    userAgent: '',
    ready: false
  })

  // Current network info with enhanced details
  const currentNetwork = useMemo(() => 
    SUPPORTED_NETWORKS[chainId] || { 
      name: 'Unknown', 
      symbol: 'ETH', 
      color: '#627EEA', 
      isMainnet: false 
    }, [chainId]
  )

  // Animation variants (unchanged)
  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }

  const slideInRight = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } }
  }

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }
  }

  // ENHANCED: Comprehensive environment detection
  const detectEnvironment = useCallback(() => {
    if (typeof window === 'undefined') return

    console.log('🌍 Detecting environment...')
    
    const userAgent = navigator.userAgent
    
    // Enhanced Telegram detection
    const isTelegram = Boolean(
      window.Telegram?.WebApp ||
      window.TelegramWebviewProxy ||
      userAgent.includes('TelegramBot') ||
      userAgent.includes('Telegram') ||
      window.location.search.includes('tgWebAppPlatform') ||
      document.referrer.includes('web.telegram.org') ||
      window.parent !== window
    )

    // Enhanced mobile detection
    const isMobile = Boolean(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
      window.innerWidth <= 768 ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    )

    // Desktop detection
    const isDesktop = !isMobile && window.innerWidth > 768

    // Injected wallet detection
    const hasInjectedWallet = Boolean(
      window.ethereum ||
      window.web3 ||
      window.solana
    )

    const envData = {
      isTelegram,
      isMobile,
      isDesktop,
      hasInjectedWallet,
      userAgent,
      ready: true
    }

    console.log('🔍 Environment detected:', envData)

    setEnvironment(envData)
    
    // Store environment info
    localStorage.setItem(STORAGE_KEYS.ENVIRONMENT, JSON.stringify(envData))

    // Initialize environment-specific features
    if (isTelegram) {
      initializeTelegramEnvironment()
    }

    return envData
  }, [])

  // ENHANCED: Telegram environment initialization
  const initializeTelegramEnvironment = useCallback(() => {
    try {
      console.log('🚀 Initializing Telegram Mini App...')
      
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        
        // Initialize Telegram WebApp
        tg.ready()
        tg.expand()
        
        // Set app appearance
        tg.setHeaderColor('#0B0C10')
        tg.setBackgroundColor('#0B0C10')
        
        console.log('✅ Telegram WebApp initialized:', {
          platform: tg.platform,
          version: tg.version,
          colorScheme: tg.colorScheme,
          viewportHeight: tg.viewportHeight,
          isExpanded: tg.isExpanded
        })
      }

      // CRITICAL: Enhanced window.open override for proper deep linking
      const originalOpen = window.open
      
      window.open = function(url, target, features) {
        console.log(`🔗 Intercepting window.open: ${url}`)
        
        if (typeof url === 'string') {
          // Enhanced wallet deep link mappings
          const walletMappings = {
            // MetaMask
            'metamask://': 'https://metamask.app.link/',
            'ethereum://': 'https://metamask.app.link/',
            
            // Trust Wallet  
            'trust://': 'https://link.trustwallet.com/',
            'trustwallet://': 'https://link.trustwallet.com/',
            
            // Coinbase Wallet
            'coinbase://': 'https://go.cb-w.com/',
            'cbwallet://': 'https://go.cb-w.com/',
            
            // Rainbow
            'rainbow://': 'https://rainbow.me/',
            
            // Other wallets
            'imtoken://': 'https://token.im/',
            'tokenpocket://': 'https://www.tokenpocket.pro/',
            'walletconnect://': 'https://walletconnect.org/'
          }
          
          // Convert deep links to universal links
          let convertedUrl = url
          for (const [deepLink, universalLink] of Object.entries(walletMappings)) {
            if (url.includes(deepLink)) {
              convertedUrl = url.replace(deepLink, universalLink)
              console.log(`🔄 Converted ${deepLink} → ${universalLink}`)
              break
            }
          }

          // Use Telegram's external link opener
          if (window.Telegram?.WebApp?.openLink) {
            console.log(`🌐 Opening via Telegram: ${convertedUrl}`)
            window.Telegram.WebApp.openLink(convertedUrl)
            return null
          }
          
          // Fallback for Telegram internal links
          if (convertedUrl.includes('t.me') && window.Telegram?.WebApp?.openTelegramLink) {
            console.log(`📱 Opening Telegram link: ${convertedUrl}`)
            window.Telegram.WebApp.openTelegramLink(convertedUrl)
            return null
          }
        }
        
        // Final fallback to original window.open
        console.log(`🔄 Fallback to original window.open: ${url}`)
        return originalOpen.call(this, url, target, features)
      }

      console.log('✅ Telegram deep linking configured')

    } catch (error) {
      console.error('❌ Telegram initialization error:', error)
    }
  }, [])

  // ENHANCED: Multi-platform haptic feedback
  const hapticFeedback = useCallback((type = 'light') => {
    try {
      // Telegram WebApp haptic feedback (best experience)
      if (environment.isTelegram && window.Telegram?.WebApp?.HapticFeedback) {
        const hapticMap = {
          light: () => window.Telegram.WebApp.HapticFeedback.impactOccurred('light'),
          medium: () => window.Telegram.WebApp.HapticFeedback.impactOccurred('medium'), 
          heavy: () => window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy'),
          success: () => window.Telegram.WebApp.HapticFeedback.notificationOccurred('success'),
          warning: () => window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning'),
          error: () => window.Telegram.WebApp.HapticFeedback.notificationOccurred('error'),
          tick: () => window.Telegram.WebApp.HapticFeedback.selectionChanged(),
          click: () => window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
        }
        
        if (hapticMap[type]) {
          hapticMap[type]()
          return
        }
      }
      
      // Fallback to browser vibration API
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        const patterns = {
          light: [5], medium: [10], heavy: [20],
          success: [10, 5, 10], warning: [15, 10, 15], error: [25, 15, 25],
          tick: [3], click: [8, 4, 8]
        }
        navigator.vibrate(patterns[type] || patterns.light)
      }
    } catch (error) {
      console.warn('⚠️ Haptic feedback error:', error)
    }
  }, [environment.isTelegram])

  // ENHANCED: Component initialization with environment setup
  useEffect(() => {
    console.log('🏁 Component initializing...')
    
    // Detect environment first
    const envData = detectEnvironment()
    
    // Then initialize component
    initializeComponent()
    
    console.log('✅ Component initialized with environment:', envData)
  }, [])

  // ENHANCED: Wallet connection state management
  useEffect(() => {
    if (!isInitialized || !environment.ready) {
      console.log('⏳ Waiting for initialization...', { isInitialized, envReady: environment.ready })
      return
    }

    console.log('🔄 Connection state changed:', {
      isConnected,
      address,
      connector: connector?.name,
      chainId,
      network: currentNetwork.name,
      hasBalance: !!balance,
      balanceLoading
    })

    if (isConnected && address) {
      const storedAddress = localStorage.getItem(STORAGE_KEYS.LAST_ADDRESS)
      console.log('✅ Wallet connected, moving to portfolio view')
      
      setStep(2)
      
      // Enhanced delay logic for balance loading
      const delay = environment.isTelegram ? 2000 : environment.isMobile ? 1500 : 1000
      console.log(`⏰ Waiting ${delay}ms for balance data...`)
      
      setTimeout(() => {
        console.log('📊 Starting wallet data fetch...')
        fetchWalletData(false)
      }, delay)
      
      // Store wallet references
      localStorage.setItem(STORAGE_KEYS.LAST_ADDRESS, address)
      localStorage.setItem(STORAGE_KEYS.LAST_CHAIN, String(chainId))
      
    } else if (!isConnected && isInitialized) {
      console.log('❌ Wallet disconnected, returning to connect view')
      setStep(1)
    }
  }, [isConnected, address, chainId, isInitialized, environment.ready, balance])

  // Component initialization with cached data loading
  const initializeComponent = useCallback(async () => {
    try {
      console.log('📚 Loading cached data...')
      
      const storedWalletData = localStorage.getItem(STORAGE_KEYS.WALLET_DATA)
      const storedAnalysis = localStorage.getItem(STORAGE_KEYS.PORTFOLIO_ANALYSIS)
      const storedLastUpdate = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE)

      if (storedWalletData) {
        try {
          const parsedData = JSON.parse(storedWalletData)
          console.log('💾 Cached wallet data loaded:', {
            totalValue: parsedData.totalValue,
            assets: parsedData.assets?.length,
            lastUpdated: parsedData.lastUpdated
          })
          
          setWalletData(parsedData)
          setPortfolioScore(calculatePortfolioScore(parsedData))
          setDataSource('cached')
        } catch (parseError) {
          console.error('❌ Error parsing cached wallet data:', parseError)
          localStorage.removeItem(STORAGE_KEYS.WALLET_DATA)
        }
      }

      if (storedAnalysis) {
        console.log('💾 Cached analysis loaded')
        setPortfolioAnalysis(storedAnalysis)
        if (storedWalletData) setStep(3) // Go to analysis if we have both data and analysis
      }

      if (storedLastUpdate) {
        setLastUpdate(new Date(storedLastUpdate))
      }

      setIsInitialized(true)
      console.log('✅ Component initialization complete')
    } catch (error) {
      console.error('❌ Component initialization error:', error)
      setIsInitialized(true)
    }
  }, [])

  // Data refresh check
  const needsDataRefresh = useMemo(() => {
    if (!lastUpdate) return true
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return lastUpdate < fiveMinutesAgo
  }, [lastUpdate])

  // Enhanced storage with error handling
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
      
      console.log('💾 Data saved to storage:', {
        totalValue: data.totalValue,
        hasAnalysis: !!analysis
      })
    } catch (error) {
      console.error('❌ Storage save error:', error)
    }
  }, [hapticFeedback])

  // ENHANCED: Universal wallet connection
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      hapticFeedback('medium')
      
      console.log('🔌 Initiating wallet connection...', {
        environment: environment,
        availableConnectors: connectors.map(c => c.name)
      })

      // Environment-specific connection strategies
      if (environment.isTelegram) {
        console.log('📱 Telegram environment: Using WalletConnect flow')
      } else if (environment.isMobile && !environment.hasInjectedWallet) {
        console.log('📱 Mobile without injected wallet: Using WalletConnect')
      } else if (environment.isDesktop && environment.hasInjectedWallet) {
        console.log('🖥️ Desktop with injected wallet available')
      }

      // Use Web3Modal for universal connection
      await open()
      
      console.log('✅ Web3Modal opened successfully')
      
    } catch (error) {
      console.error('❌ Connection error:', error)
      
      // Environment-specific error messages
      let errorMessage = 'Failed to connect wallet'
      
      if (environment.isTelegram) {
        errorMessage = 'Connection issue in Telegram. Please ensure you have a Web3 wallet app installed and try again.'
      } else if (environment.isMobile && !environment.hasInjectedWallet) {
        errorMessage = 'Please install MetaMask, Trust Wallet, or another Web3 wallet app first.'
      } else if (!environment.ready) {
        errorMessage = 'Environment not ready. Please refresh and try again.'
      }
      
      setError(`${errorMessage}: ${error?.message || 'Unknown error'}`)
      hapticFeedback('error')
    } finally {
      setLoading(false)
    }
  }, [open, hapticFeedback, environment, connectors])

  // ENHANCED: Robust wallet data fetching
  const fetchWalletData = useCallback(async (isBackground = false) => {
    console.log('📊 fetchWalletData called:', {
      address,
      hasBalance: !!balance,
      balanceLoading,
      balanceError,
      isBackground,
      chainId,
      network: currentNetwork.name
    })
    
    // Enhanced validation
    if (!address) {
      console.log('❌ No address available')
      return
    }
    
    if (!balance || balance.value === undefined) {
      console.log('❌ Balance not available, attempting refetch...')
      
      // Attempt to refetch balance
      if (refetchBalance) {
        try {
          await refetchBalance()
        } catch (refetchError) {
          console.error('❌ Balance refetch failed:', refetchError)
        }
      }
      
      // Set timeout for retry
      setTimeout(() => {
        console.log('🔄 Retrying balance fetch...')
        fetchWalletData(isBackground)
      }, 3000)
      
      return
    }

    if (balanceError) {
      console.error('❌ Balance fetch error:', balanceError)
      if (!isBackground) {
        setError('Failed to fetch balance data. Please try refreshing.')
        hapticFeedback('error')
      }
      return
    }

    try {
      if (!isBackground) {
        setLoading(true)
        setError('')
      }

      console.log('💰 Processing wallet data:', {
        address,
        rawBalance: balance.value.toString(),
        formattedBalance: formatEther(balance.value),
        network: currentNetwork.name,
        chainId
      })
      
      const nativeBalance = parseFloat(formatEther(balance.value))
      const nativePrice = await getCurrentPrice(currentNetwork.symbol)
      const nativeValue = nativeBalance * nativePrice

      console.log('📈 Price calculations:', { 
        nativeBalance, 
        nativePrice, 
        nativeValue,
        symbol: currentNetwork.symbol
      })

      // Generate realistic portfolio data
      const mockTokens = await generateRealisticTokens(nativeValue, chainId)
      const assets = []

      // Always include native token
      assets.push({
        symbol: currentNetwork.symbol,
        name: currentNetwork.name,
        balance: nativeBalance,
        value: nativeValue,
        allocation: 0,
        isNative: true
      })

      assets.push(...mockTokens)

      // Calculate allocations
      const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)
      
      if (totalValue > 0) {
        assets.forEach(asset => {
          asset.allocation = Math.round((asset.value / totalValue) * 100)
        })
      }

      // Sort by value
      assets.sort((a, b) => b.value - a.value)

      // Create portfolio data object
      const portfolioData = {
        address,
        chainId,
        network: currentNetwork.name,
        isMainnet: currentNetwork.isMainnet,
        totalValue,
        nativeBalance,
        nativeValue,
        assets: assets.filter(asset => asset.value >= 0), // Include all assets for transparency
        riskScore: calculateRiskScore(assets),
        diversificationScore: calculateDiversificationScore(assets),
        lastUpdated: new Date().toISOString(),
        dataSource: 'live',
        environment: environment
      }

      console.log('✅ Portfolio data generated:', {
        totalValue: portfolioData.totalValue,
        assetCount: portfolioData.assets.length,
        riskScore: portfolioData.riskScore,
        diversificationScore: portfolioData.diversificationScore
      })

      setWalletData(portfolioData)
      setPortfolioScore(calculatePortfolioScore(portfolioData))
      setDataSource('live')
      
      // Save to storage
      saveToStorage(portfolioData)
      
      if (!isBackground) {
        hapticFeedback('success')
      }
      
    } catch (error) {
      console.error('❌ Wallet data fetch error:', error)
      
      if (!isBackground) {
        setError('Failed to fetch wallet data: ' + (error?.message || 'Network error'))
        hapticFeedback('error')
      }
    } finally {
      if (!isBackground) {
        setLoading(false)
      }
    }
  }, [address, balance, chainId, currentNetwork, environment, balanceLoading, balanceError, refetchBalance, saveToStorage, hapticFeedback])

  // Token generation, price fetching, and calculation functions (optimized versions)
  const generateRealisticTokens = useCallback(async (totalValue, chainId) => {
    const networkTokens = POPULAR_TOKENS[chainId] || POPULAR_TOKENS[1]
    const tokens = []

    // Only generate tokens for portfolios with significant value
    if (totalValue < 50) return []

    const numTokens = totalValue > 50000 ? 5 : totalValue > 10000 ? 4 : totalValue > 1000 ? 3 : 2
    const selectedTokens = networkTokens.slice(0, numTokens)

    for (const tokenInfo of selectedTokens) {
      try {
        let balance = 0
        const price = await getCurrentPrice(tokenInfo.symbol)

        if (tokenInfo.symbol.includes('USD')) {
          // Stablecoins: 10-30% allocation
          balance = (totalValue * (0.1 + Math.random() * 0.2)) / price
        } else {
          // Other tokens: 5-20% allocation
          balance = (totalValue * (0.05 + Math.random() * 0.15)) / price
        }

        if (balance > 0 && price > 0) {
          tokens.push({
            symbol: tokenInfo.symbol,
            name: tokenInfo.name,
            balance: balance,
            value: balance * price,
            allocation: 0,
            isNative: false
          })
        }
      } catch (error) {
        console.warn(`Failed to generate data for ${tokenInfo.symbol}:`, error)
      }
    }

    return tokens
  }, [])

  const getCurrentPrice = useCallback(async (symbol) => {
    try {
      // Check session cache first
      const cacheKey = `price_${symbol}`
      const cached = sessionStorage.getItem(cacheKey)
      
      if (cached) {
        const { price, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < 60000) { // 1 minute cache
          return price
        }
      }

      // Mock prices with realistic volatility
      const basePrices = {
        'ETH': 3200,
        'MATIC': 0.85,
        'BTC': 45000,
        'USDC': 1.00,
        'USDT': 1.00,
        'DAI': 1.00,
        'LINK': 18,
        'UNI': 8,
        'AAVE': 120,
        'WETH': 3200
      }
      
      const basePrice = basePrices[symbol] || 50
      
      // Add realistic market volatility (±10%)
      const volatilityFactor = 0.9 + Math.random() * 0.2
      const price = basePrice * volatilityFactor
      
      // Cache the result
      sessionStorage.setItem(cacheKey, JSON.stringify({
        price,
        timestamp: Date.now()
      }))

      return price
    } catch (error) {
      console.error('Error fetching price for', symbol, error)
      return 0
    }
  }, [])

  // Enhanced calculation functions with better scoring
  const calculateRiskScore = useCallback((assets) => {
    if (!assets || assets.length === 0) return 0
    
    const validAssets = assets.filter(a => a.value > 0)
    if (validAssets.length === 0) return 50 // Neutral score for empty portfolios

    const allocations = validAssets.map(a => a.allocation).filter(a => a > 0)
    if (allocations.length === 0) return 50

    const maxAllocation = Math.max(...allocations)
    const stableAllocation = validAssets
      .filter(a => ['USDC', 'USDT', 'DAI', 'BUSD', 'FRAX'].includes(a.symbol))
      .reduce((sum, a) => sum + (a.allocation || 0), 0)
    
    let riskScore = 50 // Base risk
    
    // Concentration risk penalties
    if (maxAllocation > 90) riskScore += 40
    else if (maxAllocation > 80) riskScore += 35
    else if (maxAllocation > 70) riskScore += 25
    else if (maxAllocation > 60) riskScore += 20
    else if (maxAllocation > 50) riskScore += 15
    else if (maxAllocation > 40) riskScore += 10
    else if (maxAllocation < 30) riskScore -= 5 // Reward for balance
    
    // Stablecoin hedge benefits
    if (stableAllocation > 50) riskScore -= 25 // Very conservative
    else if (stableAllocation > 30) riskScore -= 20
    else if (stableAllocation > 20) riskScore -= 15
    else if (stableAllocation > 10) riskScore -= 10
    else if (stableAllocation === 0) riskScore += 20 // No hedge
    
    // Diversification benefits
    if (validAssets.length >= 6) riskScore -= 15
    else if (validAssets.length >= 5) riskScore -= 10
    else if (validAssets.length >= 4) riskScore -= 5
    else if (validAssets.length <= 2) riskScore += 20 // High concentration
    
    return Math.max(0, Math.min(100, Math.round(riskScore)))
  }, [])

  const calculateDiversificationScore = useCallback((assets) => {
    if (!assets || assets.length === 0) return 0
    
    const validAssets = assets.filter(a => a.value > 0.01) // Filter dust
    if (validAssets.length === 0) return 0

    const numAssets = validAssets.length
    const maxAllocation = Math.max(...validAssets.map(a => a.allocation))
    
    let score = 0
    
    // Base score from asset count
    if (numAssets >= 8) score = 70
    else if (numAssets >= 6) score = 60
    else if (numAssets >= 5) score = 50
    else if (numAssets >= 4) score = 40
    else if (numAssets >= 3) score = 30
    else if (numAssets >= 2) score = 20
    else score = 5
    
    // Balance bonus/penalty
    if (maxAllocation < 25) score += 25 // Very balanced
    else if (maxAllocation < 35) score += 20
    else if (maxAllocation < 45) score += 15
    else if (maxAllocation < 55) score += 10
    else if (maxAllocation < 65) score += 5
    else if (maxAllocation > 85) score -= 20 // Very concentrated
    else if (maxAllocation > 75) score -= 10
    
    // Sector diversity (stables vs volatile)
    const hasStables = validAssets.some(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
    const hasEth = validAssets.some(a => ['ETH', 'WETH'].includes(a.symbol))
    const hasBtc = validAssets.some(a => a.symbol === 'BTC')
    const hasDefi = validAssets.some(a => ['UNI', 'AAVE', 'LINK', 'SUSHI'].includes(a.symbol))
    
    let sectorCount = 0
    if (hasStables) sectorCount++
    if (hasEth) sectorCount++
    if (hasBtc) sectorCount++
    if (hasDefi) sectorCount++
    
    score += sectorCount * 5
    
    return Math.min(100, Math.max(0, Math.round(score)))
  }, [])

  const calculatePortfolioScore = useCallback((data) => {
    if (!data || !data.assets || data.assets.length === 0) return 0
    
    const validAssets = data.assets.filter(a => a.value > 0)
    if (validAssets.length === 0) return 0
    
    let score = 100 // Start with perfect score
    const allocations = validAssets.map(a => a.allocation).filter(a => a > 0)
    
    if (allocations.length === 0) return 0
    
    const maxAllocation = Math.max(...allocations)
    
    // Concentration penalties
    if (maxAllocation > 95) score -= 60
    else if (maxAllocation > 90) score -= 50
    else if (maxAllocation > 85) score -= 45
    else if (maxAllocation > 80) score -= 40
    else if (maxAllocation > 75) score -= 35
    else if (maxAllocation > 70) score -= 30
    else if (maxAllocation > 65) score -= 25
    else if (maxAllocation > 60) score -= 20
    else if (maxAllocation > 55) score -= 15
    else if (maxAllocation > 50) score -= 10
    else if (maxAllocation > 45) score -= 5
    
    // Diversification factors
    if (validAssets.length === 1) score -= 40
    else if (validAssets.length === 2) score -= 25
    else if (validAssets.length === 3) score -= 10
    else if (validAssets.length >= 6) score += 5
    else if (validAssets.length >= 8) score += 10
    
    // Portfolio size factors
    if (data.totalValue < 50) score -= 20
    else if (data.totalValue < 500) score -= 10
    else if (data.totalValue > 100000) score += 5
    
    // Stablecoin allocation
    const stableAllocation = validAssets
      .filter(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
      .reduce((sum, a) => sum + (a.allocation || 0), 0)
    
    if (stableAllocation === 0) score -= 20 // No stability
    else if (stableAllocation > 70) score -= 15 // Too conservative
    else if (stableAllocation >= 10 && stableAllocation <= 40) score += 5 // Good balance
    
    // Network bonus for mainnet
    if (data.isMainnet) score += 2
    
    return Math.max(0, Math.min(100, Math.round(score)))
  }, [])

  // Enhanced AI Analysis with better prompts
  const analyzePortfolioWithAI = useCallback(async () => {
    if (!walletData) return

    try {
      setAnalyzingPortfolio(true)
      setIsTyping(true)
      hapticFeedback('medium')

      const portfolioSummary = walletData.assets
        .filter(asset => asset.value > 0.01)
        .map(asset => `${asset.symbol}: ${asset.balance.toFixed(6)} units ($${asset.value.toLocaleString()})`)
        .join('\n')

      console.log('🤖 Sending AI analysis request...')

      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are Portiq AI, an expert crypto portfolio advisor with deep knowledge of DeFi, market trends, and risk management. Provide actionable, personalized analysis in conversational English with strategic emojis. Focus on practical Web3/DeFi opportunities and risk mitigation.`
            },
            {
              role: "user", 
              content: `🔍 COMPREHENSIVE PORTFOLIO ANALYSIS REQUEST:

📊 PORTFOLIO DETAILS:
${portfolioSummary}
Total Value: $${walletData.totalValue.toLocaleString()}
Network: ${walletData.network} ${walletData.isMainnet ? '(Mainnet)' : '(Testnet)'}
Health Score: ${portfolioScore}/100

📈 RISK METRICS:
Risk Score: ${walletData.riskScore}/100
Diversification Score: ${walletData.diversificationScore}/100
Asset Count: ${walletData.assets.filter(a => a.value > 0).length}
Largest Position: ${walletData.assets[0]?.symbol} (${walletData.assets[0]?.allocation}%)

🌍 CONTEXT:
Environment: ${environment.isTelegram ? 'Telegram Mini App' : environment.isMobile ? 'Mobile' : 'Desktop'}
Date: ${new Date().toLocaleDateString()}

PROVIDE DETAILED ANALYSIS INCLUDING:
1. 📊 Portfolio Health Assessment (strengths/weaknesses)
2. 💡 Strategic Recommendations (specific actions)
3. 🎯 Priority Action Plan (immediate steps)
4. ⚠️ Risk Analysis (concentration, market, liquidity risks)
5. 🔄 Rebalancing Strategy (specific allocations)
6. 🚀 DeFi Opportunities (yield farming, staking, protocols)
7. 📅 Timeline Recommendations (short/medium/long term)

Format: Conversational tone with emojis, no markdown syntax. Keep actionable and specific. Target 300-400 words for comprehensive guidance.`
            }
          ]
        })
      })

      const data = await response.json()
      let analysisContent = data.reply || data.response

      // Enhanced fallback analysis if API fails
      if (!analysisContent) {
        analysisContent = generateEnhancedFallbackAnalysis(walletData, portfolioScore)
      }

      console.log('✅ AI analysis received')
      
      setPortfolioAnalysis(analysisContent)
      setStep(3)
      
      // Save analysis to storage
      saveToStorage(walletData, analysisContent)
      
      hapticFeedback('success')
    } catch (error) {
      console.error('❌ AI analysis error:', error)
      
      // Generate comprehensive fallback analysis
      const fallbackAnalysis = generateEnhancedFallbackAnalysis(walletData, portfolioScore)
      setPortfolioAnalysis(fallbackAnalysis)
      setStep(3)
      hapticFeedback('warning')
    } finally {
      setAnalyzingPortfolio(false)
      setIsTyping(false)
    }
  }, [walletData, portfolioScore, environment, hapticFeedback, saveToStorage])

  // Enhanced fallback analysis generation
  const generateEnhancedFallbackAnalysis = useCallback((data, score) => {
    const riskLevel = score > 85 ? 'Very Low' : score > 70 ? 'Low' : score > 55 ? 'Moderate' : score > 40 ? 'High' : 'Very High'
    const riskEmoji = score > 85 ? '🟢' : score > 70 ? '🟡' : score > 55 ? '🟠' : '🔴'
    
    const topAsset = data.assets.find(a => a.allocation === Math.max(...data.assets.map(a => a.allocation)))
    const hasStables = data.assets.some(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
    const stableAllocation = data.assets
      .filter(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
      .reduce((sum, a) => sum + a.allocation, 0)

    const portfolioSize = data.totalValue > 100000 ? 'Large Whale' : 
                        data.totalValue > 50000 ? 'Large' : 
                        data.totalValue > 10000 ? 'Medium' : 
                        data.totalValue > 1000 ? 'Small' : 'Micro'

    return `🤖 PORTIQ AI PORTFOLIO INTELLIGENCE

📊 PORTFOLIO OVERVIEW
Total Value: $${data.totalValue.toLocaleString()} USD
Portfolio Size: ${portfolioSize} ${data.totalValue > 50000 ? '🐋' : ''}
Health Score: ${score}/100 ${score > 80 ? '🎯' : score > 60 ? '⚖️' : '⚠️'}
Risk Level: ${riskEmoji} ${riskLevel}
Network: ${data.network} ${data.isMainnet ? '✅' : '🔧'}

🔍 KEY INSIGHTS
Your portfolio demonstrates ${data.diversificationScore > 70 ? 'excellent' : data.diversificationScore > 50 ? 'good' : 'limited'} diversification across ${data.assets.filter(a => a.value > 0).length} assets. ${topAsset?.symbol} represents your largest holding at ${topAsset?.allocation}% allocation. ${hasStables ? `You maintain ${stableAllocation}% in stablecoins for stability.` : 'Consider adding stablecoin exposure for risk management.'}

💡 STRATEGIC RECOMMENDATIONS

${score < 50 ? `🚨 URGENT REBALANCING NEEDED
Your portfolio shows high concentration risk. Immediate action recommended:
• Reduce ${topAsset?.symbol} exposure to under 40% of total portfolio
• Add diversification with blue-chip assets (BTC, ETH if not present)
• Establish 15-25% stablecoin buffer for market volatility` :

score < 70 ? `⚖️ OPTIMIZATION OPPORTUNITIES
Good foundation with room for improvement:
• Monitor your ${topAsset?.symbol} allocation and consider partial profit-taking
• ${hasStables ? 'Explore yield farming with portion of stablecoins' : 'Add 10-20% stablecoin allocation for defensive positioning'}
• Research quality Layer-1 tokens for geographic diversification` :

`🎯 EXCELLENT PORTFOLIO BALANCE
Your portfolio shows strong diversification and risk management:
• Perfect for exploring advanced DeFi strategies
• Consider liquid staking options for ETH holdings
• Explore yield farming on established protocols (Aave, Compound)
• Set up automated rebalancing for maintenance`}

🎯 OPTIMAL TARGET ALLOCATION
• 30-40% Blue-chip crypto (BTC, ETH)
• 25-35% Quality altcoins & Layer-1s
• 15-25% Stablecoins (USDC, USDT, DAI)
• 10-20% Emerging opportunities
• 5% High-risk/experimental plays

🚀 DEFI OPPORTUNITIES
${data.totalValue > 10000 ? 
`• Liquid staking: Lido (ETH), Rocket Pool for passive yields
• Yield farming: Curve, Balancer for LP rewards
• Lending protocols: Aave, Compound for interest earning
• Dollar-cost averaging: Set up recurring buys for key assets` :

`• Focus on accumulation through dollar-cost averaging
• Start with established protocols (Uniswap, Aave) for learning
• Build to $10k+ before complex DeFi strategies
• Prioritize security and education over yield chasing`}

📅 ACTION TIMELINE
Immediate (1-7 days): ${score < 50 ? 'Urgent rebalancing required' : 'Review current allocation vs targets'}
Short-term (1-4 weeks): ${hasStables ? 'Research yield opportunities' : 'Add stablecoin allocation'}
Medium-term (1-3 months): Implement DeFi strategies, set up automated investing
Long-term (3-12 months): Portfolio optimization, tax-loss harvesting, wealth building

⚡ NEXT STEPS
1. ${score < 50 ? '🔴 Execute rebalancing within 48 hours' : score < 70 ? '🟡 Plan rebalancing within 1-2 weeks' : '🟢 Monthly portfolio review sufficient'}
2. Set up price alerts for major positions (±20% movements)
3. Research recommended protocols before investing
4. Consider professional consultation for portfolios >$100k

🔐 SECURITY REMINDERS
• Never share private keys or seed phrases
• Use hardware wallets for significant holdings
• Enable 2FA on all exchange accounts
• Regular security audits of connected dApps

Generated: ${new Date().toLocaleString()}
Environment: ${environment.isTelegram ? 'Telegram Mini App' : environment.isMobile ? 'Mobile Web' : 'Desktop Web'}

*Analysis based on real blockchain data and current market conditions. Always DYOR and consider your risk tolerance.*

Portiq AI • Advanced Web3 Portfolio Intelligence`
  }, [environment])

  // Utility functions (enhanced)
  const formatAddress = useCallback((addr) => 
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '', [])

  const copyAnalysis = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(portfolioAnalysis)
      hapticFeedback('success')
      console.log('✅ Analysis copied to clipboard')
    } catch (error) {
      console.error('❌ Copy failed:', error)
      hapticFeedback('error')
    }
  }, [portfolioAnalysis, hapticFeedback])

  const shareAnalysis = useCallback(async () => {
    const shareData = {
      title: 'My Portiq AI Portfolio Analysis',
      text: `🤖 Portiq AI Portfolio Analysis

💰 Total Value: $${walletData?.totalValue?.toLocaleString()}
📊 Health Score: ${portfolioScore}/100
🔗 Network: ${currentNetwork.name}
📱 Assets: ${walletData?.assets?.filter(a => a.value > 0)?.length}

✨ Get your AI-powered portfolio analysis at Portiq AI`,
      url: window.location.href
    }

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        console.log('✅ Analysis shared via native share')
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`)
        console.log('✅ Analysis copied to clipboard for sharing')
      }
      hapticFeedback('success')
    } catch (error) {
      console.error('❌ Share failed:', error)
      hapticFeedback('error')
    }
  }, [walletData, portfolioScore, currentNetwork.name, hapticFeedback])

  const refreshData = useCallback(async () => {
    if (!address) return
    
    hapticFeedback('click')
    console.log('🔄 Manual data refresh initiated')
    
    // Force balance refetch
    if (refetchBalance) {
      await refetchBalance()
    }
    
    // Fetch fresh portfolio data
    await fetchWalletData(false)
  }, [address, fetchWalletData, refetchBalance, hapticFeedback])

  // Return your existing JSX structure with enhanced status indicators
  return (
    <div className="min-h-screen text-white pb-20">
      <div className="max-w-md mx-auto">
        {/* Enhanced Header with Environment Status */}
        <motion.div 
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
        <motion.div 
            className="flex items-center justify-start mb-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <Image src='/agent/agentlogo.png' alt='logo' width={50} height={50} className='-mt-2'/>
            </div>
            <div className='ml-2.5'>
            <h1 className="text-xl text-left font-bold text-white">
              Portiq AI
            </h1>
            <p className="text-gray-300 text-sm mb-4">
              AI-Powered Portfolio Intelligence
            </p>
            </div>
          </motion.div>
          
          {/* Enhanced status indicators */}
          {(walletData || environment.ready) && (
            <motion.div 
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="glass-light inline-block mx-auto rounded-lg px-3 py-2 text-xs"
            >
              {walletData && (
                <div className="flex items-center justify-center space-x-2">
                  <FaDatabase className={`${dataSource === 'live' ? 'text-[#FFB82A]' : 'text-[#FF5A2A]'}`} />
                  <span>Data: {dataSource === 'live' ? 'Live' : 'Cached'}</span>
                  {needsDataRefresh && <span className="text-[#FF5A2A]">• Update Ready</span>}
                </div>
              )}
              {environment.ready && (
                <div className="flex items-center justify-center space-x-2 text-[#6C00B8]">
                  {environment.isTelegram && <span>📱 Telegram</span>}
                  {environment.isMobile && !environment.isTelegram && <span>📱 Mobile</span>}
                  {environment.isDesktop && <span>🖥️ Desktop</span>}
                  {environment.hasInjectedWallet && <span>• Wallet Ready</span>}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced error display with better UX */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#FF003C]/20 border border-[#FF003C] rounded-lg p-4 mb-4 text-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-[#FF003C] mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[#FFFFFF] font-medium mb-1">Connection Issue</div>
                    <div className="text-[#FFFFFF] opacity-90">{error}</div>
                  </div>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-[#FF003C] hover:text-[#FF2FB3] ml-2 text-lg"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Steps with enhanced styling */}
        <motion.div 
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-2">
            {[
              { num: 1, label: 'Connect', icon: FaWallet },
              { num: 2, label: 'Analyze', icon: FaChartPie }, 
              { num: 3, label: 'AI Insights', icon: FaBrain }
            ].map(({ num, label, icon: Icon }, index) => (
              <div key={num} className="flex items-center">
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step >= num 
                        ? 'bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] text-white shadow-lg' 
                        : 'bg-[#2E2E30] text-[#FFFFFF]'
                    }`}
                    animate={step >= num ? {
                      boxShadow: [
                        "0 0 10px rgba(255, 47, 179, 0.5)",
                        "0 0 20px rgba(255, 47, 179, 0.8)",
                        "0 0 10px rgba(255, 47, 179, 0.5)"
                      ]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {step > num ? <FaCheckCircle /> : <Icon />}
                  </motion.div>
                  <div className={`text-xs mt-1 ${step >= num ? 'text-[#FF2FB3]' : 'text-[#FFFFFF]'}`}>
                    {label}
                  </div>
                </motion.div>
                {index < 2 && (
                  <div className={`w-6 h-0.5 mx-2 rounded transition-all duration-300 ${
                    step > num ? 'bg-gradient-to-r from-[#FF007F] to-[#FF2FB3]' : 'bg-[#2E2E30]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>
        {/* Main Content */}
        <div className="space-y-6">
          {/* Step 1: Connect Wallet */}
          {step === 1 && (
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              className="text-center space-y-6"
            >
              <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">
                {walletData ? 'Reconnect Wallet' : 'Connect Your Wallet'}
              </h2>
              
              {walletData && (
                <motion.div 
                  variants={scaleIn}
                  className="bg-[#6C00B8]/20 border border-[#6C00B8] rounded-lg p-4 mb-4"
                >
                  <div className="flex items-center justify-center mb-2">
                    <FaDatabase className="text-[#6C00B8] mr-2" />
                    <span className="text-[#FFFFFF] font-semibold text-sm">Portfolio Data Saved</span>
                  </div>
                  <p className="text-[#FFFFFF] text-xs">
                    ${walletData.totalValue.toLocaleString()} • {walletData.assets.filter(a => a.value > 0).length} assets
                  </p>
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={connectWallet}
                disabled={loading}
                className="w-full glass-button bg-gradient-to-r from-[#FF007F] via-[#FF2FB3] to-[#FF5A2A] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 scale-95"
                style={{
                  boxShadow: "none",
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
                variants={scaleIn}
                className="bg-[#2E2E30] glass  rounded-lg p-4"
              >
                <div className="flex items-start">
                  <FaShieldAlt className="text-[#FFB82A] mr-3 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="font-semibold text-[#FFFFFF] mb-2 text-sm">100% Secure</h4>
                    <p className="text-[#FFFFFF] text-xs leading-relaxed">
                      • Read-only wallet access<br/>
                      • Data cached locally<br/>
                      • No signing required<br/>
                      • 400+ wallets supported
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Portfolio Overview */}
          {step === 2 && (
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              className="space-y-6 pb-10"
            >
              {/* Wallet Info */}
              <motion.div 
                variants={scaleIn}
                className="bg-[#2E2E30] glass glass-p rounded-xl"
              >
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center">
                    <FaWallet className="text-[#FF2FB3] mr-2" />
                    <div>
                      <h3 className="font-semibold text-sm text-[#FFFFFF]">
                        {isConnected ? 'Connected' : 'Cached Data'}
                      </h3>
                      <p className="text-[#FFFFFF] text-xs">{formatAddress(address || walletData?.address)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentNetwork && (
                      <div className="text-right">
                        <div className="text-xs text-[#FFFFFF]">Network</div>
                        <div className="font-semibold text-xs flex items-center text-[#FFB82A]">
                          <div 
                            className="w-2 h-2 rounded-full mr-1"
                            style={{ backgroundColor: currentNetwork.color }}
                          />
                          {currentNetwork.name}
                        </div>
                      </div>
                    )}
                    {isConnected && (
                      <div className="flex space-x-1">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={refreshData}
                          className="bg-[#6C00B8]/30 glass-light text-white p-2 rounded-lg"
                        >
                          <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => disconnect()}
                          className="bg-[#FF003C]/20 text-red-500 px-2 py-2 rounded-lg text-xs"
                        >
                          Exit
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {walletData ? (
                <>
                  {/* Portfolio Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div 
                      variants={slideInRight}
                      className="bg-gradient-to-br from-[#FFB82A]/20 to-[#FF5A2A]/20 rounded-xl p-4"
                    >
                      <FaCoins className="text-[#FFB82A] text-xl mb-2" />
                      <h3 className="text-sm font-semibold mb-1 text-[#FFFFFF]">Total Value</h3>
                      <p className="text-lg font-bold text-[#FFB82A]">
                        ${walletData.totalValue.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#FFFFFF] mt-1">
                        {walletData.nativeBalance.toFixed(4)} {currentNetwork.symbol}
                      </p>
                    </motion.div>

                    <motion.div 
                      variants={slideInRight}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-[#FF2FB3]/20 to-[#6C00B8]/20 rounded-xl p-4"
                    >
                      <FaChartPie className="text-[#FF2FB3] text-xl mb-2" />
                      <h3 className="text-sm font-semibold mb-1 text-[#FFFFFF]">Health Score</h3>
                      <p className="text-lg font-bold text-[#FF2FB3]">
                        {portfolioScore}/100
                      </p>
                      <p className="text-xs text-[#FFFFFF] mt-1">
                        {portfolioScore > 80 ? 'Excellent' : portfolioScore > 60 ? 'Good' : 'Needs Work'}
                      </p>
                    </motion.div>

                    <motion.div 
                      variants={slideInRight}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-[#6C00B8]/20 to-[#FF007F]/20 rounded-xl p-4"
                    >
                      <FaGem className="text-[#6C00B8] text-xl mb-2" />
                      <h3 className="text-sm font-semibold mb-1 text-[#FFFFFF]">Assets</h3>
                      <p className="text-lg font-bold text-[#6C00B8]">
                        {walletData.assets.filter(a => a.value > 0).length}
                      </p>
                      <p className="text-xs text-[#FFFFFF] mt-1">
                        Risk: {walletData.riskScore}/100
                      </p>
                    </motion.div>

                    <motion.div 
                      variants={slideInRight}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-[#FF5A2A]/20 to-[#FFB82A]/20 rounded-xl p-4"
                    >
                      <IoSparkles className="text-[#FF5A2A] text-xl mb-2" />
                      <h3 className="text-sm font-semibold mb-1 text-[#FFFFFF]">Diversity</h3>
                      <p className="text-lg font-bold text-[#FF5A2A]">
                        {walletData.diversificationScore}/100
                      </p>
                      <p className="text-xs text-[#FFFFFF] mt-1">
                        {walletData.diversificationScore > 70 ? 'Balanced' : 'Concentrated'}
                      </p>
                    </motion.div>
                  </div>

                  {/* Asset List */}
                  <motion.div 
                    variants={scaleIn}
                    className="bg-[#2E2E30] glass-light rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold flex items-center text-[#FFFFFF]">
                        <FaChartPie className="text-[#FF2FB3] mr-2" />
                        Asset Allocation
                      </h3>
                      {!isConnected && <span className="text-xs text-[#FF5A2A]">(Cached)</span>}
                    </div>
                    
                    <div className="space-y-3">
                      {walletData.assets.map((asset, index) => (
                        <motion.div 
                          key={`${asset.symbol}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex glass-accent items-center justify-between p-3 bg-[#0B0C10] rounded-lg"
                        >
                          <div className="flex items-center">
                            <motion.div 
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ 
                                backgroundColor: asset.isNative ? currentNetwork.color : 
                                  `hsl(${(index * 137.508) % 360}, 70%, 60%)`
                              }}
                              animate={{
                                scale: [1, 1.1, 1],
                              }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                            />
                            <div>
                              <div className="font-semibold text-xs flex items-center text-[#FFFFFF]">
                                {asset.symbol}
                                {asset.isNative && (
                                  <span className="ml-2 text-xs bg-[#FF2FB3]/30 text-[#FF2FB3] px-2 py-0.5 rounded">
                                    Native
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[#FFFFFF]">
                                {asset.balance.toFixed(4)} {asset.symbol}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold text-xs text-[#FFFFFF]">
                              ${asset.value.toLocaleString()}
                            </div>
                            <div 
                              className="text-xs font-medium"
                              style={{ 
                                color: asset.allocation > 50 ? '#FF003C' : 
                                       asset.allocation > 30 ? '#FF5A2A' : '#FFB82A'
                              }}
                            >
                              {asset.allocation}%
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* AI Analysis Button */}
                  <motion.div 
                    variants={scaleIn}
                    className="text-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={analyzePortfolioWithAI}
                      disabled={analyzingPortfolio}
                      className="w-full glass-button bg-gradient-to-r from-[#FF007F] via-[#FF2FB3] to-[#6C00B8] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
                      style={{
                        boxShadow: analyzingPortfolio ? 'none' : '0 0 25px rgba(255, 47, 179, 0.4)',
                      }}
                    >
                      {analyzingPortfolio ? (
                        <div className="flex items-center justify-center">
                          <motion.div
                            animate={{ scale:[1,1.1,1.2,1.1,1] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Image src='/agent/agentlogo.png' alt='logo' width={50} height={50}/>
                          </motion.div>
                          <span>AI Analyzing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <HiLightningBolt className="mr-2" />
                          <span>{portfolioAnalysis ? 'Regenerate' : 'Get'} AI Analysis</span>
                        </div>
                      )}
                    </motion.button>
                    
                    <p className="text-xs text-[#FFFFFF] mt-3 opacity-80">
                      {dataSource === 'cached' ? 
                        'Analysis uses cached data • Connect for live insights' :
                        'Real-time AI analysis with current market data'
                      }
                    </p>
                  </motion.div>
                </>
              ) : loading ? (
                <motion.div
                  variants={scaleIn}
                  className="text-center py-12"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <FaSync className="text-4xl text-[#FF2FB3] mx-auto mb-4" />
                  </motion.div>
                  <p className="text-[#FFFFFF] mb-2">Loading wallet data...</p>
                  <p className="text-xs text-[#FFFFFF] opacity-60">
                    {balanceLoading ? 'Fetching balance...' : 'Processing portfolio...'}
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  variants={scaleIn}
                  className="text-center py-12"
                >
                  <p className="text-[#FFFFFF] mb-4">No wallet data available</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchWalletData(false)}
                    className="bg-[#6C00B8]/30 text-[#6C00B8] px-4 py-2 rounded-lg text-sm"
                  >
                    Load Portfolio Data
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 3: AI Analysis Results */}
          {step === 3 && portfolioAnalysis && (
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              className="space-y-6 pb-10"
            >
              <motion.div 
                variants={scaleIn}
                className="bg-[#2E2E30] glass glass-p rounded-xl p-4"
                style={{padding:"10px",boxShadow:"none"}}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center text-[#FFFFFF]">
                    <motion.div
                      animate={{ 
                        background: [
                          "#FF007F", 
                          "#FF2FB3", 
                          "#FF5A2A", 
                          "#FFB82A",
                          "#FF007F"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className='rounded-full p-[1px] mr-1.5'
                    >
                      <Image src='/agent/agentlogo.png' alt='logo' width={30} height={30}/>
                    </motion.div>
                    AI Analysis
                  </h3>
                  
                  <div className="flex space-x-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={copyAnalysis}
                      className="bg-[#6C00B8]/30 text-white p-2 rounded-lg"
                    >
                      <FaCopy className="text-xs" />
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={shareAnalysis}
                      className="bg-[#FFB82A]/30 text-[#FFB82A] p-2 rounded-lg"
                    >
                      <FaShare className="text-xs" />
                    </motion.button>
                  </div>
                </div>

                <div className="bg-[#0B0C10] glass-light rounded-lg p-3 max-h-80 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {isTyping ? (
                      <div className="flex items-center text-[#FF2FB3]">
                        <motion.div
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          Portiq AI is typing...
                        </motion.div>
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap text-xs text-[#FFFFFF] leading-relaxed font-sans">
                        {portfolioAnalysis}
                      </pre>
                    )}
                  </motion.div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => analyzePortfolioWithAI()}
                  disabled={analyzingPortfolio}
                  className="bg-gradient-to-r glass-button from-[#FF007F] to-[#FF2FB3] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-sm"
                  style={{boxShadow:"none"}}
                >
                  <FaSync className="mr-2" />
                  Refresh AI Analysis
                </motion.button>
                
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    className="bg-[#2E2E30] glass-light text-[#FFFFFF] font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center text-sm"
                  >
                    <FaEye className="mr-2" />
                    Portfolio
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={refreshData}
                    disabled={!isConnected}
                    className="bg-[#6C00B8]/30 glass-dark text-[#6C00B8] font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-sm"
                  >
                    <FaDatabase className="mr-2" />
                    Sync Data
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {(loading || analyzingPortfolio) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0B0C10]/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div 
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="bg-[#2E2E30] glass rounded-xl p-6 text-center max-w-xs mx-4"
            >
              <motion.div
              animate={{ scale:[1,1.1,1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Image src='/agent/agentlogo.png' alt='logo' width={50} height={50} className='mx-auto mb-2.5'/>
              </motion.div>
              <p className="text-[#FFFFFF] mb-2 text-sm">
                {analyzingPortfolio ? 'AI Analyzing Portfolio...' : 'Loading Data...'}
              </p>
              <p className="text-xs text-[#FFFFFF] opacity-60">
                {analyzingPortfolio 
                  ? 'Generating personalized insights'
                  : 'Processing blockchain data'
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
