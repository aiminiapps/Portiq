import { useState } from 'react';
import { Plus, AlertTriangle, Flame, Clock } from 'lucide-react';
import Image from 'next/image';

// /coinslogo/bnb.png
const AINewsCenter = () => {
const [newsData] = useState([
  {
    id: 1,
    coin: 'BTC',
    symbol: 'Bitcoin / USDT',
    title: '🔥 Spike Incoming',
    subtitle: 'Updated: Just now',
    type: 'bullish',
    icon: <Image src="/coinslogo/bitcoin.png" alt="BTC" width={100} height={100} />,
    gradient: 'from-orange-500 to-yellow-500',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 2,
    coin: 'ETH',
    symbol: 'Ethereum / USDT',
    title: '📈 Major Breakout Expected',
    subtitle: 'Updated: 3 minutes ago',
    type: 'bullish',
    icon: <Image src="/coinslogo/eth.png" alt="ETH" width={100} height={100} />,
    gradient: 'from-white to-white',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 3,
    coin: 'SOL',
    symbol: 'Solana / USDT',
    title: '🌟 DeFi Activity Surging',
    subtitle: 'Updated: 12 minutes ago',
    type: 'bullish',
    icon: <Image src="/coinslogo/sol.png" alt="SOL" width={100} height={100} />,
    gradient: 'from-[#000508] to-[#000508]',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 4,
    coin: 'XRP',
    symbol: 'Ripple / USDT',
    title: '🔍 Market Consolidation Phase',
    subtitle: 'Updated: 22 minutes ago',
    type: 'neutral',
    icon: <Image src="/coinslogo/xrp.png" alt="XRP" width={100} height={100} />,
    gradient: 'from-blue-600 to-blue-800',
    bgGradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 5,
    coin: 'BNB',
    symbol: 'Binance Coin / USDT',
    title: '🚀 Strong Momentum Building',
    subtitle: 'Updated: 30 minutes ago',
    type: 'bullish',
    icon: <Image src="/coinslogo/bnb.png" alt="BNB" width={100} height={100} />,
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 6,
    coin: 'BTC',
    symbol: 'Bitcoin / USDT',
    title: '⚡ Institutional Buying Picks Up',
    subtitle: 'Updated: 45 minutes ago',
    type: 'bullish',
    icon: <Image src="/coinslogo/bitcoin.png" alt="BTC" width={100} height={100} />,
    gradient: 'from-orange-500 to-yellow-500',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 7,
    coin: 'ETH',
    symbol: 'Ethereum / USDT',
    title: '🔧 Ethereum ETF Talks Intensify',
    subtitle: 'Updated: 1 hour ago',
    type: 'bullish',
    icon: <Image src="/coinslogo/eth.png" alt="ETH" width={100} height={100} />,
    gradient: 'from-white to-white',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 8,
    coin: 'SOL',
    symbol: 'Solana / USDT',
    title: '📉 Correction May Be Imminent',
    subtitle: 'Updated: 1 hour 15 minutes ago',
    type: 'bearish',
    icon: <Image src="/coinslogo/sol.png" alt="SOL" width={100} height={100} />,
    gradient: 'from-[#000508] to-[#000508]',
    bgGradient: 'from-red-500/20 to-pink-500/20'
  },
  {
    id: 9,
    coin: 'XRP',
    symbol: 'Ripple / USDT',
    title: '⚖️ Regulatory Clarity Boosts Sentiment',
    subtitle: 'Updated: 2 hours ago',
    type: 'bullish',
    icon: <Image src="/coinslogo/xrp.png" alt="XRP" width={100} height={100} />,
    gradient: 'from-blue-600 to-blue-800',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 10,
    coin: 'BNB',
    symbol: 'Binance Coin / USDT',
    title: '🔥 Binance Expands Staking Options',
    subtitle: 'Updated: 2 hours 30 minutes ago',
    type: 'bullish',
    icon: <Image src="/coinslogo/bnb.png" alt="BNB" width={100} height={100} />,
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 11,
    coin: 'BTC',
    symbol: 'Bitcoin / USDT',
    title: '📊 Volatility Expected This Week',
    subtitle: 'Updated: 3 hours ago',
    type: 'neutral',
    icon: <Image src="/coinslogo/bitcoin.png" alt="BTC" width={100} height={100} />,
    gradient: 'from-orange-500 to-yellow-500',
    bgGradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 12,
    coin: 'ETH',
    symbol: 'Ethereum / USDT',
    title: '🌐 Layer-2 Solutions Gain Traction',
    subtitle: 'Updated: 3 hours 20 minutes ago',
    type: 'bullish',
    icon: <Image src="/coinslogo/eth.png" alt="ETH" width={100} height={100} />,
    gradient: 'from-white to-white',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 13,
    coin: 'SOL',
    symbol: 'Solana / USDT',
    title: '🔗 New Partnerships Announced',
    subtitle: 'Updated: 4 hours ago',
    type: 'bullish',
    icon: <Image src="/coinslogo/sol.png" alt="SOL" width={100} height={100} />,
    gradient: 'from-[#000508] to-[#000508]',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 14,
    coin: 'XRP',
    symbol: 'Ripple / USDT',
    title: '📉 Selling Pressure Increases',
    subtitle: 'Updated: 4 hours 10 minutes ago',
    type: 'bearish',
    icon: <Image src="/coinslogo/xrp.png" alt="XRP" width={100} height={100} />,
    gradient: 'from-blue-600 to-blue-800',
    bgGradient: 'from-red-500/20 to-pink-500/20'
  },
  {
    id: 15,
    coin: 'BNB',
    symbol: 'Binance Coin / USDT',
    title: '📈 Trading Volume Surges',
    subtitle: 'Updated: 5 hours ago',
    type: 'bullish',
    icon: <Image src="/coinslogo/bnb.png" alt="BNB" width={100} height={100} />,
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 16,
    coin: 'BTC',
    symbol: 'Bitcoin / USDT',
    title: '🛡️ Network Security Upgraded',
    subtitle: 'Updated: 5 hours 30 minutes ago',
    type: 'bullish',
    icon: <Image src="/coinslogo/bitcoin.png" alt="BTC" width={100} height={100} />,
    gradient: 'from-orange-500 to-yellow-500',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 17,
    coin: 'ETH',
    symbol: 'Ethereum / USDT',
    title: '⚠️ Gas Fees Spike Concerns',
    subtitle: 'Updated: 6 hours ago',
    type: 'bearish',
    icon: <Image src="/coinslogo/eth.png" alt="ETH" width={100} height={100} />,
    gradient: 'from-white to-white',
    bgGradient: 'from-red-500/20 to-pink-500/20'
  },
  {
    id: 18,
    coin: 'SOL',
    symbol: 'Solana / USDT',
    title: '🚀 NFT Marketplace Growth',
    subtitle: 'Updated: 6 hours 15 minutes ago',
    type: 'bullish',
    icon: <Image src="/coinslogo/sol.png" alt="SOL" width={100} height={100} />,
    gradient: 'from-[#000508] to-[#000508]',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 19,
    coin: 'XRP',
    symbol: 'Ripple / USDT',
    title: '🔄 Stable Trading Range Observed',
    subtitle: 'Updated: 7 hours ago',
    type: 'neutral',
    icon: <Image src="/coinslogo/xrp.png" alt="XRP" width={100} height={100} />,
    gradient: 'from-blue-600 to-blue-800',
    bgGradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 20,
    coin: 'BNB',
    symbol: 'Binance Coin / USDT',
    title: '🌍 Global Adoption Rising',
    subtitle: 'Updated: 7 hours 30 minutes ago',
    type: 'bullish',
    icon: <Image src="/coinslogo/bnb.png" alt="BNB" width={100} height={100} />,
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-green-500/20 to-emerald-500/20'
  }
]);

  const SynaptAIIcon = () => (
    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
        <Image src='/agent/agentlogo.png' alt='logo' width={50} height={50}/>
    </div>
  );

  const getStatusIcon = (type) => {
    switch(type) {
      case 'bullish': return <Flame className="w-4 h-4 text-green-400" />;
      case 'bearish': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-3xl font-bold text-white">RVX News Center</h1>
        <SynaptAIIcon />
      </div>

      <div>
        {/* Subtitle */}
        <p className="text-gray-400 text-center mb-6">
          Tap the + button to add the token you want to view.
        </p>

        {/* News Cards */}
        <div className="space-y-4 max-w-md mx-auto">
          {newsData.map((news, index) => (
            <div
              key={news.id}
              className="relative group cursor-pointer"
              style={{
                animation: `slideIn 0.6s ease-out ${index * 0.05}s both`
              }}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${news.bgGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Card */}
              <div className={`relative bg-gradient-to-r ${news.bgGradient} backdrop-blur-lg border border-green-400/20 border-l-2 border-l-green-500/30 border-r-2 border-r-green-500/30 rounded-2xl p-5 hover:border-green-500/50 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]`}>
                
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white to-gray-300 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white to-gray-300 rounded-full blur-xl"></div>
                </div>

                <div className="relative flex items-center justify-between">
                  {/* Left Side - Coin Info */}
                  <div className="flex items-center space-x-4">
                    {/* Coin Icon */}
                    <div className={`size-12 bg-gradient-to-br ${news.gradient} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                      {news.icon}
                    </div>
                    
                    {/* News Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">
                        {news.coin}
                      </h3>
                      <p className="text-gray-300 text-sm mb-1">
                        {news.symbol}
                      </p>
                    </div>
                  </div>

                  {/* Right Side - News Content */}
                  <div className="flex-1 text-right ml-4">
                    <div className="flex items-center justify-end mb-1">
                        <div className='absolute -top-3 -left-2'>{getStatusIcon(news.type)}</div>
                      <h4 className="text-white font-semibold ml-2 text-xs">
                        {news.title}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-[10px] flex items-center justify-end">
                      <Clock className="w-3 h-3 mr-1" />
                      {news.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Token Button */}
        <div className="flex justify-center mt-8 mb-8">
          <button className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95">
            <Plus className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
      <div className='h-20'/>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AINewsCenter;