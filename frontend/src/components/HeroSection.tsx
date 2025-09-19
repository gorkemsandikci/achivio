import React from 'react';
import Image from 'next/image';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/main_hero.jpg"
          alt="Achivio - Blockchain Habit Tracker Hero"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        <div className="mb-8">
          <Image
            src="/assets/images/3d_rendered_crypto_tokens.jpg"
            alt="ACHIV Crypto Tokens"
            width={200}
            height={200}
            className="mx-auto rounded-full shadow-2xl mb-6 animate-pulse"
          />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
          Achivio
        </h1>
        
        <p className="text-2xl md:text-3xl mb-4 font-semibold">
          Where Habits Meet Blockchain Innovation
        </p>
        
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
          Transform your daily habits into blockchain rewards. Earn ACHIV tokens, collect NFT badges, 
          and customize your 3D virtual workspace. The future of motivational habit tracking is here!
        </p>
        
        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="mb-4 text-4xl">🔥</div>
            <h3 className="text-xl font-bold mb-2">Streak Rewards</h3>
            <p className="text-sm opacity-80">
              Build consecutive day streaks and earn multiplied ACHIV token bonuses
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="mb-4 text-4xl">🏆</div>
            <h3 className="text-xl font-bold mb-2">NFT Badges</h3>
            <p className="text-sm opacity-80">
              Unlock rare NFT achievement badges for reaching milestones
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="mb-4 text-4xl">🏠</div>
            <h3 className="text-xl font-bold mb-2">3D Rooms</h3>
            <p className="text-sm opacity-80">
              Customize your virtual workspace with earned furniture NFTs
            </p>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
            Start Your Journey 🚀
          </button>
          
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 border border-white/30">
            View Demo 📱
          </button>
        </div>
        
        {/* Stats Preview */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-yellow-400">10M+</div>
            <div className="text-sm opacity-80">ACHIV Tokens</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">1000+</div>
            <div className="text-sm opacity-80">Daily Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">50K+</div>
            <div className="text-sm opacity-80">Tasks Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400">500+</div>
            <div className="text-sm opacity-80">NFT Badges</div>
          </div>
        </div>
      </div>
      
      {/* Floating Success Illustration */}
      <div className="absolute bottom-10 right-10 hidden lg:block">
        <div className="w-24 h-24 bg-green-400 rounded-xl opacity-60 animate-bounce flex items-center justify-center text-3xl">
          ✨
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
