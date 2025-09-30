import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section bg-white min-h-screen flex items-center justify-center relative overflow-hidden">
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
      <div className="relative z-10 text-center text-gray-900 px-4 max-w-6xl mx-auto">
        <div>
          <Image
            src="/assets/images/logo-achivio.png"
            alt="Achivio Logo"
            width={500}
            height={500}
            className="mx-auto"
          />
        </div>
        
        <p className="text-xl md:text-2xl mb-4 font-medium text-gray-700">
          Where Habits Meet Blockchain Innovation
        </p>
        
        <p className="text-base md:text-lg mb-8 max-w-3xl mx-auto text-gray-600">
          Transform your daily habits into blockchain rewards. Earn ACHIV tokens, collect NFT badges, 
          and customize your 3D virtual workspace. The future of motivational habit tracking is here!
        </p>
        
        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="mb-4 text-4xl">🔥</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Streak Rewards</h3>
            <p className="text-sm text-gray-600">
              Build consecutive day streaks and earn multiplied ACHIV token bonuses
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="mb-4 text-4xl">🏆</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">NFT Badges</h3>
            <p className="text-sm text-gray-600">
              Unlock rare NFT achievement badges for reaching milestones
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="mb-4 text-4xl">🏠</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">3D Rooms</h3>
            <p className="text-sm text-gray-600">
              Customize your virtual workspace with earned furniture NFTs
            </p>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/wallet" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-md text-center">
            Start Your Journey 🚀
          </Link>
          
          <Link href="/wallet" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 border border-gray-200 text-center">
            View Demo 📱
          </Link>
        </div>
        
        {/* Stats Preview */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900">10M+</div>
            <div className="text-sm text-gray-600">ACHIV Tokens</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">1000+</div>
            <div className="text-sm text-gray-600">Daily Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">50K+</div>
            <div className="text-sm text-gray-600">Tasks Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">500+</div>
            <div className="text-sm text-gray-600">NFT Badges</div>
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
