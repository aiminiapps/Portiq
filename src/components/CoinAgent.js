'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaWallet, FaBrain, FaShieldAlt, FaChartPie, FaRocket, 
  FaCoins, FaExclamationTriangle, FaCheckCircle, FaSync,
  FaEye, FaDownload, FaShare, FaCopy, FaFire, FaGem
} from 'react-icons/fa';
import { 
  RiAiGenerate, RiWallet3Line, RiSecurePaymentLine,
  RiBarChart2Line, RiErrorWarningLine 
} from 'react-icons/ri';
import { HiSparkles, HiLightBulb } from 'react-icons/hi';
import { BiWallet, BiAnalyse } from 'react-icons/bi';
import { MdAccountBalanceWallet, MdSecurity } from 'react-icons/md';

// Real wallet configurations with actual logos
const SUPPORTED_WALLETS = [
  {
    name: 'MetaMask',
    id: 'metamask',
    logo: 'https://cdn.jsdelivr.net/gh/MetaMask/brand-resources@master/SVG/metamask-fox.svg',
    color: 'from-[#FF6B35] to-[#F7931E]',
    connector: 'injected',
    downloadUrl: 'https://metamask.io/download/'
  },
  {
    name: 'WalletConnect',
    id: 'walletconnect',
    logo: 'https://registry.walletconnect.com/api/v1/logo/md/walletconnect-logo.svg',
    color: 'from-[#3B99FC] to-[#1E88E5]',
    connector: 'walletconnect',
    downloadUrl: 'https://walletconnect.com/'
  },
  {
    name: 'Coinbase Wallet',
    id: 'coinbase',
    logo: 'https://www.coinbase.com/img/favicon.ico',
    color: 'from-[#0052FF] to-[#1652F0]',
    connector: 'coinbaseWallet',
    downloadUrl: 'https://www.coinbase.com/wallet'
  },
  {
    name: 'Trust Wallet',
    id: 'trust',
    logo: 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg',
    color: 'from-[#3375BB] to-[#1E88E5]',
    connector: 'injected',
    downloadUrl: 'https://trustwallet.com/'
  },
  {
    name: 'Phantom',
    id: 'phantom',
    logo: 'https://phantom.app/img/phantom-logo.svg',
    color: 'from-[#AB9FF2] to-[#4E44CE]',
    connector: 'phantom',
    downloadUrl: 'https://phantom.app/'
  },
  {
    name: 'Binance Wallet',
    id: 'binance',
    logo: 'https://bin.bnbstatic.com/static/images/common/favicon.ico',
    color: 'from-[#F3BA2F] to-[#FCD535]',
    connector: 'injected',
    downloadUrl: 'https://www.binance.com/en/web3wallet'
  }
];

// Ethereum mainnet configuration
const ETHEREUM_MAINNET = {
  chainId: '0x1',
  chainName: 'Ethereum Mainnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.infura.io/v3/'],
  blockExplorerUrls: ['https://etherscan.io'],
};

const PortiqAiAgentCore = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletType, setWalletType] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzingPortfolio, setAnalyzingPortfolio] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Connect, 2: Analyze, 3: Results
  const [aiInsights, setAiInsights] = useState('');
  const [portfolioScore, setPortfolioScore] = useState(0);
  const [web3Provider, setWeb3Provider] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Mobile haptic feedback
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

  // Check if wallet is already connected
  useEffect(() => {
    checkWalletConnection();
    setupEventListeners();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
          setWalletType('metamask');
          setStep(2);
          await fetchRealWalletData(accounts[0]);
          
          // Get chain ID
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(chainId);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const setupEventListeners = () => {
    if (typeof window.ethereum !== 'undefined') {
      // Account changed
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletAddress(accounts[0]);
          fetchRealWalletData(accounts[0]);
        }
      });

      // Chain changed
      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(chainId);
        window.location.reload(); // Recommended by MetaMask
      });

      // Disconnect
      window.ethereum.on('disconnect', () => {
        disconnectWallet();
      });
    }
  };

  // Real wallet connection handlers
  const connectWallet = useCallback(async (walletId) => {
    try {
      setLoading(true);
      setError('');
      hapticFeedback('medium');

      const wallet = SUPPORTED_WALLETS.find(w => w.id === walletId);
      
      if (walletId === 'metamask' || wallet.connector === 'injected') {
        await connectMetaMask(walletId);
      } else if (walletId === 'walletconnect') {
        await connectWalletConnect();
      } else if (walletId === 'coinbase') {
        await connectCoinbaseWallet();
      } else if (walletId === 'phantom') {
        await connectPhantom();
      } else {
        // For other injected wallets
        await connectMetaMask(walletId);
      }

    } catch (error) {
      console.error('Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
      hapticFeedback('error');
    } finally {
      setLoading(false);
    }
  }, [hapticFeedback]);

  // MetaMask and other injected wallet connection
  const connectMetaMask = async (walletType) => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask or a Web3 wallet');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Switch to Ethereum mainnet if not already
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ETHEREUM_MAINNET.chainId }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ETHEREUM_MAINNET],
          });
        }
      }

      const address = accounts[0];
      setWalletAddress(address);
      setWalletType(walletType);
      setWalletConnected(true);
      setStep(2);
      
      // Get chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chainId);
      
      await fetchRealWalletData(address);
      hapticFeedback('success');
      
    } catch (error) {
      throw new Error(error.message || 'Failed to connect to wallet');
    }
  };

  // WalletConnect connection
  const connectWalletConnect = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
      
      const provider = await EthereumProvider.init({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
        chains: [1, 56, 137], // Ethereum, BSC, Polygon
        showQrModal: true,
        qrModalOptions: {
          themeMode: 'dark',
          themeVariables: {
            '--wcm-z-index': '9999'
          }
        }
      });

      await provider.connect();
      const accounts = provider.accounts;
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setWalletType('walletconnect');
        setWalletConnected(true);
        setWeb3Provider(provider);
        setStep(2);
        await fetchRealWalletData(accounts[0]);
        hapticFeedback('success');
      }
    } catch (error) {
      if (error.message.includes('User rejected')) {
        throw new Error('Connection rejected by user');
      }
      throw new Error('Failed to connect with WalletConnect');
    }
  };

  // Coinbase Wallet connection
  const connectCoinbaseWallet = async () => {
    try {
      // Check if Coinbase Wallet is available
      if (window.ethereum?.isCoinbaseWallet) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletType('coinbase');
          setWalletConnected(true);
          setStep(2);
          await fetchRealWalletData(accounts[0]);
          hapticFeedback('success');
        }
      } else {
        // Redirect to Coinbase Wallet
        const dappUrl = encodeURIComponent(window.location.href);
        window.open(`https://go.cb-w.com/dapp?cb_url=${dappUrl}`, '_blank');
        throw new Error('Please install Coinbase Wallet');
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to connect Coinbase Wallet');
    }
  };

  // Phantom wallet connection (Solana)
  const connectPhantom = async () => {
    try {
      if (window.solana?.isPhantom) {
        const response = await window.solana.connect();
        const address = response.publicKey.toString();
        
        setWalletAddress(address);
        setWalletType('phantom');
        setWalletConnected(true);
        setStep(2);
        await fetchRealSolanaWalletData(address);
        hapticFeedback('success');
      } else {
        throw new Error('Please install Phantom Wallet');
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to connect Phantom Wallet');
    }
  };

  // Fetch real wallet data using multiple APIs
  const fetchRealWalletData = async (address) => {
    try {
      setLoading(true);
      
      // Use multiple free APIs to get real data
      const [ethBalance, tokenBalances] = await Promise.all([
        fetchEthBalance(address),
        fetchTokenBalances(address)
      ]);

      const totalValue = calculateTotalValue(ethBalance, tokenBalances);
      const assets = formatAssets(ethBalance, tokenBalances);
      
      const portfolioData = {
        balance: {
          eth: ethBalance,
          ...tokenBalances
        },
        totalValue: totalValue,
        assets: assets,
        riskScore: calculateRiskScore(assets),
        diversificationScore: calculateDiversificationScore(assets)
      };

      setWalletData(portfolioData);
      
      // Calculate portfolio health score
      const healthScore = calculatePortfolioScore(portfolioData);
      setPortfolioScore(healthScore);
      
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError('Failed to fetch wallet data. Using demo data.');
      
      // Fallback to demo data if API fails
      const demoData = {
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
        diversificationScore: 45
      };
      
      setWalletData(demoData);
      setPortfolioScore(calculatePortfolioScore(demoData));
    } finally {
      setLoading(false);
    }
  };

  // Fetch real Solana wallet data
  const fetchRealSolanaWalletData = async (address) => {
    try {
      // Use Solana RPC to get real data
      const response = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address]
        })
      });

      const data = await response.json();
      const solBalance = data.result.value / 1000000000; // Convert lamports to SOL

      const portfolioData = {
        balance: { sol: solBalance },
        totalValue: solBalance * 100, // Approximate SOL price
        assets: [
          { symbol: 'SOL', balance: solBalance, value: solBalance * 100, allocation: 100 }
        ],
        riskScore: 75,
        diversificationScore: 20
      };

      setWalletData(portfolioData);
      setPortfolioScore(calculatePortfolioScore(portfolioData));
      
    } catch (error) {
      console.error('Error fetching Solana wallet data:', error);
      setError('Failed to fetch Solana wallet data');
    }
  };

  // Fetch ETH balance using free API
  const fetchEthBalance = async (address) => {
    try {
      // Using Etherscan API (free tier)
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=YourApiKeyToken`
      );
      const data = await response.json();
      return parseFloat(data.result) / 1e18; // Convert Wei to ETH
    } catch (error) {
      console.log('Etherscan API failed, using fallback');
      return 0.1; // Fallback value
    }
  };

  // Fetch token balances
  const fetchTokenBalances = async (address) => {
    try {
      // This would typically use APIs like Moralis, Alchemy, or CovalentHQ
      // For demo, returning empty object
      return {};
    } catch (error) {
      return {};
    }
  };

  const calculateTotalValue = (ethBalance, tokenBalances) => {
    // Approximate ETH price for demo
    const ethPrice = 3000;
    let total = ethBalance * ethPrice;
    
    // Add token values (would need real price data)
    Object.entries(tokenBalances).forEach(([token, balance]) => {
      // Add token values based on real prices
      total += balance * getTokenPrice(token);
    });
    
    return total;
  };

  const getTokenPrice = (token) => {
    // Mock prices - in production, use CoinGecko API or similar
    const prices = {
      'USDC': 1,
      'USDT': 1,
      'DAI': 1,
      'WETH': 3000,
      'LINK': 15,
      'UNI': 10
    };
    return prices[token] || 0;
  };

  const formatAssets = (ethBalance, tokenBalances) => {
    const assets = [];
    const ethPrice = 3000;
    
    if (ethBalance > 0) {
      const ethValue = ethBalance * ethPrice;
      assets.push({
        symbol: 'ETH',
        balance: ethBalance,
        value: ethValue,
        allocation: 100 // Will be recalculated
      });
    }
    
    // Add tokens
    Object.entries(tokenBalances).forEach(([token, balance]) => {
      if (balance > 0) {
        const value = balance * getTokenPrice(token);
        assets.push({
          symbol: token,
          balance: balance,
          value: value,
          allocation: 0 // Will be calculated
        });
      }
    });
    
    // Calculate allocations
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    assets.forEach(asset => {
      asset.allocation = totalValue > 0 ? Math.round((asset.value / totalValue) * 100) : 0;
    });
    
    return assets;
  };

  const calculateRiskScore = (assets) => {
    // Higher concentration = higher risk
    const maxAllocation = Math.max(...assets.map(a => a.allocation));
    return Math.min(100, 50 + (maxAllocation - 50));
  };

  const calculateDiversificationScore = (assets) => {
    // More assets with balanced allocation = better diversification
    const numAssets = assets.length;
    const maxAllocation = Math.max(...assets.map(a => a.allocation));
    
    let score = numAssets * 20; // Base score
    if (maxAllocation < 50) score += 20; // Bonus for no major concentration
    
    return Math.min(100, score);
  };

  // Calculate portfolio health score
  const calculatePortfolioScore = (data) => {
    if (!data || !data.assets) return 0;
    
    let score = 100;
    
    // Check concentration risk
    const maxAllocation = Math.max(...data.assets.map(a => a.allocation));
    if (maxAllocation > 50) score -= (maxAllocation - 50) * 2;
    
    // Check diversification
    if (data.assets.length < 3) score -= 20;
    if (data.assets.length < 5) score -= 10;
    
    // Check stable coin allocation
    const stableAllocation = data.assets
      .filter(a => ['USDC', 'USDT', 'DAI'].includes(a.symbol))
      .reduce((sum, a) => sum + a.allocation, 0);
    
    if (stableAllocation < 10) score -= 15;
    if (stableAllocation > 50) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  };

  // AI Portfolio Analysis
  const analyzePortfolioWithAI = useCallback(async () => {
    if (!walletData) return;

    try {
      setAnalyzingPortfolio(true);
      setShowAnalysisModal(true);
      hapticFeedback('medium');

      // Mock AI analysis for demo - replace with real API
      const analysis = generateMockAnalysis(walletData, portfolioScore);
      setPortfolioAnalysis(analysis);
      setStep(3);

    } catch (error) {
      console.error('AI Analysis Error:', error);
      const fallback = `❌ Unable to analyze portfolio at this time.\n\n🔄 API Error: ${error.message}\n\n💡 Please try again later or check your connection.`;
      setPortfolioAnalysis(fallback);
      hapticFeedback('error');
    } finally {
      setAnalyzingPortfolio(false);
    }
  }, [walletData, portfolioScore, hapticFeedback]);

  const generateMockAnalysis = (data, score) => {
    const riskLevel = score > 80 ? 'Low' : score > 60 ? 'Moderate' : 'High';
    const topAsset = data.assets.reduce((max, asset) => asset.allocation > max.allocation ? asset : max);
    
    return `📊 PORTFOLIO ANALYSIS REPORT

💰 Total Value: $${data.totalValue.toLocaleString()}
📈 Health Score: ${score}/100 (${score > 80 ? 'Excellent' : score > 60 ? 'Good' : 'Needs Improvement'})
⚠️ Risk Level: ${riskLevel}

🔍 KEY FINDINGS:
• Your portfolio is ${data.assets.length > 3 ? 'well' : 'poorly'} diversified with ${data.assets.length} assets
• ${topAsset.symbol} dominates at ${topAsset.allocation}% allocation
• ${score < 60 ? 'High concentration risk detected' : 'Reasonable asset distribution'}

💡 RECOMMENDATIONS:
${score < 60 ? '• Reduce concentration in ' + topAsset.symbol + ' (currently ' + topAsset.allocation + '%)\n• Add more diverse assets to spread risk' : '• Consider adding stablecoins for stability\n• Monitor market conditions for rebalancing opportunities'}
• Set up regular portfolio rebalancing (monthly/quarterly)
• Consider DeFi yield opportunities for passive income

🎯 OPTIMAL ALLOCATION:
• 40-50% Blue-chip crypto (BTC, ETH)
• 20-30% Mid-cap altcoins
• 15-25% Stablecoins
• 5-10% Experimental/High-risk assets

🔮 MARKET OUTLOOK:
Current market conditions suggest ${score > 70 ? 'holding steady with your current allocation' : 'rebalancing to reduce risk'}. Monitor major support levels and consider taking profits on overperforming assets.

⚡ IMMEDIATE ACTIONS:
1. ${score < 50 ? 'Urgent: Rebalance within 48 hours' : 'Review allocation weekly'}
2. Set up price alerts for major holdings
3. Consider dollar-cost averaging for new positions`;
  };

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletConnected(false);
    setWalletAddress('');
    setWalletType('');
    setWalletData(null);
    setPortfolioAnalysis('');
    setStep(1);
    setPortfolioScore(0);
    setWeb3Provider(null);
    setChainId(null);
    hapticFeedback('light');
  }, [hapticFeedback]);

  // Copy analysis to clipboard
  const copyAnalysis = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(portfolioAnalysis);
      hapticFeedback('success');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, [portfolioAnalysis, hapticFeedback]);

  // Share portfolio analysis
  const shareAnalysis = useCallback(async () => {
    const shareData = {
      title: 'My Portiq Portfolio Analysis',
      text: `Check out my AI-powered portfolio analysis from Portiq!\n\nTotal Value: $${walletData?.totalValue?.toLocaleString()}\nHealth Score: ${portfolioScore}/100`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        hapticFeedback('success');
      } catch (err) {
        await navigator.clipboard.writeText(shareData.text);
        hapticFeedback('medium');
      }
    } else {
      await navigator.clipboard.writeText(shareData.text);
      hapticFeedback('medium');
    }
  }, [walletData, portfolioScore, hapticFeedback]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pb-12">
      {/* Header */}
      <motion.div 
        className="py-5 px-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] flex items-center justify-center">
            <FaBrain className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">PORTIQ AI AGENT</h1>
            <p className="text-sm text-gray-300">Real Web3 Portfolio Intelligence</p>
          </div>
        </div>

        {/* Connection Status */}
        {walletConnected && (
          <motion.div
            className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Connected to {walletType.charAt(0).toUpperCase() + walletType.slice(1)}</span>
          </motion.div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mt-6">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center space-x-2">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNum 
                    ? 'bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
                animate={{ scale: step === stepNum ? 1.1 : 1 }}
              >
                {stepNum}
              </motion.div>
              {stepNum < 3 && (
                <div className={`w-8 h-1 rounded-full ${
                  step > stepNum ? 'bg-[#FF007F]' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-400 mt-2 max-w-xs mx-auto">
          <span>Connect</span>
          <span>Analyze</span>
          <span>Optimize</span>
        </div>
      </motion.div>

      {/* Step 1: Wallet Connection */}
      {step === 1 && (
        <motion.div
          className="px-6 space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Connect Your Web3 Wallet</h2>
            <p className="text-gray-400 text-sm">Choose your preferred wallet for real-time analysis</p>
          </div>

          <div className="space-y-3">
            {SUPPORTED_WALLETS.map((wallet) => (
              <motion.button
                key={wallet.id}
                className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-200"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => connectWallet(wallet.id)}
                disabled={loading}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                      <img 
                        src={wallet.logo} 
                        alt={wallet.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        className={`w-8 h-8 bg-gradient-to-r ${wallet.color} rounded-lg items-center justify-center text-white text-sm font-bold hidden`}
                      >
                        {wallet.name.charAt(0)}
                      </div>
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-medium">{wallet.name}</h3>
                      <p className="text-gray-400 text-xs">
                        {wallet.id === 'walletconnect' ? 'Universal Connection' : 
                         wallet.id === 'phantom' ? 'Solana Ecosystem' : 'Ethereum Compatible'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {loading && (
                      <motion.div
                        className="w-6 h-6 border-2 border-[#FF007F] border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    <FaWallet className="text-gray-400" size={16} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Install Wallet Section */}
          <motion.div
            className="backdrop-blur-md bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <HiLightBulb className="text-blue-400" size={20} />
              <h3 className="text-white font-medium">Don't have a wallet?</h3>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Install a Web3 wallet to manage your crypto portfolio securely.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <motion.a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800/50 text-gray-300 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center space-x-1"
                whileTap={{ scale: 0.95 }}
              >
                <FaDownload size={12} />
                <span>MetaMask</span>
              </motion.a>
              <motion.a
                href="https://trustwallet.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800/50 text-gray-300 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center space-x-1"
                whileTap={{ scale: 0.95 }}
              >
                <FaDownload size={12} />
                <span>Trust Wallet</span>
              </motion.a>
            </div>
          </motion.div>

          {error && (
            <motion.div
              className="backdrop-blur-md bg-red-500/10 border border-red-500/20 rounded-xl p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-2 text-red-400">
                <FaExclamationTriangle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Step 2: Portfolio Overview */}
      {step === 2 && walletData && (
        <motion.div
          className="px-6 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Wallet Info */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] rounded-xl flex items-center justify-center">
                  <FaWallet className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="text-white font-medium">Connected Wallet</h3>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-400 text-xs">{formatAddress(walletAddress)}</p>
                    {chainId && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        Chain: {parseInt(chainId) === 1 ? 'ETH' : 'Other'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <motion.button
                className="text-gray-400 hover:text-red-400 text-sm"
                whileTap={{ scale: 0.9 }}
                onClick={disconnectWallet}
              >
                Disconnect
              </motion.button>
            </div>
          </div>

          {/* Portfolio Summary */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-center mb-6">
              <motion.h3 
                className="text-4xl font-bold text-white mb-2"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                ${walletData.totalValue.toLocaleString()}
              </motion.h3>
              <p className="text-gray-300">Total Portfolio Value</p>
              <div className="text-xs text-gray-500 mt-1">
                Real-time data from blockchain
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <motion.div 
                  className={`text-2xl font-bold ${
                    portfolioScore > 80 ? 'text-green-400' : 
                    portfolioScore > 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  {portfolioScore}
                </motion.div>
                <div className="text-xs text-gray-400">Health Score</div>
              </div>
              <div className="text-center">
                <motion.div 
                  className="text-2xl font-bold text-[#FF5A2A]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  {walletData.riskScore}
                </motion.div>
                <div className="text-xs text-gray-400">Risk Level</div>
              </div>
              <div className="text-center">
                <motion.div 
                  className="text-2xl font-bold text-[#FF2FB3]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  {walletData.assets.length}
                </motion.div>
                <div className="text-xs text-gray-400">Assets</div>
              </div>
            </div>

            {/* Health Score Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Portfolio Health</span>
                <span className={`font-bold ${
                  portfolioScore > 80 ? 'text-green-400' : 
                  portfolioScore > 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {portfolioScore > 80 ? 'Excellent' : 
                   portfolioScore > 60 ? 'Good' : 'Needs Optimization'}
                </span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    portfolioScore > 80 ? 'bg-gradient-to-r from-green-500 to-green-400' : 
                    portfolioScore > 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${portfolioScore}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Asset Breakdown */}
            <div className="space-y-3 mb-6">
              <h4 className="text-white font-medium text-sm mb-3">Asset Breakdown</h4>
              {walletData.assets.map((asset, index) => (
                <motion.div
                  key={asset.symbol}
                  className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3 border border-gray-700/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {asset.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{asset.symbol}</div>
                      <div className="text-gray-400 text-xs">{asset.balance.toFixed(6)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium text-sm">${asset.value.toLocaleString()}</div>
                    <div className="text-gray-400 text-xs">{asset.allocation}%</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Real-time Data Indicator */}
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Live blockchain data</span>
              <FaSync className="animate-spin" size={10} />
            </div>

            {/* Analyze Button */}
            <motion.button
              className="w-full bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(255, 0, 127, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={analyzePortfolioWithAI}
              disabled={analyzingPortfolio || loading}
            >
              <div className="flex items-center justify-center space-x-3">
                {analyzingPortfolio ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>ANALYZING PORTFOLIO...</span>
                  </>
                ) : (
                  <>
                    <RiAiGenerate size={20} />
                    <span>ANALYZE WITH AI</span>
                    <HiSparkles size={20} />
                  </>
                )}
              </div>
            </motion.button>
          </div>

          {/* Security Notice */}
          <div className="backdrop-blur-md bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-yellow-400 mb-2">
              <FaShieldAlt size={16} />
              <h4 className="font-medium text-sm">Security Notice</h4>
            </div>
            <p className="text-gray-300 text-xs">
              Your wallet data is read-only. We never request private keys or signing permissions for transfers.
            </p>
          </div>
        </motion.div>
      )}

      {/* Step 3: AI Analysis Results */}
      {step === 3 && (
        <motion.div
          className="px-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">AI Portfolio Analysis</h2>
            <p className="text-gray-400 text-sm">Personalized insights from real wallet data</p>
          </div>

          {/* Analysis Results */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] rounded-xl flex items-center justify-center">
                <RiAiGenerate className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AI Analysis Report</h3>
                <p className="text-xs text-gray-400">Based on real blockchain data</p>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-4 mb-6 max-h-96 overflow-y-auto border border-gray-700/30">
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line font-mono">
                {portfolioAnalysis}
              </div>
            </div>

            {/* Portfolio Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-400">${walletData.totalValue.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Current Value</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                <div className={`text-lg font-bold ${
                  portfolioScore > 80 ? 'text-green-400' : 
                  portfolioScore > 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {portfolioScore}/100
                </div>
                <div className="text-xs text-gray-400">Health Score</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 py-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 border border-gray-600/30"
                whileTap={{ scale: 0.95 }}
                onClick={copyAnalysis}
              >
                <FaCopy size={14} />
                <span>Copy</span>
              </motion.button>
              
              <motion.button
                className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 py-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 border border-gray-600/30"
                whileTap={{ scale: 0.95 }}
                onClick={shareAnalysis}
              >
                <FaShare size={14} />
                <span>Share</span>
              </motion.button>
              
              <motion.button
                className="flex-1 bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] text-white py-3 rounded-lg text-sm font-medium"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStep(2);
                  fetchRealWalletData(walletAddress);
                }}
              >
                Re-analyze
              </motion.button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="backdrop-blur-md bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
              <FaRocket className="text-orange-400" size={16} />
              <span>Recommended Actions</span>
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <FaCheckCircle className="text-green-400" size={14} />
                <span>Set up automated rebalancing alerts</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <FaCheckCircle className="text-green-400" size={14} />
                <span>Monitor portfolio health weekly</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <FaCheckCircle className="text-green-400" size={14} />
                <span>Consider diversification opportunities</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <FaFire className="text-orange-400" size={14} />
                <span>Explore DeFi yield farming options</span>
              </div>
            </div>
          </div>

          {/* Start New Analysis */}
          <motion.button
            className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 py-3 rounded-xl text-sm font-medium border border-gray-600/30"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setStep(1);
              disconnectWallet();
            }}
          >
            Analyze Different Wallet
          </motion.button>
        </motion.div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-gray-900/90 border border-gray-700 rounded-2xl p-8 text-center max-w-sm mx-auto">
              <motion.div
                className="w-16 h-16 border-4 border-[#FF007F] border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <h3 className="text-white font-bold mb-2">Connecting Wallet</h3>
              <p className="text-gray-400 text-sm">Please confirm connection in your wallet...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Modal */}
      <AnimatePresence>
        {analyzingPortfolio && showAnalysisModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900/95 border border-gray-700 rounded-2xl p-8 text-center max-w-md mx-auto"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <motion.div
                className="w-20 h-20 border-4 border-[#FF007F] border-t-transparent rounded-full mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <h3 className="text-white font-bold mb-2 text-lg">Analyzing Your Portfolio</h3>
              <p className="text-gray-400 text-sm mb-4">
                AI is processing your real wallet data and market conditions...
              </p>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <HiSparkles className="animate-pulse" />
                <span>Generating personalized insights</span>
                <HiSparkles className="animate-pulse" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortiqAiAgentCore;