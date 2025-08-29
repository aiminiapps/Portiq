'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  FaTrendingUp, FaTrendingDown, FaRocket, FaChartBar, FaBrain, 
  FaCoins, FaArrowUp, FaArrowDown, FaExchangeAlt, FaBookmark,
  FaFire, FaEye, FaShare, FaHeart, FaBell, FaCopy, FaDownload
} from 'react-icons/fa';
import { HiSparkles, HiLightBulb } from 'react-icons/hi';
import { RiAiGenerate, RiBookmarkLine, RiBookmarkFill } from 'react-icons/ri';
import { BiTrendingUp, BiTrendingDown, BiPulse } from 'react-icons/bi';
import { MdTrendingFlat, MdWaves, MdAutoGraph } from 'react-icons/md';
import { IoFlashOutline, IoFlash } from 'react-icons/io5';

const PortiqPotentialCenter = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [aiInsights, setAiInsights] = useState({});
  const [aiThoughts, setAiThoughts] = useState({});
  const [bookmarked, setBookmarked] = useState(new Set());
  const [notifications, setNotifications] = useState(new Set());
  const [lastTap, setLastTap] = useState(0);
  const [showAiModal, setShowAiModal] = useState(false);
  const [currentAiThought, setCurrentAiThought] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [watchlist, setWatchlist] = useState(new Set());
  const [priceAlerts, setPriceAlerts] = useState({});

  // Mobile haptic feedback
  const hapticFeedback = useCallback((type = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 50,
        heavy: 100,
        success: [50, 30, 50],
        notification: [100, 50, 100, 50, 100]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Fetch coins data from API
  useEffect(() => {
    let isMounted = true;
    
    async function fetchCoins() {
      try {
        setLoading(true);
        const response = await fetch('/api/coins');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch market data');
        }

        if (isMounted) {
          setCoins(data.slice(0, 10)); // Limit to top 10 for mobile
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCoins();
    const interval = setInterval(fetchCoins, 60000); // Update every minute

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Generate comprehensive AI thoughts for coins
  const generateAIThoughts = useCallback(async (coin) => {
    if (aiThoughts[coin.symbol]) {
      setCurrentAiThought(aiThoughts[coin.symbol]);
      setShowAiModal(true);
      return;
    }

    try {
      setLoadingAi(true);
      setShowAiModal(true);
      hapticFeedback('medium');

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are an AI that provides detailed investment research reports for cryptocurrencies."
            },
            {
              role: "user",
              content: `Provide comprehensive AI analysis for ${coin.name} (${coin.symbol}):

Current Data:
- Price: $${coin.priceUsd}
- Market Cap: $${formatNumber(coin.marketCapUsd)}
- 24h Change: ${coin.changePercent24Hr?.toFixed(2)}%
- Volume: $${formatNumber(coin.volumeUsd24Hr)}

Please analyze:
1. Technical outlook and price momentum
2. Market position and competitive advantages
3. Portfolio allocation recommendation (percentage for different risk profiles)
4. Key risks and opportunities
5. Short-term (1-3 months) and medium-term (3-12 months) outlook
6. DON'T USE MARKDOWN FORMAT 

Format as a detailed investment research report.
NOTE: Use some emojis and write in text format, Use very simple English.
`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle the actual API response properly
      let thoughts;
      if (data && data.reply) {
        thoughts = data.reply;
      } else if (data && data.response) {
        thoughts = data.response;
      } else if (data && typeof data === 'string') {
        thoughts = data;
      } else if (data && data.message) {
        thoughts = data.message;
      } else if (data && data.content) {
        thoughts = data.content;
      } else {
        throw new Error('Invalid API response format');
      }
      
      setAiThoughts(prev => ({
        ...prev,
        [coin.symbol]: thoughts
      }));
      setCurrentAiThought(thoughts);

    } catch (error) {
      console.error('AI API Error:', error);
      const fallback = `❌ Unable to generate detailed analysis for ${coin.name} at this time.\n\n🔄 API Error: ${error.message}\n\n💡 Please try again later or check your API connection.`;
      setCurrentAiThought(fallback);
    } finally {
      setLoadingAi(false);
    }
  }, [aiThoughts, hapticFeedback]);

  // Toggle bookmark
  const toggleBookmark = useCallback((symbol) => {
    setBookmarked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
        hapticFeedback('light');
      } else {
        newSet.add(symbol);
        hapticFeedback('success');
      }
      return newSet;
    });
  }, [hapticFeedback]);

  // Toggle watchlist
  const toggleWatchlist = useCallback((symbol) => {
    setWatchlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
        hapticFeedback('light');
      } else {
        newSet.add(symbol);
        hapticFeedback('notification');
      }
      return newSet;
    });
  }, [hapticFeedback]);

  // Share coin data
  const shareCoin = useCallback(async (coin) => {
    const shareData = {
      title: `${coin.name} (${coin.symbol})`,
      text: `${coin.name} is trading at $${coin.priceUsd} with ${coin.changePercent24Hr?.toFixed(2)}% change. Market Cap: $${formatNumber(coin.marketCapUsd)}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        hapticFeedback('success');
      } catch (err) {
        navigator.clipboard.writeText(shareData.text);
        hapticFeedback('medium');
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      hapticFeedback('medium');
    }
  }, [hapticFeedback]);

  // Calculate allocation potential
  const calculateAllocationPotential = (coin) => {
    if (!coin) return 0;
    
    const marketCapScore = coin.marketCapUsd > 500000000000 ? 90 : 
                          coin.marketCapUsd > 100000000000 ? 75 :   
                          coin.marketCapUsd > 10000000000 ? 60 :    
                          40;
    
    const volumeScore = Math.min(100, (coin.volumeUsd24Hr || 0) / 1000000000 * 20);
    const stabilityBonus = Math.abs(coin.changePercent24Hr || 0) < 2 ? 15 : 
                          Math.abs(coin.changePercent24Hr || 0) < 5 ? 5 : 0;
    
    return Math.min(100, Math.round((marketCapScore * 0.6 + volumeScore * 0.3) + stabilityBonus));
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(2);
  };

  // Format price with appropriate decimals
  const formatPrice = (price) => {
    if (!price) return '$0.00';
    if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  // Get allocation category
  const getAllocationCategory = (coin) => {
    if (['USDT', 'USDC', 'DAI'].includes(coin.symbol)) return { name: 'Stable', color: '#FFB82A' };
    if (['BTC', 'ETH'].includes(coin.symbol)) return { name: 'Core', color: '#FF007F' };
    if (coin.marketCapUsd > 50000000000) return { name: 'Large', color: '#FF2FB3' };
    return { name: 'Growth', color: '#FF5A2A' };
  };

  // Handle coin tap
  const handleCoinTap = useCallback((coin) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    hapticFeedback('medium');
    setSelectedCoin(coin);
    
    // Double tap for quick bookmark
    if (tapLength < 500 && tapLength > 0) {
      toggleBookmark(coin.symbol);
      hapticFeedback('heavy');
    }
    
    setLastTap(currentTime);
  }, [lastTap, hapticFeedback, toggleBookmark]);

  if (loading) {
    return (
      <div className="h-fit flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-4 border-[#FF007F] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-fit flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">Failed to load market data</div>
          <div className="text-gray-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky glass glass-p top-0 z-50 glass bg-[#0B0C10]/80 backdrop-blur-xl border-b border-[#FF007F]/10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-white text-xl font-semibold tektur">AI MARKET LENS</h1>
                <p className="text-xs text-gray-400">Intelligent Price Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.div
                className="flex items-center space-x-1 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400 font-medium">LIVE</span>
              </motion.div>
              
              <div className="text-xs text-gray-400">
                {bookmarked.size} saved
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coins List */}
      <div className="space-y-2">
        <AnimatePresence>
          {coins.map((coin, index) => {
            const allocationPotential = calculateAllocationPotential(coin);
            const isPositive = (coin.changePercent24Hr || 0) >= 0;
            const isFlat = Math.abs(coin.changePercent24Hr || 0) < 0.5;
            const category = getAllocationCategory(coin);
            const isBookmarked = bookmarked.has(coin.symbol);
            const inWatchlist = watchlist.has(coin.symbol);
            
            return (
              <motion.div
                key={coin.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass glass-p rounded-2xl overflow-hidden cursor-pointer relative"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 0, 127, 0.05) 0%, 
                    rgba(255, 47, 179, 0.03) 50%, 
                    rgba(108, 0, 184, 0.05) 100%)`
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCoinTap(coin)}
              >
                {/* Bookmark indicator */}
                {isBookmarked && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[#FFB82A] rounded-full flex items-center justify-center z-10">
                    <RiBookmarkFill className="text-black text-xs" />
                  </div>
                )}

                <div className="p-4">
                  {/* Coin Header with Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img 
                          src={coin.image} 
                          alt={coin.name}
                          className="w-14 h-14 rounded-xl"
                          onError={(e) => {
                            e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${category.color}"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10">${coin.symbol.charAt(0)}</text></svg>`;
                          }}
                        />
                        <div 
                          className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name}
                        </div>
                      </div>
                      
                      <div>
                        {/* <h3 className="text-lg font-bold text-white">{coin.symbol}</h3> */}
                        <p className="text-lg font-semibold text-white">{coin.name}</p>
                        <div className="text-lg font-semibold text-gray-200">
                          {formatPrice(coin.priceUsd)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-white mb-1">
                        {allocationPotential}%
                      </div>
                      <div className={`flex items-center space-x-1 ${
                        isFlat ? 'text-gray-400' : isPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isFlat ? <MdTrendingFlat /> : isPositive ? <BiTrendingUp /> : <BiTrendingDown />}
                        <span className="text-sm font-medium">
                          {Math.abs(coin.changePercent24Hr || 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Allocation Potential Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MdAutoGraph className="text-[#FF5A2A] text-sm" />
                        <span className="text-sm font-medium text-gray-300">AI Score</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {allocationPotential > 80 ? 'Excellent' : 
                         allocationPotential > 60 ? 'Strong' : 
                         allocationPotential > 40 ? 'Moderate' : 'Speculative'}
                      </span>
                    </div>
                    
                    <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `${category.color}`
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${allocationPotential}%` }}
                        transition={{ duration: 1.5, delay: index * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Market Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center bg-gray-800/20 rounded-lg p-2">
                      <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                      <div className="text-sm font-medium text-white">
                        ${formatNumber(coin.marketCapUsd)}
                      </div>
                    </div>
                    
                    <div className="text-center bg-gray-800/20 rounded-lg p-2">
                      <div className="text-xs text-gray-400 mb-1">Volume 24h</div>
                      <div className="text-sm font-medium text-white">
                        ${formatNumber(coin.volumeUsd24Hr)}
                      </div>
                    </div>
                    
                    <div className="text-center bg-gray-800/20 rounded-lg p-2">
                      <div className="text-xs text-gray-400 mb-1">Status</div>
                      <div className={`text-sm font-medium ${
                        isFlat ? 'text-gray-400' : isPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isFlat ? 'Stable' : isPositive ? 'Bullish' : 'Bearish'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800/30">
                    <div className="flex items-center space-x-3">
                      <motion.button
                        className={`p-2 rounded-full ${isBookmarked ? 'bg-[#FFB82A]/20 text-[#FFB82A]' : 'bg-gray-800/30 text-gray-400'}`}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(coin.symbol);
                        }}
                      >
                        {isBookmarked ? <RiBookmarkFill size={14} /> : <RiBookmarkLine size={14} />}
                      </motion.button>
                      
                      <motion.button
                        className={`p-2 rounded-full ${inWatchlist ? 'bg-[#FF5A2A]/20 text-[#FF5A2A]' : 'bg-gray-800/30 text-gray-400'}`}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(coin.symbol);
                        }}
                      >
                        {inWatchlist ? <IoFlash size={14} /> : <IoFlashOutline size={14} />}
                      </motion.button>
                      
                      <motion.button
                        className="p-2 rounded-full bg-gray-800/30 text-gray-400"
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          shareCoin(coin);
                        }}
                      >
                        <FaShare size={12} />
                      </motion.button>
                    </div>
                    
                    <motion.button
                      className="px-4 py-2 bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] rounded-lg text-xs font-medium text-white flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        generateAIThoughts(coin);
                      }}
                    >
                      <HiLightBulb size={14} />
                      <span>AI Thoughts</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* AI Thoughts Modal */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAiModal(false)}
          >
            <motion.div
              className="glass glass-p rounded-t-3xl w-full max-w-lg max-h-[80vh] overflow-hidden"
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: `linear-gradient(135deg, 
                  rgba(255, 0, 127, 0.1) 0%, 
                  rgba(255, 47, 179, 0.08) 50%, 
                  rgba(108, 0, 184, 0.1) 100%)`
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] rounded-xl flex items-center justify-center">
                      <RiAiGenerate className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">AI Analysis</h3>
                      <p className="text-xs text-gray-400">Comprehensive Market Insights</p>
                    </div>
                  </div>
                  
                  <motion.button
                    className="w-8 h-8 bg-gray-800/50 rounded-full flex items-center justify-center text-gray-400"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAiModal(false)}
                  >
                    ✕
                  </motion.button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {loadingAi ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        className="w-8 h-8 border-2 border-[#FF007F] border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="ml-3 text-gray-300">Generating AI thoughts...</span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                      {currentAiThought}
                    </div>
                  )}
                </div>

                {!loadingAi && currentAiThought && (
                  <div className="flex items-center justify-center mt-4 mb-5 pt-4 border-t border-gray-800/30">
                    <motion.button
                      className="px-4 py-2 bg-gray-800/50 rounded-lg text-xs text-gray-300 flex items-center space-x-2"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigator.clipboard.writeText(currentAiThought);
                        hapticFeedback('success');
                      }}
                    >
                      <FaCopy size={12} />
                      <span>Copy Analysis</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Instructions */}
      <motion.div
        className="text-center text-gray-400 text-xs mt-6 pb-4 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Double tap to bookmark • AI Thoughts for deep analysis • Watch for alerts
      </motion.div>
    </div>
  );
};

export default PortiqPotentialCenter;