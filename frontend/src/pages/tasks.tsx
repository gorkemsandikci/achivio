import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import MobileLayout from '../components/MobileLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import ResponsiveContainer from '../components/ResponsiveContainer';
import LogoHeader from '../components/LogoHeader';
import { useWallet } from '../contexts/WalletContext';
import { DatabaseService } from '../services/database';

export default function Tasks() {
  const { dbUser, isConnected, stxAddress } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from database
  useEffect(() => {
    const loadTasksData = async () => {
      if (!isConnected || !stxAddress || !dbUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Load categories and tasks
        const [categoriesData, tasksData, userTasksData] = await Promise.all([
          DatabaseService.getTaskCategories(),
          DatabaseService.getTasks(),
          DatabaseService.getUserTasks(dbUser.id)
        ]);

        console.log('📊 Loaded data:', {
          categories: categoriesData?.length || 0,
          availableTasks: tasksData?.length || 0,
          userTasks: userTasksData?.length || 0
        });

        // Debug: Check which tasks are progressive
        console.log('🔍 Task types:', tasksData?.map(task => ({
          title: task.title,
          task_type: task.task_type,
          max_progress: task.max_progress,
          progress_unit: task.progress_unit
        })));
        
        setCategories(categoriesData || []);
        setAvailableTasks(tasksData || []);
        setUserTasks(userTasksData || []);
      } catch (error) {
        console.error('Error loading tasks data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasksData();
  }, [isConnected, stxAddress, dbUser]);

  // Helper functions
  const isTaskStarted = (taskId: string) => {
    return userTasks.some(ut => ut.task_id === taskId);
  };

  const startTask = async (taskId: string) => {
    if (!dbUser || !isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      const result = await DatabaseService.addTaskToUser(dbUser.id, taskId);
      
      if (result) {
        alert('✅ Task started! You can now track this habit daily.');
        
        // Reload user tasks
        const userTasksData = await DatabaseService.getUserTasks(dbUser.id);
        setUserTasks(userTasksData || []);
      }
    } catch (error) {
      console.error('Error starting task:', error);
      alert('Failed to start task. Please try again.');
    }
  };

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
            // Show progress update with nice formatting
            const progressText = getProgressText(task, result.current_progress, result.max_progress);
            showProgressUpdate(task, progressText, result.current_progress, result.max_progress);
          }
          
          // Reload user tasks
          const userTasksData = await DatabaseService.getUserTasks(dbUser.id);
          setUserTasks(userTasksData || []);
        }
      } else {
        // Single completion task
        const result = await DatabaseService.completeTask(dbUser.id, task.id);
        
        if (result) {
          showCompletionPopup(task, result.achiv_earned, result.xp_earned);
          
          // Reload user tasks
          const userTasksData = await DatabaseService.getUserTasks(dbUser.id);
          setUserTasks(userTasksData || []);
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

  const filteredTasks = selectedCategory === 'all' 
    ? availableTasks 
    : availableTasks.filter(task => task.task_categories?.slug === selectedCategory);



  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Tasks - Achivio</title>
        <meta name="description" content="Complete daily tasks and earn rewards" />
      </Head>

      <ResponsiveContainer>
        <MobileLayout>
          <LogoHeader />
          <div className="px-4 pt-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Daily Quests 🎯</h1>
            <p className="text-blue-200">Complete tasks to earn ACHIV tokens and XP</p>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category.slug
                      ? `bg-gradient-to-r ${category.color_gradient} text-gray-900 shadow-lg scale-105`
                      : 'bg-white/60 border border-gray-200 text-gray-600 hover:bg-white/80 shadow-sm'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Task Cards */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-2">No tasks found</p>
                <p className="text-sm text-gray-500">
                  Available tasks: {availableTasks.length}, 
                  Selected category: {selectedCategory}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const taskStarted = isTaskStarted(task.id);
              
              return (
                <div
                  key={task.id}
                  className={`bg-white/80 backdrop-blur-xl rounded-3xl p-5 border-2 transition-all duration-300 transform shadow-lg ${
                    taskStarted 
                      ? 'border-blue-400/50' 
                      : 'border-gray-200 hover:scale-102 hover:border-gray-300 active:scale-98'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Task Icon & Status */}
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${task.color_gradient} flex items-center justify-center text-2xl ${
                        taskStarted ? 'shadow-lg' : 'opacity-75'
                      }`}>
                        {taskStarted ? '🎯' : task.icon}
                      </div>
                      
                      {/* Status Badge */}
                      {taskStarted && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          Started
                        </div>
                      )}
                    </div>
                    
                    {/* Task Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-white">
                          {task.title}
                        </h3>
                          <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(task.difficulty)}`}>
                              {task.difficulty}
                            </div>
                          </div>
                      </div>
                      
                      <p className="text-sm mb-3 text-gray-600">
                        {task.description}
                      </p>
                      
                      {/* Task Meta Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600">
                            ⏱️ {task.time_estimate}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 text-yellow-400">
                            <span className="text-sm font-bold">+{task.reward_xp}</span>
                            <span className="text-xs">XP</span>
                          </div>
                          <div className="flex items-center space-x-1 text-green-400">
                            <span className="text-sm font-bold">+{task.reward_achiv}</span>
                            <span className="text-xs">ACHIV</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar for Progressive Tasks */}
                      {taskStarted && task.task_type === 'progressive' && (
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Daily Progress</span>
                            <span className="text-xs font-bold text-blue-600">
                              {/* Get current progress from userTasks */}
                              {userTasks.find(ut => ut.task_id === task.id)?.daily_progress || 0}/{task.max_progress} {task.progress_unit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, ((userTasks.find(ut => ut.task_id === task.id)?.daily_progress || 0) / task.max_progress) * 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex justify-end">
                        {taskStarted ? (
                          <button
                            onClick={() => handleTaskProgress(task)}
                            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                              task.task_type === 'progressive' 
                                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            {task.task_type === 'progressive' 
                              ? `➕ +${getProgressAmount(task)} ${task.progress_unit}` 
                              : '✅ Complete Today'
                            }
                          </button>
                        ) : (
                          <button
                            onClick={() => startTask(task.id)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                          >
                            🚀 Start Tracking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
              })
            )}
          </div>

          {/* Add New Task Button */}
          <div className="mt-8 pb-6">
            <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
              ➕ Create Custom Task
            </button>
          </div>
        </div>
        </MobileLayout>
      </ResponsiveContainer>
    </ProtectedRoute>
  );
}
