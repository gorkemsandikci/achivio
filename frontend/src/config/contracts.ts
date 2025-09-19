// Stacks Contract Configuration
export const CONTRACT_CONFIG = {
  // Network Configuration
  NETWORK: 'testnet',
  STACKS_API: 'https://api.testnet.hiro.so',
  
  // Deployed Contract Addresses
  DEPLOYER_ADDRESS: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  
  // Contract Names
  CONTRACTS: {
    ACHIV_TOKEN: 'achiv-token',
    TASK_TRACKER: 'task-tracker',
    STREAK_SYSTEM: 'streak-system',
    NFT_BADGES: 'nft-badges',
    ROOM_ITEMS: 'room-items',
    LEADERBOARD: 'leaderboard'
  },
  
  // Full Contract Identifiers
  FULL_CONTRACTS: {
    ACHIV_TOKEN: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.achiv-token',
    TASK_TRACKER: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.task-tracker',
    STREAK_SYSTEM: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.streak-system',
    NFT_BADGES: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.nft-badges',
    ROOM_ITEMS: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.room-items',
    LEADERBOARD: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.leaderboard'
  },
  
  // Explorer URLs
  EXPLORER_BASE: 'https://explorer.hiro.so',
  
  // Token Configuration
  ACHIV_TOKEN: {
    NAME: 'ACHIV',
    SYMBOL: 'ACHIV',
    DECIMALS: 6,
    TOTAL_SUPPLY: 1000000000000000 // 1 billion tokens with 6 decimals
  }
};

// Helper function to get full contract identifier
export const getContractId = (contractName: keyof typeof CONTRACT_CONFIG.CONTRACTS): string => {
  return `${CONTRACT_CONFIG.DEPLOYER_ADDRESS}.${CONTRACT_CONFIG.CONTRACTS[contractName]}`;
};

// Helper function to get explorer URL for a contract
export const getExplorerUrl = (contractName: keyof typeof CONTRACT_CONFIG.CONTRACTS): string => {
  const contractId = getContractId(contractName);
  return `${CONTRACT_CONFIG.EXPLORER_BASE}/txid/${contractId}?chain=${CONTRACT_CONFIG.NETWORK}`;
};

export default CONTRACT_CONFIG;
