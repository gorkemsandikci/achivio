import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Badge {
  id: number;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  requirement: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  image: string;
}

const Achievements: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCelebration, setShowCelebration] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  const categories = [
    { id: 'all', name: 'All Badges', icon: '🏆' },
    { id: 'streak', name: 'Streak Master', icon: '🔥' },
    { id: 'tasks', name: 'Task Expert', icon: '✅' },
    { id: 'social', name: 'Social Star', icon: '👥' },
    { id: 'special', name: 'Special Events', icon: '⭐' }
  ];

  const badges: Badge[] = [
    {
      id: 1,
      name: "Week Warrior",
      description: "Complete tasks for 7 consecutive days",
      rarity: "common",
      category: "streak",
      requirement: "7-day streak",
      earned: true,
      earnedDate: "2024-09-15",
      image: "/assets/images/animated_fire_streak_counter.jpg"
    },
    {
      id: 2,
      name: "Fortnight Fighter",
      description: "Maintain a 14-day habit streak",
      rarity: "rare",
      category: "streak", 
      requirement: "14-day streak",
      earned: false,
      progress: 7,
      maxProgress: 14,
      image: "/assets/images/achievement-badges.jpg"
    },
    {
      id: 3,
      name: "Century Champion",
      description: "Complete 100 total tasks",
      rarity: "epic",
      category: "tasks",
      requirement: "100 tasks completed",
      earned: false,
      progress: 42,
      maxProgress: 100,
      image: "/assets/images/milestone_celebration.jpg"
    },
    {
      id: 4,
      name: "Annual Achiever", 
      description: "Maintain a full year streak",
      rarity: "legendary",
      category: "streak",
      requirement: "365-day streak",
      earned: false,
      progress: 7,
      maxProgress: 365,
      image: "/assets/images/achievement_unlock_animation.jpg"
    },
    {
      id: 5,
      name: "Social Butterfly",
      description: "Share 10 achievements on social media",
      rarity: "rare",
      category: "social",
      requirement: "10 social shares",
      earned: true,
      earnedDate: "2024-09-10",
      image: "/assets/images/social_sharing_card.jpg"
    },
    {
      id: 6,
      name: "First Steps",
      description: "Complete your very first task",
      rarity: "common",
      category: "tasks",
      requirement: "Complete 1 task",
      earned: true,
      earnedDate: "2024-08-20",
      image: "/assets/images/success_illustration.jpg"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-300';
      case 'epic': return 'border-purple-300';
      case 'legendary': return 'border-yellow-300';
      default: return 'border-gray-300';
    }
  };

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory);

  const earnedBadges = badges.filter(badge => badge.earned);
  const totalBadges = badges.length;
  const completionPercentage = Math.round((earnedBadges.length / totalBadges) * 100);

  // Simulate badge unlock animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showCelebration) {
        const unlockedBadge = badges.find(badge => badge.id === 2 && !badge.earned);
        if (unlockedBadge) {
          setNewBadge(unlockedBadge);
          setShowCelebration(true);
        }
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="achievements min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      {/* Header */}
      <div className="relative mb-8 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/achievement-badges.jpg"
            alt="Achievement Background"
            fill
            className="object-cover opacity-20"
          />
        </div>
        
        <div className="relative z-10 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">🏆 Achievement Gallery</h1>
            <p className="text-purple-100 text-lg">Showcase your habit mastery with NFT badges</p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Progress</h2>
            <p className="text-gray-600">Collect all badges to become a Habit Master!</p>
          </div>
          
          <div className="mt-4 md:mt-0 text-center">
            <div className="text-3xl font-bold text-purple-600">{earnedBadges.length}/{totalBadges}</div>
            <div className="text-sm text-gray-500">Badges Collected</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
            style={{width: `${completionPercentage}%`}}
          ></div>
        </div>
        <div className="text-center text-sm text-gray-600">{completionPercentage}% Complete</div>
      </div>

      {/* Category Filter */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📂 Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {filteredBadges.map((badge) => (
          <div 
            key={badge.id} 
            className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${getRarityBorder(badge.rarity)} ${
              badge.earned ? 'hover:scale-105' : 'opacity-60'
            } transition-all duration-300`}
          >
            {/* Badge Image */}
            <div className="relative h-48">
              <Image
                src={badge.image}
                alt={badge.name}
                fill
                className="object-cover"
              />
              
              {/* Rarity Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${getRarityColor(badge.rarity)} opacity-20`}></div>
              
              {/* Earned Status */}
              {badge.earned && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  ✓ Earned
                </div>
              )}
              
              {/* Rarity Badge */}
              <div className="absolute top-2 left-2">
                <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white font-semibold`}>
                  {badge.rarity.toUpperCase()}
                </span>
              </div>
            </div>
            
            {/* Badge Info */}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{badge.description}</p>
              
              <div className="text-xs text-gray-500 mb-3">
                📋 {badge.requirement}
              </div>
              
              {badge.earned ? (
                <div className="text-green-600 font-semibold text-sm">
                  🎉 Earned on {badge.earnedDate}
                </div>
              ) : (
                badge.progress !== undefined && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{badge.progress}/{badge.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{width: `${((badge.progress || 0) / (badge.maxProgress || 1)) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{badges.filter(b => b.earned && b.rarity === 'common').length}</div>
          <div className="text-sm text-gray-500">Common Badges</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{badges.filter(b => b.earned && b.rarity === 'rare').length}</div>
          <div className="text-sm text-gray-500">Rare Badges</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{badges.filter(b => b.earned && b.rarity === 'epic').length}</div>
          <div className="text-sm text-gray-500">Epic Badges</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{badges.filter(b => b.earned && b.rarity === 'legendary').length}</div>
          <div className="text-sm text-gray-500">Legendary Badges</div>
        </div>
      </div>

      {/* Achievement Celebration Modal */}
      {showCelebration && newBadge && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-bounce">
            <div className="mb-6">
              <Image
                src="/assets/images/achievement_unlock_animation.jpg"
                alt="Achievement Unlocked"
                width={200}
                height={200}
                className="mx-auto rounded-xl"
              />
            </div>
            
            <h2 className="text-3xl font-bold text-purple-600 mb-2">🎉 Achievement Unlocked!</h2>
            <h3 className="text-xl font-semibold mb-2">{newBadge.name}</h3>
            <p className="text-gray-600 mb-4">{newBadge.description}</p>
            
            <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getRarityColor(newBadge.rarity)} text-white font-semibold mb-6`}>
              {newBadge.rarity.toUpperCase()} BADGE
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => setShowCelebration(false)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Awesome! 🚀
              </button>
              
              <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300">
                Share Achievement 📱
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next Achievements Preview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">🎯 Coming Up Next</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.filter(badge => !badge.earned && badge.progress !== undefined).slice(0, 2).map((badge) => (
            <div key={badge.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 relative">
                <Image
                  src={badge.image}
                  alt={badge.name}
                  fill
                  className="rounded-lg object-cover opacity-60"
                />
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold">{badge.name}</h4>
                <div className="text-sm text-gray-600 mb-2">{badge.requirement}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    style={{width: `${((badge.progress || 0) / (badge.maxProgress || 1)) * 100}%`}}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {badge.progress}/{badge.maxProgress} ({Math.round(((badge.progress || 0) / (badge.maxProgress || 1)) * 100)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
