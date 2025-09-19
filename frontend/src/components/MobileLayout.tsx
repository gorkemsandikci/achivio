import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const router = useRouter();
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
    
    setIsTransitioning(true);
    const targetTab = navItems.find(item => item.id === tabId);
    
    if (targetTab) {
      await router.push(targetTab.path);
      setActiveTab(tabId);
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400 rounded-full opacity-5 animate-spin duration-[20s]"></div>
      </div>

      {/* Main Content Area */}
      <div className={`pb-24 transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Glassmorphism Background */}
        <div className="bg-white/10 backdrop-blur-xl border-t border-white/20">
          <div className="px-2 py-3">
            <div className="flex justify-around items-center relative">
              {/* Active Tab Indicator */}
              <div 
                className="absolute top-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-300 ease-out"
                style={{
                  left: `${(navItems.findIndex(item => item.id === activeTab) * 20)}%`,
                  width: '20%'
                }}
              />
              
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-300 transform ${
                    activeTab === item.id
                      ? 'scale-110 bg-white/20 text-white shadow-lg'
                      : 'scale-100 text-white/70 hover:text-white hover:scale-105'
                  }`}
                >
                  <div className={`text-2xl mb-1 ${activeTab === item.id ? 'animate-bounce' : ''}`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-semibold ${activeTab === item.id ? 'text-white' : 'text-white/80'}`}>
                    {item.label}
                  </span>
                  
                  {/* Active Glow Effect */}
                  {activeTab === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl blur-sm -z-10"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Quick Task Add */}
      <div className="fixed bottom-28 right-6 z-40">
        <button className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl transform hover:scale-110 transition-all duration-300 animate-pulse">
          ➕
        </button>
      </div>

    </div>
  );
};

export default MobileLayout;
