'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function TelegramScript() {
  useEffect(() => {
    // Add event listener for when the script loads
    const handleScriptLoad = () => {
      console.log('📱 Telegram WebApp script loaded successfully');
      
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('telegramScriptLoaded'));
    };

    // Check if script is already loaded
    if (window.Telegram?.WebApp) {
      handleScriptLoad();
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <Script
      src="https://telegram.org/js/telegram-web-app.js"
      strategy="beforeInteractive"
      onLoad={() => {
        console.log('📱 Telegram WebApp script loaded');
        window.dispatchEvent(new CustomEvent('telegramScriptLoaded'));
      }}
      onError={(e) => {
        console.error('❌ Failed to load Telegram WebApp script:', e);
      }}
    />
  );
}