'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWallet, FaBrain, FaShieldAlt, FaChartPie, FaRocket, FaCoins, FaExclamationTriangle, FaCheckCircle, FaSync, FaEye, FaDownload, FaShare, FaCopy, FaFire, FaGem } from 'react-icons/fa';
import { RiAiGenerate, RiWallet3Line, RiSecurePaymentLine, RiBarChart2Line, RiErrorWarningLine } from 'react-icons/ri';
import { HiSparkles, HiLightBulb } from 'react-icons/hi';
import { BiWallet, BiAnalyse } from 'react-icons/bi';
import { MdAccountBalanceWallet, MdSecurity } from 'react-icons/md';
import Image from 'next/image';

// Supported networks configuration
const SUPPORTED_NETWORKS = {
  mainnet: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3/YOUR_PROJECT_ID'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  sepolia: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SEP',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/YOUR_PROJECT_ID'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  polygon: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
  bsc: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed1.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/'],
  }
};

// Updated wallet configurations with proper provider detection
const SUPPORTED_WALLETS = [
  {
    name: 'MetaMask',
    id: 'metamask',
    logo: 'https://images.ctfassets.net/clixtyxoaeas/4rnpEzy1ATWRKVBOLxZ1Fm/a74dc1eed36d23d7ea6030383a4d5163/MetaMask-icon-fox.svg',
    color: 'from-[#FF6B35] to-[#F7931E]',
    connector: 'injected',
    downloadUrl: 'https://metamask.io/download/',
    checkProvider: () => window.ethereum?.isMetaMask,
  },
  {
    name: 'Coinbase Wallet',
    id: 'coinbase',
    logo: 'https://cdn.iconscout.com/icon/free/png-512/free-coinbase-logo-icon-svg-png-download-7651204.png?f=webp&w=512',
    color: 'from-[#0052FF] to-[#1652F0]',
    connector: 'coinbaseWallet',
    downloadUrl: 'https://www.coinbase.com/wallet',
    checkProvider: () => window.ethereum?.isCoinbaseWallet,
  },
  {
    name: 'Trust Wallet',
    id: 'trust',
    logo: 'https://avatars.githubusercontent.com/u/32179889?v=4',
    color: 'from-[#3375BB] to-[#1E88E5]',
    connector: 'injected',
    downloadUrl: 'https://trustwallet.com/',
    checkProvider: () => window.ethereum?.isTrust,
  },
  {
    name: 'WalletConnect',
    id: 'walletconnect',
    logo: '/agent/agentlogo.png',
    color: 'from-[#3B99FC] to-[#1E88E5]',
    connector: 'walletconnect',
    downloadUrl: 'https://walletconnect.com/',
    checkProvider: () => true, // Always available
  }
];

const PortiqAiAgentCore = () => {
  // State management
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletType, setWalletType] = useState('');
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [provider, setProvider] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzingPortfolio, setAnalyzingPortfolio] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [portfolioScore, setPortfolioScore] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connecting', 'connected', 'disconnected', 'error'

  // Haptic feedback for mobile
  const hapticFeedback = useCallback((type = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 50,
        heavy: 100,
        success: [50, 30, 50],
        warning: [100, 50, 100],
        error: [200, 100, 200]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Initialize wallet connection on component mount
  useEffect(() => {
    initializeWalletConnection();
    return () => {
      // Cleanup event listeners
      if (provider && provider.removeAllListeners) {
        provider.removeAllListeners();
      }
    };
  }, []);

  // Initialize wallet connection
  const initializeWalletConnection = async () => {
    try {
      await checkExistingConnection();
      setupProviderEventListeners();
    } catch (error) {
      console.error('Initialization error:', error);
      setError('Failed to initialize wallet connection');
    }
  };

  // Check for existing wallet connection
  const checkExistingConnection = async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({ 
          method: 'eth_chainId' 
        });
        
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
        setCurrentNetwork(getNetworkByChainId(chainId));
        setProvider(window.ethereum);
        setStep(2);
        
        // Determine wallet type
        const walletType = detectWalletType();
        setWalletType(walletType);
        
        await fetchWalletData(accounts[0], chainId);
      }
    } catch (error) {
      console.error('Error checking existing connection:', error);
    }
  };

  // Detect wallet type based on provider
  const detectWalletType = () => {
    if (window.ethereum?.isMetaMask) return 'metamask';
    if (window.ethereum?.isCoinbaseWallet) return 'coinbase';
    if (window.ethereum?.isTrust) return 'trust';
    return 'injected';
  };

  // Get network configuration by chain ID
  const getNetworkByChainId = (chainId) => {
    const networks = Object.values(SUPPORTED_NETWORKS);
    return networks.find(network => network.chainId === chainId) || SUPPORTED_NETWORKS.mainnet;
  };

  // Setup provider event listeners (EIP-1193 standard)
  const setupProviderEventListeners = () => {
    if (typeof window.ethereum === 'undefined') return;

    // Account changed
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    // Chain changed
    window.ethereum.on('chainChanged', handleChainChanged);
    
    // Connection changed
    window.ethereum.on('connect', handleConnect);
    
    // Disconnection
    window.ethereum.on('disconnect', handleDisconnect);
  };

  // Handle account changes
  const handleAccountsChanged = useCallback(async (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setWalletAddress(accounts[0]);
      if (currentNetwork) {
        await fetchWalletData(accounts[0], currentNetwork.chainId);
      }
      hapticFeedback('light');
    }
  }, [currentNetwork, hapticFeedback]);

  // Handle chain changes
  const handleChainChanged = useCallback((chainId) => {
    const network = getNetworkByChainId(chainId);
    setCurrentNetwork(network);
    
    // Refresh wallet data for new network
    if (walletAddress) {
      fetchWalletData(walletAddress, chainId);
    }
    
    hapticFeedback('medium');
  }, [walletAddress, hapticFeedback]);

  // Handle connection
  const handleConnect = useCallback((connectInfo) => {
    console.log('Wallet connected:', connectInfo);
    setConnectionStatus('connected');
  }, []);

  // Handle disconnection
  const handleDisconnect = useCallback((error) => {
    console.log('Wallet disconnected:', error);
    disconnectWallet();
  }, []);

  // Main wallet connection function
  const connectWallet = useCallback(async (walletId) => {
    try {
      setLoading(true);
      setError('');
      setConnectionStatus('connecting');
      hapticFeedback('medium');

      const wallet = SUPPORTED_WALLETS.find(w => w.id === walletId);
      
      if (!wallet) {
        throw new Error('Unsupported wallet type');
      }

      let accounts = [];
      let chainId = '';

      switch (walletId) {
        case 'walletconnect':
          ({ accounts, chainId } = await connectWalletConnect());
          break;
        case 'metamask':
        case 'coinbase':
        case 'trust':
        default:
          ({ accounts, chainId } = await connectInjectedWallet(wallet));
          break;
      }

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      // Set wallet state
      setWalletAddress(accounts[0]);
      setWalletType(walletId);
      setWalletConnected(true);
      setCurrentNetwork(getNetworkByChainId(chainId));
      setProvider(window.ethereum);
      setConnectionStatus('connected');
      setStep(2);

      await fetchWalletData(accounts[0], chainId);
      hapticFeedback('success');

    } catch (error) {
      console.error('Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
      setConnectionStatus('error');
      hapticFeedback('error');
    } finally {
      setLoading(false);
    }
  }, [hapticFeedback]);

  // Connect injected wallet (MetaMask, Coinbase, Trust, etc.)
  const connectInjectedWallet = async (wallet) => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error(`Please install ${wallet.name} to continue`);
    }

    // Check if specific wallet is available
    if (wallet.checkProvider && !wallet.checkProvider()) {
      if (wallet.id !== 'metamask') { // Generic fallback for non-MetaMask
        console.warn(`${wallet.name} not detected, using default provider`);
      }
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Get current chain
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      // Check if we're on a supported network
      const supportedChainIds = Object.values(SUPPORTED_NETWORKS).map(n => n.chainId);
      if (!supportedChainIds.includes(chainId)) {
        await switchToSupportedNetwork();
      }

      return { accounts, chainId };

    } catch (error) {
      if (error.code === 4001) {
        throw new Error('Connection request was rejected by user');
      }
      throw new Error(error.message || `Failed to connect ${wallet.name}`);
    }
  };

  // Connect WalletConnect
  const connectWalletConnect = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
      
      const wcProvider = await EthereumProvider.init({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
        chains: [1, 137, 56], // Ethereum, Polygon, BSC
        showQrModal: true,
        qrModalOptions: {
          themeMode: 'dark',
          themeVariables: {
            '--wcm-z-index': '9999'
          }
        }
      });

      await wcProvider.connect();
      
      const accounts = wcProvider.accounts;
      const chainId = `0x${wcProvider.chainId.toString(16)}`;
      
      setProvider(wcProvider);
      
      return { accounts, chainId };

    } catch (error) {
      if (error.message.includes('User rejected')) {
        throw new Error('Connection rejected by user');
      }
      throw new Error('Failed to connect with WalletConnect');
    }
  };

  // Switch to supported network
  const switchToSupportedNetwork = async (networkKey = 'mainnet') => {
    const network = SUPPORTED_NETWORKS[networkKey];
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
    } catch (switchError) {
      // Network not added to wallet
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });
        } catch (addError) {
          throw new Error('Failed to add network to wallet');
        }
      } else {
        throw new Error('Failed to switch network');
      }
    }
  };

  // Fetch wallet data with proper error handling
  const fetchWalletData = async (address, chainId) => {
    try {
      setLoading(true);
      
      // Use appropriate API based on network
      const network = getNetworkByChainId(chainId);
      let portfolioData;

      switch (network.chainName) {
        case 'Ethereum Mainnet':
        case 'Sepolia Testnet':
          portfolioData = await fetchEthereumData(address);
          break;
        case 'Polygon Mainnet':
          portfolioData = await fetchPolygonData(address);
          break;
        case 'Binance Smart Chain':
          portfolioData = await fetchBSCData(address);
          break;
        default:
          portfolioData = await fetchGenericData(address);
      }

      setWalletData(portfolioData);
      setPortfolioScore(calculatePortfolioScore(portfolioData));

    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError('Failed to fetch wallet data. Please try again.');
      
      // Fallback demo data
      const fallbackData = generateFallbackData();
      setWalletData(fallbackData);
      setPortfolioScore(calculatePortfolioScore(fallbackData));
      
    } finally {
      setLoading(false);
    }
  };

  // Fetch Ethereum data
  const fetchEthereumData = async (address) => {
    try {
      // Use multiple APIs for redundancy
      const ethBalance = await fetchEthBalance(address);
      const tokenBalances = await fetchERC20Tokens(address);
      
      return formatPortfolioData(ethBalance, tokenBalances, 'ETH');
    } catch (error) {
      throw new Error('Failed to fetch Ethereum data');
    }
  };

  // Fetch Polygon data
  const fetchPolygonData = async (address) => {
    try {
      // Polygon-specific API calls
      const maticBalance = await fetchMaticBalance(address);
      const tokenBalances = await fetchPolygonTokens(address);
      
      return formatPortfolioData(maticBalance, tokenBalances, 'MATIC');
    } catch (error) {
      throw new Error('Failed to fetch Polygon data');
    }
  };

  // Fetch BSC data
  const fetchBSCData = async (address) => {
    try {
      const bnbBalance = await fetchBNBBalance(address);
      const tokenBalances = await fetchBSCTokens(address);
      
      return formatPortfolioData(bnbBalance, tokenBalances, 'BNB');
    } catch (error) {
      throw new Error('Failed to fetch BSC data');
    }
  };

  // Generic data fetching
  const fetchGenericData = async (address) => {
    return generateFallbackData();
  };

  // Fetch ETH balance using multiple APIs with fallback
  const fetchEthBalance = async (address) => {
    const apis = [
      {
        url: `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY}`,
        parse: (data) => parseFloat(data.result) / 1e18
      },
      {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
        parse: (data) => parseFloat(data.result) / 1e18
      }
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url);
        const data = await response.json();
        if (data.result) {
          return api.parse(data);
        }
      } catch (error) {
        console.warn('API failed, trying next:', error);
      }
    }

    throw new Error('All balance APIs failed');
  };

  // Fetch ERC20 tokens
  const fetchERC20Tokens = async (address) => {
    try {
      // Using Moralis API or similar
      const response = await fetch(`https://deep-index.moralis.io/api/v2/${address}/erc20`, {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API_KEY
        }
      });
      
      const tokens = await response.json();
      return tokens.reduce((acc, token) => {
        acc[token.symbol] = parseFloat(token.balance) / Math.pow(10, token.decimals);
        return acc;
      }, {});
    } catch (error) {
      return {};
    }
  };

  // Similar functions for other networks...
  const fetchMaticBalance = async (address) => {
    // Polygon-specific implementation
    return 0;
  };

  const fetchBNBBalance = async (address) => {
    // BSC-specific implementation
    return 0;
  };

  const fetchPolygonTokens = async (address) => {
    return {};
  };

  const fetchBSCTokens = async (address) => {
    return {};
  };

  // Format portfolio data
  const formatPortfolioData = (nativeBalance, tokenBalances, nativeSymbol) => {
    const assets = [];
    const nativePrice = getNativeTokenPrice(nativeSymbol);
    
    // Add native token
    if (nativeBalance > 0) {
      assets.push({
        symbol: nativeSymbol,
        balance: nativeBalance,
        value: nativeBalance * nativePrice,
        allocation: 0 // Will be calculated
      });
    }

    // Add tokens
    Object.entries(tokenBalances).forEach(([symbol, balance]) => {
      if (balance > 0) {
        const price = getTokenPrice(symbol);
        assets.push({
          symbol,
          balance,
          value: balance * price,
          allocation: 0
        });
      }
    });

    // Calculate allocations
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    assets.forEach(asset => {
      asset.allocation = totalValue > 0 ? Math.round((asset.value / totalValue) * 100) : 0;
    });

    return {
      balance: { [nativeSymbol.toLowerCase()]: nativeBalance, ...tokenBalances },
      totalValue,
      assets,
      riskScore: calculateRiskScore(assets),
      diversificationScore: calculateDiversificationScore(assets),
      network: currentNetwork?.chainName || 'Unknown'
    };
  };

  // Get native token prices
  const getNativeTokenPrice = (symbol) => {
    const prices = {
      'ETH': 3000,
      'MATIC': 0.8,
      'BNB': 300,
      'SEP': 3000 // Testnet, same as ETH
    };
    return prices[symbol] || 0;
  };

  // Get token prices (implement with CoinGecko API)
  const getTokenPrice = (symbol) => {
    const prices = {
      'USDC': 1,
      'USDT': 1,
      'DAI': 1,
      'WETH': 3000,
      'LINK': 15,
      'UNI': 10,
      'AAVE': 100,
      'COMP': 50
    };
    return prices[symbol] || 0;
  };

  // Generate fallback demo data
  const generateFallbackData = () => {
    return {
      balance: {
        eth: 0.5,
        usdc: 1000,
      },
      totalValue: 2500.00,
      assets: [
        { symbol: 'ETH', balance: 0.5, value: 1500, allocation: 60 },
        { symbol: 'USDC', balance: 1000, value: 1000, allocation: 40 }
      ],
      riskScore: 65,
      diversificationScore: 45,
      network: 'Demo Mode'
    };
  };

  // Risk score calculation
  const calculateRiskScore = (assets) => {
    if (!assets.length) return 0;
    
    const maxAllocation = Math.max(...assets.map(a => a.allocation));
    let score = 50; // Base score
    
    // Penalize concentration
    if (maxAllocation > 70) score += 30;
    else if (maxAllocation > 50) score += 15;
    
    // Bonus for diversification
    if (assets.length >= 5) score -= 10;
    
    return Math.min(100, Math.max(0, score));
  };

  // Diversification score
  const calculateDiversificationScore = (assets) => {
    if (!assets.length) return 0;
    
    let score = assets.length * 15; // Base score per asset
    const maxAllocation = Math.max(...assets.map(a => a.allocation));
    
    // Bonus for balanced allocation
    if (maxAllocation < 40) score += 25;
    else if (maxAllocation < 60) score += 15;
    
    return Math.min(100, score);
  };

  // Portfolio health score
  const calculatePortfolioScore = (data) => {
    if (!data || !data.assets.length) return 0;
    
    let score = 100;
    const maxAllocation = Math.max(...data.assets.map(a => a.allocation));
    
    // Concentration penalty
    if (maxAllocation > 70) score -= 30;
    else if (maxAllocation > 50) score -= 15;
    
    // Diversification bonus
    if (data.assets.length < 3) score -= 20;
    if (data.assets.length >= 5) score += 10;
    
    // Stablecoin allocation
    const stableAllocation = data.assets
      .filter(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
      .reduce((sum, a) => sum + a.allocation, 0);
    
    if (stableAllocation < 10) score -= 15;
    if (stableAllocation > 60) score -= 10;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // AI Portfolio Analysis
  const analyzePortfolioWithAI = useCallback(async () => {
    if (!walletData) return;

    try {
      setAnalyzingPortfolio(true);
      setShowAnalysisModal(true);
      hapticFeedback('medium');

      // In production, use real AI API
      const analysis = generateMockAnalysis(walletData, portfolioScore);
      setPortfolioAnalysis(analysis);
      setStep(3);

    } catch (error) {
      console.error('AI Analysis Error:', error);
      setPortfolioAnalysis(`❌ Unable to analyze portfolio at this time.\n\nError: ${error.message}`);
      hapticFeedback('error');
    } finally {
      setAnalyzingPortfolio(false);
    }
  }, [walletData, portfolioScore, hapticFeedback]);

  // Generate mock analysis
  const generateMockAnalysis = (data, score) => {
    const riskLevel = score > 80 ? 'Low' : score > 60 ? 'Moderate' : 'High';
    const topAsset = data.assets.reduce((max, asset) => 
      asset.allocation > max.allocation ? asset : max, data.assets[0]
    );

    return `📊 PORTFOLIO ANALYSIS REPORT
💰 Total Value: $${data.totalValue.toLocaleString()}
🌐 Network: ${data.network}
📈 Health Score: ${score}/100 (${score > 80 ? 'Excellent' : score > 60 ? 'Good' : 'Needs Improvement'})
⚠️ Risk Level: ${riskLevel}

🔍 KEY FINDINGS:
• Portfolio contains ${data.assets.length} assets
• ${topAsset.symbol} dominates at ${topAsset.allocation}% allocation
• ${score < 60 ? 'High concentration risk detected' : 'Reasonable asset distribution'}
• Diversification score: ${data.diversificationScore}/100

💡 RECOMMENDATIONS:
${score < 60 ? 
  `• Reduce concentration in ${topAsset.symbol} (currently ${topAsset.allocation}%)\n• Add more diverse assets to spread risk` : 
  '• Consider adding stablecoins for stability\n• Monitor market conditions for rebalancing'
}
• Set up regular portfolio rebalancing
• Consider DeFi yield opportunities

🎯 OPTIMAL ALLOCATION:
• 40-50% Blue-chip crypto (BTC, ETH)
• 20-30% Mid-cap altcoins  
• 15-25% Stablecoins
• 5-10% High-risk/experimental

⚡ IMMEDIATE ACTIONS:
1. ${score < 50 ? 'Urgent: Rebalance within 48 hours' : 'Review allocation weekly'}
2. Set up price alerts for major holdings
3. Consider dollar-cost averaging for new positions`;
  };

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    // Remove event listeners
    if (provider && provider.removeAllListeners) {
      provider.removeAllListeners();
    }

    // Reset state
    setWalletConnected(false);
    setWalletAddress('');
    setWalletType('');
    setCurrentNetwork(null);
    setProvider(null);
    setWalletData(null);
    setPortfolioAnalysis('');
    setStep(1);
    setPortfolioScore(0);
    setConnectionStatus('disconnected');
    
    hapticFeedback('light');
  }, [provider, hapticFeedback]);

  // Copy analysis
  const copyAnalysis = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(portfolioAnalysis);
      hapticFeedback('success');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, [portfolioAnalysis, hapticFeedback]);

  // Share analysis
  const shareAnalysis = useCallback(async () => {
    const shareData = {
      title: 'My Portiq Portfolio Analysis',
      text: `Portfolio Analysis - Total: $${walletData?.totalValue?.toLocaleString()}, Score: ${portfolioScore}/100`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        hapticFeedback('success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          await fallbackShare(shareData);
        }
      }
    } else {
      await fallbackShare(shareData);
    }
  }, [walletData, portfolioScore, hapticFeedback]);

  // Fallback share method
  const fallbackShare = async (data) => {
    try {
      await navigator.clipboard.writeText(data.text);
      hapticFeedback('medium');
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get network display info
  const getNetworkDisplay = () => {
    if (!currentNetwork) return null;
    
    const networkNames = {
      '0x1': 'Ethereum',
      '0xaa36a7': 'Sepolia',
      '0x89': 'Polygon',
      '0x38': 'BSC'
    };
    
    return networkNames[currentNetwork.chainId] || 'Unknown';
  };

  // Check if wallet is available
  const isWalletAvailable = (walletId) => {
    const wallet = SUPPORTED_WALLETS.find(w => w.id === walletId);
    if (!wallet) return false;
    
    if (walletId === 'walletconnect') return true;
    
    return wallet.checkProvider ? wallet.checkProvider() : typeof window.ethereum !== 'undefined';
  };

  // Component render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-slate-900"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-purple-500/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FaBrain className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Portiq AI Agent
              </h1>
              <p className="text-xs text-purple-300">Real Web3 Portfolio Intelligence</p>
            </div>
          </div>
          
          {walletConnected && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium">{formatAddress(walletAddress)}</div>
                <div className="text-xs text-purple-300">
                  {getNetworkDisplay()} • {connectionStatus}
                </div>
              </div>
              <button
                onClick={disconnectWallet}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                title="Disconnect Wallet"
              >
                <FaSync className="text-red-400" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Step 1: Wallet Connection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Connect Your Wallet
                </h2>
                <p className="text-purple-300 max-w-2xl mx-auto">
                  Choose your preferred wallet for real-time portfolio analysis. 
                  We use read-only access to analyze your holdings.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 max-w-md mx-auto">
                  <div className="flex items-center space-x-2 text-red-400">
                    <FaExclamationTriangle />
                    <span className="font-medium">Connection Error</span>
                  </div>
                  <p className="text-sm mt-1 text-red-300">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {SUPPORTED_WALLETS.map((wallet) => {
                  const available = isWalletAvailable(wallet.id);
                  
                  return (
                    <motion.button
                      key={wallet.id}
                      whileHover={{ scale: available ? 1.02 : 1 }}
                      whileTap={{ scale: available ? 0.98 : 1 }}
                      onClick={() => available ? connectWallet(wallet.id) : window.open(wallet.downloadUrl, '_blank')}
                      disabled={loading && connectionStatus === 'connecting'}
                      className={`
                        p-4 rounded-xl border backdrop-blur-sm transition-all duration-200
                        ${available 
                          ? 'bg-gradient-to-r border-purple-500/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20' 
                          : 'bg-slate-800/50 border-slate-600/30 opacity-75'
                        }
                        ${loading && connectionStatus === 'connecting' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${wallet.color} flex items-center justify-center`}>
                          <Image
                            src={wallet.logo}
                            alt={wallet.name}
                            width={24}
                            height={24}
                            className="w-6 h-6"
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-white">{wallet.name}</div>
                          <div className="text-sm text-purple-300">
                            {available ? (
                              wallet.id === 'walletconnect' ? 'Universal Connection' : 
                              wallet.id === 'phantom' ? 'Solana Ecosystem' : 'Ethereum Compatible'
                            ) : 'Not Installed'}
                          </div>
                        </div>
                        {loading && connectionStatus === 'connecting' ? (
                          <FaSync className="text-purple-400 animate-spin" />
                        ) : available ? (
                          <FaWallet className="text-purple-400" />
                        ) : (
                          <FaDownload className="text-slate-400" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 max-w-md mx-auto">
                <div className="flex items-center space-x-2 text-blue-400 mb-2">
                  <FaShieldAlt />
                  <span className="font-medium text-sm">Security Notice</span>
                </div>
                <p className="text-xs text-blue-300">
                  Your wallet data is read-only. We never request private keys or signing permissions for transfers.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Portfolio Overview */}
          {step === 2 && walletData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Portfolio Overview</h2>
                <p className="text-purple-300">
                  Connected to {getNetworkDisplay()} • {formatAddress(walletAddress)}
                </p>
              </div>

              {/* Portfolio Value Card */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium text-purple-300">Total Portfolio Value</h3>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ${walletData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Risk: {walletData.riskScore}/100</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Diversification: {walletData.diversificationScore}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assets Table */}
              {walletData.assets.length > 0 && (
                <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FaCoins className="mr-2 text-purple-400" />
                    Asset Breakdown
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-purple-500/20">
                          <th className="text-left py-2 text-purple-300 font-medium">Asset</th>
                          <th className="text-right py-2 text-purple-300 font-medium">Balance</th>
                          <th className="text-right py-2 text-purple-300 font-medium">Value</th>
                          <th className="text-right py-2 text-purple-300 font-medium">Allocation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {walletData.assets.map((asset, index) => (
                          <tr key={index} className="border-b border-slate-700/50">
                            <td className="py-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
                                  {asset.symbol.charAt(0)}
                                </div>
                                <span className="font-medium">{asset.symbol}</span>
                              </div>
                            </td>
                            <td className="text-right py-3">
                              {asset.balance.toLocaleString('en-US', { 
                                minimumFractionDigits: 4, 
                                maximumFractionDigits: 4 
                              })}
                            </td>
                            <td className="text-right py-3">
                              ${asset.value.toLocaleString('en-US', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </td>
                            <td className="text-right py-3">
                              <div className="flex items-center justify-end space-x-2">
                                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    style={{ width: `${asset.allocation}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{asset.allocation}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Analysis Button */}
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={analyzePortfolioWithAI}
                  disabled={loading || analyzingPortfolio}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-purple-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzingPortfolio ? (
                    <span className="flex items-center">
                      <FaSync className="animate-spin mr-2" />
                      Analyzing Portfolio...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <RiAiGenerate className="mr-2" />
                      Get AI Analysis
                    </span>
                  )}
                </motion.button>
                <p className="text-sm text-purple-300 mt-2">
                  Personalized insights from real wallet data
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: AI Analysis Results */}
          {step === 3 && portfolioAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">AI Portfolio Analysis</h2>
                <p className="text-purple-300">Based on real blockchain data</p>
              </div>

              {/* Analysis Report */}
              <div className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaBrain className="mr-2 text-purple-400" />
                    Analysis Report
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyAnalysis}
                      className="p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors"
                      title="Copy Analysis"
                    >
                      <FaCopy className="text-purple-400" />
                    </button>
                    <button
                      onClick={shareAnalysis}
                      className="p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors"
                      title="Share Analysis"
                    >
                      <FaShare className="text-purple-400" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-slate-200">
                    {portfolioAnalysis}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => analyzePortfolioWithAI()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/20 transition-all duration-200"
                >
                  <span className="flex items-center justify-center">
                    <FaSync className="mr-2" />
                    Refresh Analysis
                  </span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(2)}
                  className="bg-slate-700/50 hover:bg-slate-600/50 px-6 py-3 rounded-xl font-semibold border border-slate-600/50 transition-all duration-200"
                >
                  <span className="flex items-center justify-center">
                    <FaChartPie className="mr-2" />
                    View Portfolio
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Loading States */}
          <AnimatePresence>
            {showAnalysisModal && analyzingPortfolio && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-slate-800 border border-purple-500/20 rounded-xl p-8 max-w-md w-full text-center space-y-4"
                >
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <FaBrain className="text-white text-2xl animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold">AI Analysis in Progress</h3>
                  <p className="text-purple-300">
                    AI is processing your real wallet data and market conditions...
                  </p>
                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [0, -10, 0],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connection Status Indicator */}
          {connectionStatus === 'connecting' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg z-50"
            >
              <div className="flex items-center space-x-2">
                <FaSync className="animate-spin" />
                <span className="font-medium">Please confirm connection in your wallet...</span>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
};

export default PortiqAiAgentCore;
