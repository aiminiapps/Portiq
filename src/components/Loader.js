'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiAiGenerate, RiLineChartLine, RiBarChart2Line 
} from 'react-icons/ri';
import { 
  FaCoins, FaRocket, FaGem, FaChartPie, FaBolt 
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const PortiqLoader = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [progress, setProgress] = useState(0);

  // Loading stages with messages
  const loadingStages = [
    { icon: <RiAiGenerate size={24} />, text: "Initializing AI Engine...", color: "#FF007F" },
    { icon: <FaChartPie size={24} />, text: "Loading Portfolio Analytics...", color: "#FF2FB3" },
    { icon: <FaCoins size={24} />, text: "Connecting to Markets...", color: "#FFB82A" },
    { icon: <FaRocket size={24} />, text: "Optimizing Performance...", color: "#FF5A2A" },
    { icon: <HiSparkles size={24} />, text: "Welcome to Portiq!", color: "#6C00B8" }
  ];

  // Canvas animation for dynamic glow effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 400;

    let animationId;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dynamic gradient background
      const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 200);
      gradient.addColorStop(0, 'rgba(255, 0, 127, 0.1)');
      gradient.addColorStop(0.5, 'rgba(255, 47, 179, 0.05)');
      gradient.addColorStop(1, 'rgba(108, 0, 184, 0.02)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated rings
      const rings = [
        { radius: 80 + Math.sin(time * 0.02) * 10, color: 'rgba(255, 0, 127, 0.3)', width: 3 },
        { radius: 120 + Math.sin(time * 0.015) * 15, color: 'rgba(255, 47, 179, 0.2)', width: 2 },
        { radius: 160 + Math.sin(time * 0.01) * 20, color: 'rgba(255, 184, 42, 0.15)', width: 1.5 }
      ];

      rings.forEach((ring, index) => {
        ctx.beginPath();
        ctx.arc(200, 200, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.width;
        ctx.stroke();

        // Add glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = ring.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Central pulsing core
      const coreRadius = 40 + Math.sin(time * 0.03) * 8;
      const coreGradient = ctx.createRadialGradient(200, 200, 0, 200, 200, coreRadius);
      coreGradient.addColorStop(0, 'rgba(255, 0, 127, 0.8)');
      coreGradient.addColorStop(0.7, 'rgba(255, 47, 179, 0.4)');
      coreGradient.addColorStop(1, 'rgba(255, 47, 179, 0)');

      ctx.beginPath();
      ctx.arc(200, 200, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      time++;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Simulate loading progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15 + 5;
        
        // Update loading stage based on progress
        const stageIndex = Math.min(
          Math.floor((newProgress / 100) * loadingStages.length),
          loadingStages.length - 1
        );
        setLoadingStage(stageIndex);

        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 600);

    return () => clearInterval(progressInterval);
  }, [loadingStages.length]);

  // Floating particles animation
  const FloatingParticle = ({ delay, size = 4, color = "#FF007F" }) => (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
      animate={{
        y: [-20, -100, -20],
        x: [Math.random() * 40 - 20, Math.random() * 60 - 30, Math.random() * 40 - 20],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-gradient-to-br from-[#0B0C10] to-[#1A1A1D] overflow-hidden">
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        style={{ filter: 'blur(1px)' }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <FloatingParticle
              delay={i * 0.5}
              size={Math.random() * 6 + 2}
              color={[
                "#FF007F", "#FF2FB3", "#FFB82A", "#FF5A2A", "#6C00B8"
              ][Math.floor(Math.random() * 5)]}
            />
          </div>
        ))}
      </div>

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo Section */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Logo background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF007F] to-[#FF2FB3] rounded-3xl blur-xl opacity-30 scale-110" />
          
          {/* Logo container */}
          <div className="relative glass rounded-3xl p-8 border border-[#FF007F]/30"
            style={{
              background: `linear-gradient(135deg, 
                rgba(255, 0, 127, 0.15) 0%, 
                rgba(255, 47, 179, 0.10) 50%, 
                rgba(108, 0, 184, 0.05) 100%)`
            }}
          >
            <motion.div
              className="text-center"
              animate={{
                textShadow: [
                  "0 0 20px rgba(255, 0, 127, 0.5)",
                  "0 0 40px rgba(255, 47, 179, 0.8)",
                  "0 0 20px rgba(255, 0, 127, 0.5)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <h1 className="text-5xl font-bold text-white tektur mb-2">
                PORTIQ
              </h1>
              <p className="text-gray-300 text-sm font-medium tracking-wider">
                AI PORTFOLIO OPTIMIZER
              </p>
            </motion.div>
          </div>

          {/* Rotating ring around logo */}
          <motion.div
            className="absolute inset-0 border-2 border-transparent rounded-3xl"
            style={{
              background: `linear-gradient(45deg, #FF007F, #FF2FB3, #FFB82A, #FF5A2A) border-box`,
              WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "subtract",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Loading Progress */}
        <div className="w-80 space-y-6">
          {/* Current stage indicator */}
          <AnimatePresence mode="wait">
            <motion.div
              key={loadingStage}
              className="flex items-center justify-center space-x-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${loadingStages[loadingStage]?.color}20, ${loadingStages[loadingStage]?.color}10)`,
                  border: `1px solid ${loadingStages[loadingStage]?.color}30`
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div style={{ color: loadingStages[loadingStage]?.color }}>
                  {loadingStages[loadingStage]?.icon}
                </div>
              </motion.div>
              
              <div className="text-center">
                <p className="text-white font-medium text-lg">
                  {loadingStages[loadingStage]?.text}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {Math.round(progress)}% Complete
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="relative">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FF007F] via-[#FF2FB3] to-[#FFB82A] rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Progress shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 w-6 animate-pulse" />
              </motion.div>
            </div>
            
            {/* Progress glow */}
            <div 
              className="absolute top-0 h-2 rounded-full blur-sm opacity-50 bg-gradient-to-r from-[#FF007F] via-[#FF2FB3] to-[#FFB82A]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Loading dots */}
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-[#FF007F] rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <motion.div
          className="text-center text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <p>Powered by Advanced AI • Built for Traders</p>
        </motion.div>
      </div>

      {/* Corner decorative elements */}
      <div className="absolute top-4 right-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <RiLineChartLine className="text-[#FF007F] opacity-20" size={24} />
        </motion.div>
      </div>
      
      <div className="absolute bottom-4 left-4">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <RiBarChart2Line className="text-[#FFB82A] opacity-20" size={24} />
        </motion.div>
      </div>
    </div>
  );
};

export default PortiqLoader;
