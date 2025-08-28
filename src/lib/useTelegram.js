'use client';

import { useState, useEffect, useCallback } from 'react';

export const useTelegram = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [webApp, setWebApp] = useState(null);

  const initTelegram = useCallback(() => {
    console.log('🚀 Initializing Telegram WebApp...');
    
    // Check if Telegram WebApp is available
    if (typeof window === 'undefined') {
      console.log('❌ Window is undefined');
      return;
    }

    // Wait for Telegram object to be available
    const checkTelegram = () => {
      if (window.Telegram?.WebApp) {
        console.log('✅ Telegram WebApp found!');
        
        const tg = window.Telegram.WebApp;
        setWebApp(tg);
        
        // Initialize WebApp
        tg.ready();
        tg.expand();
        
        console.log('📱 Telegram WebApp Info:', {
          version: tg.version,
          platform: tg.platform,
          colorScheme: tg.colorScheme,
          isExpanded: tg.isExpanded,
          viewportHeight: tg.viewportHeight,
          initData: tg.initData ? '✅ Present' : '❌ Missing',
          initDataUnsafe: tg.initDataUnsafe
        });

        // Method 1: Try to get user from initDataUnsafe
        if (tg.initDataUnsafe?.user) {
          const telegramUser = tg.initDataUnsafe.user;
          console.log('✅ User from initDataUnsafe:', telegramUser);
          
          const userData = {
            id: telegramUser.id,
            first_name: telegramUser.first_name || 'User',
            last_name: telegramUser.last_name || '',
            username: telegramUser.username || '',
            language_code: telegramUser.language_code || 'en',
            is_premium: telegramUser.is_premium || false,
            allows_write_to_pm: telegramUser.allows_write_to_pm || false,
            photo_url: telegramUser.photo_url || null
          };
          
          setUser(userData);
          setLoading(false);
          setError(null);
          
          // Save to storage
          try {
            localStorage.setItem('telegram_user', JSON.stringify(userData));
            console.log('💾 User saved to localStorage');
          } catch (e) {
            console.warn('⚠️ Failed to save to localStorage:', e);
          }
          
          return;
        }

        // Method 2: Try to parse initData manually
        if (tg.initData) {
          console.log('🔍 Trying to parse initData manually...');
          try {
            const urlParams = new URLSearchParams(tg.initData);
            const userString = urlParams.get('user');
            
            if (userString) {
              const telegramUser = JSON.parse(decodeURIComponent(userString));
              console.log('✅ User from initData parsing:', telegramUser);
              
              const userData = {
                id: telegramUser.id,
                first_name: telegramUser.first_name || 'User',
                last_name: telegramUser.last_name || '',
                username: telegramUser.username || '',
                language_code: telegramUser.language_code || 'en',
                is_premium: telegramUser.is_premium || false,
                allows_write_to_pm: telegramUser.allows_write_to_pm || false,
                photo_url: telegramUser.photo_url || null
              };
              
              setUser(userData);
              setLoading(false);
              setError(null);
              
              try {
                localStorage.setItem('telegram_user', JSON.stringify(userData));
              } catch (e) {
                console.warn('⚠️ Failed to save to localStorage:', e);
              }
              
              return;
            }
          } catch (parseError) {
            console.error('❌ Error parsing initData:', parseError);
          }
        }

        // Method 3: Check if running in development mode or outside Telegram
        console.log('⚠️ No user data found in Telegram WebApp');
        console.log('🔍 Environment check:', {
          isDevelopment: process.env.NODE_ENV === 'development',
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          isInTelegram: window.parent !== window
        });

        // Fallback for development or when user data is not available
        setError('No user data available from Telegram');
        loadFallbackUser();
        
      } else {
        console.log('⏳ Telegram WebApp not ready yet, retrying...');
        // Retry after a short delay
        setTimeout(checkTelegram, 100);
      }
    };

    checkTelegram();
  }, []);

  const loadFallbackUser = useCallback(() => {
    console.log('🔄 Loading fallback user...');
    
    // Try to load from localStorage first
    try {
      const storedUser = localStorage.getItem('telegram_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('✅ Loaded user from localStorage:', userData);
        setUser(userData);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('⚠️ Failed to load from localStorage:', e);
    }

    // Create a test user for development
    const testUser = {
      id: Date.now(),
      first_name: 'Test User',
      last_name: 'Dev',
      username: 'testuser',
      language_code: 'en',
      is_premium: false,
      allows_write_to_pm: true,
      photo_url: null
    };
    
    console.log('🧪 Using test user for development:', testUser);
    setUser(testUser);
    setLoading(false);
    
    try {
      localStorage.setItem('telegram_user', JSON.stringify(testUser));
    } catch (e) {
      console.warn('⚠️ Failed to save test user:', e);
    }
  }, []);

  const showAlert = useCallback((message) => {
    if (webApp?.showAlert) {
      webApp.showAlert(message);
    } else {
      alert(message);
    }
  }, [webApp]);

  const showConfirm = useCallback((message, callback) => {
    if (webApp?.showConfirm) {
      webApp.showConfirm(message, callback);
    } else {
      const result = confirm(message);
      callback(result);
    }
  }, [webApp]);

  const hapticFeedback = useCallback((type = 'light') => {
    if (webApp?.HapticFeedback) {
      switch (type) {
        case 'light':
          webApp.HapticFeedback.impactOccurred('light');
          break;
        case 'medium':
          webApp.HapticFeedback.impactOccurred('medium');
          break;
        case 'heavy':
          webApp.HapticFeedback.impactOccurred('heavy');
          break;
        case 'success':
          webApp.HapticFeedback.notificationOccurred('success');
          break;
        case 'error':
          webApp.HapticFeedback.notificationOccurred('error');
          break;
        case 'warning':
          webApp.HapticFeedback.notificationOccurred('warning');
          break;
        default:
          webApp.HapticFeedback.impactOccurred('light');
      }
    }
  }, [webApp]);

  useEffect(() => {
    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(() => {
      initTelegram();
    }, 100);

    return () => clearTimeout(timer);
  }, [initTelegram]);

  return {
    user,
    loading,
    error,
    webApp,
    showAlert,
    showConfirm,
    hapticFeedback,
    retry: initTelegram,
    loadFallbackUser
  };
};