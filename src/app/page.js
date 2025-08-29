'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/storage';
import { useTelegram } from '@/lib/useTelegram';
import CustomLoader from '@/components/Loader';
import BottomNav from '@/components/BottomNav';
import CoinAgent from '@/components/CoinAgent';
import Agent from '@/components/Agent';
import TaskCenter from '@/components/TaskCenter';
import InviteCenter from '@/components/InviteCenter';
import DataCenterHome from '@/components/DataCenterHome';
import PortiqPortfolioCenter from '@/components/CryptoAgentCenter';
import { 
  FaCheck, FaTasks, FaUserPlus, FaRocket, FaCoins, FaGem,
  FaClock, FaFire, FaStar, FaTrophy, FaPlay
} from 'react-icons/fa';
import { RiAiGenerate, RiTwitterXFill } from 'react-icons/ri';
import { HiSparkles } from 'react-icons/hi';

// Enhanced Earning Timer Component
const PortiqEarningTimer = () => {
  const { earningTimer, startEarningTimer, formatTime, agfiPoints } = useStore();

  useEffect(() => {
    if (earningTimer.isActive && earningTimer.startTimestamp) {
      const duration = 6 * 60 * 60; // 6 hours in seconds
      const elapsedSeconds = Math.floor((Date.now() - earningTimer.startTimestamp) / 1000);
      const newTimeRemaining = Math.max(duration - elapsedSeconds, 0);

      if (newTimeRemaining === 0 && !earningTimer.hasAwardedPoints) {
        useStore.getState().updateEarningTimer();
      }
    }
  }, [earningTimer.isActive, earningTimer.startTimestamp, earningTimer.hasAwardedPoints]);

  const totalDuration = 6 * 60 * 60;
  const progress = earningTimer.isActive 
    ? ((totalDuration - earningTimer.timeRemaining) / totalDuration) * 100
    : 0;

  const circumference = 2 * Math.PI * 140; 
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div 
      className="glass rounded-3xl relative overflow-hidden min-h-[420px] flex flex-col items-center justify-center p-6 border border-[#FF007F]/20"
      style={{
        background: `linear-gradient(135deg, 
          rgba(255, 0, 127, 0.1) 0%, 
          rgba(255, 47, 179, 0.05) 50%, 
          rgba(108, 0, 184, 0.05) 100%)`
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF007F]/5 to-[#FF2FB3]/5 rounded-3xl" />
      
      {/* Main circular progress container */}
      <div className="relative flex items-center justify-center mb-8">
        <svg width="300" height="300" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="150"
            cy="150"
            r="140"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle with gradient */}
          <circle
            cx="150"
            cy="150"
            r="140"
            stroke="url(#portiqGradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          {/* Enhanced gradient definition */}
          <defs>
            <linearGradient id="portiqGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF007F" />
              <stop offset="50%" stopColor="#FF2FB3" />
              <stop offset="100%" stopColor="#FFB82A" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="relative scale-90"
            animate={{ 
              rotate: earningTimer.isActive ? 360 : 0,
              scale: earningTimer.isActive ? [0.9, 1, 0.9] : 0.9
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <Image src='/agent/agentlogo.png' alt='agent logo' width={200} height={200} quality={100}/>
          </motion.div>
        </div>

        {/* Progress indicator */}
        <div className="absolute right-1/2 -bottom-8 transform translate-x-1/2 -translate-y-1/2">
          <motion.div 
            className="w-16 h-16 glass rounded-full flex items-center justify-center border-2 border-[#FFB82A]/50 shadow-lg"
            style={{
              background: `linear-gradient(135deg, 
                rgba(255, 184, 42, 0.2) 0%, 
                rgba(255, 90, 42, 0.1) 100%)`
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FaClock className="text-[#FFB82A]" size={20} />
          </motion.div>
        </div>
      </div>

      {/* Bottom content with enhanced styling */}
      <div className="w-full text-center space-y-4 relative z-10">
        <div className='flex items-center justify-between w-full mb-4'>
          <div className="flex items-center space-x-2">
            <FaCoins className="text-[#FFB82A]" size={20} />
            <div className="text-white font-bold text-xl tektur">
              Earn 3,000 $PTIQ
            </div>
          </div>
          <div className="text-[#FF2FB3] font-bold font-mono text-xl">
            {earningTimer.isActive ? formatTime(earningTimer.timeRemaining) : '06:00:00'}
          </div>
        </div>
        
        {/* Progress bar */}
        {earningTimer.isActive && (
          <motion.div 
            className="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF007F] to-[#FFB82A] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        )}

        {/* Start button with enhanced styling */}
        {!earningTimer.isActive && (
          <motion.button
            onClick={() => startEarningTimer(6 * 60 * 60)}
            className="w-full glass-button py-4 rounded-2xl font-bold tektur text-white transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center space-x-3">
              <FaPlay size={16} />
              <span>START EARNING</span>
              <HiSparkles size={16} />
            </div>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Enhanced User Balance Component
const PortiqUserBalance = () => {
  const { spaiPoints, agentTickets } = useStore();
  
  return (
    <motion.div 
      className="grid grid-cols-2 gap-4 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <motion.div 
        className="glass rounded-2xl p-4 text-center border border-[#FFB82A]/20"
        style={{
          background: `linear-gradient(135deg, 
            rgba(255, 184, 42, 0.1) 0%, 
            rgba(255, 90, 42, 0.05) 100%)`
        }}
        whileHover={{ scale: 1.05 }}
      >
        <FaCoins className="text-[#FFB82A] mx-auto mb-2" size={24} />
        <div className="text-[#FFB82A] font-bold text-sm mb-1">$PTIQ POINTS</div>
        <div className="text-white font-bold text-2xl tektur">{spaiPoints.toLocaleString()}</div>
      </motion.div>
      
      <motion.div 
        className="glass rounded-2xl p-4 text-center border border-[#FF007F]/20"
        style={{
          background: `linear-gradient(135deg, 
            rgba(255, 0, 127, 0.1) 0%, 
            rgba(255, 47, 179, 0.05) 100%)`
        }}
        whileHover={{ scale: 1.05 }}
      >
        <FaGem className="text-[#FF007F] mx-auto mb-2" size={24} />
        <div className="text-[#FF007F] font-bold text-sm mb-1">AI LICENSES</div>
        <div className="text-white font-bold text-2xl tektur">{agentTickets.toLocaleString()}</div>
      </motion.div>
    </motion.div>
  );
};

// Enhanced Social Task Component
const PortiqSocialTask = () => {
  const { addSpaiPoints, setTwitterFollowCompleted, tasks } = useStore();
  const [completed, setCompleted] = useState(tasks.followX.completed);
  const { hapticFeedback } = useTelegram();

  const handleJoinX = () => {
    if (!completed) {
      setCompleted(true);
      addSpaiPoints(1000);
      setTwitterFollowCompleted(true);
      hapticFeedback('success');
      window.open('https://x.com/portiqai', '_blank');
    }
  };

  return (
    <motion.div 
      className="glass rounded-2xl p-4 border border-[#FF5A2A]/20 mb-6"
      style={{
        background: `linear-gradient(135deg, 
          rgba(255, 90, 42, 0.1) 0%, 
          rgba(255, 0, 127, 0.05) 100%)`
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] rounded-xl flex items-center justify-center">
            <RiTwitterXFill className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold">Follow Portiq on X</h3>
            <p className="text-gray-300 text-sm">Get 1,000 $PTIQ Points instantly</p>
          </div>
        </div>
        <motion.button
          onClick={handleJoinX}
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
            completed 
              ? 'bg-green-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] hover:from-[#FF2FB3] hover:to-[#FF007F]'
          )}
          disabled={completed}
          whileTap={{ scale: 0.95 }}
        >
          {completed ? (
            <FaCheck className="text-white" size={16} />
          ) : (
            <FaRocket className="text-white" size={16} />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Enhanced Navigation Buttons Component with React Icons
const PortiqNavigationButtons = ({ setActiveTab, earningTimer, startEarningTimer }) => {
  const { hapticFeedback } = useTelegram();

  const handleNavClick = (tab) => {
    hapticFeedback('light');
    setActiveTab(tab);
  };

  const navItems = [
    {
      id: 'task',
      icon: <FaTasks size={24} />,
      label: 'Tasks',
      color: 'from-[#FFB82A] to-[#FF5A2A]',
      bgColor: 'rgba(255, 184, 42, 0.1)'
    },
    {
      id: 'SPAI',
      icon: <Image src="/agent/agentlogo.png" alt="AI Agent" width={32} height={32} />,
      label: 'AI Agent',
      color: 'from-[#FF007F] to-[#FF2FB3]',
      bgColor: 'rgba(255, 0, 127, 0.1)'
    },
    {
      id: 'invite',
      icon: <FaUserPlus size={24} />,
      label: 'Invite',
      color: 'from-[#FF2FB3] to-[#6C00B8]',
      bgColor: 'rgba(255, 47, 179, 0.1)'
    },
    {
      id: 'start',
      icon: <FaPlay size={20} />,
      label: 'Start',
      color: 'from-[#FF5A2A] to-[#FFB82A]',
      bgColor: 'rgba(255, 90, 42, 0.1)'
    }
  ];

  return (
    <motion.div 
      className="grid grid-cols-4 gap-3 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      {navItems.map((item, index) => (
        <motion.button 
          key={item.id}
          onClick={() => {
            if (item.id === 'start') {
              hapticFeedback('medium');
              startEarningTimer(6 * 60 * 60);
            } else {
              handleNavClick(item.id);
            }
          }}
          disabled={item.id === 'start' && earningTimer.isActive}
          className={cn(
            'text-center transition-all duration-300',
            item.id === 'start' && earningTimer.isActive ? 'opacity-50' : 'opacity-100'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 + index * 0.1 }}
        >
          <div 
            className="glass rounded-2xl p-4 mb-2 border border-white/10 flex items-center justify-center h-16"
            style={{ background: item.bgColor }}
          >
            <div className={`bg-gradient-to-r ${item.color} bg-clip-text`}>
              {item.icon}
            </div>
          </div>
          <p className="text-gray-300 text-sm font-medium">{item.label}</p>
        </motion.button>
      ))}
    </motion.div>
  );
};

// Main Component with Enhanced Styling
function PortiqTelegramMiniApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [showLoader, setShowLoader] = useState(true);
  
  const { 
    user, 
    loading: telegramLoading, 
    error: telegramError, 
    webApp,
    showAlert,
    hapticFeedback,
    retry: retryTelegram,
    loadFallbackUser
  } = useTelegram();
  
  const { 
    agentTickets, 
    useAgentTicket, 
    setUser, 
    earningTimer, 
    startEarningTimer 
  } = useStore();
  
  const router = useRouter();

  // Show loader for 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Update store when user changes
  useEffect(() => {
    if (user) {
      console.log('✅ Setting user in store:', user);
      setUser(user);
    }
  }, [user, setUser]);

  const handleAgentAccess = useCallback(() => {
    if (agentTickets > 0) {
      useAgentTicket();
      setActiveTab('SPAI');
      hapticFeedback('success');
    } else {
      showAlert('You need at least 1 Agent License to access the AI Agent.');
      hapticFeedback('error');
    }
  }, [agentTickets, useAgentTicket, showAlert, hapticFeedback]);

  const handleTabNavigation = useCallback((tab) => {
    console.log('Navigating to tab:', tab);
    setActiveTab(tab);
    hapticFeedback('light');
    router.push(`/?tab=${tab}`, { scroll: false });
  }, [router, hapticFeedback]);

  const PortiqTopNav = () => (
    <motion.div 
      className="w-full mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Image src="/logo.png" alt="Portiq Logo" width={200} height={60} priority />
        </motion.div>
        <motion.div 
          className="text-right glass rounded-xl p-3 border border-[#FF007F]/20"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255, 0, 127, 0.1) 0%, 
              rgba(255, 47, 179, 0.05) 100%)`
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-400 text-sm">Welcome back</p>
          <p className="text-white text-lg font-bold">
            {user?.first_name || 'Trader'}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderHomeContent = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <PortiqEarningTimer />
      <PortiqUserBalance />
      <PortiqSocialTask />
      <PortiqNavigationButtons
        setActiveTab={handleTabNavigation}
        earningTimer={earningTimer}
        startEarningTimer={startEarningTimer}
      />
      <PortiqPortfolioCenter/>
      <DataCenterHome />
      <div className="h-20" />
    </motion.div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'dataCenter':
        return <CoinAgent />;
      case 'SPAI':
        return <Agent />;
      case 'task':
        return <TaskCenter user={user} />;
      case 'invite':
        return <InviteCenter user={user} />;
      default:
        return renderHomeContent();
    }
  };

  // Show loader while initializing
  if (showLoader || telegramLoading) {
    return <CustomLoader />;
  }

  // Enhanced error state with Portiq styling
  if (telegramError && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0C10] to-[#1A1A1D] flex items-center justify-center p-4">
        <motion.div 
          className="text-center space-y-4 max-w-sm glass rounded-3xl p-8 border border-[#FF007F]/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center mb-4">
            <RiAiGenerate className="text-[#FF007F] mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold text-white mb-2 tektur">Connection Issue</h2>
            <p className="text-sm text-gray-300">{telegramError}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={retryTelegram}
              className="glass-button w-full py-3 rounded-xl font-bold text-white"
            >
              🔄 Retry Connection
            </button>
            <button
              onClick={loadFallbackUser}
              className="w-full py-3 rounded-xl font-bold text-white bg-gray-600/20 border border-gray-500/30"
            >
              🧪 Continue with Test User
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl font-bold text-white bg-green-600/20 border border-green-500/30"
            >
              🔃 Reload Page
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Suspense fallback={<CustomLoader />}>
      <div className="min-h-screen max-w-md w-full mx-auto text-white flex flex-col items-center p-4 relative overflow-hidden bg-gradient-to-br from-[#0B0C10] to-[#1A1A1D]">
        <div className="w-full">
          <PortiqTopNav />
          <SearchParamsWrapper setActiveTab={setActiveTab} renderContent={renderContent} />
        </div>
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50">
          <BottomNav
            activeTab={activeTab}
            setActiveTab={handleTabNavigation}
            handleAgentAccess={handleAgentAccess}
          />
        </div>
      </div>
    </Suspense>
  );
}

// Component to handle useSearchParams
const SearchParamsWrapper = ({ setActiveTab, renderContent }) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab') || 'home';
    setActiveTab(tab);
  }, [searchParams, setActiveTab]);

  return renderContent();
};

export default PortiqTelegramMiniApp;
