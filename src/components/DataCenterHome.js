'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, TrendingUp, Zap, Users, Activity, Trophy, Brain } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AgentFiShowcase() {
  const [totalUsers, setTotalUsers] = useState(80890);
  const [activeTasks, setActiveTasks] = useState(52847);
  const [completedToday, setCompletedToday] = useState(58934);
  const [loading, setLoading] = useState(true);
  const [userActivities, setUserActivities] = useState([]);

  // Mock user activities
  const mockActivities = [
    {
      id: 1,
      username: "Sarah K.",
      action: "Price monitoring completed",
      reward: 25,
      timeAgo: "2 mins ago",
      avatar: "SK",
      color: "bg-blue-500"
    },
    {
      id: 2,
      username: "Mike R.",
      action: "Document summarization finished",
      reward: 45,
      timeAgo: "5 mins ago",
      avatar: "MR",
      color: "bg-purple-500"
    },
    {
      id: 3,
      username: "Alex Chen",
      action: "Alert notifications sent",
      reward: 18,
      timeAgo: "8 mins ago",
      avatar: "AC",
      color: "bg-green-500"
    },
    {
      id: 4,
      username: "Emma J.",
      action: "Data analysis completed",
      reward: 67,
      timeAgo: "12 mins ago",
      avatar: "EJ",
      color: "bg-pink-500"
    },
    {
      id: 5,
      username: "David L.",
      action: "Market research finished",
      reward: 89,
      timeAgo: "15 mins ago",
      avatar: "DL",
      color: "bg-orange-500"
    }
  ];

  const userAvatars = [
    { name: "Sarah", avatar: <Image src='/avatar/avatar-1.svg' alt='user avatar' width={60} height={60}/>},
    { name: "Mike", avatar: <Image src='/avatar/avatar-2.svg' alt='user avatar' width={60} height={60}/> },
    { name: "Alex", avatar: <Image src='/avatar/avatar-3.svg' alt='user avatar' width={60} height={60}/> },
    { name: "Emma", avatar: <Image src='/avatar/avatar-4.svg' alt='user avatar' width={60} height={60}/> },
    { name: "David", avatar: <Image src='/avatar/avatar-5.svg' alt='user avatar' width={60} height={60}/>},
    { name: "Lisa", avatar: <Image src='/avatar/avatar-6.svg' alt='user avatar' width={60} height={60}/> },
    { name: "Tom", avatar: <Image src='/avatar/avatar-7.svg' alt='user avatar' width={60} height={60}/>},
    { name: "Anna", avatar: <Image src='/avatar/avatar-8.svg' alt='user avatar' width={60} height={60}/> }
  ];

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setUserActivities(mockActivities);
      setLoading(false);
    }, 1500);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setTotalUsers(prev => prev + Math.floor(Math.random() * 20) + 5);
      setActiveTasks(prev => prev + Math.floor(Math.random() * 15) + 2);
      setCompletedToday(prev => prev + Math.floor(Math.random() * 10) + 3);
      
      // Add new activity occasionally
      if (Math.random() > 0.7) {
        const newActivity = {
          id: Date.now(),
          username: `User${Math.floor(Math.random() * 9999)}`,
          action: [
            "Price monitoring completed",
            "Document analysis finished",
            "Alert system activated",
            "Data processing completed",
            "Market research done"
          ][Math.floor(Math.random() * 5)],
          reward: Math.floor(Math.random() * 80) + 15,
          timeAgo: "Just now",
          avatar: `U${Math.floor(Math.random() * 99)}`,
          color: [
            "bg-blue-500", "bg-purple-500", "bg-green-500", 
            "bg-pink-500", "bg-orange-500", "bg-indigo-500"
          ][Math.floor(Math.random() * 6)]
        };
        
        setUserActivities(prev => [newActivity, ...prev.slice(0, 4)]);
      }
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-black mb-2">
          AgentFi <span className="text-blue-600">Community</span>
        </h1>
        <p className="text-gray-600 text-sm">Real users completing tasks with AI agents</p>
      </motion.div>

      {/* User Avatars Overlap Section */}
      <motion.div 
        className="flex justify-center mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="relative">
          <div className="flex items-center -space-x-3">
            {userAvatars.slice(0, 6).map((user, index) => (
              <motion.div
                key={index}
                className={`w-12 h-12 bg-white rounded-full border-3 border-white flex items-center justify-center text-white text-sm font-bold shadow-lg relative z-${10 - index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.1, zIndex: 50 }}
              >
                {user.avatar}
              </motion.div>
            ))}
            <motion.div
              className="w-20 h-12 bg-gray-200 rounded-full border-3 border-white flex items-center justify-center text-gray-600 text-xs font-bold shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              +{(totalUsers - 6).toLocaleString()}
            </motion.div>
          </div>
          <div className="text-center mt-3">
            <span className="text-gray-600 text-sm font-medium">
              {totalUsers.toLocaleString()} active users
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-3 gap-3 mb-8 max-w-sm mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-blue-600 text-xl font-bold mb-1">{totalUsers.toLocaleString()}</div>
          <div className="text-gray-600 text-xs">Total Users</div>
          <Users className="w-4 h-4 text-blue-500 mx-auto mt-1" />
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-green-600 text-xl font-bold mb-1">{activeTasks.toLocaleString()}</div>
          <div className="text-gray-600 text-xs">Active Tasks</div>
          <Activity className="w-4 h-4 text-green-500 mx-auto mt-1" />
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <div className="text-purple-600 text-xl font-bold mb-1">{completedToday.toLocaleString()}</div>
          <div className="text-gray-600 text-xs">Completed Today</div>
          <Trophy className="w-4 h-4 text-purple-500 mx-auto mt-1" />
        </div>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            className="flex flex-col items-center justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-200 border-t-blue-600"></div>
              <Brain className="w-6 h-6 text-blue-600 absolute top-3 left-3" />
            </div>
            <p className="text-gray-600 mt-4 text-sm">Loading user activities...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Activity Feed */}
      <div className="max-w-md mx-auto">
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-semibold text-black">Live Activity</h2>
          </div>
        </motion.div>

        <div className="space-y-3">
          <AnimatePresence>
            {!loading && userActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                layout
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                      {activity.avatar}
                    </div>
                    <div>
                      <h3 className="text-black font-medium text-sm">{activity.username}</h3>
                      <p className="text-gray-600 text-xs">{activity.action}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-blue-600 text-sm font-semibold">
                      <Zap className="w-3 h-3" />
                      <span>+{activity.reward}</span>
                    </div>
                    <p className="text-gray-500 text-xs">{activity.timeAgo}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs font-medium">Completed</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Task #{Math.floor(Math.random() * 99999)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <Link href='/?tab=dataCenter'>
        <motion.button
          className="w-full bg-black text-white py-4 px-8 rounded-xl font-semibold text-sm shadow-lg mb-3"
          whileTap={{ scale: 0.95 }}
        >
          Join {totalUsers.toLocaleString()}+ Users
        </motion.button>
        </Link>
        <p className="text-gray-600 text-xs">Start earning with AI automation today</p>
      </motion.div>
      <div className='h-20'/>
    </div>
  );
}