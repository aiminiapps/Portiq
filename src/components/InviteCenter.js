'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCopy, FaShare, FaCheck, FaCoins, FaUsers, FaGift,
  FaRocket, FaStar, FaTrophy, FaFire, FaGem
} from 'react-icons/fa';
import { RiAiGenerate } from 'react-icons/ri';
import { HiSparkles } from 'react-icons/hi';
import { BiTarget } from 'react-icons/bi';
import Image from 'next/image';

function PortiqInviteCenter() {
  const [inviteCode] = useState('PORTIQ2025');
  const [copySuccess, setCopySuccess] = useState(false);
  const [totalInvites, setTotalInvites] = useState(12);
  const [earnedPTIQ, setEarnedPTIQ] = useState(2400);
  const [premiumAccess, setPremiumAccess] = useState(3);

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

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const generateInviteLink = () => {
    return `https://t.me/portiq_bot`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      hapticFeedback('success');
      
      // Telegram WebApp haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleInviteTraders = () => {
    const inviteLink = generateInviteLink();
    const shareText = `🚀 Join me on Portiq - AI Portfolio Optimizer!

💎 Get AI-powered portfolio analysis
📈 Earn $PTIQ tokens through optimization
🎯 Access premium trading insights
🤖 Personal AI investment advisor

Use my invite code: ${inviteCode}

Join now: ${inviteLink}`;

    hapticFeedback('medium');

    if (window.Telegram?.WebApp) {
      // Use Telegram's native sharing
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`);
    } else {
      // Fallback for web
      if (navigator.share) {
        navigator.share({
          title: 'Join Portiq Portfolio Optimizer',
          text: shareText,
          url: inviteLink
        });
      } else {
        // Copy to clipboard as fallback
        navigator.clipboard.writeText(shareText);
        alert('Invite message copied to clipboard!');
      }
    }
  };

  return (
    <div className="min-h-screen  text-white pb-16">
      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mt-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white tektur">
                INVITE & <span className="bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] bg-clip-text text-transparent">EARN</span>
              </h1>
              <p className="text-gray-300 text-sm mt-1">Build your trading network</p>
            </div>
          </div>
        </motion.div>

        {/* Illustration */}
        <motion.div 
          className="relative my-8 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="relative">
            <div className="w-64 h-64 bg-gradient-to-br from-[#FF007F]/20 to-[#FF2FB3]/20 rounded-full flex items-center justify-center">
                <Image src='/agent/agentlogo.png' alt='logo' width={300} height={300}/>
            </div>
            
            {/* Floating Icons */}
            <motion.div
              className="absolute -top-4 -right-4 w-12 h-12 bg-[#FF007F] rounded-full flex items-center justify-center"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaRocket className="text-white" size={20} />
            </motion.div>            
            <motion.div
              className="absolute top-1/2 -left-8 w-10 h-10 bg-[#FF2FB3] rounded-full flex items-center justify-center"
              animate={{ x: [-3, 3, -3] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <HiSparkles className="text-white" size={16} />
            </motion.div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div 
          className="space-y-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-white text-center tektur mb-6">
            HOW IT <span className="bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] bg-clip-text text-transparent">WORKS</span>
          </h2>
          
          <div className="space-y-4">
            <motion.div 
              className="glass rounded-2xl p-4 border border-[#FF007F]/20"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(255, 0, 127, 0.05) 0%, 
                  rgba(255, 47, 179, 0.03) 100%)`
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#FF007F] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Share Your Link</h3>
                  <p className="text-gray-300 text-sm">Invite traders to join Portiq and discover AI-powered portfolio optimization.</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="glass rounded-2xl p-4 border border-[#FFB82A]/20"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(255, 184, 42, 0.1) 0%, 
                  rgba(255, 90, 42, 0.05) 100%)`
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#FFB82A] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Friends Join & Optimize</h3>
                  <p className="text-gray-300 text-sm">They connect wallets, get AI analysis, and start earning $PTIQ tokens.</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="glass rounded-2xl p-4 border border-[#FF2FB3]/20"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(255, 47, 179, 0.1) 0%, 
                  rgba(108, 0, 184, 0.05) 100%)`
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#FF2FB3] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Earn Premium Access</h3>
                  <p className="text-gray-300 text-sm">1 Friend = Premium AI License worth up to 1,000 $PTIQ tokens and exclusive features!</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Invite Code Section */}
        <motion.div 
          className="glass rounded-2xl p-6 mb-6 border border-[#FF007F]/20"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255, 0, 127, 0.1) 0%, 
              rgba(255, 47, 179, 0.05) 100%)`
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <FaStar className="text-[#FFB82A]" size={20} />
              <h3 className="text-lg font-bold text-white">Your Invite Code</h3>
              <FaStar className="text-[#FFB82A]" size={20} />
            </div>
            
            <div className="glass rounded-xl p-4 border border-[#FFB82A]/30 mb-4"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(255, 184, 42, 0.1) 0%, 
                  rgba(255, 90, 42, 0.05) 100%)`
              }}
            >
              <div className="font-mono text-2xl text-[#FFB82A] tracking-wider font-bold">
                {inviteCode}
              </div>
            </div>
            
            <p className="text-gray-300 text-sm">
              Share this code for instant recognition and bonus rewards!
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={handleInviteTraders}
            className="w-full glass-button tektur font-bold py-4 rounded-2xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center space-x-3">
              <FaShare size={18} />
              <span>INVITE TRADERS</span>
              <HiSparkles size={18} />
            </div>
          </motion.button>

          <motion.button
            onClick={handleCopyCode}
            className="w-full glass rounded-2xl py-4 border border-[#FFB82A]/30 text-white font-bold transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, 
                rgba(255, 184, 42, 0.1) 0%, 
                rgba(255, 90, 42, 0.05) 100%)`
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <AnimatePresence mode="wait">
                {copySuccess ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <FaCheck className="text-green-400" size={18} />
                    <span className="text-green-400">COPIED!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <FaCopy size={18} />
                    <span>COPY CODE</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        </motion.div>

        {/* Rewards Info */}
        <motion.div 
          className="mt-8 glass rounded-2xl p-4 border border-[#FF5A2A]/20"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255, 90, 42, 0.1) 0%, 
              rgba(255, 184, 42, 0.05) 100%)`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <FaTrophy className="text-[#FFB82A]" size={20} />
              <h3 className="text-white font-bold">Referral Rewards</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-[#FF007F] font-bold">200 $PTIQ</div>
                <div className="text-gray-400">Per Referral</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-[#FFB82A] font-bold">Premium Access</div>
                <div className="text-gray-400">AI Features</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs text-gray-400">
            Build your network and earn together with Portiq AI! 
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default PortiqInviteCenter;
