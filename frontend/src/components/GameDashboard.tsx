import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const GameDashboard: React.FC = () => {
  const [streak, setStreak] = useState(7);
  const [level, setLevel] = useState(3);
  const [xp, setXp] = useState(1247);
  const [nextLevelXp] = useState(2000);
  const [showCelebration, setShowCelebration] = useState(false);

  const dailyTasks = [
    { 
      id: 1, 
      title: "Morning Workout", 
      category: "Fitness", 
      reward: 150, 
      xp: 50,
      completed: true, 
      icon: "🏋️",
      color: "from-red-400 to-pink-500"
    },
    { 
      id: 2, 
      title: "Read 30 min", 
      category: "Learning", 
      reward: 100, 
      xp: 40,
      completed: true, 
      icon: "📚",
      color: "from-blue-400 to-indigo-500"
    },
    { 
      id: 3, 
      title: "Meditate", 
      category: "Wellness", 
      reward: 80, 
      xp: 30,
      completed: false, 
      icon: "🧘",
      color: "from-green-400 to-teal-500"
    },
    { 
      id: 4, 
      title: "Code Practice", 
      category: "Skills", 
      reward: 200, 
      xp: 75,
      completed: false, 
      icon: "💻",
      color: "from-purple-400 to-indigo-500"
    },
  ];

  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const totalTasks = dailyTasks.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  const handleTaskComplete = (taskId: number) => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
    // Add XP animation logic here
  };

  return (
    <div className="pt-12 px-4 pb-6">
      {/* Hero Stats Section */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Level {level} Achiever!</h1>
                <p className="text-white/90">Keep crushing your goals! 🔥</p>
              </div>
              <div className="w-16 h-16 relative">
                <Image
                  src="/assets/images/3d_rendered_crypto_tokens.jpg"
                  alt="Profile"
                  fill
                  className="rounded-full border-3 border-white/50"
                />
              </div>
            </div>
            
            {/* XP Progress Bar */}
            <div className="bg-white/20 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(xp / nextLevelXp) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-white/90">
              <span>{xp} XP</span>
              <span>{nextLevelXp - xp} XP to Level {level + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 rounded-full"></div>
          <div className="relative z-10">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-xs opacity-90">Day Streak</div>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/20 rounded-full"></div>
          <div className="relative z-10">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
            <div className="text-xs opacity-90">Today</div>
          </div>
        </div>

        {/* Tokens Earned */}
        <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-10 h-10 bg-white/10 rounded-full -translate-y-2 translate-x-2"></div>
          <div className="relative z-10">
            <div className="text-2xl mb-1">💎</div>
            <div className="text-2xl font-bold">24.5</div>
            <div className="text-xs opacity-90">ACHIV</div>
          </div>
        </div>
      </div>

      {/* Daily Progress Ring */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Today's Progress</h2>
          <span className="text-white/80 text-sm">{Math.round(progressPercentage)}% Complete</span>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            {/* Progress Ring Background */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(progressPercentage / 100) * 314} 314`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{completedTasks}</div>
                <div className="text-xs text-white/80">of {totalTasks}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Tasks */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-white mb-4">Today's Quests</h2>
        
        {dailyTasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white/10 backdrop-blur-xl rounded-2xl p-4 border transition-all duration-300 transform ${
              task.completed 
                ? 'border-green-400/50 scale-98 opacity-75' 
                : 'border-white/20 hover:scale-102 hover:border-white/40 active:scale-98'
            }`}
            onClick={() => !task.completed && handleTaskComplete(task.id)}
          >
            <div className="flex items-center space-x-4">
              {/* Task Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${task.color} flex items-center justify-center text-2xl ${
                task.completed ? 'opacity-50' : 'shadow-lg'
              }`}>
                {task.completed ? '✅' : task.icon}
              </div>
              
              {/* Task Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold ${task.completed ? 'text-white/60 line-through' : 'text-white'}`}>
                    {task.title}
                  </h3>
                  {!task.completed && (
                    <div className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                      +{task.xp} XP
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${task.completed ? 'text-white/50' : 'text-white/80'}`}>
                    {task.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${task.completed ? 'text-white/50' : 'text-green-400'}`}>
                      +{task.reward} ACHIV
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Completion Effect */}
            {task.completed && (
              <div className="absolute inset-0 bg-green-400/10 rounded-2xl pointer-events-none"></div>
            )}
          </div>
        ))}
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 text-center animate-bounce max-w-sm mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Quest Complete!</h2>
            <p className="text-white/90 mb-4">You earned +50 XP and +150 ACHIV tokens!</p>
            <button 
              onClick={() => setShowCelebration(false)}
              className="bg-white text-orange-500 font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition-colors"
            >
              Awesome! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDashboard;
