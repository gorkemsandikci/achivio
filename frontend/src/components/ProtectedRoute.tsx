import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '../contexts/WalletContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isConnected, isLoading } = useWallet();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check if we should redirect immediately
  const shouldRedirect = !isLoading && !isConnected && router.pathname !== '/wallet';
  
  // Debug removed for production

  useEffect(() => {
    if (shouldRedirect) {
      console.log('🔀 ProtectedRoute: Wallet sayfasına yönlendiriliyor, sayfa:', router.pathname);
      setIsRedirecting(true);
      
      // Try Next.js router first, then fallback to window.location
      const redirectToWallet = async () => {
        try {
          await router.replace('/wallet');
          console.log('✅ ProtectedRoute: router.replace() başarılı');
        } catch (error) {
          console.log('❌ ProtectedRoute: router.replace() başarısız, window.location kullanılıyor');
          if (typeof window !== 'undefined') {
            window.location.href = '/wallet';
          }
        }
      };
      
      redirectToWallet();
    } else if (isConnected) {
      console.log('✅ ProtectedRoute: Cüzdan bağlı, redirect durumu sıfırlanıyor');
      setIsRedirecting(false);
    }
  }, [shouldRedirect, isConnected, router]);

  // Show loading spinner while checking connection
  if (isLoading) {
    console.log('⏳ ProtectedRoute: Loading ekranı gösteriliyor');
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
          <div className="text-6xl mb-4 animate-spin">🔄</div>
          <h2 className="text-2xl font-bold text-white mb-4">Checking Connection...</h2>
          <p className="text-white/70">
            Please wait while we verify your wallet connection.
          </p>
        </div>
      </div>
    );
  }

  // Show redirect message if redirecting
  if (isRedirecting) {
    console.log('🔄 ProtectedRoute: Redirecting ekranı gösteriliyor');
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
          <div className="text-6xl mb-4 animate-pulse">🔄</div>
          <h2 className="text-2xl font-bold text-white mb-4">Redirecting...</h2>
          <p className="text-white/70">
            Taking you to the wallet connection page...
          </p>
        </div>
      </div>
    );
  }

  // Show connection required message if not connected (and not redirecting)
  if (!isConnected && !shouldRedirect) {
    console.log('🔗 ProtectedRoute: Wallet Connection Required ekranı gösteriliyor');
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-white mb-4">Wallet Connection Required</h2>
          <p className="text-white/70 mb-6">
            Please connect your Stacks wallet to access this feature.
          </p>
          <button
            onClick={() => router.push('/wallet')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-6 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // If should redirect, don't render children at all
  if (shouldRedirect) {
    console.log('🚫 ProtectedRoute: shouldRedirect=true, children render edilmiyor');
    return null;
  }

  console.log('✅ ProtectedRoute: Tüm kontroller geçti, children render ediliyor');
  return <>{children}</>;
};

export default ProtectedRoute;
