import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userConnected, setUserConnected] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', current: true },
    { name: 'My Habits', href: '/habits', icon: '✅', current: false },
    { name: 'Achievements', href: '/achievements', icon: '🏆', current: false },
    { name: 'Virtual Room', href: '/room', icon: '🏠', current: false },
    { name: 'Leaderboard', href: '/leaderboard', icon: '🥇', current: false },
    { name: 'Store', href: '/store', icon: '🛍️', current: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-green-500 to-blue-600">
            <div className="flex items-center">
              <div className="w-8 h-8 relative mr-2">
                <Image
                  src="/assets/images/3d_rendered_crypto_tokens.jpg"
                  alt="Achivio Logo"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h1 className="text-xl font-bold text-white">Achivio</h1>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-b border-gray-200">
            {userConnected ? (
              <div className="flex items-center">
                <div className="w-10 h-10 relative mr-3">
                  <Image
                    src="/assets/images/success_illustration.jpg"
                    alt="User Avatar"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-gray-900">HabitMaster</div>
                  <div className="text-sm text-gray-500">Level 3 • 24.5 ACHIV</div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setUserConnected(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
              >
                Connect Wallet 🔗
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  item.current
                    ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-r-4 border-green-500'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-2">Today's Progress</div>
              <div className="flex justify-between text-xs">
                <span>Tasks: 3/5</span>
                <span>Streak: 7 🔥</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  type="button"
                  className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Breadcrumb */}
                <nav className="hidden lg:flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-4">
                    <li>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500">Dashboard</span>
                      </div>
                    </li>
                  </ol>
                </nav>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">View notifications</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6l2 2v8l-2 2H9l-2-2V9l2-2z" />
                  </svg>
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>

                {/* ACHIV Balance */}
                <div className="hidden sm:flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <div className="w-4 h-4 relative mr-2">
                    <Image
                      src="/assets/images/3d_rendered_crypto_tokens.jpg"
                      alt="ACHIV Token"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold">24.5 ACHIV</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-6 h-6 relative mr-2">
                  <Image
                    src="/assets/images/3d_rendered_crypto_tokens.jpg"
                    alt="Achivio"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <span className="text-sm text-gray-500">
                  © 2024 Achivio. Built on Stacks blockchain.
                </span>
              </div>
              
              <div className="flex space-x-6">
                <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">
                  About
                </Link>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                  Privacy
                </Link>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">
                  Terms
                </Link>
                <Link href="/support" className="text-sm text-gray-500 hover:text-gray-900">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
