#!/usr/bin/env node

/**
 * Achivio Mainnet Deployment Script
 * 
 * This script deploys all Achivio contracts to Stacks mainnet with enhanced security
 * and production-ready configurations.
 * 
 * ⚠️  IMPORTANT: This script deploys to MAINNET with REAL STX costs!
 *     Only run this when you're ready for production deployment.
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
import { StacksMainnet } from "@stacks/network";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// Configuration
const NETWORK = new StacksMainnet();
const MAINNET_CONFIG = {
  // Replace with your actual private key for mainnet deployment
  PRIVATE_KEY: process.env.STACKS_MAINNET_PRIVATE_KEY || "your-mainnet-private-key-here",
  
  // Contract deployment order (dependencies first)
  CONTRACTS: [
    "achiv-token",
    "task-tracker", 
    "streak-system",
    "nft-badges",
    "room-items",
    "leaderboard"
  ],
  
  // Production configuration values
  INITIAL_SUPPLY: 10000000000000, // 10M ACHIV tokens for initial distribution
  BASE_REWARD: 1000000, // 1 ACHIV token base reward
  STREAK_BONUS: 500000, // 0.5 ACHIV streak bonus
  
  // Security settings
  REQUIRE_CONFIRMATION: true,
  MIN_STX_BALANCE: 1000000, // 1 STX minimum balance required
  MAX_DEPLOYMENT_COST: 10000000, // 10 STX maximum cost per contract
};

interface MainnetDeploymentResult {
  contractName: string;
  txId: string;
  contractAddress: string;
  status: 'pending' | 'success' | 'failed';
  deploymentCost: number;
  error?: string;
}

class AchivioMainnetDeployer {
  private privateKey: string;
  private senderAddress: string;
  private deploymentResults: MainnetDeploymentResult[] = [];
  private totalCost: number = 0;

  constructor(privateKey: string) {
    this.privateKey = privateKey;
    this.senderAddress = getAddressFromPrivateKey(
      createStacksPrivateKey(privateKey),
      TransactionVersion.Mainnet
    );
    
    console.log("🚀 Achivio Mainnet Deployment Initializing...");
    console.log(`📍 Deployer Address: ${this.senderAddress}`);
    console.log(`🌐 Network: ${NETWORK.version} (${NETWORK.chainId})`);
    console.log("⚠️  WARNING: This will deploy to MAINNET with real STX costs!");
  }

  /**
   * Perform pre-deployment security checks
   */
  private async performSecurityChecks(): Promise<void> {
    console.log("\n🔒 Performing security checks...");
    
    // Check STX balance
    try {
      const response = await fetch(`${NETWORK.coreApiUrl}/extended/v1/address/${this.senderAddress}/balances`);
      const balanceData = await response.json();
      const stxBalance = parseInt(balanceData.stx.balance);
      
      console.log(`💰 Current STX balance: ${stxBalance / 1000000} STX`);
      
      if (stxBalance < MAINNET_CONFIG.MIN_STX_BALANCE) {
        throw new Error(`Insufficient STX balance. Need at least ${MAINNET_CONFIG.MIN_STX_BALANCE / 1000000} STX`);
      }
      
    } catch (error) {
      throw new Error(`Failed to check STX balance: ${error}`);
    }
    
    // Verify contract files exist
    for (const contractName of MAINNET_CONFIG.CONTRACTS) {
      const contractPath = path.join(__dirname, "..", "contracts", `${contractName}.clar`);
      if (!fs.existsSync(contractPath)) {
        throw new Error(`Contract file not found: ${contractPath}`);
      }
    }
    
    // Check if contracts are already deployed
    for (const contractName of MAINNET_CONFIG.CONTRACTS) {
      try {
        const contractAddress = `${this.senderAddress}.${contractName}`;
        const response = await fetch(`${NETWORK.coreApiUrl}/extended/v1/contract/${contractAddress}`);
        
        if (response.ok) {
          console.warn(`⚠️  Contract ${contractName} already exists at ${contractAddress}`);
        }
      } catch (error) {
        // Contract doesn't exist, which is expected for new deployments
      }
    }
    
    console.log("✅ Security checks passed");
  }

  /**
   * Get user confirmation for mainnet deployment
   */
  private async getUserConfirmation(): Promise<boolean> {
    if (!MAINNET_CONFIG.REQUIRE_CONFIRMATION) {
      return true;
    }
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log("\n" + "=".repeat(60));
    console.log("⚠️  MAINNET DEPLOYMENT CONFIRMATION REQUIRED");
    console.log("=".repeat(60));
    console.log("This action will:");
    console.log("• Deploy 6 smart contracts to Stacks mainnet");
    console.log("• Cost approximately 5-15 STX in deployment fees");
    console.log("• Create permanent, immutable smart contracts");
    console.log("• Initialize the Achivio production system");
    console.log("");
    console.log("Deployer Address:", this.senderAddress);
    console.log("Network: Stacks Mainnet");
    console.log("");
    
    return new Promise((resolve) => {
      rl.question("Are you sure you want to proceed? (yes/no): ", (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
      });
    });
  }

  /**
   * Estimate total deployment costs
   */
  private async estimateDeploymentCosts(): Promise<number> {
    console.log("\n💰 Estimating deployment costs...");
    
    let totalEstimatedCost = 0;
    
    for (const contractName of MAINNET_CONFIG.CONTRACTS) {
      try {
        const contractSource = this.readContractSource(contractName);
        
        const estimatedCost = await estimateContractDeploy({
          contractName,
          codeBody: contractSource,
          senderKey: this.privateKey,
          network: NETWORK,
          anchorMode: AnchorMode.Any,
        });
        
        const costInSTX = estimatedCost.cost_scalar_change_by_byte / 1000000;
        totalEstimatedCost += estimatedCost.cost_scalar_change_by_byte;
        
        console.log(`📄 ${contractName}: ~${costInSTX.toFixed(3)} STX`);
        
        if (estimatedCost.cost_scalar_change_by_byte > MAINNET_CONFIG.MAX_DEPLOYMENT_COST) {
          console.warn(`⚠️  ${contractName} exceeds maximum deployment cost!`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to estimate cost for ${contractName}: ${error}`);
      }
    }
    
    console.log(`💎 Total estimated cost: ~${(totalEstimatedCost / 1000000).toFixed(3)} STX`);
    return totalEstimatedCost;
  }

  /**
   * Read contract source code from file
   */
  private readContractSource(contractName: string): string {
    const contractPath = path.join(__dirname, "..", "contracts", `${contractName}.clar`);
    return fs.readFileSync(contractPath, "utf8");
  }

  /**
   * Deploy a single contract with enhanced error handling
   */
  private async deployContract(contractName: string): Promise<MainnetDeploymentResult> {
    console.log(`\n📄 Deploying ${contractName} to mainnet...`);
    
    try {
      const contractSource = this.readContractSource(contractName);
      const contractAddress = `${this.senderAddress}.${contractName}`;
      
      // Get precise cost estimate
      const estimatedCost = await estimateContractDeploy({
        contractName,
        codeBody: contractSource,
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
      });
      
      const costInSTX = estimatedCost.cost_scalar_change_by_byte / 1000000;
      console.log(`💰 Deployment cost: ${costInSTX.toFixed(6)} STX`);
      
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
      console.log("📡 Broadcasting transaction...");
      const broadcastResult = await broadcastTransaction(deployTx, NETWORK);
      
      if (broadcastResult.error) {
        throw new Error(`Broadcast failed: ${broadcastResult.error}`);
      }

      const result: MainnetDeploymentResult = {
        contractName,
        txId: broadcastResult.txid,
        contractAddress,
        status: 'pending',
        deploymentCost: estimatedCost.cost_scalar_change_by_byte
      };

      this.totalCost += estimatedCost.cost_scalar_change_by_byte;

      console.log(`✅ ${contractName} deployment broadcasted to mainnet`);
      console.log(`🔗 Transaction ID: ${broadcastResult.txid}`);
      console.log(`📍 Contract Address: ${contractAddress}`);
      console.log(`🌐 Explorer: https://explorer.stacks.co/txid/${broadcastResult.txid}`);
      
      return result;
      
    } catch (error) {
      const result: MainnetDeploymentResult = {
        contractName,
        txId: '',
        contractAddress: `${this.senderAddress}.${contractName}`,
        status: 'failed',
        deploymentCost: 0,
        error: error instanceof Error ? error.message : String(error)
      };
      
      console.error(`❌ Failed to deploy ${contractName}: ${result.error}`);
      return result;
    }
  }

  /**
   * Wait for transaction confirmation with enhanced monitoring
   */
  private async waitForConfirmation(txId: string, contractName: string, maxRetries = 60): Promise<boolean> {
    console.log(`⏳ Waiting for ${contractName} confirmation...`);
    console.log(`🔗 Track progress: https://explorer.stacks.co/txid/${txId}`);
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`${NETWORK.coreApiUrl}/extended/v1/tx/${txId}`);
        const txData = await response.json();
        
        if (txData.tx_status === 'success') {
          console.log(`✅ ${contractName} confirmed on mainnet!`);
          return true;
        } else if (txData.tx_status === 'abort_by_response' || txData.tx_status === 'abort_by_post_condition') {
          console.error(`❌ ${contractName} deployment failed: ${txData.tx_status}`);
          if (txData.tx_result) {
            console.error(`📄 Result: ${txData.tx_result.repr}`);
          }
          return false;
        }
        
        // Show progress
        const progress = Math.round(((i + 1) / maxRetries) * 100);
        console.log(`⏳ ${contractName} pending... ${progress}% (${i + 1}/${maxRetries})`);
        
        // Wait 30 seconds between checks (mainnet blocks are slower)
        await new Promise(resolve => setTimeout(resolve, 30000));
        
      } catch (error) {
        console.error(`Error checking transaction status: ${error}`);
      }
    }
    
    console.error(`⏰ Timeout waiting for ${contractName} confirmation`);
    return false;
  }

  /**
   * Setup contract connections for mainnet
   */
  private async setupMainnetConnections(): Promise<void> {
    console.log("\n🔗 Setting up mainnet contract connections...");
    
    const contractAddress = this.senderAddress;
    const setupTransactions: string[] = [];
    
    try {
      // All the same setup as testnet but with mainnet network
      const setupCalls = [
        { contract: "task-tracker", function: "set-token-contract", args: [`${contractAddress}.achiv-token`] },
        { contract: "streak-system", function: "set-token-contract", args: [`${contractAddress}.achiv-token`] },
        { contract: "streak-system", function: "set-task-tracker-contract", args: [`${contractAddress}.task-tracker`] },
        { contract: "room-items", function: "set-achiv-token-contract", args: [`${contractAddress}.achiv-token`] },
        { contract: "room-items", function: "set-nft-badges-contract", args: [`${contractAddress}.nft-badges`] },
        { contract: "leaderboard", function: "set-achiv-token-contract", args: [`${contractAddress}.achiv-token`] },
        { contract: "achiv-token", function: "add-authorized-minter", args: [`${contractAddress}.task-tracker`] },
        { contract: "achiv-token", function: "add-authorized-minter", args: [`${contractAddress}.streak-system`] },
        { contract: "nft-badges", function: "add-authorized-minter", args: [`${contractAddress}.streak-system`] },
      ];

      for (const call of setupCalls) {
        console.log(`Setting up ${call.contract}.${call.function}...`);
        
        const tx = await makeContractCall({
          contractAddress,
          contractName: call.contract,
          functionName: call.function,
          functionArgs: call.args,
          senderKey: this.privateKey,
          network: NETWORK,
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
        });

        const result = await broadcastTransaction(tx, NETWORK);
        if (result.error) {
          throw new Error(`Failed to setup ${call.contract}.${call.function}: ${result.error}`);
        }
        
        setupTransactions.push(result.txid);
        console.log(`✅ ${call.contract}.${call.function} setup: ${result.txid}`);
        
        // Wait between setup calls
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

      console.log("✅ All mainnet contract connections established!");
      console.log("🔗 Setup transaction IDs:");
      setupTransactions.forEach((txId, index) => {
        console.log(`   ${index + 1}. ${txId}`);
      });
      
    } catch (error) {
      console.error("❌ Error setting up mainnet connections:", error);
      throw error;
    }
  }

  /**
   * Perform production-ready initial distribution
   */
  private async performMainnetDistribution(): Promise<void> {
    console.log("\n💎 Performing mainnet ACHIV token distribution...");
    
    try {
      const mintTx = await makeContractCall({
        contractAddress: this.senderAddress,
        contractName: "achiv-token",
        functionName: "admin-mint",
        functionArgs: [MAINNET_CONFIG.INITIAL_SUPPLY, this.senderAddress],
        senderKey: this.privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      });

      const result = await broadcastTransaction(mintTx, NETWORK);
      
      if (result.error) {
        throw new Error(`Distribution failed: ${result.error}`);
      }
      
      console.log(`✅ Mainnet distribution transaction: ${result.txid}`);
      console.log(`💎 Minted ${MAINNET_CONFIG.INITIAL_SUPPLY / 1000000} ACHIV tokens`);
      console.log(`🌐 Explorer: https://explorer.stacks.co/txid/${result.txid}`);
      
    } catch (error) {
      console.error("❌ Error in mainnet distribution:", error);
      throw error;
    }
  }

  /**
   * Main deployment function for mainnet
   */
  public async deploy(): Promise<void> {
    try {
      // Security checks
      await this.performSecurityChecks();
      
      // Cost estimation
      await this.estimateDeploymentCosts();
      
      // User confirmation
      const confirmed = await this.getUserConfirmation();
      if (!confirmed) {
        console.log("❌ Deployment cancelled by user");
        return;
      }
      
      console.log(`\n🚀 Starting mainnet deployment of ${MAINNET_CONFIG.CONTRACTS.length} contracts...`);
      console.log("⏰ Started at:", new Date().toISOString());
      
      // Deploy contracts sequentially
      for (let i = 0; i < MAINNET_CONFIG.CONTRACTS.length; i++) {
        const contractName = MAINNET_CONFIG.CONTRACTS[i];
        console.log(`\n📦 Deploying contract ${i + 1}/${MAINNET_CONFIG.CONTRACTS.length}: ${contractName}`);
        
        const result = await this.deployContract(contractName);
        this.deploymentResults.push(result);
        
        if (result.status === 'failed') {
          console.error(`❌ Mainnet deployment failed for ${contractName}, stopping...`);
          return;
        }
        
        // Wait for confirmation before next deployment
        const confirmed = await this.waitForConfirmation(result.txId, contractName);
        if (confirmed) {
          result.status = 'success';
        } else {
          result.status = 'failed';
          console.error(`❌ Failed to confirm ${contractName} on mainnet`);
          return;
        }
        
        // Longer delay between mainnet deployments
        if (i < MAINNET_CONFIG.CONTRACTS.length - 1) {
          console.log("⏳ Waiting before next deployment...");
          await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute
        }
      }
      
      // Setup contract connections
      await this.setupMainnetConnections();
      
      // Wait for setup transactions
      console.log("⏳ Waiting for setup transactions to confirm...");
      await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutes
      
      // Perform initial distribution
      await this.performMainnetDistribution();
      
      // Final summary
      this.printMainnetDeploymentSummary();
      
    } catch (error) {
      console.error("💥 Mainnet deployment failed:", error);
      throw error;
    }
  }

  /**
   * Print comprehensive mainnet deployment summary
   */
  private printMainnetDeploymentSummary(): void {
    console.log("\n" + "=".repeat(70));
    console.log("🎉 ACHIVIO MAINNET DEPLOYMENT COMPLETED");
    console.log("=".repeat(70));
    
    console.log(`📍 Deployer Address: ${this.senderAddress}`);
    console.log(`🌐 Network: Stacks Mainnet`);
    console.log(`⏰ Completed at: ${new Date().toISOString()}`);
    console.log(`💰 Total deployment cost: ${(this.totalCost / 1000000).toFixed(6)} STX\n`);
    
    console.log("📄 Mainnet Contract Addresses:");
    this.deploymentResults.forEach(result => {
      const status = result.status === 'success' ? '✅' : '❌';
      const cost = result.deploymentCost > 0 ? ` (${(result.deploymentCost / 1000000).toFixed(6)} STX)` : '';
      console.log(`${status} ${result.contractName}: ${result.contractAddress}${cost}`);
      if (result.txId) {
        console.log(`   🔗 TX: https://explorer.stacks.co/txid/${result.txId}`);
      }
    });
    
    console.log("\n🎯 Production Configuration:");
    console.log(`• Task completion reward: ${MAINNET_CONFIG.BASE_REWARD / 1000000} ACHIV`);
    console.log(`• Streak bonus: ${MAINNET_CONFIG.STREAK_BONUS / 1000000} ACHIV`);
    console.log(`• Initial supply: ${MAINNET_CONFIG.INITIAL_SUPPLY / 1000000} ACHIV`);
    
    console.log("\n🌐 Mainnet Explorer Links:");
    this.deploymentResults.forEach(result => {
      if (result.status === 'success') {
        console.log(`• ${result.contractName}: https://explorer.stacks.co/address/${result.contractAddress}`);
      }
    });
    
    console.log("\n🔐 Security Recommendations:");
    console.log("1. Verify all contract code on Stacks Explorer");
    console.log("2. Test all contract functions with small amounts first");
    console.log("3. Set up monitoring for contract events");
    console.log("4. Prepare emergency pause procedures if needed");
    console.log("5. Document all contract addresses for frontend integration");
    
    console.log("\n📋 Post-Deployment Checklist:");
    console.log("☐ Verify contract deployment on Explorer");
    console.log("☐ Test token minting and transfers");
    console.log("☐ Test task creation and completion");
    console.log("☐ Test streak system and badge minting");
    console.log("☐ Test room item purchases");
    console.log("☐ Update frontend with mainnet contract addresses");
    console.log("☐ Set up production monitoring");
    console.log("☐ Announce mainnet launch");
    
    console.log("\n" + "=".repeat(70));
    console.log("🚀 Achivio is now LIVE on Stacks Mainnet!");
    console.log("=".repeat(70));
  }
}

// Main execution
async function main() {
  const privateKey = process.env.STACKS_MAINNET_PRIVATE_KEY;
  
  if (!privateKey) {
    console.error("❌ Error: STACKS_MAINNET_PRIVATE_KEY environment variable is required");
    console.error("💡 Set your mainnet private key: export STACKS_MAINNET_PRIVATE_KEY='your-key-here'");
    process.exit(1);
  }
  
  if (privateKey === "your-mainnet-private-key-here") {
    console.error("❌ Error: Please set a real private key in STACKS_MAINNET_PRIVATE_KEY");
    console.error("⚠️  WARNING: Never commit private keys to version control!");
    process.exit(1);
  }
  
  const deployer = new AchivioMainnetDeployer(privateKey);
  
  try {
    await deployer.deploy();
    console.log("🎉 Mainnet deployment completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Mainnet deployment failed:", error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

export { AchivioMainnetDeployer, MAINNET_CONFIG };
