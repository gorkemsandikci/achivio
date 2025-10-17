import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import MobileLayout from '../components/MobileLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import ResponsiveContainer from '../components/ResponsiveContainer';
import LogoHeader from '../components/LogoHeader';
import { useWallet } from '../contexts/WalletContext';

export default function Rewards() {
  return (
    <ProtectedRoute>
      <ResponsiveContainer>
        <MobileLayout>
          <LogoHeader />
          <RewardsContent />
        </MobileLayout>
      </ResponsiveContainer>
    </ProtectedRoute>
  );
}

function RewardsContent() {
  const { isConnected, stxAddress } = useWallet();
  const [selectedTab, setSelectedTab] = useState('tokens');
  const [mintingBadge, setMintingBadge] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const mintNFTBadge = async (badgeId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    setMintingBadge(badgeId.toString());
    
    try {
      // Simulate NFT minting process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      alert('🎉 NFT Badge successfully minted! \n\nYour badge is now available in your 3D room as a decorative item!');
      
    } catch (error) {
      alert('❌ Minting failed. Please try again.');
    } finally {
      setMintingBadge(null);
    }
  };

  const tokenStats = {
    balance: 24.5,
    todayEarned: 6.2,
    weeklyEarned: 45.8,
    totalEarned: 342.7
  };

  const badges = [
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first habit",
      rarity: "Common",
      earned: true,
      earnedDate: "2024-09-01",
      image: "/assets/images/success_illustration.jpg",
      unlocks: ["Basic Room Theme"],
      color: "from-gray-400 to-gray-600"
    },
    {
      id: 2,
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      rarity: "Rare",
      earned: true,
      earnedDate: "2024-09-15",
      image: "/assets/images/animated_fire_streak_counter.jpg",
      unlocks: ["Fire Theme", "Streak Multiplier x1.2"],
      color: "from-blue-400 to-indigo-600"
    },
    {
      id: 3,
      name: "Fitness Master",
      description: "Complete 50 fitness tasks",
      rarity: "Epic",
      earned: false,
      progress: 32,
      maxProgress: 50,
      image: "/assets/images/milestone_celebration.jpg",
      unlocks: ["Gym Room", "Workout Equipment NFTs"],
      color: "from-purple-400 to-pink-600"
    },
    {
      id: 4,
      name: "Legendary Achiever",
      description: "Maintain a 365-day streak",
      rarity: "Legendary",
      earned: false,
      progress: 7,
      maxProgress: 365,
      image: "/assets/images/achievement_unlock_animation.jpg",
      unlocks: ["Golden Room", "Exclusive Avatar", "VIP Status"],
      color: "from-yellow-400 to-orange-500"
    }
  ];

  const recentTransactions = [
    { type: 'earned', amount: 2.5, task: 'Morning Workout', time: '2 hours ago' },
    { type: 'earned', amount: 1.8, task: 'Reading Session', time: '4 hours ago' },
    { type: 'spent', amount: -5.0, task: 'Bought Desk NFT', time: '1 day ago' },
    { type: 'earned', amount: 3.2, task: 'Code Practice', time: '1 day ago' },
  ];

  const getRarityGlow = (rarity: string) => {
    switch(rarity) {
      case 'Common': return 'shadow-gray-400/50';
      case 'Rare': return 'shadow-blue-400/50';
      case 'Epic': return 'shadow-purple-400/50';
      case 'Legendary': return 'shadow-yellow-400/50';
      default: return 'shadow-gray-400/50';
    }
  };

  return (
    <>
      <Head>
        <title>Rewards - Achivio</title>
        <meta name="description" content="View your earned tokens and NFT badges" />
      </Head>

      <MobileLayout>
        <div className="px-4 pt-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Rewards 💎</h1>
            <p className="text-blue-200">Your earned tokens and achievement badges</p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-white/80 rounded-2xl p-1 mb-6 border border-gray-200 shadow-lg">
            <button
              onClick={() => setSelectedTab('tokens')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === 'tokens'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-gray-600'
              }`}
            >
              💰 Tokens
            </button>
            <button
              onClick={() => setSelectedTab('badges')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedTab === 'badges'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-gray-600'
              }`}
            >
              🏆 NFT Badges
            </button>
          </div>

          {selectedTab === 'tokens' ? (
            <div>
              {/* Token Balance Card */}
              <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl p-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Total Balance</p>
                      <h2 className="text-4xl font-bold text-white">{tokenStats.balance}</h2>
                      <p className="text-white/90">ACHIV Tokens</p>
                    </div>
                    <div className="w-16 h-16 relative">
                      <Image
                        src="/assets/images/3d_rendered_crypto_tokens.jpg"
                        alt="ACHIV Token"
                        fill
                        className="rounded-full"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-white text-lg font-bold">+{tokenStats.todayEarned}</div>
                      <div className="text-blue-200 text-xs">Today</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white text-lg font-bold">+{tokenStats.weeklyEarned}</div>
                      <div className="text-blue-200 text-xs">This Week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white text-lg font-bold">{tokenStats.totalEarned}</div>
                      <div className="text-blue-200 text-xs">All Time</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                
                <div className="space-y-3">
                  {recentTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'earned' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                        }`}>
                          {tx.type === 'earned' ? '↗️' : '↙️'}
                        </div>
                        <div>
                          <div className="text-gray-900 font-medium">{tx.task}</div>
                          <div className="text-gray-900/60 text-sm">{tx.time}</div>
                        </div>
                      </div>
                      <div className={`font-bold ${tx.type === 'earned' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'earned' ? '+' : ''}{tx.amount} ACHIV
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Badge Collection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`bg-white/90 backdrop-blur-xl rounded-3xl p-4 border-2 transition-all duration-300 transform hover:scale-105 ${
                      badge.earned 
                        ? `border-gray-300 ${getRarityGlow(badge.rarity)} shadow-2xl` 
                        : 'border-gray-200 opacity-60'
                    } shadow-lg`}
                  >
                    <div className="relative mb-3">
                      <div className="w-full h-32 relative rounded-2xl overflow-hidden border border-gray-200">
                        <Image
                          src={badge.image}
                          alt={badge.name}
                          fill
                          className="object-cover"
                        />
                        {badge.earned && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        )}
                      </div>
                      
                      {/* Rarity Badge */}
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${badge.color} text-gray-900`}>
                        {badge.rarity}
                      </div>
                      
                      {/* Earned Status */}
                      {badge.earned && (
                        <div className="absolute top-2 right-2 bg-green-500 text-gray-900 text-xs px-2 py-1 rounded-full font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-gray-900 font-bold text-sm mb-1">{badge.name}</h3>
                    <p className="text-gray-600 text-xs mb-2">{badge.description}</p>
                    
                    {!badge.earned && badge.progress !== undefined && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-900/60 mb-1">
                          <span>Progress</span>
                          <span>{badge.progress}/{badge.maxProgress}</span>
                        </div>
                        <div className="bg-white/20 rounded-full h-1.5">
                          <div 
                            className={`bg-gradient-to-r ${badge.color} h-1.5 rounded-full transition-all duration-500`}
                            style={{width: `${(badge.progress / badge.maxProgress) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Mint NFT Button */}
                    {badge.earned && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          mintNFTBadge(badge.id);
                        }}
                        disabled={mintingBadge === badge.id.toString()}
                        className="w-full mt-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-gray-900 text-xs font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50"
                      >
                        {mintingBadge === badge.id.toString() ? '🔄 Minting...' : '🎨 Mint NFT'}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Collection Stats */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Collection Stats</h3>
                
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-400">{badges.filter(b => b.earned && b.rarity === 'Common').length}</div>
                    <div className="text-xs text-gray-900/60">Common</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{badges.filter(b => b.earned && b.rarity === 'Rare').length}</div>
                    <div className="text-xs text-gray-900/60">Rare</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{badges.filter(b => b.earned && b.rarity === 'Epic').length}</div>
                    <div className="text-xs text-gray-900/60">Epic</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{badges.filter(b => b.earned && b.rarity === 'Legendary').length}</div>
                    <div className="text-xs text-gray-900/60">Legendary</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Badge Detail Modal */}
          {selectedBadge && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 max-w-sm w-full border border-gray-200 shadow-lg">
                <div className="relative mb-4">
                  <div className="w-full h-48 relative rounded-2xl overflow-hidden">
                    <Image
                      src={selectedBadge.image}
                      alt={selectedBadge.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${selectedBadge.color} text-gray-900`}>
                    {selectedBadge.rarity}
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedBadge.name}</h2>
                <p className="text-gray-600 mb-4">{selectedBadge.description}</p>
                
                {selectedBadge.earned ? (
                  <div className="mb-4">
                    <div className="text-green-400 font-semibold mb-2">🎉 Earned on {selectedBadge.earnedDate}</div>
                    <div className="text-gray-600 text-sm">
                      <strong>Unlocks:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {selectedBadge.unlocks.map((unlock: string, index: number) => (
                          <li key={index}>{unlock}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="text-yellow-400 font-semibold mb-2">🎯 In Progress</div>
                    {selectedBadge.progress !== undefined && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress: {selectedBadge.progress}/{selectedBadge.maxProgress}</span>
                          <span>{Math.round((selectedBadge.progress / selectedBadge.maxProgress) * 100)}%</span>
                        </div>
                        <div className="bg-white/20 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${selectedBadge.color} h-2 rounded-full transition-all duration-500`}
                            style={{width: `${(selectedBadge.progress / selectedBadge.maxProgress) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <button 
                  onClick={() => setSelectedBadge(null)}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-gray-900 font-bold py-3 rounded-2xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </MobileLayout>
    </>
  );
}
