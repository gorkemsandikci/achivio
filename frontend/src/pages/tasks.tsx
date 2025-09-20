import React, { useState } from 'react';
import Head from 'next/head';
import MobileLayout from '../components/MobileLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useWallet } from '../contexts/WalletContext';

export default function Tasks() {
  const { isConnected, stxAddress } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [completedTasks, setCompletedTasks] = useState<number[]>([1, 2]);
  const [earnedTokens, setEarnedTokens] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  const categories = [
    { id: 'all', name: 'All', icon: '📋', color: 'from-gray-400 to-gray-600' },
    { id: 'fitness', name: 'Fitness', icon: '🏋️', color: 'from-red-400 to-pink-500' },
    { id: 'learning', name: 'Learning', icon: '📚', color: 'from-blue-400 to-indigo-500' },
    { id: 'wellness', name: 'Wellness', icon: '🧘', color: 'from-green-400 to-teal-500' },
    { id: 'skills', name: 'Skills', icon: '💻', color: 'from-purple-400 to-indigo-500' },
  ];

  const tasks = [
    {
      id: 1,
      title: "Morning Workout",
      description: "30 minutes of cardio or strength training",
      category: 'fitness',
      difficulty: 'Medium',
      reward: 150,
      xp: 50,
      streak: 7,
      icon: '🏋️',
      color: 'from-red-400 to-pink-500',
      timeEstimate: '30 min'
    },
    {
      id: 2,
      title: "Read Educational Content",
      description: "Read for 30 minutes to expand knowledge",
      category: 'learning',
      difficulty: 'Easy',
      reward: 100,
      xp: 40,
      streak: 5,
      icon: '📚',
      color: 'from-blue-400 to-indigo-500',
      timeEstimate: '30 min'
    },
    {
      id: 3,
      title: "Meditation Session",
      description: "10 minutes of mindfulness meditation",
      category: 'wellness',
      difficulty: 'Easy',
      reward: 80,
      xp: 30,
      streak: 0,
      icon: '🧘',
      color: 'from-green-400 to-teal-500',
      timeEstimate: '10 min'
    },
    {
      id: 4,
      title: "Code Practice",
      description: "Practice coding for skill improvement",
      category: 'skills',
      difficulty: 'Hard',
      reward: 200,
      xp: 75,
      streak: 3,
      icon: '💻',
      color: 'from-purple-400 to-indigo-500',
      timeEstimate: '45 min'
    },
    {
      id: 5,
      title: "Drink 8 Glasses Water",
      description: "Stay hydrated throughout the day",
      category: 'wellness',
      difficulty: 'Easy',
      reward: 60,
      xp: 25,
      streak: 2,
      icon: '💧',
      color: 'from-cyan-400 to-blue-500',
      timeEstimate: 'All day'
    },
    {
      id: 6,
      title: "Evening Walk",
      description: "20-minute walk in nature or neighborhood",
      category: 'fitness',
      difficulty: 'Easy',
      reward: 90,
      xp: 35,
      streak: 1,
      icon: '🚶',
      color: 'from-orange-400 to-red-500',
      timeEstimate: '20 min'
    }
  ];

  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  const completeTask = async (taskId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task || completedTasks.includes(taskId)) return;

    // Mark task as completed
    setCompletedTasks(prev => [...prev, taskId]);
    setEarnedTokens(prev => prev + task.reward);

    // Check for badge earning (example: complete 5 tasks)
    const newCompletedCount = completedTasks.length + 1;
    if (newCompletedCount === 5 && !earnedBadges.includes('first-badge')) {
      setEarnedBadges(prev => [...prev, 'first-badge']);
      
      // Show celebration
      alert('🎉 Congratulations! You earned your first NFT Badge: "Task Master"! \n\nYou can now mint this as an NFT and use it in your 3D room!');
    }

    // Show reward notification
    alert(`✅ Task completed! \n+${task.reward} ACHIV tokens \n+${task.xp} XP`);
  };


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

      <MobileLayout>
        <div className="px-4 pt-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Quests 🎯</h1>
            <p className="text-gray-600">Complete tasks to earn ACHIV tokens and XP</p>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-gray-900 shadow-lg scale-105`
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
            {filteredTasks.map((task) => {
              const isCompleted = completedTasks.includes(task.id);
              
              return (
                <div
                  key={task.id}
                  className={`bg-white/80 backdrop-blur-xl rounded-3xl p-5 border-2 transition-all duration-300 transform shadow-lg ${
                    isCompleted 
                      ? 'border-green-400/50 scale-98 opacity-75' 
                      : 'border-gray-200 hover:scale-102 hover:border-gray-300 active:scale-98'
                  }`}
                  onClick={() => !isCompleted && completeTask(task.id)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Task Icon & Status */}
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${task.color} flex items-center justify-center text-2xl ${
                        isCompleted ? 'opacity-50' : 'shadow-lg'
                      }`}>
                        {isCompleted ? '✅' : task.icon}
                      </div>
                      
                      {/* Streak Badge */}
                      {task.streak > 0 && !isCompleted && (
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-gray-900 text-xs px-2 py-1 rounded-full font-bold">
                          {task.streak}🔥
                        </div>
                      )}
                    </div>
                    
                    {/* Task Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-bold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        {!isCompleted && (
                          <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(task.difficulty)}`}>
                              {task.difficulty}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <p className={`text-sm mb-3 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                      
                      {/* Task Meta Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                            ⏱️ {task.timeEstimate}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center space-x-1 ${isCompleted ? 'text-gray-400' : 'text-yellow-400'}`}>
                            <span className="text-sm font-bold">+{task.xp}</span>
                            <span className="text-xs">XP</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${isCompleted ? 'text-gray-400' : 'text-green-400'}`}>
                            <span className="text-sm font-bold">+{task.reward}</span>
                            <span className="text-xs">ACHIV</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar for Completed Tasks */}
                      {isCompleted && (
                        <div className="mt-3">
                          <div className="bg-green-400/20 rounded-full h-2">
                            <div className="bg-green-400 h-2 rounded-full w-full transition-all duration-1000"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Completion Glow Effect */}
                  {isCompleted && (
                    <div className="absolute inset-0 bg-green-400/5 rounded-3xl pointer-events-none"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Task Button */}
          <div className="mt-8 pb-6">
            <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-gray-900 py-4 rounded-2xl font-bold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
              ➕ Create Custom Task
            </button>
          </div>
        </div>
      </MobileLayout>
    </ProtectedRoute>
  );
}
