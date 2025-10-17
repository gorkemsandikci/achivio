import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useWallet } from '../contexts/WalletContext';
import { DatabaseService } from '../services/database';

const GameDashboard: React.FC = () => {
  const { dbUser, isConnected, stxAddress } = useWallet();
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [recentCompletions, setRecentCompletions] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load user dashboard data from database
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isConnected || !stxAddress || !dbUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const dashboardData = await DatabaseService.getUserDashboardData(stxAddress);
        
        if (dashboardData) {
          setUserTasks(dashboardData.userTasks || []);
          setRecentCompletions(dashboardData.recentCompletions || []);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [isConnected, stxAddress, dbUser]);

  // Calculate progress from user tasks
  const todayCompletedTasks = recentCompletions.filter(completion => {
    const today = new Date().toDateString();
    const completionDate = new Date(completion.completed_at).toDateString();
    return completionDate === today;
  }).length;
  
  const activeTasks = userTasks.filter(task => task.is_active).length;
  const progressPercentage = activeTasks > 0 ? (todayCompletedTasks / activeTasks) * 100 : 0;

  const getProgressAmount = (task: any) => {
    // Define progress amounts based on task and unit
    switch (task.progress_unit) {
      case 'minutes':
        if (task.title.includes('Coding') || task.title.includes('Deep Work')) return 15; // 15-minute chunks
        if (task.title.includes('Meditation')) return 5; // 5-minute chunks
        return 10; // Default 10-minute chunks
      case 'glasses':
      case 'cups':
      case 'servings':
      case 'breaks':
        return 1; // One at a time
      case 'steps':
        return 1000; // 1000 steps at a time
      case 'hours':
        return 1; // 1 hour at a time
      case 'reps':
        return 10; // 10 reps at a time
      default:
        return 1;
    }
  };

  const handleTaskProgress = async (task: any) => {
    if (!dbUser || !isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      // For progressive tasks, track progress; for single tasks, complete directly
      if (task.task_type === 'progressive') {
        const progressAmount = getProgressAmount(task);
        const result = await DatabaseService.trackDailyProgress(dbUser.id, task.id, progressAmount);
        
        if (result) {
          if (result.is_completed) {
            // Show completion popup
            showCompletionPopup(task, result.achiv_earned, result.xp_earned);
          } else {
            // Show progress update
            const progressText = getProgressText(task, result.current_progress, result.max_progress);
            showProgressUpdate(task, progressText, result.current_progress, result.max_progress);
          }
          
          // Reload dashboard data
          const dashboardData = await DatabaseService.getUserDashboardData(stxAddress!);
          if (dashboardData) {
            setUserTasks(dashboardData.userTasks || []);
            setRecentCompletions(dashboardData.recentCompletions || []);
          }
        }
      } else {
        // Single completion task
        const result = await DatabaseService.completeTask(dbUser.id, task.id);
        
        if (result) {
          showCompletionPopup(task, result.achiv_earned, result.xp_earned);
          
          // Reload dashboard data
          const dashboardData = await DatabaseService.getUserDashboardData(stxAddress!);
          if (dashboardData) {
            setUserTasks(dashboardData.userTasks || []);
            setRecentCompletions(dashboardData.recentCompletions || []);
          }
        }
      }
    } catch (error) {
      console.error('Error handling task progress:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const getProgressText = (task: any, current: number, max: number) => {
    const percentage = Math.round((current / max) * 100);
    return `${current}/${max} ${task.progress_unit} (${percentage}%)`;
  };

  const showProgressUpdate = (task: any, progressText: string, current: number, max: number) => {
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 bg-black/30 flex items-center justify-center z-50';
    popup.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-sm mx-4 text-center shadow-xl">
        <div class="text-4xl mb-3">${task.icon}</div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">${task.title}</h3>
        <p class="text-gray-600 mb-4">Progress Updated!</p>
        <div class="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-4 mb-4">
          <div class="text-xl font-bold text-blue-600 mb-2">${progressText}</div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style="width: ${Math.min(100, (current / max) * 100)}%"
            ></div>
          </div>
        </div>
        <button 
          onclick="this.parentElement.parentElement.remove()" 
          class="bg-blue-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
        >
          Keep Going! 💪
        </button>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Auto remove after 2 seconds if user doesn't click
    setTimeout(() => {
      if (popup.parentElement) {
        popup.remove();
      }
    }, 2000);
  };

  const showCompletionPopup = (task: any, achivEarned: number, xpEarned: number) => {
    // Create a custom popup that doesn't auto-close
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    popup.innerHTML = `
      <div class="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
        <p class="text-gray-600 mb-4">You completed: <strong>${task.title}</strong></p>
        <div class="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-4 mb-6">
          <div class="flex justify-center space-x-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">+${achivEarned}</div>
              <div class="text-sm text-gray-600">ACHIV</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">+${xpEarned}</div>
              <div class="text-sm text-gray-600">XP</div>
            </div>
          </div>
        </div>
        <button 
          onclick="this.parentElement.parentElement.remove()" 
          class="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Awesome! 🚀
        </button>
      </div>
    `;
    
    document.body.appendChild(popup);
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
                <h1 className="text-2xl font-bold">Level {dbUser?.level || 1} Achiever!</h1>
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
                style={{ width: `${((dbUser?.xp || 0) / ((dbUser?.level || 1) * 1000)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-white/90">
              <span>{dbUser?.xp || 0} XP</span>
              <span>{((dbUser?.level || 1) * 1000) - (dbUser?.xp || 0)} XP to Level {(dbUser?.level || 1) + 1}</span>
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
            <div className="text-2xl font-bold">{dbUser?.current_streak || 0}</div>
            <div className="text-xs opacity-90">Day Streak</div>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/20 rounded-full"></div>
          <div className="relative z-10">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-2xl font-bold">{todayCompletedTasks}/{activeTasks}</div>
            <div className="text-xs opacity-90">Today</div>
          </div>
        </div>

        {/* Tokens Earned */}
        <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-10 h-10 bg-white/10 rounded-full -translate-y-2 translate-x-2"></div>
          <div className="relative z-10">
            <div className="text-2xl mb-1">💎</div>
            <div className="text-2xl font-bold">{dbUser?.achiv_balance || 0}</div>
            <div className="text-xs opacity-90">ACHIV</div>
          </div>
        </div>
      </div>

      {/* Daily Progress Ring */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Today's Progress</h2>
          <span className="text-blue-200 text-sm">{Math.round(progressPercentage)}% Complete</span>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            {/* Progress Ring Background */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="url(#gradient)"
                strokeWidth="10"
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
                <div className="text-2xl font-bold text-white">{todayCompletedTasks}</div>
                <div className="text-xs text-blue-200">of {activeTasks}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Tasks */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-white mb-4">Today's Quests</h2>
        
        {userTasks.slice(0, 4).map((userTask) => {
          const task = userTask.tasks;
          const isCompletedToday = recentCompletions.some(completion => {
            const today = new Date().toDateString();
            const completionDate = new Date(completion.completed_at).toDateString();
            return completionDate === today && completion.task_id === task.id;
          });
          
          return (
          <div
            key={task.id}
            className={`bg-white/80 backdrop-blur-xl rounded-2xl p-4 border transition-all duration-300 transform shadow-lg ${
              isCompletedToday 
                ? 'border-green-400/50 scale-98 opacity-75' 
                : 'border-gray-200 hover:scale-102 hover:border-gray-300 active:scale-98'
            }`}
            onClick={() => !isCompletedToday && handleTaskProgress(task)}
          >
            <div className="flex items-center space-x-4">
              {/* Task Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${task.color_gradient} flex items-center justify-center text-2xl ${
                isCompletedToday ? 'opacity-50' : 'shadow-lg'
              }`}>
                {isCompletedToday ? '✅' : task.icon}
              </div>
              
              {/* Task Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold ${isCompletedToday ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {task.title}
                  </h3>
                  {!isCompletedToday && (
                    <div className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                      +{task.reward_xp} XP
                    </div>
                  )}
                </div>
                
                {/* Progress Bar for Progressive Tasks */}
                {!isCompletedToday && task.task_type === 'progressive' && (
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Progress</span>
                      <span className="text-xs font-bold text-blue-600">
                        {userTask.daily_progress || 0}/{task.max_progress} {task.progress_unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, ((userTask.daily_progress || 0) / task.max_progress) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isCompletedToday ? 'text-gray-400' : 'text-gray-600'}`}>
                    {task.task_categories?.name || 'General'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${isCompletedToday ? 'text-gray-400' : 'text-green-600'}`}>
                      +{task.reward_achiv} ACHIV
                    </span>
                    {!isCompletedToday && task.task_type === 'progressive' && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        +{getProgressAmount(task)} {task.progress_unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Completion Effect */}
            {isCompletedToday && (
              <div className="absolute inset-0 bg-green-400/10 rounded-2xl pointer-events-none"></div>
            )}
          </div>
          );
        })}
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
