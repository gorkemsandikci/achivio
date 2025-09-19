# Achivio Deployment Guide

This guide covers the complete deployment process for Achivio smart contracts on Stacks testnet and mainnet.

## Prerequisites

### System Requirements
- Node.js v16 or higher
- npm or yarn package manager
- Clarinet CLI v2.0+
- Git for version control

### Stacks Wallet Setup
- Stacks wallet with STX for deployment fees
- Private key access for deployment account
- Sufficient STX balance (minimum 1 STX for testnet, 10+ STX for mainnet)

### Development Environment
```bash
# Install Clarinet
curl --proto '=https' --tlsv1.2 -sSf https://sh.clarinet.so | sh

# Verify installation
clarinet --version
node --version
npm --version
```

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] Security audit completed (for mainnet)

### Configuration
- [ ] Environment variables set
- [ ] Private keys secured (never commit to git)
- [ ] Contract parameters configured
- [ ] Deployment scripts tested

### Network Preparation
- [ ] STX balance sufficient for deployment
- [ ] Network connectivity verified
- [ ] Explorer access confirmed

## Testnet Deployment

### Step 1: Environment Setup

Create `.env` file:
```bash
# Testnet configuration
STACKS_PRIVATE_KEY=your_testnet_private_key_here
NETWORK=testnet

# Optional: Custom RPC endpoints
STACKS_API_URL=https://api.testnet.hiro.so
```

### Step 2: Pre-Deployment Testing

```bash
# Run comprehensive tests
npm test

# Check contract syntax
clarinet check

# Simulate deployment locally
clarinet integrate
```

### Step 3: Deploy to Testnet

```bash
# Deploy all contracts
npm run deploy:testnet

# Or deploy individual contracts
ts-node scripts/deploy-testnet.ts
```

### Step 4: Verify Testnet Deployment

1. **Check Explorer**: Visit [Stacks Testnet Explorer](https://explorer.stacks.co/?chain=testnet)
2. **Verify Contracts**: Ensure all 6 contracts deployed successfully
3. **Test Functions**: Execute read-only functions to verify deployment
4. **Check Connections**: Verify contract interconnections work

### Step 5: Post-Deployment Testing

```bash
# Test contract interactions
npm run test:integration

# Test token minting
clarinet console
```

Example testnet verification:
```typescript
// Check ACHIV token deployment
const tokenInfo = await callReadOnlyFunction({
  contractAddress: 'ST1234...YOUR_ADDRESS',
  contractName: 'achiv-token',
  functionName: 'get-name',
  functionArgs: [],
  network: new StacksTestnet()
});
console.log(tokenInfo); // Should return "Achivio Token"
```

## Mainnet Deployment

⚠️ **WARNING**: Mainnet deployment uses real STX and creates permanent contracts!

### Step 1: Security Review

Before mainnet deployment, complete a thorough security review:

#### Code Audit Checklist
- [ ] External security audit completed
- [ ] All test cases pass with 100% coverage
- [ ] No hardcoded values or test data
- [ ] Error handling comprehensive
- [ ] Access controls properly implemented
- [ ] Economic parameters validated

#### Deployment Checklist
- [ ] Private key stored securely (hardware wallet recommended)
- [ ] Deployment address has sufficient STX (20+ STX recommended)
- [ ] Team approval for mainnet deployment
- [ ] Rollback plan prepared
- [ ] Monitoring systems ready

### Step 2: Mainnet Environment

Create mainnet environment:
```bash
# Mainnet configuration (keep secure!)
STACKS_MAINNET_PRIVATE_KEY=your_mainnet_private_key_here
NETWORK=mainnet

# Production settings
INITIAL_SUPPLY=10000000000000  # 10M ACHIV tokens
BASE_REWARD=1000000           # 1 ACHIV per task
STREAK_BONUS=500000          # 0.5 ACHIV streak bonus
```

### Step 3: Cost Estimation

Estimate deployment costs:
```bash
# Get cost estimates
ts-node scripts/estimate-costs.ts

# Expected costs (approximate):
# - achiv-token: ~1.5 STX
# - task-tracker: ~2.0 STX
# - streak-system: ~1.8 STX
# - nft-badges: ~2.2 STX
# - room-items: ~2.5 STX
# - leaderboard: ~1.5 STX
# - Setup transactions: ~1.0 STX
# Total: ~12-15 STX
```

### Step 4: Mainnet Deployment

```bash
# Deploy to mainnet (requires confirmation)
npm run deploy:mainnet

# Monitor deployment progress
# Each contract deployment will be confirmed before proceeding
```

The mainnet deployment script includes:
- Pre-deployment security checks
- User confirmation prompts
- Cost estimation and approval
- Sequential contract deployment with confirmation
- Automatic contract connection setup
- Initial token distribution
- Comprehensive deployment summary

### Step 5: Mainnet Verification

1. **Explorer Verification**
   - Check all contracts on [Stacks Explorer](https://explorer.stacks.co)
   - Verify contract source code matches repository
   - Confirm transaction success

2. **Function Testing**
   ```bash
   # Test core functions with small amounts
   npm run test:mainnet
   ```

3. **Integration Verification**
   - Test task creation and completion
   - Verify token minting works
   - Check NFT badge creation
   - Test room item purchases

### Step 6: Post-Deployment Setup

#### Frontend Configuration
Update frontend with mainnet contract addresses:
```typescript
// config/contracts.ts
export const MAINNET_CONTRACTS = {
  ACHIV_TOKEN: 'SP1234...YOUR_ADDRESS.achiv-token',
  TASK_TRACKER: 'SP1234...YOUR_ADDRESS.task-tracker',
  STREAK_SYSTEM: 'SP1234...YOUR_ADDRESS.streak-system',
  NFT_BADGES: 'SP1234...YOUR_ADDRESS.nft-badges',
  ROOM_ITEMS: 'SP1234...YOUR_ADDRESS.room-items',
  LEADERBOARD: 'SP1234...YOUR_ADDRESS.leaderboard'
};
```

#### Monitoring Setup
Set up monitoring for:
- Contract events and transactions
- Token supply and distribution
- User activity and engagement
- Error rates and failed transactions

## Deployment Scripts Reference

### `deploy-testnet.ts`

Automated testnet deployment with:
- Contract validation
- Sequential deployment
- Connection setup
- Initial token distribution
- Comprehensive logging

Key features:
```typescript
class AchivioDeployer {
  async deploy() {
    // Deploy contracts in dependency order
    for (const contractName of CONTRACTS) {
      await this.deployContract(contractName);
      await this.waitForConfirmation(result.txId);
    }
    
    // Setup contract connections
    await this.setupContractConnections();
    
    // Initial distribution
    await this.performInitialDistribution();
  }
}
```

### `deploy-mainnet.ts`

Production deployment with enhanced security:
- Pre-deployment security checks
- STX balance verification
- User confirmation prompts
- Cost estimation and approval
- Enhanced error handling
- Comprehensive audit trail

Security features:
```typescript
class AchivioMainnetDeployer {
  async performSecurityChecks() {
    // Check STX balance
    // Verify contract files
    // Check for existing deployments
    // Validate configuration
  }
  
  async getUserConfirmation() {
    // Interactive confirmation prompt
    // Display deployment details
    // Require explicit approval
  }
}
```

## Troubleshooting

### Common Deployment Issues

#### Insufficient STX Balance
```
Error: Insufficient balance for deployment
```
**Solution**: Add more STX to deployment account

#### Contract Already Exists
```
Error: Contract already deployed at address
```
**Solution**: Use different deployer address or update existing contract

#### Network Connectivity Issues
```
Error: Failed to connect to Stacks API
```
**Solution**: Check network connection and API endpoints

#### Transaction Timeout
```
Error: Transaction confirmation timeout
```
**Solution**: Check transaction on explorer, may need longer wait time

### Deployment Recovery

If deployment fails mid-process:

1. **Check Partial Deployment**
   ```bash
   # Check which contracts deployed successfully
   npm run check:deployment
   ```

2. **Resume Deployment**
   ```bash
   # Resume from failed contract
   npm run deploy:resume --from=contract-name
   ```

3. **Rollback if Necessary**
   ```bash
   # Note: Smart contracts are immutable, prepare new deployment
   npm run deploy:new-version
   ```

### Gas Optimization

To reduce deployment costs:

1. **Optimize Contract Size**
   - Remove unused functions
   - Minimize comment length
   - Optimize data structures

2. **Batch Operations**
   - Group setup transactions
   - Use single initialization call

3. **Deploy During Low Activity**
   - Monitor network congestion
   - Deploy when fees are lower

## Deployment Verification

### Automated Verification Script

```typescript
// scripts/verify-deployment.ts
async function verifyDeployment(network: string) {
  const contracts = ['achiv-token', 'task-tracker', 'streak-system', 
                   'nft-badges', 'room-items', 'leaderboard'];
  
  for (const contract of contracts) {
    // Verify contract exists
    const contractInfo = await getContractInfo(contract);
    assert(contractInfo.exists, `Contract ${contract} not found`);
    
    // Test read-only functions
    const result = await callReadOnlyFunction(contract, 'get-contract-stats');
    assert(result.success, `Contract ${contract} not responding`);
  }
  
  console.log('✅ All contracts verified successfully');
}
```

### Manual Verification Steps

1. **Contract Existence**
   - Verify all 6 contracts deployed
   - Check contract addresses match expected format
   - Confirm deployment transactions succeeded

2. **Function Testing**
   - Call read-only functions to verify contract state
   - Test basic functionality with small amounts
   - Verify error handling works correctly

3. **Integration Testing**
   - Test complete user workflow
   - Verify contract interactions work
   - Check event emissions

4. **Security Verification**
   - Verify access controls
   - Test pause mechanisms
   - Confirm authorization systems

## Best Practices

### Security
- Never commit private keys to version control
- Use hardware wallets for mainnet deployments
- Implement comprehensive testing before deployment
- Conduct security audits for production systems

### Operations
- Monitor deployment progress continuously
- Keep deployment logs for audit trails
- Verify all contracts before announcing launch
- Prepare rollback procedures for issues

### Documentation
- Document all contract addresses
- Record deployment parameters
- Maintain deployment history
- Update frontend configurations

## Support

For deployment assistance:
- Check the [troubleshooting section](#troubleshooting)
- Review deployment logs for specific errors
- Contact support at support@achivio.app
- Join Discord for community help

---

This deployment guide ensures a smooth and secure deployment process for the Achivio smart contract system.
