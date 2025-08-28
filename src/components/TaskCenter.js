'use client';

import { useState } from 'react';
import { useStore } from '@/lib/storage';
import Image from 'next/image';

const TaskCenter = () => {
  const {
    tasks,
    purchasePass,
    completeTask,
    setTwitterFollowCompleted,
  } = useStore();
  const [error, setError] = useState(null);

  const handlePurchasePass = (count) => {
    const success = purchasePass(count);
    if (!success) {
      setError('Insufficient AGFI Points');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleTask = (taskName, points, action) => {
    if (!tasks[taskName].completed) {
      completeTask(taskName, points);
      if (action) action();
    }
  };

  const SynaptAIIcon = () => (
    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
    <Image src='/agent/agentlogo.png' alt='logo' width={50} height={50}/>
    </div>
  );

  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-3xl font-semibold text-black">Task Center</h2>
        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
        <Image src='/agent/agentlogo.png' alt='logo' width={50} height={50}/>
        </div>
      </div>

      <div className="max-w-md mx-auto">

        {/* Daily Task Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <SynaptAIIcon />
            <div>
              <h3 className="text-xl font-medium text-black">Daily Task</h3>
              <p className="text-gray-700 text-sm">Earn Every day</p>
            </div>
          </div>

          {/* Daily Reward Task */}
          <div className="glass">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image src='/assets/daily-rewareds.svg' alt='logo' width={100} height={100} className='size-14'/>
                <div>
                  <h4 className="text-black font-semibold">Daily Reward</h4>
                  <p className="text-gray-700 text-sm">100 AGFI POINT</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                  tasks.dailyReward.completed ? 'bg-black' : 'bg-gray-500'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    tasks.dailyReward.completed ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </div>
              </div>
            </div>
            {!tasks.dailyReward.completed && (
              <button
              onClick={() => handleTask('dailyReward', 100)}
              className="w-full mt-3 py-2 glass-light glass-blue rounded-xl text-stone-900 font-medium transition-all duration-300"
              >
                Claim Reward
              </button>
            )}
          </div>

          {/* RT Post Task */}
          <div className="glass">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image src='/assets/rt-clam.svg' alt='logo' width={100} height={100} className='size-14'/>
                <div>
                  <h4 className="text-black font-semibold">RT Our Post</h4>
                  <p className="text-gray-700 text-sm">1K AGFI POINT</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                  tasks.rtPost.completed ? 'bg-black' : 'bg-gray-500'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    tasks.rtPost.completed ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </div>
              </div>
            </div>
            {!tasks.rtPost.completed && (
              <button
              onClick={() => handleTask('rtPost', 1000, () => window.open('https://x.com/agentfiservice/status/1938070816236966000', '_blank'))}
              className="w-full mt-3 py-2 glass-light glass-blue rounded-xl text-stone-900 font-medium transition-all duration-300"
              >
                Retweet & Claim
              </button>
            )}
          </div>
        </div>

        {/* Optional Task Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <SynaptAIIcon />
            <div>
              <h3 className="text-xl font-medium text-black">Option Task</h3>
              <p className="text-gray-700 text-sm">1/Task</p>
            </div>
          </div>

          {/* Follow X Task */}
          <div className="glass">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image src='/assets/follow-on-x.svg' alt='logo' width={100} height={100} className='size-14'/>
                <div>
                  <h4 className="text-black font-semibold">Follow X</h4>
                  <p className="text-gray-700 text-sm">1K AGFI POINT</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                  tasks.followX.completed ? 'bg-black' : 'bg-gray-500'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    tasks.followX.completed ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </div>
              </div>
            </div>
            {!tasks.followX.completed && (
              <button
              onClick={() =>
                handleTask('followX', 1000, () => {
                  setTwitterFollowCompleted(true);
                  window.open('https://x.com/agentfiservice', '_blank');
                })
              }
              className="w-full mt-3 py-2 glass-light glass-blue rounded-xl text-stone-900 font-medium transition-all duration-300"
              >
                Follow & Claim
              </button>
            )}
          </div>

          {/* Invite 5 Users Task */}
          <div className="glass">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image src='/assets/invite-f.svg' alt='logo' width={100} height={100} className='size-14'/>
                <div>
                  <h4 className="text-black font-semibold">Invite 5 users</h4>
                  <p className="text-gray-700 text-sm">5K AGFI POINT</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                  tasks.inviteFive.completed ? 'bg-black' : 'bg-gray-500'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    tasks.inviteFive.completed ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </div>
              </div>
            </div>
            {!tasks.inviteFive.completed && (
              <button
                disabled={tasks.inviteFive.completed}
                className="w-full mt-3 py-2 glass-light glass-blue rounded-xl text-stone-900 font-medium transition-all duration-300"
              >
                Invite & Claim
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Description */}
      <p className="text-black mb-6 text-center leading-relaxed">
          <span className="font-semibold text-gray-800">Use AGFI Points to purchase a pass and activate your AI Agent.</span>  Once activated, you can submit your predictions and start earning rewards based on your performance.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Pass Purchase Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => handlePurchasePass(1)}
            className="flex-1 glass-light glass-blue py-4 rounded-2xl text-black font-semibold text-[16px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            1 PASS / 500 AGFI
          </button>
          <button
            onClick={() => handlePurchasePass(5)}
            className="flex-1 glass-light glass-blue py-4 rounded-2xl text-stone-700 font-semibold text-[16px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            5 PASS / 2K AGFI
          </button>
        </div>
      <div className='h-20'/>
    </div>
  );
};

export default TaskCenter;