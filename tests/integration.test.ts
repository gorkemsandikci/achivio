import { describe, it, expect, beforeEach } from "vitest";
import { Cl, cvToJSON } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

/*
  Integration Tests - Full Achivio User Workflow
  Testing the complete user journey from task creation to room customization
*/

describe("Achivio Integration Tests", () => {
  beforeEach(() => {
    // Setup all contract connections
    setupContracts();
  });

  function setupContracts() {
    // Set contract addresses for all interconnected contracts
    
    // Task Tracker setup
    simnet.callPublicFn(
      "task-tracker",
      "set-token-contract",
      [Cl.contractPrincipal(deployer, "achiv-token")],
      deployer
    );

    // Streak System setup
    simnet.callPublicFn(
      "streak-system",
      "set-token-contract",
      [Cl.contractPrincipal(deployer, "achiv-token")],
      deployer
    );
    simnet.callPublicFn(
      "streak-system",
      "set-task-tracker-contract",
      [Cl.contractPrincipal(deployer, "task-tracker")],
      deployer
    );

    // Room Items setup
    simnet.callPublicFn(
      "room-items",
      "set-achiv-token-contract",
      [Cl.contractPrincipal(deployer, "achiv-token")],
      deployer
    );
    simnet.callPublicFn(
      "room-items",
      "set-nft-badges-contract",
      [Cl.contractPrincipal(deployer, "nft-badges")],
      deployer
    );

    // Leaderboard setup
    simnet.callPublicFn(
      "leaderboard",
      "set-achiv-token-contract",
      [Cl.contractPrincipal(deployer, "achiv-token")],
      deployer
    );
    simnet.callPublicFn(
      "leaderboard",
      "set-task-tracker-contract",
      [Cl.contractPrincipal(deployer, "task-tracker")],
      deployer
    );
    simnet.callPublicFn(
      "leaderboard",
      "set-streak-system-contract",
      [Cl.contractPrincipal(deployer, "streak-system")],
      deployer
    );

    // Authorize minters
    simnet.callPublicFn(
      "achiv-token",
      "add-authorized-minter",
      [Cl.contractPrincipal(deployer, "task-tracker")],
      deployer
    );
    simnet.callPublicFn(
      "achiv-token",
      "add-authorized-minter",
      [Cl.contractPrincipal(deployer, "streak-system")],
      deployer
    );
    simnet.callPublicFn(
      "nft-badges",
      "add-authorized-minter",
      [Cl.contractPrincipal(deployer, "streak-system")],
      deployer
    );
  }

  describe("Complete User Journey - Alice's Habit Tracking Experience", () => {
    it("should complete full workflow: task creation → completion → streak → badges → room items", () => {
      // Step 1: Alice creates her first habit
      console.log("🎯 Step 1: Alice creates daily exercise habit");
      
      const createTaskResult = simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Daily Exercise"),
          Cl.stringAscii("30 minutes of morning exercise to stay healthy"),
          Cl.uint(2000000), // 2 ACHIV reward
          Cl.stringAscii("fitness"),
          Cl.uint(3), // Medium difficulty
        ],
        alice
      );
      expect(createTaskResult.result).toBeOk(Cl.uint(1));

      // Step 2: Alice completes her task for the first time
      console.log("💪 Step 2: Alice completes her exercise task");
      
      const completeTaskResult = simnet.callPublicFn(
        "task-tracker",
        "complete-task",
        [Cl.uint(1)],
        alice
      );
      expect(completeTaskResult.result).toBeOk(Cl.uint(2000000));

      // Verify Alice earned ACHIV tokens
      const aliceBalance = simnet.callReadOnlyFn(
        "achiv-token",
        "get-balance",
        [Cl.principal(alice)],
        deployer
      );
      expect(aliceBalance.result).toBeOk(Cl.uint(2000000));

      // Step 3: Update Alice's streak (simulating task tracker calling streak system)
      console.log("🔥 Step 3: Alice's streak is updated");
      
      const updateStreakResult = simnet.callPublicFn(
        "streak-system",
        "update-user-streak",
        [Cl.principal(alice), Cl.uint(1)], // 1 task completed today
        deployer // Task tracker would call this
      );
      expect(updateStreakResult.result).toBeOk(Cl.uint(1)); // 1-day streak

      // Step 4: Alice claims her streak bonus
      console.log("🎁 Step 4: Alice claims streak bonus");
      
      const currentDate = simnet.callReadOnlyFn(
        "streak-system",
        "get-current-date",
        [],
        deployer
      );
      
      const claimBonusResult = simnet.callPublicFn(
        "streak-system",
        "claim-streak-bonus",
        [currentDate.result],
        alice
      );
      expect(claimBonusResult.result).toBeOk(Cl.uint(500000)); // Base streak bonus

      // Verify Alice's total balance increased
      const aliceNewBalance = simnet.callReadOnlyFn(
        "achiv-token",
        "get-balance",
        [Cl.principal(alice)],
        deployer
      );
      expect(aliceNewBalance.result).toBeOk(Cl.uint(2500000)); // 2 ACHIV + 0.5 bonus

      // Step 5: Simulate achieving a 7-day streak milestone
      console.log("🏆 Step 5: Alice achieves 7-day streak milestone");
      
      // Simulate multiple days of task completion
      for (let day = 2; day <= 7; day++) {
        // Advance time (simulate new day)
        simnet.mineEmptyBlocks(144); // ~1 day worth of blocks
        
        // Create new task for the day (or complete existing recurring task)
        simnet.callPublicFn(
          "task-tracker",
          "create-task",
          [
            Cl.stringAscii(`Day ${day} Exercise`),
            Cl.stringAscii("Daily exercise continuation"),
            Cl.uint(2000000),
            Cl.stringAscii("fitness"),
            Cl.uint(3),
          ],
          alice
        );
        
        // Complete the task
        simnet.callPublicFn(
          "task-tracker",
          "complete-task",
          [Cl.uint(day)],
          alice
        );
        
        // Update streak
        simnet.callPublicFn(
          "streak-system",
          "update-user-streak",
          [Cl.principal(alice), Cl.uint(1)],
          deployer
        );
      }

      // Check Alice's streak
      const aliceStreak = simnet.callReadOnlyFn(
        "streak-system",
        "get-user-streak",
        [Cl.principal(alice)],
        deployer
      );
      
      const streakData = cvToJSON(aliceStreak.result).value.value;
      expect(streakData["current-streak"].value).toBe("7");

      // Step 6: Alice receives a streak milestone badge
      console.log("🥇 Step 6: Alice earns 7-day streak badge");
      
      const mintBadgeResult = simnet.callPublicFn(
        "nft-badges",
        "mint-streak-badge",
        [Cl.principal(alice), Cl.uint(7)],
        deployer
      );
      expect(mintBadgeResult.result).toBeOk(Cl.uint(1)); // First badge token ID

      // Verify Alice owns the badge
      const badgeOwner = simnet.callReadOnlyFn(
        "nft-badges",
        "get-owner",
        [Cl.uint(1)],
        deployer
      );
      expect(badgeOwner.result).toBeOk(Cl.some(Cl.principal(alice)));

      // Step 7: Alice purchases room items with her ACHIV tokens
      console.log("🛋️ Step 7: Alice buys furniture for her virtual room");
      
      // Check Alice's current balance before purchase
      const balanceBeforePurchase = simnet.callReadOnlyFn(
        "achiv-token",
        "get-balance",
        [Cl.principal(alice)],
        deployer
      );
      console.log("Alice's balance before purchase:", cvToJSON(balanceBeforePurchase.result));

      // Purchase a modern desk (template ID 1, costs 5 ACHIV)
      const purchaseResult = simnet.callPublicFn(
        "room-items",
        "purchase-item",
        [Cl.uint(1)], // Modern desk template
        alice
      );
      expect(purchaseResult.result).toBeOk(Cl.uint(1)); // First room item token ID

      // Step 8: Alice places the item in her virtual room
      console.log("🏠 Step 8: Alice decorates her virtual room");
      
      const placeItemResult = simnet.callPublicFn(
        "room-items",
        "place-item-in-room",
        [
          Cl.uint(1), // Item ID
          Cl.tuple({ x: Cl.uint(500), y: Cl.uint(300), z: Cl.uint(0) }), // Position
          Cl.tuple({ x: Cl.uint(0), y: Cl.uint(0), z: Cl.uint(0) }), // Rotation
          Cl.uint(100), // Normal scale
        ],
        alice
      );
      expect(placeItemResult.result).toBeOk(Cl.bool(true));

      // Verify item placement
      const itemPlacement = simnet.callReadOnlyFn(
        "room-items",
        "get-item-placement",
        [Cl.principal(alice), Cl.uint(1)],
        deployer
      );
      
      const placementData = cvToJSON(itemPlacement.result).value.value;
      expect(placementData["is-placed"].value).toBe(true);

      // Step 9: Update Alice's stats in the leaderboard
      console.log("📊 Step 9: Alice's achievements are recorded in leaderboard");
      
      const updateStatsResult = simnet.callPublicFn(
        "leaderboard",
        "update-user-stats",
        [
          Cl.principal(alice),
          Cl.uint(7), // tasks completed
          Cl.uint(14000000), // rewards earned (approximate)
          Cl.uint(7), // current streak
          Cl.uint(7), // longest streak
          Cl.uint(1), // badges count
          Cl.uint(2), // level
        ],
        deployer
      );
      expect(updateStatsResult.result).toBeOk(Cl.uint(16470)); // Overall score

      // Step 10: Alice sets up her public profile
      console.log("👤 Step 10: Alice creates her public profile");
      
      const profileResult = simnet.callPublicFn(
        "leaderboard",
        "set-user-profile",
        [
          Cl.some(Cl.stringAscii("FitAlice")), // Display name
          Cl.bool(true), // Public profile
          Cl.bool(true), // Show in leaderboards
          Cl.stringAscii("fitness"), // Favorite category
          Cl.some(Cl.stringAscii("Fitness enthusiast achieving daily goals!")), // Bio
        ],
        alice
      );
      expect(profileResult.result).toBeOk(Cl.bool(true));

      // Final verification: Check Alice's complete profile
      console.log("✅ Final verification: Alice's complete Achivio profile");
      
      const finalProfile = simnet.callReadOnlyFn(
        "leaderboard",
        "get-user-achievements",
        [Cl.principal(alice)],
        deployer
      );
      
      const achievements = cvToJSON(finalProfile.result).value;
      expect(achievements.level.value).toBe("2");
      expect(achievements["total-tasks"].value).toBe("7");
      expect(achievements["current-streak"].value).toBe("7");
      expect(achievements["total-badges"].value).toBe("1");

      console.log("🎉 Alice has successfully completed her Achivio journey!");
      console.log("📈 Final Stats:", achievements);
    });
  });

  describe("Multi-User Social Features", () => {
    it("should handle multiple users competing on leaderboards", () => {
      console.log("🏁 Testing multi-user competition");

      // Setup tasks for competition
      const taskIds: number[] = [];
      for (let i = 1; i <= 5; i++) {
        const result = simnet.callPublicFn(
          "task-tracker",
          "create-task",
          [
            Cl.stringAscii(`Competition Task ${i}`),
            Cl.stringAscii(`Task ${i} for competition`),
            Cl.uint(1000000),
            Cl.stringAscii("competition"),
            Cl.uint(2),
          ],
          deployer
        );
        taskIds.push(i);
      }

      // Alice completes 3 tasks
      for (let i = 1; i <= 3; i++) {
        simnet.callPublicFn("task-tracker", "complete-task", [Cl.uint(i)], alice);
        simnet.mineEmptyBlocks(144); // New day
      }

      // Bob completes 4 tasks
      for (let i = 1; i <= 4; i++) {
        simnet.callPublicFn("task-tracker", "complete-task", [Cl.uint(i)], bob);
        simnet.mineEmptyBlocks(144); // New day
      }

      // Charlie completes 2 tasks
      for (let i = 1; i <= 2; i++) {
        simnet.callPublicFn("task-tracker", "complete-task", [Cl.uint(i)], charlie);
        simnet.mineEmptyBlocks(144); // New day
      }

      // Update all user stats
      simnet.callPublicFn(
        "leaderboard",
        "update-user-stats",
        [Cl.principal(alice), Cl.uint(3), Cl.uint(3000000), Cl.uint(3), Cl.uint(3), Cl.uint(0), Cl.uint(1)],
        deployer
      );

      simnet.callPublicFn(
        "leaderboard",
        "update-user-stats",
        [Cl.principal(bob), Cl.uint(4), Cl.uint(4000000), Cl.uint(4), Cl.uint(4), Cl.uint(0), Cl.uint(2)],
        deployer
      );

      simnet.callPublicFn(
        "leaderboard",
        "update-user-stats",
        [Cl.principal(charlie), Cl.uint(2), Cl.uint(2000000), Cl.uint(2), Cl.uint(2), Cl.uint(0), Cl.uint(1)],
        deployer
      );

      // Compare users
      const comparison = simnet.callReadOnlyFn(
        "leaderboard",
        "compare-users",
        [Cl.principal(alice), Cl.principal(bob)],
        deployer
      );

      const comparisonData = cvToJSON(comparison.result).value;
      expect(comparisonData.winner.value).toBe(bob); // Bob should win with more tasks

      // Check rankings
      const aliceRank = simnet.callReadOnlyFn(
        "leaderboard",
        "get-user-rank",
        [Cl.principal(alice), Cl.uint(1), Cl.uint(4)], // Overall, All-time
        deployer
      );

      const bobRank = simnet.callReadOnlyFn(
        "leaderboard",
        "get-user-rank",
        [Cl.principal(bob), Cl.uint(1), Cl.uint(4)],
        deployer
      );

      // Bob should have better rank (lower number = better rank)
      expect(Number(cvToJSON(bobRank.result).value)).toBeLessThan(
        Number(cvToJSON(aliceRank.result).value)
      );

      console.log("🏆 Competition results:");
      console.log("Alice rank:", cvToJSON(aliceRank.result).value);
      console.log("Bob rank:", cvToJSON(bobRank.result).value);
    });
  });

  describe("Advanced Room Customization", () => {
    it("should handle badge-locked special items", () => {
      console.log("🔐 Testing badge-locked item purchase");

      // Give Alice some ACHIV tokens
      simnet.callPublicFn(
        "achiv-token",
        "admin-mint",
        [Cl.uint(25000000), Cl.principal(alice)], // 25 ACHIV
        deployer
      );

      // Try to buy golden trophy without streak badge (should fail)
      const failedPurchase = simnet.callPublicFn(
        "room-items",
        "purchase-item",
        [Cl.uint(4)], // Golden trophy (requires streak badge)
        alice
      );
      expect(failedPurchase.result).toBeErr(Cl.uint(512)); // ERR_BADGE_REQUIREMENT_NOT_MET

      // Give Alice a streak badge
      simnet.callPublicFn(
        "nft-badges",
        "mint-streak-badge",
        [Cl.principal(alice), Cl.uint(7)],
        deployer
      );

      // Now purchase should succeed
      const successfulPurchase = simnet.callPublicFn(
        "room-items",
        "purchase-item",
        [Cl.uint(4)], // Golden trophy
        alice
      );
      expect(successfulPurchase.result).toBeOk(Cl.uint(1));

      // Verify Alice owns the special item
      const itemOwner = simnet.callReadOnlyFn(
        "room-items",
        "get-owner",
        [Cl.uint(1)],
        deployer
      );
      expect(itemOwner.result).toBeOk(Cl.some(Cl.principal(alice)));

      console.log("✨ Alice successfully purchased badge-locked golden trophy!");
    });

    it("should handle room customization and themes", () => {
      console.log("🎨 Testing room theme customization");

      // Give Alice room items first
      simnet.callPublicFn(
        "achiv-token",
        "admin-mint",
        [Cl.uint(10000000), Cl.principal(alice)],
        deployer
      );

      simnet.callPublicFn(
        "room-items",
        "purchase-item",
        [Cl.uint(1)], // Modern desk
        alice
      );

      // Change room theme
      const themeResult = simnet.callPublicFn(
        "room-items",
        "change-room-theme",
        [Cl.stringAscii("cyberpunk"), Cl.stringAscii("synthwave-beats")],
        alice
      );
      expect(themeResult.result).toBeOk(Cl.bool(true));

      // Verify room theme
      const roomData = simnet.callReadOnlyFn(
        "room-items",
        "get-user-room",
        [Cl.principal(alice)],
        deployer
      );

      const room = cvToJSON(roomData.result).value.value;
      expect(room["room-theme"].value).toBe("cyberpunk");
      expect(room["background-music"].value).toBe("synthwave-beats");

      console.log("🌈 Alice's room theme updated to cyberpunk!");
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle contract pause scenarios gracefully", () => {
      console.log("⏸️ Testing contract pause functionality");

      // Pause all contracts
      simnet.callPublicFn("achiv-token", "pause-contract", [], deployer);
      simnet.callPublicFn("task-tracker", "pause-contract", [], deployer);
      simnet.callPublicFn("streak-system", "pause-contract", [], deployer);
      simnet.callPublicFn("nft-badges", "pause-contract", [], deployer);
      simnet.callPublicFn("room-items", "pause-contract", [], deployer);
      simnet.callPublicFn("leaderboard", "pause-contract", [], deployer);

      // Try operations (should all fail)
      const taskResult = simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Test"),
          Cl.stringAscii("Test"),
          Cl.uint(1000000),
          Cl.stringAscii("test"),
          Cl.uint(1),
        ],
        alice
      );
      expect(taskResult.result).toBeErr(Cl.uint(205)); // ERR_CONTRACT_PAUSED

      const mintResult = simnet.callPublicFn(
        "achiv-token",
        "admin-mint",
        [Cl.uint(1000000), Cl.principal(alice)],
        deployer
      );
      expect(mintResult.result).toBeErr(Cl.uint(104)); // ERR_CONTRACT_PAUSED

      // Unpause and verify operations work again
      simnet.callPublicFn("task-tracker", "unpause-contract", [], deployer);
      simnet.callPublicFn("achiv-token", "unpause-contract", [], deployer);

      const taskResult2 = simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Test After Unpause"),
          Cl.stringAscii("Test"),
          Cl.uint(1000000),
          Cl.stringAscii("test"),
          Cl.uint(1),
        ],
        alice
      );
      expect(taskResult2.result).toBeOk(Cl.uint(1));

      console.log("✅ Contract pause/unpause functionality working correctly");
    });

    it("should handle insufficient funds scenarios", () => {
      console.log("💸 Testing insufficient funds scenarios");

      // Try to buy expensive item without enough ACHIV
      const purchaseResult = simnet.callPublicFn(
        "room-items",
        "purchase-item",
        [Cl.uint(4)], // Golden trophy (20 ACHIV)
        alice
      );
      expect(purchaseResult.result).toBeErr(Cl.uint(506)); // ERR_INSUFFICIENT_FUNDS

      console.log("✅ Insufficient funds protection working correctly");
    });
  });

  describe("Token Economics", () => {
    it("should demonstrate deflationary tokenomics through room item purchases", () => {
      console.log("🔥 Testing deflationary token mechanics");

      // Initial total supply should be 0
      const initialSupply = simnet.callReadOnlyFn(
        "achiv-token",
        "get-total-supply",
        [],
        deployer
      );
      expect(initialSupply.result).toBeOk(Cl.uint(0));

      // Mint tokens through task completion
      simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Deflationary Test"),
          Cl.stringAscii("Test task"),
          Cl.uint(10000000), // 10 ACHIV reward
          Cl.stringAscii("test"),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.callPublicFn("task-tracker", "complete-task", [Cl.uint(1)], alice);

      // Check supply increased
      const afterMintSupply = simnet.callReadOnlyFn(
        "achiv-token",
        "get-total-supply",
        [],
        deployer
      );
      expect(afterMintSupply.result).toBeOk(Cl.uint(10000000));

      // Purchase room item (burns tokens)
      const purchaseResult = simnet.callPublicFn(
        "room-items",
        "purchase-item",
        [Cl.uint(1)], // Modern desk (5 ACHIV)
        alice
      );
      expect(purchaseResult.result).toBeOk(Cl.uint(1));

      // Check supply decreased (deflationary)
      const afterBurnSupply = simnet.callReadOnlyFn(
        "achiv-token",
        "get-total-supply",
        [],
        deployer
      );
      expect(afterBurnSupply.result).toBeOk(Cl.uint(5000000)); // 10 - 5 = 5 ACHIV

      console.log("🔥 Deflationary mechanics working: supply reduced from 10 to 5 ACHIV");
    });
  });
});
