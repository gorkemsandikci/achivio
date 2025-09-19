import React, { useState } from 'react';
import Image from 'next/image';

interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  tasksCompleted: number;
  currentStreak: number;
  badges: number;
  level: number;
  change: number; // +/- rank change
}

const Leaderboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');

  const categories = [
    { id: 'overall', name: 'Overall Score', icon: '🏆' },
    { id: 'streaks', name: 'Longest Streaks', icon: '🔥' },
    { id: 'tasks', name: 'Tasks Completed', icon: '✅' },
    { id: 'rewards', name: 'ACHIV Earned', icon: '💎' },
    { id: 'badges', name: 'Badge Collection', icon: '🏅' }
  ];

  const timeframes = [
    { id: 'daily', name: 'Today' },
    { id: 'weekly', name: 'This Week' },
    { id: 'monthly', name: 'This Month' },
    { id: 'alltime', name: 'All Time' }
  ];

  // Mock leaderboard data
  const leaderboardData: LeaderboardUser[] = [
    {
      rank: 1,
      username: "HabitMaster",
      avatar: "/assets/images/achievement-badges.jpg",
      score: 15420,
      tasksCompleted: 127,
      currentStreak: 23,
      badges: 8,
      level: 5,
      change: 0
    },
    {
      rank: 2,
      username: "StreakWarrior",
      avatar: "/assets/images/animated_fire_streak_counter.jpg",
      score: 14850,
      tasksCompleted: 98,
      currentStreak: 45,
      badges: 6,
      level: 4,
      change: 1
    },
    {
      rank: 3,
      username: "AchievementHunter",
      avatar: "/assets/images/success_illustration.jpg",
      score: 13920,
      tasksCompleted: 156,
      currentStreak: 12,
      badges: 12,
      level: 6,
      change: -1
    },
    {
      rank: 4,
      username: "ProductivityPro",
      avatar: "/assets/images/virtual_room_preview_1.jpg",
      score: 12750,
      tasksCompleted: 89,
      currentStreak: 18,
      badges: 5,
      level: 4,
      change: 2
    },
    {
      rank: 5,
      username: "DailyGrinder",
      avatar: "/assets/images/milestone_celebration.jpg",
      score: 11980,
      tasksCompleted: 134,
      currentStreak: 8,
      badges: 7,
      level: 5,
      change: -1
    }
  ];

  const currentUser = {
    rank: 12,
    username: "You",
    avatar: "/assets/images/3d_rendered_crypto_tokens.jpg",
    score: 8450,
    tasksCompleted: 42,
    currentStreak: 7,
    badges: 4,
    level: 3,
    change: 3
  };

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '➖';
  };

  return (
    <div className="leaderboard min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-4">
      {/* Header with Background */}
      <div className="relative mb-8 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/leaderboard_interface.jpg"
            alt="Leaderboard Background"
            fill
            className="object-cover opacity-20"
          />
        </div>
        
        <div className="relative z-10 bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
            <p className="text-yellow-100 text-lg">Compete with habit champions worldwide!</p>
          </div>
        </div>
      </div>

      {/* Category and Timeframe Selection */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">📊 Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-yellow-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-lg mb-1">{category.icon}</div>
                  <div>{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Timeframes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">⏰ Timeframe</h3>
            <div className="grid grid-cols-2 gap-2">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.id}
                  onClick={() => setSelectedTimeframe(timeframe.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedTimeframe === timeframe.id
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {timeframe.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center mb-6">🏆 Top Champions</h2>
        <div className="flex justify-center items-end space-x-4 mb-8">
          {/* 2nd Place */}
          <div className="text-center">
            <div className="bg-gray-300 rounded-xl p-4 mb-2 h-32 flex flex-col justify-end">
              <div className="w-16 h-16 mx-auto mb-2 relative">
                <Image
                  src={leaderboardData[1].avatar}
                  alt={leaderboardData[1].username}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="text-4xl">🥈</div>
            </div>
            <div className="font-bold">{leaderboardData[1].username}</div>
            <div className="text-sm text-gray-600">{leaderboardData[1].score} pts</div>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div className="bg-yellow-400 rounded-xl p-4 mb-2 h-40 flex flex-col justify-end">
              <div className="w-20 h-20 mx-auto mb-2 relative">
                <Image
                  src={leaderboardData[0].avatar}
                  alt={leaderboardData[0].username}
                  fill
                  className="rounded-full object-cover border-4 border-yellow-600"
                />
              </div>
              <div className="text-5xl">🥇</div>
            </div>
            <div className="font-bold text-lg">{leaderboardData[0].username}</div>
            <div className="text-sm text-gray-600">{leaderboardData[0].score} pts</div>
            <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mt-1">
              👑 Champion
            </div>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <div className="bg-orange-400 rounded-xl p-4 mb-2 h-28 flex flex-col justify-end">
              <div className="w-14 h-14 mx-auto mb-2 relative">
                <Image
                  src={leaderboardData[2].avatar}
                  alt={leaderboardData[2].username}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="text-3xl">🥉</div>
            </div>
            <div className="font-bold">{leaderboardData[2].username}</div>
            <div className="text-sm text-gray-600">{leaderboardData[2].score} pts</div>
          </div>
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">📋 Full Rankings</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badges</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboardData.map((user) => (
                <tr key={user.rank} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl">{getRankIcon(user.rank)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 relative mr-4">
                        <Image
                          src={user.avatar}
                          alt={user.username}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">Level {user.level}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-gray-900">{user.score.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">points</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.tasksCompleted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-orange-600 font-medium">{user.currentStreak} 🔥</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {user.badges} 🏅
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`flex items-center ${getChangeColor(user.change)}`}>
                      {getChangeIcon(user.change)} {Math.abs(user.change)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current User Position */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-xl">
        <h3 className="text-xl font-semibold mb-4">📍 Your Position</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{getRankIcon(currentUser.rank)}</div>
            <div className="text-sm opacity-80">Current Rank</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{currentUser.score.toLocaleString()}</div>
            <div className="text-sm opacity-80">Your Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{currentUser.currentStreak} 🔥</div>
            <div className="text-sm opacity-80">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{currentUser.badges} 🏅</div>
            <div className="text-sm opacity-80">Badges Earned</div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm opacity-80">
            {currentUser.change > 0 ? `↗️ Up ${currentUser.change} positions this week!` : 
             currentUser.change < 0 ? `↘️ Down ${Math.abs(currentUser.change)} positions` :
             '➖ No change in ranking'}
          </div>
          <div className="text-sm opacity-80">
            {leaderboardData[currentUser.rank - 2]?.score - currentUser.score || 0} points to next rank
          </div>
        </div>
      </div>

      {/* Social Sharing */}
      <div className="mt-8 text-center">
        <h3 className="text-lg font-semibold mb-4">📱 Share Your Achievement</h3>
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300">
            Share on Twitter 🐦
          </button>
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300">
            Share on WhatsApp 💬
          </button>
          <button className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-all duration-300">
            Copy Link 🔗
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
