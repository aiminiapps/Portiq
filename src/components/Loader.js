import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const CustomLoader = () => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!canvas || !ctx || !img) return;

    // Set canvas size
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    let shinePosition = -50;
    const shineWidth = 40;
    const totalWidth = canvas.width + shineWidth + 50;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Create shine effect
      const gradient = ctx.createLinearGradient(
        shinePosition - shineWidth/2, 0, 
        shinePosition + shineWidth/2, 0
      );
      
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      // Apply shine with composite operation
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = gradient;
      ctx.fillRect(shinePosition - shineWidth/2, 0, shineWidth, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      
      // Update shine position
      shinePosition += 2;
      if (shinePosition > totalWidth) {
        shinePosition = -50;
        // Add delay before next shine
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate);
        }, 200);
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Start animation when image loads
    const handleImageLoad = () => {
      animate();
    };

    if (img.complete) {
      handleImageLoad();
    } else {
      img.addEventListener('load', handleImageLoad);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      img.removeEventListener('load', handleImageLoad);
    };
  }, []);

  return (
    <div className='min-h-screen max-w-md w-full relative flex items-center justify-center mx-auto bg-white overflow-hidden'>
      {/* Background decorations */}
      {/* Logo with advanced canvas shine effect */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          {/* Hidden image for canvas reference */}
          <Image 
            ref={imageRef}
            src='/logo.png' 
            alt='logo' 
            width={270} 
            height={80}
            quality={100}
            className="opacity-0 absolute"
            crossOrigin="anonymous"
          />
          
          {/* Canvas for shine effect */}
          <canvas 
            ref={canvasRef}
            className="relative z-10 rounded-lg"
            style={{ width: `${imageRef.current?.naturalWidth || 270}px`, height: `${imageRef.current?.naturalHeight || 80}px` }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default CustomLoader;