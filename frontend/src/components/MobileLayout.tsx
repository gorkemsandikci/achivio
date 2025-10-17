import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useWallet } from '../contexts/WalletContext';
import AnimatedBackground from './AnimatedBackground';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: '🎯', label: 'Dashboard', path: '/dashboard' },
    { id: 'tasks', icon: '✅', label: 'Tasks', path: '/tasks' },
    { id: 'rewards', icon: '💎', label: 'Rewards', path: '/rewards' },
    { id: 'room', icon: '🏠', label: '3D Room', path: '/room' },
    { id: 'wallet', icon: '👤', label: 'Profile', path: '/wallet' },
  ];

  useEffect(() => {
    const currentPath = router.pathname;
    const currentTab = navItems.find(item => item.path === currentPath);
    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [router.pathname]);

  const handleTabChange = async (tabId: string) => {
    if (tabId === activeTab) return;
    
    const targetTab = navItems.find(item => item.id === tabId);
    if (!targetTab) return;
    
    // Protected routes require wallet connection
    const protectedRoutes = ['/dashboard', '/tasks', '/rewards', '/room'];
    const isProtectedRoute = protectedRoutes.includes(targetTab.path);
    
    if (isProtectedRoute && !isConnected) {
      console.log('🚫 MobileLayout: Korumalı sayfaya erişim engellendi, wallet sayfasına yönlendiriliyor');
      await router.push('/wallet');
      return;
    }
    
    setIsTransitioning(true);
    await router.push(targetTab.path);
    setActiveTab(tabId);
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

      return (
        <div className="h-full relative flex flex-col overflow-hidden">
          {/* Animated VR Background */}
          <div className="absolute inset-0">
            <AnimatedBackground />
          </div>

      {/* Main Content Area - Scrollable */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 relative z-10 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {children}
      </div>

      {/* Bottom Navigation - Fixed at bottom */}
      <div className="flex-shrink-0 z-50">
        {/* Active Tab Indicator - Outside navigation */}
        <div 
          className="absolute -top-1 h-1 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-700 ease-out z-10"
          style={{
            left: `${(navItems.findIndex(item => item.id === activeTab) * 20)}%`,
            width: '20%'
          }}
        />
        
        {/* VR Theme Background */}
        <div className="bg-black/80 backdrop-blur-lg border-t border-purple-500/20 shadow-lg">
          <div className="px-2 py-3">
            <div className="flex justify-around items-center relative">
              
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-700 transform ${
                        activeTab === item.id
                          ? 'scale-105 bg-purple-500/20 text-cyan-400 shadow-sm'
                          : 'scale-100 text-gray-400 hover:text-white hover:scale-105'
                      }`}
                    >
                      <div className={`text-2xl mb-1 transition-all duration-500 ${activeTab === item.id ? 'animate-bounce' : ''}`}>
                        {item.icon}
                      </div>
                      <span className={`text-xs font-medium ${activeTab === item.id ? 'text-cyan-400' : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default MobileLayout;
