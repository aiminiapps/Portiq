'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/storage';
import { 
  FaGift, FaTwitter, FaUserPlus, FaCoins, FaStar, FaFire, 
  FaTrophy, FaRocket, FaBolt, FaGem, FaCheck, FaCopy,
  FaShare, FaClock, FaCalendarDay, FaUsers, FaRetweet
} from 'react-icons/fa';
import { RiAiGenerate, RiTwitterXFill } from 'react-icons/ri';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { BiTrendingUp, BiGift } from 'react-icons/bi';

const PortiqTaskCenter = () => {
  const {
    tasks,
    purchasePass,
    completeTask,
    setTwitterFollowCompleted,
    agfiPoints,
    passes
  } = useStore();
  const [error, setError] = useState(null);
  const [completingTask, setCompletingTask] = useState(null);

  // Mobile haptic feedback
  const hapticFeedback = useCallback((type = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 50,
        heavy: 100,
        success: [50, 30, 50],
        warning: [100, 50, 100]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const handlePurchasePass = (count) => {
    const success = purchasePass(count);
    if (!success) {
      setError('Insufficient $PTIQ Points');
      hapticFeedback('warning');
      setTimeout(() => setError(null), 3000);
    } else {
      hapticFeedback('success');
    }
  };

  const handleTask = async (taskName, points, action) => {
    if (!tasks[taskName].completed) {
      setCompletingTask(taskName);
      hapticFeedback('medium');
      
      // Add delay for better UX
      setTimeout(() => {
        completeTask(taskName, points);
        if (action) action();
        setCompletingTask(null);
        hapticFeedback('success');
      }, 1000);
    }
  };

  const tasksList = [
    {
      id: 'dailyReward',
      title: 'Daily Check-in',
      description: 'Claim your daily reward',
      points: 200,
      icon: <FaGift className="text-[#FFB82A]" size={24} />,
      category: 'daily',
      action: null
    },
    {
      id: 'rtPost',
      title: 'Retweet Our Post',
      description: 'Share our latest announcement',
      points: 1000,
      icon: <FaRetweet className="text-[#FF5A2A]" size={24} />,
      category: 'daily',
      action: () => window.open('https://x.com/portiqai/status/1938070816236966000', '_blank')
    },
    {
      id: 'followX',
      title: 'Follow on X (Twitter)',
      description: 'Follow @PortiqAI for updates',
      points: 1500,
      icon: <RiTwitterXFill className="text-[#FF007F]" size={24} />,
      category: 'social',
      action: () => {
        setTwitterFollowCompleted(true);
        window.open('https://x.com/portiqai', '_blank');
      }
    },
    {
      id: 'inviteFive',
      title: 'Invite 5 Friends',
      description: 'Build your trading network',
      points: 5000,
      icon: <FaUsers className="text-[#FF2FB3]" size={24} />,
      category: 'referral',
      action: null
    }
  ];

  const PassOption = ({ count, price, popular = false }) => (
    <motion.button
      onClick={() => handlePurchasePass(count)}
      className={`relative flex-1 glass rounded-2xl p-4 border transition-all duration-300 ${
        popular 
          ? 'border-[#FF007F]/50 bg-gradient-to-br from-[#FF007F]/10 to-[#FF2FB3]/05' 
          : 'border-[#FFB82A]/30 bg-gradient-to-br from-[#FFB82A]/10 to-[#FF5A2A]/05'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] px-3 py-1 rounded-full text-xs font-bold text-white">
            POPULAR
          </div>
        </div>
      )}
      
      <div className="text-center">
        <div className="text-2xl font-bold text-white mb-1">{count}</div>
        <div className="text-sm text-gray-300 mb-2">
          {count === 1 ? 'Premium Pass' : 'Premium Passes'}
        </div>
        <div className="flex items-center justify-center space-x-1 text-[#FFB82A]">
          <FaCoins size={14} />
          <span className="font-bold">{price.toLocaleString()} $PTIQ</span>
        </div>
      </div>
    </motion.button>
  );

  return (
    <div className="min-h-screen text-white pb-20">
      {/* Header */}
      <motion.div 
        className=""
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full flex items-center justify-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-center text-white tektur">TASK CENTER</h1>
            <p className="text-gray-300 text-sm text-center text-balance">Earn $PTIQ & unlock premium features</p>
          </div>
        </div>
      </motion.div>

      <div className="">
        {/* Daily Tasks Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] rounded-xl flex items-center justify-center">
              <FaCalendarDay className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tektur">DAILY MISSIONS</h2>
              <p className="text-gray-400 text-sm">Reset every 24 hours</p>
            </div>
          </div>

          <div className="space-y-4">
            {tasksList.filter(task => task.category === 'daily').map((task, index) => (
              <motion.div
                key={task.id}
                className="glass glass-p rounded-2xl p-4 border border-[#FF007F]/10"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 0, 127, 0.05) 0%, 
                    rgba(255, 47, 179, 0.03) 100%)`
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 glass glass-p rounded-2xl flex items-center justify-center border border-gray-700/30">
                      {task.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{task.title}</h3>
                      <p className="text-gray-400 text-sm">{task.description}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <FaCoins className="text-[#FFB82A]" size={12} />
                        <span className="text-[#FFB82A] font-bold text-sm">+{task.points} $PTIQ</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <motion.div
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                        tasks[task.id]?.completed ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                        tasks[task.id]?.completed ? 'translate-x-6' : 'translate-x-0'
                      }`}></div>
                    </motion.div>
                  </div>
                </div>
                
                {!tasks[task.id]?.completed && (
                  <motion.button
                    onClick={() => handleTask(task.id, task.points, task.action)}
                    disabled={completingTask === task.id}
                    className="w-full glass-button py-3 rounded-xl font-bold text-white transition-all duration-300"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {completingTask === task.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Complete Task</span>
                        <HiSparkles size={16} />
                      </div>
                    )}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social & Referral Tasks */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FFB82A] to-[#FF5A2A] rounded-xl flex items-center justify-center">
              <FaShare className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tektur">GROWTH MISSIONS</h2>
              <p className="text-gray-400 text-sm">One-time completion rewards</p>
            </div>
          </div>

          <div className="space-y-4">
            {tasksList.filter(task => ['social', 'referral'].includes(task.category)).map((task, index) => (
              <motion.div
                key={task.id}
                className="glass glass-p rounded-2xl p-4 border border-[#FFB82A]/10"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 184, 42, 0.1) 0%, 
                    rgba(255, 90, 42, 0.03) 100%)`
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 glass glass-p rounded-2xl flex items-center justify-center border border-gray-700/30">
                      {task.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{task.title}</h3>
                      <p className="text-gray-400 text-sm">{task.description}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <FaCoins className="text-[#FFB82A]" size={12} />
                        <span className="text-[#FFB82A] font-bold text-sm">+{task.points} $PTIQ</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <motion.div
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                        tasks[task.id]?.completed ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                        tasks[task.id]?.completed ? 'translate-x-6' : 'translate-x-0'
                      }`}></div>
                    </motion.div>
                  </div>
                </div>
                
                {!tasks[task.id]?.completed && (
                  <motion.button
                    onClick={() => handleTask(task.id, task.points, task.action)}
                    disabled={completingTask === task.id || (task.id === 'inviteFive' && tasks[task.id]?.completed)}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-[#FFB82A]/20 to-[#FF5A2A]/20 border border-[#FFB82A]/30"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {completingTask === task.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Processing...</span>
                      </div>
                    ) : task.id === 'inviteFive' ? (
                      <span>Coming Soon</span>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Complete Task</span>
                        <HiSparkles size={16} />
                      </div>
                    )}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PortiqTaskCenter;
