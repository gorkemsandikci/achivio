import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

interface WalletContextType {
  userSession: UserSession;
  userData: any;
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
  const [userData, setUserData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stxAddress, setStxAddress] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState(0);

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
            
            // Refresh page after successful connection to show profile
            setTimeout(() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }, 500);
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
            setIsConnected(true);
            setStxAddress(walletAddress);
          } else {
            userSession.signUserOut();
            setUserData(null);
            setIsConnected(false);
            setStxAddress(null);
          }
        } else {
          setUserData(null);
          setIsConnected(false);
          setStxAddress(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear session on error to ensure clean state
        userSession.signUserOut();
        setUserData(null);
        setIsConnected(false);
        setStxAddress(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
    setLastCheckTime(Date.now());
  }, []); // Remove userSession dependency to avoid infinite loops

  // Periodic check for auth status changes
  useEffect(() => {
    const interval = setInterval(async () => {
      // Only check if not currently loading and if some time has passed
      if (!isLoading && Date.now() - lastCheckTime > 2000) {
        try {
          const wasConnected = isConnected;
          
          if (userSession.isUserSignedIn()) {
            const userData = userSession.loadUserData();
            const walletAddress = userData.profile.stxAddress?.testnet || userData.profile.stxAddress?.mainnet;
            
            if (walletAddress && walletAddress.trim() !== '' && !wasConnected) {
              // State changed from disconnected to connected
              console.log('Auth state changed: now connected');
              setUserData(userData);
              setIsConnected(true);
              setStxAddress(walletAddress);
              
              // Refresh to show new state
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }
          }
        } catch (error) {
          console.error('Periodic auth check error:', error);
        }
        setLastCheckTime(Date.now());
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [isConnected, isLoading, lastCheckTime, userSession]);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Achivio - Habit Tracker',
        icon: '/favicon.ico',
      },
      redirectTo: '/',
      onFinish: () => {
        // Force a check after connection is finished
        console.log('Connect finished, checking auth status...');
        setTimeout(() => {
          // Re-run auth check after connection
          const recheckAuth = async () => {
            try {
              if (userSession.isUserSignedIn()) {
                const userData = userSession.loadUserData();
                const walletAddress = userData.profile.stxAddress?.testnet || userData.profile.stxAddress?.mainnet;
                
                if (walletAddress && walletAddress.trim() !== '') {
                  console.log('Connection successful, refreshing page...');
                  setUserData(userData);
                  setIsConnected(true);
                  setStxAddress(walletAddress);
                  
                  // Refresh to show new state
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
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
