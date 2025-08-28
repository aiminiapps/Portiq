import React, { useState, useEffect } from 'react';
import { Copy, Share2, CheckCircle } from 'lucide-react';
import Image from 'next/image';

function InviteCenter() {
  const [inviteCode] = useState('AGFI2025');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    } else {
      // Fallback for development
      telegramWebApp.ready();
    }
  }, []);

  const generateInviteLink = () => {
    const baseUrl = 'https://t.me/agentfiai_bot';
    return `https://t.me/agentfiai_bot`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      
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
    const shareText = `🚀 Join me on AGFI ! 

🤖 Get AI-powered tasks insights
📈 Earn AGFI Points through tasks complete
🎯 Access exclusive AI missions

Use my invite code: ${inviteCode}

Join now: ${inviteLink}`;

    if (window.Telegram?.WebApp) {
      // Use Telegram's native sharing
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`);
    } else {
      // Fallback for web
      if (navigator.share) {
        navigator.share({
          title: 'Join AGFI Tasks Platform',
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
    <div className="text-white overflow-hidden">
      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-semibold text-black">
              Invite Traders
            </h1>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                <Image src='/agent/agentlogo.png' alt='logo' width={100} height={150}/>
            </div>
          </div>
        </div>
        <div className="relative mb-8 flex items-center justify-center">
                <Image src='/assets/invite.svg' alt='Character' width={400} height={400} quality={80}/>
        </div>

        {/* How It Works Steps */}
        <div className="space-y-4 mb-8">
          <h1 className='text-stone-800 text-xl font-semibold'>How It Works - Invite to Earn</h1>
          <div>
            <h2 className='text-stone-800 text-xl font-medium'>Share Your Invitation Link</h2>
            <p className='text-stone-700 py-1'>Invite others to AGFI by sharing your personal referral link. For each successful join, you unlock a strategic opportunity.</p>
            <h2 className='text-stone-800 text-xl font-medium mt-4'>Your Friends Join AGFI</h2>
            <p className='text-stone-700 py-1'>They start submitting predictions, engaging with AI agents, and earning AGFI Points.</p>
            <h2 className='text-stone-800 text-xl font-medium mt-4'>1 Friend = 1 Agent LICENSE</h2>
            <p className='text-stone-700 py-1'>Each referral gives you an Agent License, which allows you to submit premium predictions, earn bonus rewards, or access exclusive AI missions.<br/>(Each pass is worth up to 3,000 AGFI Points based on your performance.)</p>
          </div>
        </div>

        {/* Invite Code Section */}
        <div className="glass rounded-xl p-6 mb-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium text-stone-800 mb-2">Your Invite Code</h3>
            <div className="bg-blue-500/10 rounded-lg p-3 border border-gray-600/50">
              <div className="font-mono text-xl text-gray-600 tracking-wider">{inviteCode}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleInviteTraders}
            className="glass-light glass-blue glass-button w-full "
          >
            <div className="flex items-center justify-center space-x-2">
              <Share2 className="w-5 h-5" />
              <span>Invite Traders</span>
            </div>
          </button>

          <button
            onClick={handleCopyCode}
            className="glass-light glass-dark w-full text-stone-700 font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 transform"
          >
            <div className="flex items-center justify-center space-x-2">
              {copySuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy Code</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-stone-700">
            Share AGFI with friends and earn together! 
          </p>
        </div>
      </div>
      <div className='h-22'/>
    </div>
  );
}

export default InviteCenter;