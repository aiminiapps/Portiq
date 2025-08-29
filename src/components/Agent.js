'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCoins, FaBullseye, FaRocket, FaChartLine,
  FaDollarSign, FaCalendarAlt, FaCalculator, FaLightbulb,
  FaGem, FaStar, FaTrendingUp, FaShieldAlt, FaFire
} from 'react-icons/fa';
import { RiAiGenerate } from 'react-icons/ri';
import { HiSparkles, HiTrendingUp } from 'react-icons/hi';
import { BiTarget } from 'react-icons/bi';
import Image from 'next/image';
import { SlTarget } from "react-icons/sl";

export default function PortiqInvestmentAgent() {
  const [conversation, setConversation] = useState([
    {
      role: 'assistant',
      content: "Welcome to Portiq AI Investment Agent! 🚀 I'll help you create a personalized investment strategy. Let's start by setting up your portfolio and goals!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState('welcome'); // welcome, portfolio, targets, analysis
  const [userPortfolio, setUserPortfolio] = useState([]);
  const [investmentGoals, setInvestmentGoals] = useState({});
  const [showPortfolioInput, setShowPortfolioInput] = useState(false);
  const [showTargetInput, setShowTargetInput] = useState(false);
  const [newAsset, setNewAsset] = useState({ symbol: '', amount: '', currentPrice: '' });
  const [targetAmount, setTargetAmount] = useState('');
  const [timeframe, setTimeframe] = useState('12');
  const [riskTolerance, setRiskTolerance] = useState('moderate');

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

  // Hide bottom nav when typing
  useEffect(() => {
    const bottomNav = document.querySelector('.bottomnav');
    if (input.trim()) {
      bottomNav?.classList.add('hidden');
    } else {
      bottomNav?.classList.remove('hidden');
    }
  }, [input]);

  // Add asset to portfolio
  const addAssetToPortfolio = useCallback(() => {
    if (newAsset.symbol && newAsset.amount) {
      const asset = {
        id: Date.now(),
        symbol: newAsset.symbol.toUpperCase(),
        amount: parseFloat(newAsset.amount),
        currentPrice: parseFloat(newAsset.currentPrice) || 0,
        value: parseFloat(newAsset.amount) * (parseFloat(newAsset.currentPrice) || 0)
      };
      
      setUserPortfolio(prev => [...prev, asset]);
      setNewAsset({ symbol: '', amount: '', currentPrice: '' });
      hapticFeedback('success');
      
      // Add confirmation message
      const confirmMessage = {
        role: 'assistant',
        content: `✅ Added ${asset.amount} ${asset.symbol} to your portfolio! Current value: $${asset.value.toLocaleString()}. Add more assets or click 'Continue' when ready.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversation(prev => [...prev, confirmMessage]);
    }
  }, [newAsset, hapticFeedback]);

  // Remove asset from portfolio
  const removeAsset = useCallback((id) => {
    setUserPortfolio(prev => prev.filter(asset => asset.id !== id));
    hapticFeedback('medium');
  }, [hapticFeedback]);

  // Set investment goals
  const setInvestmentTargets = useCallback(() => {
    if (targetAmount && timeframe) {
      const currentValue = userPortfolio.reduce((sum, asset) => sum + asset.value, 0);
      const targetValue = parseFloat(targetAmount);
      const requiredGrowth = ((targetValue - currentValue) / currentValue) * 100;
      const monthlyGrowth = requiredGrowth / parseInt(timeframe);
      
      const goals = {
        targetAmount: targetValue,
        timeframe: parseInt(timeframe),
        currentValue,
        requiredGrowth,
        monthlyGrowth,
        riskTolerance
      };
      
      setInvestmentGoals(goals);
      setCurrentStep('analysis');
      hapticFeedback('success');
      
      // Generate analysis
      generateInvestmentAnalysis(goals);
    }
  }, [targetAmount, timeframe, userPortfolio, riskTolerance, hapticFeedback]);

  // Generate AI investment analysis
  const generateInvestmentAnalysis = async (goals) => {
    setIsTyping(true);
    
    try {
      const portfolioSummary = userPortfolio.map(asset => 
        `${asset.symbol}: ${asset.amount} units ($${asset.value.toLocaleString()})`
      ).join('\n');
      
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are Portiq AI, an expert investment advisor specializing in cryptocurrency portfolio optimization. Provide detailed, actionable investment guidance in simple English with emojis.`
            },
            {
              role: "user", 
              content: `INVESTMENT ANALYSIS REQUEST:

📊 CURRENT PORTFOLIO:
${portfolioSummary}
Total Value: $${goals.currentValue.toLocaleString()}

🎯 INVESTMENT GOALS:
Target Amount: $${goals.targetAmount.toLocaleString()}
Timeframe: ${goals.timeframe} months
Required Growth: ${goals.requiredGrowth.toFixed(1)}%
Monthly Growth Needed: ${goals.monthlyGrowth.toFixed(1)}%
Risk Tolerance: ${goals.riskTolerance}

PLEASE PROVIDE:
1. 📈 Goal Feasibility Assessment
2. 💡 Strategic Recommendations  
3. 🎯 Specific Action Plan
4. ⚠️ Risk Analysis
5. 📅 Timeline Milestones
6. 🔄 Rebalancing Strategy

Format: Use simple text with emojis, no markdown. Keep conversational and actionable. Maximum 400 words.`
            }
          ]
        })
      });

      const data = await response.json();
      const analysisContent = data.reply || data.response || "Analysis completed! Your investment strategy has been generated.";
      
      const analysisMessage = {
        role: 'assistant',
        content: analysisContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setConversation(prev => [...prev, analysisMessage]);
      
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = {
        role: 'assistant',
        content: "⚠️ Unable to generate analysis right now. Let me provide some general guidance based on your goals...",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle regular chat messages
  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { 
      role: 'user', 
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversation((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const portfolioContext = userPortfolio.length > 0 ? 
        `\nUser's Current Portfolio: ${userPortfolio.map(a => `${a.symbol}: ${a.amount} units`).join(', ')}` : '';
      
      const goalsContext = investmentGoals.targetAmount ? 
        `\nInvestment Goals: Target $${investmentGoals.targetAmount.toLocaleString()} in ${investmentGoals.timeframe} months` : '';

      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { 
              role: "system", 
              content: `You are Portiq AI, a specialized cryptocurrency investment advisor. Your expertise includes:

🔹 PORTFOLIO ANALYSIS:
- Evaluate crypto holdings and allocation strategies
- Identify optimization opportunities
- Calculate risk-adjusted returns

🔹 INVESTMENT STRATEGY:
- Create personalized investment plans
- Recommend portfolio rebalancing
- Suggest entry/exit strategies

🔹 MARKET INSIGHTS:
- Provide crypto market analysis
- Track price movements and trends
- Offer technical and fundamental analysis

🔹 GOAL-ORIENTED GUIDANCE:
- Help users achieve specific financial targets
- Create realistic timelines and milestones
- Adjust strategies based on market conditions

CONTEXT:${portfolioContext}${goalsContext}

GUIDELINES:
- Provide actionable investment advice
- Use simple English with relevant emojis
- Focus on achievable goals and realistic expectations
- Emphasize risk management and diversification
- Keep responses concise and user-friendly (max 200 words)
- Never provide financial advice as guarantees` 
            },
            ...conversation.slice(-3),
            userMessage,
          ]
        })
      });

      const data = await response.json();
      
      if (data.reply) {
        setConversation((prev) => [
          ...prev,
          { 
            role: "assistant", 
            content: data.reply, 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error("No reply received");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "🔧 I'm experiencing some technical difficulties. Please try again or use the portfolio setup tools above!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  const totalPortfolioValue = userPortfolio.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.div 
        className="glass glass-p border-b border-[#FF007F]/20 sticky top-0 z-50"
        style={{
          background: `linear-gradient(135deg, 
            rgba(255, 0, 127, 0.1) 0%, 
            rgba(255, 47, 179, 0.05) 100%)`
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="flex items-center justify-start space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <Image src='/agent/agentlogo.png' alt='logo' width={50} height={50}/>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tektur">PORTIQ AI ADVISOR</h1>
              <p className="text-xs text-left text-gray-300">Investment Goal Assistant</p>
            </div>
          </div>

          {/* Portfolio Summary */}
          {userPortfolio.length > 0 && (
            <div className="flex items-center justify-center space-x-4 text-lg">
              <div className="flex items-center space-x-1 text-[#FFB82A]">
                <FaCoins size={14} />
                <span>${totalPortfolioValue.toLocaleString()}</span>
              </div>
              {investmentGoals.targetAmount && (
                <div className="flex items-center space-x-1 text-[#FF2FB3]">
                  <SlTarget size={14} />
                  <span>${investmentGoals.targetAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className=" space-y-3">
        {/* Portfolio Input Section */}
        <motion.div
          className="glass rounded-2xl p-4 border border-[#FF007F]/20"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255, 0, 127, 0.05) 0%, 
              rgba(255, 47, 179, 0.03) 100%)`
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold flex items-center space-x-2">
              <FaCoins className="text-[#FFB82A]" size={16} />
              <span>Current Holdings</span>
            </h3>
            <motion.button
              className="text-[#FF007F] text-sm font-medium"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPortfolioInput(!showPortfolioInput)}
            >
              {showPortfolioInput ? 'Hide' : 'Add Assets'}
            </motion.button>
          </div>

          {/* Portfolio Assets Display */}
          {userPortfolio.length > 0 && (
            <div className="space-y-2 mb-3">
              {userPortfolio.map((asset) => (
                <motion.div
                  key={asset.id}
                  className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  layout
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {asset.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{asset.symbol}</div>
                      <div className="text-gray-400 text-xs">{asset.amount} units</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-white font-medium text-sm">${asset.value.toLocaleString()}</div>
                    </div>
                    <motion.button
                      className="text-red-400 text-xs"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeAsset(asset.id)}
                    >
                      Remove
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Add Asset Form */}
          <AnimatePresence>
            {showPortfolioInput && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Symbol (BTC)"
                    value={newAsset.symbol}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                    className="bg-gray-800/50 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-[#FF007F]"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newAsset.amount}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, amount: e.target.value }))}
                    className="bg-gray-800/50 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-[#FF007F]"
                  />
                  <input
                    type="number"
                    placeholder="Price ($)"
                    value={newAsset.currentPrice}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, currentPrice: e.target.value }))}
                    className="bg-gray-800/50 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-[#FF007F]"
                  />
                </div>
                <motion.button
                  className="w-full bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] text-white py-2 rounded-lg text-sm font-medium"
                  whileTap={{ scale: 0.98 }}
                  onClick={addAssetToPortfolio}
                  disabled={!newAsset.symbol || !newAsset.amount}
                >
                  Add Asset
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Investment Goals Section */}
        <motion.div
          className="glass rounded-2xl p-4 border border-[#FFB82A]/20"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255, 184, 42, 0.1) 0%, 
              rgba(255, 90, 42, 0.05) 100%)`
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold flex items-center space-x-2">
              <SlTarget className="text-[#FFB82A]" size={16} />
              <span>Investment Goals</span>
            </h3>
            <motion.button
              className="text-[#FFB82A] text-sm font-medium"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTargetInput(!showTargetInput)}
            >
              {showTargetInput ? 'Hide' : 'Set Goals'}
            </motion.button>
          </div>

          {/* Goals Display */}
          {investmentGoals.targetAmount && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center bg-gray-800/30 rounded-lg p-3">
                <div className="text-[#FFB82A] font-bold">${investmentGoals.targetAmount.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Target</div>
              </div>
              <div className="text-center bg-gray-800/30 rounded-lg p-3">
                <div className="text-[#FF2FB3] font-bold">{investmentGoals.timeframe}m</div>
                <div className="text-xs text-gray-400">Timeline</div>
              </div>
              <div className="text-center bg-gray-800/30 rounded-lg p-3">
                <div className={`font-bold ${investmentGoals.requiredGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {investmentGoals.requiredGrowth.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Growth Needed</div>
              </div>
              <div className="text-center bg-gray-800/30 rounded-lg p-3">
                <div className="text-[#FF5A2A] font-bold capitalize">{investmentGoals.riskTolerance}</div>
                <div className="text-xs text-gray-400">Risk Level</div>
              </div>
            </div>
          )}

          {/* Goals Input Form */}
          <AnimatePresence>
            {showTargetInput && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Target Amount ($)"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="bg-gray-800/50 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-[#FFB82A]"
                  />
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-[#FFB82A]"
                  >
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">1 Year</option>
                    <option value="24">2 Years</option>
                    <option value="36">3 Years</option>
                  </select>
                </div>
                <select
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(e.target.value)}
                  className="w-full bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-[#FFB82A]"
                >
                  <option value="conservative">Conservative (Low Risk)</option>
                  <option value="moderate">Moderate (Medium Risk)</option>
                  <option value="aggressive">Aggressive (High Risk)</option>
                </select>
                <motion.button
                  className="w-full bg-gradient-to-r from-[#FFB82A] to-[#FF5A2A] text-white py-2 rounded-lg text-sm font-medium"
                  whileTap={{ scale: 0.98 }}
                  onClick={setInvestmentTargets}
                  disabled={!targetAmount || userPortfolio.length === 0}
                >
                  Generate Strategy
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {conversation.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-7 h-7 bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] rounded-full flex items-center justify-center">
                        <RiAiGenerate className="text-white text-xs" />
                      </div>
                      <span className="text-xs text-gray-400">Portiq AI • {msg.timestamp}</span>
                    </div>
                  )}
                  
                  <div className={`px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] text-white' 
                      : 'glass border border-[#FF007F]/20 text-gray-200'
                  }`}
                  style={msg.role === 'assistant' ? {
                    background: `linear-gradient(135deg, 
                      rgba(255, 0, 127, 0.05) 0%, 
                      rgba(255, 47, 179, 0.03) 50%, 
                      rgba(108, 0, 184, 0.05) 100%)`
                  } : {}}
                  >
                    <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-gray-500">You • {msg.timestamp}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] rounded-full flex items-center justify-center">
                    <RiAiGenerate className="text-white text-xs" />
                  </div>
                  <div className="glass rounded-2xl p-4 border border-[#FF007F]/20"
                    style={{
                      background: `linear-gradient(135deg, 
                        rgba(255, 0, 127, 0.05) 0%, 
                        rgba(255, 47, 179, 0.03) 100%)`
                    }}
                  >
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#FF007F] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#FF2FB3] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-[#FFB82A] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area */}
      <motion.div 
        className="glass border-t border-[#FF007F]/20 p-4"
        style={{
          background: `linear-gradient(135deg, 
            rgba(255, 0, 127, 0.05) 0%, 
            rgba(255, 47, 179, 0.03) 100%)`
        }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about investment strategies, market analysis..."
              className="w-full bg-gray-800/50 text-white placeholder-gray-400 rounded-2xl px-4 py-3 pr-12 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF007F] focus:border-transparent"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] rounded-xl flex items-center justify-center text-white disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
