import Head from 'next/head';
import Image from 'next/image';
import MobileLayout from '../components/MobileLayout';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Achievements() {
  return (
    <ProtectedRoute>
      <AchievementsContent />
    </ProtectedRoute>
  );
}

function AchievementsContent() {
  const badges = [
    {
      id: 1,
      name: "Week Warrior",
      description: "Complete tasks for 7 consecutive days",
      rarity: "common",
      earned: true,
      earnedDate: "2024-09-15",
      image: "/assets/images/animated_fire_streak_counter.jpg"
    },
    {
      id: 2,
      name: "Fortnight Fighter",
      description: "Maintain a 14-day habit streak",
      rarity: "rare",
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
      earned: false,
      progress: 7,
      maxProgress: 365,
      image: "/assets/images/achievement_unlock_animation.jpg"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'border-gray-300 bg-gray-100';
      case 'rare': return 'border-blue-300 bg-blue-100';
      case 'epic': return 'border-purple-300 bg-purple-100';
      case 'legendary': return 'border-yellow-300 bg-yellow-100';
      default: return 'border-gray-300 bg-gray-100';
    }
  };

  const earnedBadges = badges.filter(badge => badge.earned);
  const totalBadges = badges.length;
  const completionPercentage = Math.round((earnedBadges.length / totalBadges) * 100);

  return (
    <>
      <Head>
        <title>Achievements - Achivio</title>
        <meta name="description" content="Your NFT achievement badges and progress" />
      </Head>

      <MobileLayout>
        <div className="px-4 pt-4">
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
          
          <div className="relative z-10 bg-gradient-to-r from-purple-500 to-pink-600 text-gray-900 p-8">
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

        {/* Badge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {badges.map((badge) => (
            <div 
              key={badge.id} 
              className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${getRarityColor(badge.rarity)} ${
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
                
                {/* Earned Status */}
                {badge.earned && (
                  <div className="absolute top-2 right-2 bg-green-500 text-gray-900 text-xs px-2 py-1 rounded-full">
                    ✓ Earned
                  </div>
                )}
                
                {/* Rarity Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(badge.rarity)} font-semibold`}>
                    {badge.rarity.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* Badge Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{badge.description}</p>
                
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

        </div>
      </MobileLayout>
    </>
  );
}
