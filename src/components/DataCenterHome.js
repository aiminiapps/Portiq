'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheck, FaClock, FaTrendingUp, FaBolt, FaUsers, 
  FaChartLine, FaTrophy, FaBrain, FaCoins, FaRocket,
  FaFire, FaGem, FaShieldAlt
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { RiAiGenerate } from 'react-icons/ri';
import Image from 'next/image';
import Link from 'next/link';

export default function PortiqCommunityCenter() {
  const [totalUsers, setTotalUsers] = useState(127543);
  const [activeOptimizations, setActiveOptimizations] = useState(89234);
  const [completedToday, setCompletedToday] = useState(156789);
  const [totalPTIQEarned, setTotalPTIQEarned] = useState(2847392);
  const [loading, setLoading] = useState(true);
  const [userActivities, setUserActivities] = useState([]);

  // Mobile haptic feedback
  const hapticFeedback = useCallback((type = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 50,
        heavy: 100,
        success: [50, 30, 50]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Mock portfolio optimization activities
  const mockActivities = [
    {
      id: 1,
      username: "Sarah K.",
      action: "Portfolio optimization completed",
      reward: 125,
      ptiqEarned: 25,
      timeAgo: "2 mins ago",
      avatar: "SK",
      color: "from-[#FF007F] to-[#FF2FB3]",
      type: "optimization"
    },
    {
      id: 2,
      username: "Mike R.",
      action: "Risk analysis finished",
      reward: 89,
      ptiqEarned: 45,
      timeAgo: "5 mins ago",
      avatar: "MR",
      color: "from-[#FF5A2A] to-[#FFB82A]",
      type: "analysis"
    },
    {
      id: 3,
      username: "Alex Chen",
      action: "AI rebalancing executed",
      reward: 67,
      ptiqEarned: 18,
      timeAgo: "8 mins ago",
      avatar: "AC",
      color: "from-[#6C00B8] to-[#FF007F]",
      type: "rebalance"
    },
    {
      id: 4,
      username: "Emma J.",
      action: "Portfolio health improved",
      reward: 156,
      ptiqEarned: 67,
      timeAgo: "12 mins ago",
      avatar: "EJ",
      color: "from-[#FF2FB3] to-[#FFB82A]",
      type: "health"
    },
    {
      id: 5,
      username: "David L.",
      action: "Diversification optimized",
      reward: 234,
      ptiqEarned: 89,
      timeAgo: "15 mins ago",
      avatar: "DL",
      color: "from-[#FFB82A] to-[#FF5A2A]",
      type: "diversification"
    }
  ];

  const userAvatars = [
    { name: "Sarah", avatar: <Image src='/avatar/avatar-1.svg' alt='user avatar' width={48} height={48}/> },
    { name: "Mike", avatar: <Image src='/avatar/avatar-2.svg' alt='user avatar' width={48} height={48}/> },
    { name: "Alex", avatar: <Image src='/avatar/avatar-3.svg' alt='user avatar' width={48} height={48}/> },
    { name: "Emma", avatar: <Image src='/avatar/avatar-4.svg' alt='user avatar' width={48} height={48}/> },
    { name: "David", avatar: <Image src='/avatar/avatar-5.svg' alt='user avatar' width={48} height={48}/> },
    { name: "Lisa", avatar: <Image src='/avatar/avatar-6.svg' alt='user avatar' width={48} height={48}/> },
    { name: "Tom", avatar: <Image src='/avatar/avatar-7.svg' alt='user avatar' width={48} height={48}/> },
    { name: "Anna", avatar: <Image src='/avatar/avatar-8.svg' alt='user avatar' width={48} height={48}/> }
  ];

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setUserActivities(mockActivities);
      setLoading(false);
    }, 1500);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setTotalUsers(prev => prev + Math.floor(Math.random() * 25) + 8);
      setActiveOptimizations(prev => prev + Math.floor(Math.random() * 20) + 5);
      setCompletedToday(prev => prev + Math.floor(Math.random() * 15) + 7);
      setTotalPTIQEarned(prev => prev + Math.floor(Math.random() * 100) + 50);
      
      // Add new activity occasionally
      if (Math.random() > 0.6) {
        const activities = [
          "Portfolio optimization completed",
          "Risk analysis finished",
          "AI rebalancing executed",
          "Portfolio health improved",
          "Diversification optimized",
          "Asset allocation balanced",
          "Performance metrics updated"
        ];
        
        const types = ["optimization", "analysis", "rebalance", "health", "diversification"];
        const colors = [
          "from-[#FF007F] to-[#FF2FB3]",
          "from-[#FF5A2A] to-[#FFB82A]",
          "from-[#6C00B8] to-[#FF007F]",
          "from-[#FF2FB3] to-[#FFB82A]",
          "from-[#FFB82A] to-[#FF5A2A]"
        ];
        
        const newActivity = {
          id: Date.now(),
          username: `Trader${Math.floor(Math.random() * 999)}`,
          action: activities[Math.floor(Math.random() * activities.length)],
          reward: Math.floor(Math.random() * 200) + 50,
          ptiqEarned: Math.floor(Math.random() * 80) + 15,
          timeAgo: "Just now",
          avatar: `T${Math.floor(Math.random() * 99)}`,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: types[Math.floor(Math.random() * types.length)]
        };
        
        setUserActivities(prev => [newActivity, ...prev.slice(0, 4)]);
      }
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const getActivityIcon = (type) => {
    const icons = {
      optimization: <FaRocket size={14} />,
      analysis: <FaBrain size={14} />,
      rebalance: <FaChartLine size={14} />,
      health: <FaShieldAlt size={14} />,
      diversification: <FaGem size={14} />
    };
    return icons[type] || <FaCoins size={14} />;
  };

  return (
    <div className="min-h-screen text-white pb-8">
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-semibold text-white mb-2">
          PORTIQ <span className="bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] bg-clip-text text-transparent">COMMUNITY</span>
        </h1>
        <p className="text-gray-300 text-sm">Real traders optimizing portfolios with AI</p>
      </motion.div>

      {/* User Avatars Overlap Section */}
      <motion.div 
        className="flex justify-center mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="relative">
          <div className="flex items-center -space-x-3">
            {userAvatars.slice(0, 6).map((user, index) => (
              <motion.div
                key={index}
                className="w-12 h-12 bg-white/70 backdrop-blur-sm rounded-full border-2 border-[#FF007F]/30 flex items-center justify-center shadow-lg relative overflow-hidden"
                // style={{
                //   background: `linear-gradient(135deg, 
                //     rgba(255, 0, 127, 0.1) 0%, 
                //     rgba(255, 47, 179, 0.08) 50%, 
                //     rgba(108, 0, 184, 0.05) 100%)`
                // }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.1, zIndex: 50 }}
                whileTap={{ scale: 0.95 }}
                onTap={() => hapticFeedback('light')}
              >
                {user.avatar}
              </motion.div>
            ))}
            <motion.div
              className="w-20 h-12 rounded-full border-2 border-[#FFB82A]/30 flex items-center justify-center text-[#FFB82A] text-xs font-bold shadow-lg"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(255, 184, 42, 0.1) 0%, 
                  rgba(255, 90, 42, 0.08) 50%, 
                  rgba(255, 0, 127, 0.05) 100%)`
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              +{(totalUsers - 6).toLocaleString()}
            </motion.div>
          </div>
          <div className="text-center mt-4">
            <span className="text-gray-300 text-sm font-medium">
              {totalUsers.toLocaleString()} active optimizers
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-2 gap-2 mb-2 max-w-sm mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <motion.div 
          className="glass rounded-2xl p-4 text-center border border-[#FF007F]/20"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255, 0, 127, 0.1) 0%, 
              rgba(255, 47, 179, 0.05) 100%)`
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-[#FF007F] text-xl font-bold mb-1">{totalUsers.toLocaleString()}</div>
          <div className="text-gray-400 text-xs mb-2">Total Users</div>
          <FaUsers className="w-4 h-4 text-[#FF007F] mx-auto" />
        </motion.div>
        
        <motion.div 
          className="glass rounded-2xl p-4 text-center border border-[#FFB82A]/20"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255, 184, 42, 0.1) 0%, 
              rgba(255, 90, 42, 0.05) 100%)`
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-[#FFB82A] text-xl font-bold mb-1">{activeOptimizations.toLocaleString()}</div>
          <div className="text-gray-400 text-xs mb-2">Active Tasks</div>
          <FaChartLine className="w-4 h-4 text-[#FFB82A] mx-auto" />
        </motion.div>
        
        <motion.div 
          className="glass rounded-2xl p-4 -mt-5 text-center border border-[#FF2FB3]/20"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255, 47, 179, 0.1) 0%, 
              rgba(108, 0, 184, 0.05) 100%)`
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-[#FF2FB3] text-xl font-bold mb-1">{completedToday.toLocaleString()}</div>
          <div className="text-gray-400 text-xs mb-2">Completed Today</div>
          <FaTrophy className="w-4 h-4 text-[#FF2FB3] mx-auto" />
        </motion.div>
        
        <motion.div 
          className="glass rounded-2xl -mt-5 p-4 text-center border border-[#FF5A2A]/20"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255, 90, 42, 0.1) 0%, 
              rgba(255, 184, 42, 0.05) 100%)`
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-[#FF5A2A] text-xl font-bold mb-1">{totalPTIQEarned.toLocaleString()}</div>
          <div className="text-gray-400 text-xs mb-2">$PTIQ Earned</div>
          <FaCoins className="w-4 h-4 text-[#FF5A2A] mx-auto" />
        </motion.div>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            className="flex flex-col items-center justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative">
              <motion.div 
                className="w-12 h-12 border-2 border-[#FF007F]/30 border-t-[#FF007F] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <RiAiGenerate className="w-6 h-6 text-[#FF007F] absolute top-3 left-3" />
            </div>
            <p className="text-gray-400 mt-4 text-sm">Loading portfolio activities...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Activity Feed */}
      <div className="max-w-md mx-auto px-4">
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <motion.div 
              className="w-3 h-3 bg-[#00FF88] rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <h2 className="text-lg font-bold text-white tektur">LIVE OPTIMIZATIONS</h2>
            <HiSparkles className="text-[#FFB82A]" size={16} />
          </div>
        </motion.div>

        <div className="space-y-3">
          <AnimatePresence>
            {!loading && userActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="glass rounded-2xl p-4 border border-[#FF007F]/10"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 0, 127, 0.05) 0%, 
                    rgba(255, 47, 179, 0.03) 50%, 
                    rgba(108, 0, 184, 0.05) 100%)`
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                layout
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onTap={() => hapticFeedback('light')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className={`w-10 h-10 bg-gradient-to-r ${activity.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {activity.avatar}
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">{activity.username}</h3>
                      <p className="text-gray-400 text-xs">{activity.action}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-[#FFB82A] text-sm font-bold mb-1">
                      <FaCoins className="w-3 h-3" />
                      <span>+{activity.ptiqEarned} PTIQ</span>
                    </div>
                    <p className="text-gray-500 text-xs">{activity.timeAgo}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-[#00FF88]">
                      <FaCheck className="w-3 h-3" />
                      <span className="text-xs font-medium">Optimized</span>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Score: +{activity.reward}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div 
        className="mt-12 text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <Link href='/?tab=optimize'>
          <motion.button
            className="w-full max-w-sm mx-auto glass-button tektur font-bold py-4 px-8 rounded-2xl text-white shadow-lg mb-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onTap={() => hapticFeedback('success')}
          >
            <div className="flex items-center justify-center space-x-3">
              <FaRocket size={16} />
              <span>JOIN {totalUsers.toLocaleString()}+ OPTIMIZERS</span>
              <HiSparkles size={16} />
            </div>
          </motion.button>
        </Link>
        <p className="text-gray-400 text-xs">Start earning $PTIQ with AI portfolio optimization</p>
      </motion.div>
    </div>
  );
}
