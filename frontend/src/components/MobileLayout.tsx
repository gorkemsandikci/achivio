import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useWallet } from '../contexts/WalletContext';

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
        <div className="h-full bg-gray-50 relative flex flex-col">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-gray-100 opacity-50"></div>
          </div>

      {/* Main Content Area - Scrollable */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {children}
      </div>

      {/* Bottom Navigation - Fixed at bottom */}
      <div className="flex-shrink-0 z-50">
        {/* Active Tab Indicator - Outside navigation */}
        <div 
          className="absolute -top-1 h-1 bg-blue-500 rounded-full transition-all duration-700 ease-out z-10"
          style={{
            left: `${(navItems.findIndex(item => item.id === activeTab) * 20)}%`,
            width: '20%'
          }}
        />
        
        {/* Clean Background */}
        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className="px-2 py-3">
            <div className="flex justify-around items-center relative">
              
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-700 transform ${
                        activeTab === item.id
                          ? 'scale-105 bg-blue-50 text-blue-600 shadow-sm'
                          : 'scale-100 text-gray-500 hover:text-gray-700 hover:scale-105'
                      }`}
                    >
                      <div className={`text-2xl mb-1 transition-all duration-500 ${activeTab === item.id ? 'animate-bounce' : ''}`}>
                        {item.icon}
                      </div>
                      <span className={`text-xs font-medium ${activeTab === item.id ? 'text-blue-600' : 'text-gray-500'}`}>
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
