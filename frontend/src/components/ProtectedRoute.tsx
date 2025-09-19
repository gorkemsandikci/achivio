import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '../contexts/WalletContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isConnected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      // Redirect to wallet connection page if not connected
      router.push('/wallet');
    }
  }, [isConnected, router]);

  // Show loading or redirect message while checking connection
  if (!isConnected) {
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

  return <>{children}</>;
};

export default ProtectedRoute;
