import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HeroSection: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-radial from-purple-500/30 to-transparent rounded-full -top-48 -right-48 animate-pulse"></div>
      <div className="absolute w-[400px] h-[400px] bg-gradient-radial from-cyan-500/20 to-transparent rounded-full -bottom-36 -left-36 animate-pulse-reverse"></div>
      
      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-4">
          <Image
            src="/assets/images/logo-achivio.png"
            alt="Achivio Logo"
            width={400}
            height={400}
            className="mx-auto"
          />
        </div>
        
        <div className="text-2xl md:text-3xl mb-8 text-blue-200">
          Live Your Habits in VR, Earn Crypto
        </div>
        
        <p className="text-lg md:text-xl leading-relaxed mb-12 text-blue-100 max-w-3xl mx-auto">
          Complete your daily goals in virtual reality, earn ACHIV tokens for every task, 
          grow your NFT collection and design your own VR living space. Invite friends, 
          compete together and take your place in the blockchain-based achievement universe.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link 
            href="/wallet" 
            className="vr-btn-primary px-10 py-4 rounded-full text-lg font-semibold text-center"
          >
            🎮 Start VR Experience
          </Link>
          
          <Link 
            href="/dashboard" 
            className="vr-btn-secondary px-10 py-4 rounded-full text-lg font-semibold text-center"
          >
            📺 Watch Demo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
