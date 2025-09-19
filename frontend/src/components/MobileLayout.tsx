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
        <div className="min-h-screen bg-gray-50 relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-gray-100 opacity-50"></div>
          </div>

      {/* Main Content Area */}
      <div className={`pb-24 transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
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

      {/* Floating Action Button for Quick Task Add */}
      <div className="fixed bottom-28 right-6 z-40">
        <button className="w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white text-xl transform hover:scale-105 transition-all duration-300 hover:bg-blue-600">
          ➕
        </button>
      </div>

    </div>
  );
};

export default MobileLayout;
