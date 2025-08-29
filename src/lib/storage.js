import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// In-memory fallback storage for WebView edge cases
let memoryStorage = {};

// Safe storage adapter with optimized error handling
const safeStorage = {
  getItem: (name) => {
    if (typeof window !== 'undefined') {
      try {
        const value = window.localStorage.getItem(name);
        if (value !== null) {
          return value;
        }
      } catch (e) {
        // Silent fallback to memory storage
      }
      // Fallback to memory storage
      return memoryStorage[name] || null;
    }
    return null;
  },
  setItem: (name, value) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(name, value);
      } catch (e) {
        // Fallback to memory storage
        memoryStorage[name] = value;
      }
    } else {
      memoryStorage[name] = value;
    }
  },
  removeItem: (name) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(name);
      } catch (e) {
        // Silent error handling
      }
      delete memoryStorage[name];
    } else {
      delete memoryStorage[name];
    }
  },
};

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      spaiPoints: 0,
      agentTickets: 3,
      agentPasses: 0,
      earningTimer: {
        isActive: false,
        timeRemaining: 0,
        startTimestamp: null,
        hasAwardedPoints: false,
      },
      hasCompletedTwitterFollow: false,
      tasks: {
        dailyReward: { completed: false, lastCompleted: null },
        rtPost: { completed: false },
        followX: { completed: false },
        inviteFive: { completed: false },
      },
      invitationCode: null,
      invitedUsers: 0,
      cryptoData: {},
      winRates: {},
      setUser: (user) => {
        const code = user?.id ? `SPAI-${user.id}-${Math.random().toString(36).slice(2, 8)}` : null;
        set({ user, invitationCode: code });
      },
      addSpaiPoints: (points) =>
        set((state) => ({ spaiPoints: state.spaiPoints + points })),
      addAgentTickets: (count) =>
        set((state) => ({
          agentTickets: state.agentTickets + count,
        })),
      useAgentTicket: () =>
        set((state) => {
          if (state.agentTickets > 0) {
            return { agentTickets: state.agentTickets - 1 };
          }
          return state;
        }),
      addAgentPass: (count) =>
        set((state) => ({ agentPasses: state.agentPasses + count })),
      purchasePass: (count) => {
        const cost = count === 1 ? 500 : count === 5 ? 2000 : 0;
        if (!cost || get().spaiPoints < cost) return false;
        set((state) => ({
          spaiPoints: state.spaiPoints - cost,
          agentPasses: state.agentPasses + count,
        }));
        return true;
      },
      startEarningTimer: (duration) =>
        set({
          earningTimer: {
            isActive: true,
            timeRemaining: duration,
            startTimestamp: Date.now(),
            hasAwardedPoints: false,
          },
        }),
      updateEarningTimer: () =>
        set((state) => {
          const { earningTimer } = state;
          if (!earningTimer.isActive) return state;

          if (earningTimer.startTimestamp) {
            const duration = 6 * 60 * 60;
            const elapsedSeconds = Math.floor((Date.now() - earningTimer.startTimestamp) / 1000);
            const newTimeRemaining = Math.max(duration - elapsedSeconds, 0);

            if (newTimeRemaining <= 0 && !earningTimer.hasAwardedPoints) {
              return {
                spaiPoints: state.spaiPoints + 2000,
                earningTimer: {
                  isActive: false,
                  timeRemaining: 0,
                  startTimestamp: null,
                  hasAwardedPoints: true,
                },
              };
            } else if (newTimeRemaining > 0) {
              return {
                earningTimer: {
                  ...earningTimer,
                  timeRemaining: newTimeRemaining,
                },
              };
            }
          }
          return state;
        }),
      formatTime: (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
          .toString()
          .padStart(2, '0')}`;
      },
      completeTask: (taskName, points) => {
        const today = new Date().toDateString();
        set((state) => {
          const tasks = { ...state.tasks };
          if (taskName === 'dailyReward') {
            if (tasks.dailyReward.lastCompleted !== today) {
              tasks.dailyReward = { completed: true, lastCompleted: today };
              return { tasks, spaiPoints: state.spaiPoints + points, agentTickets: state.agentTickets + 1 };
            }
          } else if (!tasks[taskName].completed) {
            tasks[taskName] = { completed: true };
            return { tasks, spaiPoints: state.spaiPoints + points, agentTickets: state.agentTickets + 1 };
          }
          return state;
        });
      },
      resetDailyTasks: () => {
        const today = new Date().toDateString();
        set((state) => {
          if (state.tasks.dailyReward.lastCompleted !== today) {
            return {
              tasks: {
                ...state.tasks,
                dailyReward: { completed: false, lastCompleted: null },
              },
            };
          }
          return state;
        });
      },
      addReferral: () => {
        set((state) => {
          const newInvitedUsers = state.invitedUsers + 1;
          const newPasses = newInvitedUsers;
          return {
            invitedUsers: newInvitedUsers,
            agentPasses: state.agentPasses + 1,
            spaiPoints:
              newInvitedUsers >= 5 && !state.tasks.inviteFive.completed
                ? state.spaiPoints + 5000
                : state.spaiPoints,
            tasks:
              newInvitedUsers >= 5
                ? { ...state.tasks, inviteFive: { completed: true } }
                : state.tasks,
            agentTickets: state.agentTickets + 1,
          };
        });
      },
      setTwitterFollowCompleted: (value) =>
        set((state) => ({
          tasks: { ...state.tasks, followX: { completed: value } },
        })),
      updateWinRates: () =>
        set((state) => {
          const newWinRates = {};
          const coins = ['BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'SPAI'];
          coins.forEach((symbol) => {
            newWinRates[symbol] = (Math.random() * (95 - 80) + 80).toFixed(1);
          });
          return { winRates: newWinRates };
        }),
      fetchCryptoData: async () => {
        try {
          const response = await fetch('/api/coins');
          const data = await response.json();
          if (response.ok) {
            const cryptoData = data.reduce(
              (acc, coin) => ({
                ...acc,
                [coin.symbol]: {
                  price: coin.priceUsd,
                  change: coin.changePercent24Hr,
                  changePercent: coin.changePercent24Hr,
                  volume: coin.volumeUsd24Hr,
                  image: coin.image,
                  name: coin.name,
                },
              }),
              {
                SPAI: {
                  price: 0,
                  change: 0,
                  changePercent: 0,
                  volume: 0,
                  image: '/agent/agentlogo.png',
                  name: 'SPAI',
                },
              }
            );
            set({ cryptoData });
          }
        } catch (err) {
          // Silent error handling
        }
      },
    }),
    {
      name: 'PORTIQ-storage',
      storage: createJSONStorage(() => safeStorage),
      // Optimize persistence with partialize to reduce storage writes
      partialize: (state) => ({
        user: state.user,
        spaiPoints: state.spaiPoints,
        agentTickets: state.agentTickets,
        agentPasses: state.agentPasses,
        earningTimer: state.earningTimer,
        hasCompletedTwitterFollow: state.hasCompletedTwitterFollow,
        tasks: state.tasks,
        invitationCode: state.invitationCode,
        invitedUsers: state.invitedUsers,
        // Skip cryptoData and winRates as they're frequently updated
      }),
    }
  )
);

// Optimized intervals with debounced updates and error boundaries
let timerIntervalId;
let winRateIntervalId;
let lastTimerUpdate = 0;
let lastWinRateUpdate = 0;

if (typeof window !== 'undefined') {
  // Timer interval with throttling
  timerIntervalId = setInterval(() => {
    const now = Date.now();
    if (now - lastTimerUpdate < 4000) return; // Throttle to once per second
    lastTimerUpdate = now;
    
    try {
      useStore.getState().updateEarningTimer();
      useStore.getState().resetDailyTasks();
    } catch (e) {
      // Silent error handling
    }
  }, 1000);

  // Win rate interval with throttling
  winRateIntervalId = setInterval(() => {
    const now = Date.now();
    if (now - lastWinRateUpdate < 15000) return; 
    lastWinRateUpdate = now;
    
    try {
      useStore.getState().updateWinRates();
    } catch (e) {
      // Silent error handling
    }
  }, 10000);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (timerIntervalId) clearInterval(timerIntervalId);
    if (winRateIntervalId) clearInterval(winRateIntervalId);
  });
}