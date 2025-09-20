import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { DatabaseService } from '../services/database';
import { Database } from '../lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

interface WalletContextType {
  userSession: UserSession;
  userData: any | null;
  dbUser: User | null;
  isConnected: boolean;
  isLoading: boolean;
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
  const [userData, setUserData] = useState<any | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stxAddress, setStxAddress] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        if (userSession.isSignInPending()) {
          const userData = await userSession.handlePendingSignIn();
          
          const walletAddress = userData.profile.stxAddress?.testnet || userData.profile.stxAddress?.mainnet;
          
          if (walletAddress && walletAddress.trim() !== '') {
            setUserData(userData);
            setIsConnected(true);
            setStxAddress(walletAddress);
            
            // Ensure user exists in database (non-blocking)
            DatabaseService.ensureUserExists(walletAddress).then(dbUser => {
              setDbUser(dbUser);
            }).catch(error => {
              console.error('Database error:', error);
            });
          } else {
            userSession.signUserOut();
            setUserData(null);
            setIsConnected(false);
            setStxAddress(null);
          }
          
        } else if (userSession.isUserSignedIn()) {
          const userData = userSession.loadUserData();
          
          // Only set as connected if we have valid wallet address
          const walletAddress = userData.profile.stxAddress?.testnet || userData.profile.stxAddress?.mainnet;
          
          if (walletAddress && walletAddress.trim() !== '') {
            setUserData(userData);
            setStxAddress(walletAddress);
            setIsConnected(true);
            
            // Ensure user exists in database (non-blocking)
            DatabaseService.ensureUserExists(walletAddress).then(dbUser => {
              setDbUser(dbUser);
              if (!dbUser) {
                console.error('Failed to create/fetch user from database');
              }
            }).catch(error => {
              console.error('Database error:', error);
            });
          } else {
            userSession.signUserOut();
            setUserData(null);
            setDbUser(null);
            setIsConnected(false);
            setStxAddress(null);
          }
        } else {
          setUserData(null);
          setDbUser(null);
          setIsConnected(false);
          setStxAddress(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear session on error to ensure clean state
        userSession.signUserOut();
        setUserData(null);
        setDbUser(null);
        setIsConnected(false);
        setStxAddress(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []); // Remove userSession dependency to avoid infinite loops

  // Removed periodic check to prevent infinite refresh loops

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Achivio - Habit Tracker',
        icon: '/favicon.ico',
      },
      redirectTo: '/',
      onFinish: () => {
        // Force a check after connection is finished
        setTimeout(() => {
          const recheckAuth = async () => {
            try {
              if (userSession.isUserSignedIn()) {
                const userData = userSession.loadUserData();
                const walletAddress = userData.profile.stxAddress?.testnet || userData.profile.stxAddress?.mainnet;
                
                if (walletAddress && walletAddress.trim() !== '') {
                  setUserData(userData);
                  setIsConnected(true);
                  setStxAddress(walletAddress);
                  
                  // Ensure user exists in database (non-blocking)
                  DatabaseService.ensureUserExists(walletAddress).then(dbUser => {
                    setDbUser(dbUser);
                  }).catch(error => {
                    console.error('Database error:', error);
                  });
                }
              }
            } catch (error) {
              console.error('Recheck auth error:', error);
            }
          };
          
          recheckAuth();
        }, 1000);
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
    setDbUser(null);
    setIsConnected(false);
    setIsLoading(false);
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
        dbUser,
        isConnected,
        isLoading,
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
