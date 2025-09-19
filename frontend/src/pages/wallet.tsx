import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import MobileLayout from '../components/MobileLayout';
import { useWallet } from '../contexts/WalletContext';

export default function Wallet() {
  const { isConnected, stxAddress, userData, connectWallet, disconnectWallet } = useWallet();

  const userStats = {
    level: 3,
    xp: 1247,
    nextLevelXp: 2000,
    totalTasks: 42,
    streak: 7,
    badges: 4,
    joinDate: 'September 2024'
  };

  const achievements = [
    { name: 'First Steps', rarity: 'Common', image: '/assets/images/success_illustration.jpg' },
    { name: 'Week Warrior', rarity: 'Rare', image: '/assets/images/animated_fire_streak_counter.jpg' },
    { name: 'Fitness Master', rarity: 'Epic', image: '/assets/images/milestone_celebration.jpg', locked: true },
    { name: 'Legendary', rarity: 'Legendary', image: '/assets/images/achievement_unlock_animation.jpg', locked: true },
  ];

  return (
    <>
      <Head>
        <title>Profile - Achivio</title>
        <meta name="description" content="Your profile and wallet connection" />
      </Head>

      <MobileLayout>
        <div className="px-4 pt-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile 👤</h1>
            <p className="text-gray-600">Manage your account and wallet connection</p>
          </div>

          {/* Profile Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 relative">
                  <Image
                    src="/assets/images/3d_rendered_crypto_tokens.jpg"
                    alt="Profile Avatar"
                    fill
                    className="rounded-full border-3 border-white/50"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Habit Master</h2>
                  <p className="text-gray-600">Level {userStats.level} Achiever</p>
                  <p className="text-gray-500 text-sm">Joined {userStats.joinDate}</p>
                </div>
              </div>
              
              {/* XP Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-gray-700 text-sm mb-2">
                  <span>Experience</span>
                  <span>{userStats.xp} / {userStats.nextLevelXp} XP</span>
                </div>
                <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(userStats.xp / userStats.nextLevelXp) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="text-center">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-2xl font-bold text-gray-900">{userStats.streak}</div>
                <div className="text-gray-600 text-sm">Day Streak</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold text-gray-900">{userStats.totalTasks}</div>
                <div className="text-gray-600 text-sm">Tasks Done</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-2xl font-bold text-gray-900">{userStats.badges}</div>
                <div className="text-gray-600 text-sm">NFT Badges</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="text-center">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-gray-900">{userStats.level}</div>
                <div className="text-gray-600 text-sm">Level</div>
              </div>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🔗 Wallet Connection</h3>
            
            {isConnected ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-gray-900 font-medium">Connected</div>
                    <div className="text-gray-500 text-sm font-mono">
                      {stxAddress ? `${stxAddress.slice(0, 8)}...${stxAddress.slice(-4)}` : 'Loading...'}
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-2xl p-4 text-center">
                    <div className="text-lg font-bold text-green-400">24.5</div>
                    <div className="text-gray-500 text-sm">ACHIV Tokens</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 text-center">
                    <div className="text-lg font-bold text-purple-400">4</div>
                    <div className="text-gray-500 text-sm">NFT Badges</div>
                  </div>
                </div>
                
                <button 
                  onClick={disconnectWallet}
                  className="w-full bg-red-500/20 text-red-400 border border-red-400/30 py-3 rounded-2xl font-semibold hover:bg-red-500/30 transition-all duration-300"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">Connect your Stacks wallet to earn and manage your ACHIV tokens and NFT badges.</p>
                
                <div className="space-y-3">
                  <button 
                    onClick={connectWallet}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-gray-900 font-bold py-4 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
                  >
                    🔗 Connect to Stacks Testnet
                  </button>
                  
                  <p className="text-center text-gray-400 text-sm">
                    Connect your Hiro Wallet, Xverse, or other Stacks wallet to testnet
                  </p>
                  
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-blue-400">ℹ️</span>
                      <span className="text-blue-400 font-semibold">Testnet Connection</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      This app connects to Stacks Testnet. After connecting, you'll be redirected to the dashboard to start earning ACHIV tokens and NFT badges.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Achievement Preview */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Recent Achievements</h3>
            
            <div className="grid grid-cols-4 gap-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="relative">
                  <div className={`w-full aspect-square rounded-2xl overflow-hidden ${
                    achievement.locked ? 'opacity-30' : ''
                  }`}>
                    <Image
                      src={achievement.image}
                      alt={achievement.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {achievement.locked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-2xl">🔒</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-900 mb-4">⚙️ Settings</h3>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl text-gray-900 hover:bg-white/10 transition-all duration-300">
                <span>🔔 Notifications</span>
                <span className="text-gray-500">→</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl text-gray-900 hover:bg-white/10 transition-all duration-300">
                <span>🎨 Theme</span>
                <span className="text-gray-500">→</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl text-gray-900 hover:bg-white/10 transition-all duration-300">
                <span>📊 Export Data</span>
                <span className="text-gray-500">→</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl text-gray-900 hover:bg-white/10 transition-all duration-300">
                <span>❓ Help & Support</span>
                <span className="text-gray-500">→</span>
              </button>
            </div>
          </div>
        </div>
      </MobileLayout>
    </>
  );
}
