import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { useRouter } from 'next/router';

interface WalletContextType {
  userSession: UserSession;
  userData: any;
  isConnected: boolean;
  stxAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const appConfig = new AppConfig(['store_write', 'publish_data']);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [userSession] = useState(() => new UserSession({ appConfig }));
  const [userData, setUserData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stxAddress, setStxAddress] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (userSession.isSignInPending()) {
          console.log('Processing pending sign in...');
          const userData = await userSession.handlePendingSignIn();
          console.log('Sign in successful:', userData);
          
          setUserData(userData);
          setIsConnected(true);
          setStxAddress(userData.profile.stxAddress?.testnet || userData.profile.stxAddress?.mainnet || null);
          
          // Redirect to dashboard after successful connection
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/dashboard';
            }
          }, 1000);
          
        } else if (userSession.isUserSignedIn()) {
          console.log('User already signed in');
          const userData = userSession.loadUserData();
          console.log('Loaded user data:', userData);
          
          setUserData(userData);
          setIsConnected(true);
          setStxAddress(userData.profile.stxAddress?.testnet || userData.profile.stxAddress?.mainnet || null);
        } else {
          console.log('User not signed in');
          setUserData(null);
          setIsConnected(false);
          setStxAddress(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUserData(null);
        setIsConnected(false);
        setStxAddress(null);
      }
    };

    checkAuthStatus();
  }, [userSession]);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Achivio - Habit Tracker',
        icon: '/favicon.ico',
      },
      redirectTo: '/',
      onFinish: () => {
        // This will trigger the useEffect above
        console.log('Wallet connection initiated');
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
    setIsConnected(false);
    setStxAddress(null);
    
    // Redirect to home page after disconnect
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <WalletContext.Provider
      value={{
        userSession,
        userData,
        isConnected,
        stxAddress,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
