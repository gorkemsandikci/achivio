import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface UserStats {
  tasksCompleted: number;
  currentStreak: number;
  achivBalance: number;
  level: number;
  badges: number;
}

const Dashboard: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    tasksCompleted: 42,
    currentStreak: 7,
    achivBalance: 15.5,
    level: 3,
    badges: 4
  });

  const [showCelebration, setShowCelebration] = useState(false);

  const handleTaskComplete = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
    // Update stats
    setUserStats(prev => ({
      ...prev,
      tasksCompleted: prev.tasksCompleted + 1,
      achivBalance: prev.achivBalance + 2.0
    }));
  };

  return (
    <div className="dashboard min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      {/* Dashboard Header with Background */}
      <div className="relative mb-8 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/dashboard_mockup.jpg"
            alt="Dashboard Background"
            fill
            className="object-cover opacity-10"
          />
        </div>
        
        <div className="relative z-10 bg-gradient-to-r from-green-500 to-blue-600 text-white p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back! 🌟</h1>
              <p className="text-green-100">Ready to achieve your goals today?</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.achivBalance}</div>
                <div className="text-sm text-green-100">ACHIV Tokens</div>
              </div>
              
              <div className="w-16 h-16 relative">
                <Image
                  src="/assets/images/3d_rendered_crypto_tokens.jpg"
                  alt="ACHIV Tokens"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Streak Counter */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Current Streak</h3>
            <div className="w-12 h-12 relative">
              <Image
                src="/assets/images/animated_fire_streak_counter.jpg"
                alt="Streak Fire"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-500 mb-2">
            {userStats.currentStreak} days 🔥
          </div>
          <div className="text-sm text-gray-600">
            Keep it up! Next milestone: 14 days
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tasks Completed</h3>
          <div className="text-3xl font-bold text-green-500 mb-2">
            {userStats.tasksCompleted}
          </div>
          <div className="text-sm text-gray-600">
            Level {userStats.level} • {250 - userStats.tasksCompleted} to next level
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Badges Earned</h3>
            <div className="w-12 h-12 relative">
              <Image
                src="/assets/images/achievement-badges.jpg"
                alt="Achievement Badges"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-500 mb-2">
            {userStats.badges} 🏆
          </div>
          <div className="text-sm text-gray-600">
            Rare: 2 • Epic: 1 • Legendary: 1
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Progress</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Daily Goal</span>
              <span className="text-sm font-semibold">3/5 tasks</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
            </div>
            <div className="text-sm text-gray-600">2 more tasks to complete daily goal</div>
          </div>
        </div>
      </div>

      {/* Progress Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Progress Analytics</h3>
          <div className="relative h-64">
            <Image
              src="/assets/images/progress_charts.jpg"
              alt="Progress Charts"
              fill
              className="rounded-lg object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <div className="text-sm opacity-80">Weekly Progress</div>
              <div className="text-lg font-bold">+23% improvement</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Virtual Room Preview</h3>
          <div className="relative h-64 cursor-pointer hover:scale-105 transition-transform duration-300">
            <Image
              src="/assets/images/virtual_room_preview_1.jpg"
              alt="Virtual Room"
              fill
              className="rounded-lg object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <div className="text-sm opacity-80">Your Workspace</div>
              <div className="text-lg font-bold">Click to customize →</div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-6">Today's Habits</h3>
        
        <div className="space-y-4">
          {[
            { id: 1, title: "Morning Exercise", reward: 2.0, completed: true, category: "Fitness" },
            { id: 2, title: "Read for 30 minutes", reward: 1.5, completed: true, category: "Learning" },
            { id: 3, title: "Meditate", reward: 1.0, completed: true, category: "Wellness" },
            { id: 4, title: "Drink 8 glasses of water", reward: 1.0, completed: false, category: "Health" },
            { id: 5, title: "Practice coding", reward: 3.0, completed: false, category: "Skills" },
          ].map((task) => (
            <div key={task.id} className={`flex items-center justify-between p-4 rounded-lg border-2 ${
              task.completed 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}>
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  onChange={() => !task.completed && handleTaskComplete()}
                  className="w-5 h-5 text-green-500 rounded focus:ring-green-400"
                />
                <div>
                  <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {task.title}
                  </div>
                  <div className="text-sm text-gray-500">{task.category}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-green-600">
                  +{task.reward} ACHIV
                </span>
                {task.completed && <span className="text-green-500">✅</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4 animate-bounce">
            <div className="mb-4">
              <Image
                src="/assets/images/milestone_celebration.jpg"
                alt="Celebration"
                width={200}
                height={200}
                className="mx-auto rounded-xl"
              />
            </div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">🎉 Task Completed!</h3>
            <p className="text-gray-600 mb-4">You earned +2.0 ACHIV tokens!</p>
            <div className="text-sm text-gray-500">Keep up the great work!</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300">
          Add New Habit
        </button>
        
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
          View Leaderboard
        </button>
        
        <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300">
          My Badges
        </button>
        
        <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300">
          Customize Room
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
