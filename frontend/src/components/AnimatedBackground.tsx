import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <>
      {/* Main VR Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900"></div>
      
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-radial from-purple-500/50 to-transparent rounded-full -top-48 -right-48 animate-pulse"></div>
      <div className="absolute w-[400px] h-[400px] bg-gradient-radial from-cyan-500/40 to-transparent rounded-full -bottom-36 -left-36 animate-pulse-reverse"></div>
      
      {/* Additional floating elements for more depth */}
      <div className="absolute w-[300px] h-[300px] bg-gradient-radial from-purple-400/30 to-transparent rounded-full top-1/4 -left-24 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute w-[200px] h-[200px] bg-gradient-radial from-cyan-400/25 to-transparent rounded-full top-3/4 -right-16 animate-pulse-reverse" style={{ animationDelay: '4s' }}></div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/5 to-transparent"></div>
    </>
  );
};

export default AnimatedBackground;
