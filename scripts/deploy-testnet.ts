#!/usr/bin/env node

/**
 * Achivio Testnet Deployment Script
 * 
 * This script deploys all Achivio contracts to Stacks testnet in the correct order
 * and sets up the necessary contract connections and authorizations.
 */

import {
  makeContractDeploy,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  createStacksPrivateKey,
  getAddressFromPrivateKey,
  TransactionVersion,
  estimateContractDeploy,
  estimateContractFunctionCall,
} from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";
import * as fs from "fs";
import * as path from "path";

// Configuration
const NETWORK = new StacksTestnet();
const DEPLOYMENT_CONFIG = {
  // Replace with your actual private key for testnet deployment
  PRIVATE_KEY: process.env.STACKS_PRIVATE_KEY || "your-testnet-private-key-here",
  
  // Contract deployment order (dependencies first)
  CONTRACTS: [
    "achiv-token",
    "task-tracker", 
    "streak-system",
    "nft-badges",
    "room-items",
    "leaderboard"
  ],
  
  // Initial configuration values
  INITIAL_SUPPLY: 1000000000000, // 1M ACHIV tokens for initial distribution
  BASE_REWARD: 1000000, // 1 ACHIV token base reward
  STREAK_BONUS: 500000, // 0.5 ACHIV streak bonus
};

interface DeploymentResult {
  contractName: string;
  txId: string;
  contractAddress: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

class AchivioDeployer {
  private privateKey: string;
  private senderAddress: string;
  private deploymentResults: DeploymentResult[] = [];

  constructor(privateKey: string) {
    this.privateKey = privateKey;
    this.senderAddress = getAddressFromPrivateKey(
      createStacksPrivateKey(privateKey),
      TransactionVersion.Testnet
    );
    
    console.log("🚀 Achivio Testnet Deployment Starting...");
    console.log(`📍 Deployer Address: ${this.senderAddress}`);
    console.log(`🌐 Network: ${NETWORK.version} (${NETWORK.chainId})`);
  }

  /**
   * Read contract source code from file
   */
  private readContractSource(contractName: string): string {
    const contractPath = path.join(__dirname, "..", "contracts", `${contractName}.clar`);
    
    if (!fs.existsSync(contractPath)) {
      throw new Error(`Contract file not found: ${contractPath}`);
    }
    
    return fs.readFileSync(contractPath, "utf8");
  }

  /**
   * Deploy a single contract
   */
  private async deployContract(contractName: string): Promise<DeploymentResult> {
    console.log(`\n📄 Deploying ${contractName}...`);
    
    try {
      const contractSource = this.readContractSource(contractName);
      const contractAddress = `${this.senderAddress}.${contractName}`;
      
      // Estimate deployment cost
      const estimatedCost = await estimateContractDeploy({
        contractName,
        codeBody: contractSource,
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
      });
      
      console.log(`💰 Estimated deployment cost: ${estimatedCost.cost_scalar_change_by_byte} µSTX`);
      
      // Create deployment transaction
      const deployTx = await makeContractDeploy({
        contractName,
        codeBody: contractSource,
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      });

      // Broadcast transaction
      const broadcastResult = await broadcastTransaction(deployTx, NETWORK);
      
      if (broadcastResult.error) {
        throw new Error(`Broadcast failed: ${broadcastResult.error}`);
      }

      const result: DeploymentResult = {
        contractName,
        txId: broadcastResult.txid,
        contractAddress,
        status: 'pending'
      };

      console.log(`✅ ${contractName} deployment transaction broadcasted`);
      console.log(`🔗 Transaction ID: ${broadcastResult.txid}`);
      console.log(`📍 Contract Address: ${contractAddress}`);
      
      return result;
      
    } catch (error) {
      const result: DeploymentResult = {
        contractName,
        txId: '',
        contractAddress: `${this.senderAddress}.${contractName}`,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      };
      
      console.error(`❌ Failed to deploy ${contractName}: ${result.error}`);
      return result;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  private async waitForConfirmation(txId: string, maxRetries = 30): Promise<boolean> {
    console.log(`⏳ Waiting for confirmation of ${txId}...`);
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`${NETWORK.coreApiUrl}/extended/v1/tx/${txId}`);
        const txData = await response.json();
        
        if (txData.tx_status === 'success') {
          console.log(`✅ Transaction confirmed: ${txId}`);
          return true;
        } else if (txData.tx_status === 'abort_by_response' || txData.tx_status === 'abort_by_post_condition') {
          console.error(`❌ Transaction failed: ${txId} - ${txData.tx_status}`);
          return false;
        }
        
        // Wait 10 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log(`⏳ Still waiting... (${i + 1}/${maxRetries})`);
        
      } catch (error) {
        console.error(`Error checking transaction status: ${error}`);
      }
    }
    
    console.error(`⏰ Timeout waiting for confirmation of ${txId}`);
    return false;
  }

  /**
   * Setup contract connections and authorizations
   */
  private async setupContractConnections(): Promise<void> {
    console.log("\n🔗 Setting up contract connections and authorizations...");
    
    const contractAddress = this.senderAddress;
    
    try {
      // 1. Set token contract address in task-tracker
      console.log("Setting ACHIV token contract in task-tracker...");
      const setTokenTx1 = await makeContractCall({
        contractAddress,
        contractName: "task-tracker",
        functionName: "set-token-contract",
        functionArgs: [`${contractAddress}.achiv-token`],
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      });
      await broadcastTransaction(setTokenTx1, NETWORK);

      // 2. Set token contract address in streak-system
      console.log("Setting ACHIV token contract in streak-system...");
      const setTokenTx2 = await makeContractCall({
        contractAddress,
        contractName: "streak-system", 
        functionName: "set-token-contract",
        functionArgs: [`${contractAddress}.achiv-token`],
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      });
      await broadcastTransaction(setTokenTx2, NETWORK);

      // 3. Set task-tracker contract in streak-system
      console.log("Setting task-tracker contract in streak-system...");
      const setTrackerTx = await makeContractCall({
        contractAddress,
        contractName: "streak-system",
        functionName: "set-task-tracker-contract", 
        functionArgs: [`${contractAddress}.task-tracker`],
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      });
      await broadcastTransaction(setTrackerTx, NETWORK);

      // 4. Set contract addresses in room-items
      console.log("Setting contract addresses in room-items...");
      const setRoomTokenTx = await makeContractCall({
        contractAddress,
        contractName: "room-items",
        functionName: "set-achiv-token-contract",
        functionArgs: [`${contractAddress}.achiv-token`],
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      });
      await broadcastTransaction(setRoomTokenTx, NETWORK);

      const setRoomBadgesTx = await makeContractCall({
        contractAddress,
        contractName: "room-items",
        functionName: "set-nft-badges-contract",
        functionArgs: [`${contractAddress}.nft-badges`],
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      });
      await broadcastTransaction(setRoomBadgesTx, NETWORK);

      // 5. Set contract addresses in leaderboard
      console.log("Setting contract addresses in leaderboard...");
      const setLeaderboardTx1 = await makeContractCall({
        contractAddress,
        contractName: "leaderboard",
        functionName: "set-achiv-token-contract",
        functionArgs: [`${contractAddress}.achiv-token`],
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      });
      await broadcastTransaction(setLeaderboardTx1, NETWORK);

      // 6. Authorize minters in ACHIV token contract
      console.log("Authorizing contract minters...");
      const authTaskTrackerTx = await makeContractCall({
        contractAddress,
        contractName: "achiv-token",
        functionName: "add-authorized-minter",
        functionArgs: [`${contractAddress}.task-tracker`],
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      });
      await broadcastTransaction(authTaskTrackerTx, NETWORK);

      const authStreakTx = await makeContractCall({
        contractAddress,
        contractName: "achiv-token", 
        functionName: "add-authorized-minter",
        functionArgs: [`${contractAddress}.streak-system`],
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      });
      await broadcastTransaction(authStreakTx, NETWORK);

      // 7. Authorize badge minters
      console.log("Authorizing badge minters...");
      const authBadgeTx = await makeContractCall({
        contractAddress,
        contractName: "nft-badges",
        functionName: "add-authorized-minter", 
        functionArgs: [`${contractAddress}.streak-system`],
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      });
      await broadcastTransaction(authBadgeTx, NETWORK);

      console.log("✅ Contract connections and authorizations completed!");
      
    } catch (error) {
      console.error("❌ Error setting up contract connections:", error);
      throw error;
    }
  }

  /**
   * Perform initial token distribution
   */
  private async performInitialDistribution(): Promise<void> {
    console.log("\n💰 Performing initial ACHIV token distribution...");
    
    try {
      // Mint initial supply to deployer for distribution
      const mintTx = await makeContractCall({
        contractAddress: this.senderAddress,
        contractName: "achiv-token",
        functionName: "admin-mint",
        functionArgs: [DEPLOYMENT_CONFIG.INITIAL_SUPPLY, this.senderAddress],
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      });

      const result = await broadcastTransaction(mintTx, NETWORK);
      console.log(`✅ Initial distribution transaction: ${result.txid}`);
      console.log(`💎 Minted ${DEPLOYMENT_CONFIG.INITIAL_SUPPLY / 1000000} ACHIV tokens`);
      
    } catch (error) {
      console.error("❌ Error in initial distribution:", error);
      throw error;
    }
  }

  /**
   * Main deployment function
   */
  public async deploy(): Promise<void> {
    try {
      console.log(`\n🎯 Starting deployment of ${DEPLOYMENT_CONFIG.CONTRACTS.length} contracts...`);
      
      // Deploy contracts in order
      for (const contractName of DEPLOYMENT_CONFIG.CONTRACTS) {
        const result = await this.deployContract(contractName);
        this.deploymentResults.push(result);
        
        if (result.status === 'failed') {
          console.error(`❌ Deployment failed for ${contractName}, stopping...`);
          return;
        }
        
        // Wait for confirmation before deploying next contract
        const confirmed = await this.waitForConfirmation(result.txId);
        if (confirmed) {
          result.status = 'success';
        } else {
          result.status = 'failed';
          console.error(`❌ Failed to confirm ${contractName} deployment`);
          return;
        }
        
        // Small delay between deployments
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // Setup contract connections
      await this.setupContractConnections();
      
      // Wait a bit for setup transactions to confirm
      console.log("⏳ Waiting for setup transactions to confirm...");
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      // Perform initial distribution
      await this.performInitialDistribution();
      
      // Print deployment summary
      this.printDeploymentSummary();
      
    } catch (error) {
      console.error("❌ Deployment failed:", error);
      throw error;
    }
  }

  /**
   * Print deployment summary
   */
  private printDeploymentSummary(): void {
    console.log("\n" + "=".repeat(60));
    console.log("🎉 ACHIVIO TESTNET DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    
    console.log(`📍 Deployer Address: ${this.senderAddress}`);
    console.log(`🌐 Network: Stacks Testnet`);
    console.log(`⏰ Deployed at: ${new Date().toISOString()}\n`);
    
    console.log("📄 Deployed Contracts:");
    this.deploymentResults.forEach(result => {
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${result.contractName}: ${result.contractAddress}`);
      if (result.txId) {
        console.log(`   🔗 TX: ${result.txId}`);
      }
      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      }
    });
    
    console.log("\n🔗 Contract Interactions:");
    console.log(`• Task completion rewards: ${DEPLOYMENT_CONFIG.BASE_REWARD / 1000000} ACHIV`);
    console.log(`• Streak bonus: ${DEPLOYMENT_CONFIG.STREAK_BONUS / 1000000} ACHIV`);
    console.log(`• Initial supply: ${DEPLOYMENT_CONFIG.INITIAL_SUPPLY / 1000000} ACHIV`);
    
    console.log("\n🌐 Explorer Links:");
    this.deploymentResults.forEach(result => {
      if (result.status === 'success') {
        console.log(`• ${result.contractName}: https://explorer.stacks.co/txid/${result.txId}?chain=testnet`);
      }
    });
    
    console.log("\n📚 Next Steps:");
    console.log("1. Verify all contracts on Stacks Explorer");
    console.log("2. Test contract interactions");
    console.log("3. Deploy frontend application");
    console.log("4. Set up monitoring and analytics");
    
    console.log("\n" + "=".repeat(60));
  }
}

// Main execution
async function main() {
  const privateKey = process.env.STACKS_PRIVATE_KEY;
  
  if (!privateKey) {
    console.error("❌ Error: STACKS_PRIVATE_KEY environment variable is required");
    console.error("💡 Set your testnet private key: export STACKS_PRIVATE_KEY='your-key-here'");
    process.exit(1);
  }
  
  if (privateKey === "your-testnet-private-key-here") {
    console.error("❌ Error: Please set a real private key in STACKS_PRIVATE_KEY");
    process.exit(1);
  }
  
  const deployer = new AchivioDeployer(privateKey);
  
  try {
    await deployer.deploy();
    console.log("🎉 Deployment completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

export { AchivioDeployer, DEPLOYMENT_CONFIG };
