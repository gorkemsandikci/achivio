import React from 'react';
import AnimatedBackground from './AnimatedBackground';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`}>
      {/* VR Background for all screen sizes */}
      <div className="absolute inset-0">
        <AnimatedBackground />
      </div>
      
      {/* Mobile: Full width with proper height */}
      <div className="block md:hidden h-screen relative z-10">
        {children}
      </div>
      
      {/* Desktop: Mobile frame simulation - iPhone 14 Pro Max size */}
      <div className="hidden md:flex md:justify-center md:items-center md:min-h-screen md:py-8 relative z-10">
        <div className="relative w-[430px] h-[932px] bg-black rounded-[3rem] p-4 shadow-2xl">
          {/* Phone frame */}
          <div className="w-full h-full bg-gray-900 rounded-[2.5rem] overflow-hidden relative flex flex-col">
            {/* Screen content - Full height with proper scrolling */}
            <div className="w-full h-full flex flex-col">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
