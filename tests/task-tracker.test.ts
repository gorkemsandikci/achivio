import { describe, it, expect, beforeEach } from "vitest";
import { Cl, cvToJSON } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

/*
  Task Tracker Contract Tests
  Testing daily habit completion tracking and reward distribution
*/

describe("Task Tracker Contract", () => {
  beforeEach(() => {
    // Setup: Set the ACHIV token contract address
    simnet.callPublicFn(
      "task-tracker",
      "set-token-contract",
      [Cl.contractPrincipal(deployer, "achiv-token")],
      deployer
    );

    // Add task-tracker as authorized minter in achiv-token
    simnet.callPublicFn(
      "achiv-token",
      "add-authorized-minter",
      [Cl.contractPrincipal(deployer, "task-tracker")],
      deployer
    );
  });

  describe("Contract Setup", () => {
    it("should not be paused initially", () => {
      const { result } = simnet.callReadOnlyFn(
        "task-tracker",
        "is-paused",
        [],
        deployer
      );
      expect(result).toBeBool(false);
    });

    it("should return correct total stats initially", () => {
      const { result } = simnet.callReadOnlyFn(
        "task-tracker",
        "get-total-stats",
        [],
        deployer
      );
      
      const stats = cvToJSON(result).value;
      expect(stats["total-tasks-completed"]).toEqual({ type: "uint", value: "0" });
      expect(stats["total-users"]).toEqual({ type: "uint", value: "0" });
      expect(stats["contract-paused"]).toEqual({ type: "bool", value: false });
    });

    it("should allow owner to pause contract", () => {
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "pause-contract",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      const pausedResult = simnet.callReadOnlyFn(
        "task-tracker",
        "is-paused",
        [],
        deployer
      );
      expect(pausedResult.result).toBeBool(true);
    });
  });

  describe("Task Creation", () => {
    it("should allow users to create tasks", () => {
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Morning Exercise"),
          Cl.stringAscii("30 minutes of morning exercise routine"),
          Cl.uint(2000000), // 2 ACHIV reward
          Cl.stringAscii("fitness"),
          Cl.uint(3), // difficulty level
        ],
        wallet1
      );
      expect(result).toBeOk(Cl.uint(1)); // First task ID

      // Verify task was created
      const taskResult = simnet.callReadOnlyFn(
        "task-tracker",
        "get-task",
        [Cl.uint(1)],
        deployer
      );
      
      const task = cvToJSON(taskResult.result).value.value;
      expect(task.creator.value).toBe(wallet1);
      expect(task.title.value).toBe("Morning Exercise");
      expect(task["reward-amount"].value).toBe("2000000");
      expect(task.category.value).toBe("fitness");
      expect(task.difficulty.value).toBe("3");
      expect(task["is-active"].value).toBe(true);
    });

    it("should not allow creating tasks when paused", () => {
      // Pause contract
      simnet.callPublicFn("task-tracker", "pause-contract", [], deployer);

      const { result } = simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Test Task"),
          Cl.stringAscii("Test Description"),
          Cl.uint(1000000),
          Cl.stringAscii("test"),
          Cl.uint(1),
        ],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(205)); // ERR_CONTRACT_PAUSED
    });

    it("should not allow invalid difficulty levels", () => {
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Invalid Task"),
          Cl.stringAscii("Task with invalid difficulty"),
          Cl.uint(1000000),
          Cl.stringAscii("test"),
          Cl.uint(6), // Invalid difficulty (> 5)
        ],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(203)); // ERR_INVALID_TASK_ID (reused for validation)
    });

    it("should not allow zero reward amount", () => {
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Zero Reward Task"),
          Cl.stringAscii("Task with zero reward"),
          Cl.uint(0), // Zero reward
          Cl.stringAscii("test"),
          Cl.uint(1),
        ],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(208)); // ERR_INVALID_REWARD_AMOUNT
    });

    it("should increment task IDs correctly", () => {
      // Create first task
      const result1 = simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Task 1"),
          Cl.stringAscii("First task"),
          Cl.uint(1000000),
          Cl.stringAscii("test"),
          Cl.uint(1),
        ],
        wallet1
      );
      expect(result1.result).toBeOk(Cl.uint(1));

      // Create second task
      const result2 = simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Task 2"),
          Cl.stringAscii("Second task"),
          Cl.uint(1500000),
          Cl.stringAscii("test"),
          Cl.uint(2),
        ],
        wallet2
      );
      expect(result2.result).toBeOk(Cl.uint(2));
    });
  });

  describe("Task Completion", () => {
    beforeEach(() => {
      // Create a test task
      simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Daily Reading"),
          Cl.stringAscii("Read for 30 minutes daily"),
          Cl.uint(1000000), // 1 ACHIV reward
          Cl.stringAscii("education"),
          Cl.uint(2),
        ],
        wallet1
      );
    });

    it("should allow users to complete tasks and earn rewards", () => {
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "complete-task",
        [Cl.uint(1)],
        wallet2
      );
      expect(result).toBeOk(Cl.uint(1000000)); // Reward amount

      // Check user received ACHIV tokens
      const balanceResult = simnet.callReadOnlyFn(
        "achiv-token",
        "get-balance",
        [Cl.principal(wallet2)],
        deployer
      );
      expect(balanceResult.result).toBeOk(Cl.uint(1000000));

      // Check user profile was updated
      const profileResult = simnet.callReadOnlyFn(
        "task-tracker",
        "get-user-profile",
        [Cl.principal(wallet2)],
        deployer
      );
      
      const profile = cvToJSON(profileResult.result).value.value;
      expect(profile["total-tasks-completed"].value).toBe("1");
      expect(profile["total-rewards-earned"].value).toBe("1000000");
    });

    it("should not allow completing the same task twice on the same day", () => {
      // Complete task once
      simnet.callPublicFn(
        "task-tracker",
        "complete-task",
        [Cl.uint(1)],
        wallet2
      );

      // Try to complete again
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "complete-task",
        [Cl.uint(1)],
        wallet2
      );
      expect(result).toBeErr(Cl.uint(202)); // ERR_TASK_ALREADY_COMPLETED
    });

    it("should not allow completing non-existent tasks", () => {
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "complete-task",
        [Cl.uint(999)], // Non-existent task
        wallet2
      );
      expect(result).toBeErr(Cl.uint(201)); // ERR_TASK_NOT_FOUND
    });

    it("should not allow completing inactive tasks", () => {
      // Deactivate the task
      simnet.callPublicFn(
        "task-tracker",
        "deactivate-task",
        [Cl.uint(1)],
        wallet1 // Task creator
      );

      // Try to complete deactivated task
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "complete-task",
        [Cl.uint(1)],
        wallet2
      );
      expect(result).toBeErr(Cl.uint(201)); // ERR_TASK_NOT_FOUND (inactive tasks)
    });

    it("should update task completion count", () => {
      // Complete task by multiple users
      simnet.callPublicFn("task-tracker", "complete-task", [Cl.uint(1)], wallet2);
      simnet.callPublicFn("task-tracker", "complete-task", [Cl.uint(1)], wallet3);

      // Check task completion count
      const taskResult = simnet.callReadOnlyFn(
        "task-tracker",
        "get-task",
        [Cl.uint(1)],
        deployer
      );
      
      const task = cvToJSON(taskResult.result).value.value;
      expect(task["total-completions"].value).toBe("2");
    });

    it("should update global statistics", () => {
      // Complete task
      simnet.callPublicFn("task-tracker", "complete-task", [Cl.uint(1)], wallet2);

      // Check total stats
      const statsResult = simnet.callReadOnlyFn(
        "task-tracker",
        "get-total-stats",
        [],
        deployer
      );
      
      const stats = cvToJSON(statsResult.result).value;
      expect(stats["total-tasks-completed"].value).toBe("1");
    });

    it("should check if task is completed today", () => {
      // Complete task
      simnet.callPublicFn("task-tracker", "complete-task", [Cl.uint(1)], wallet2);

      // Check completion status
      const completedResult = simnet.callReadOnlyFn(
        "task-tracker",
        "is-task-completed-today",
        [Cl.principal(wallet2), Cl.uint(1)],
        deployer
      );
      expect(completedResult.result).toBeBool(true);

      // Check for different user
      const notCompletedResult = simnet.callReadOnlyFn(
        "task-tracker",
        "is-task-completed-today",
        [Cl.principal(wallet3), Cl.uint(1)],
        deployer
      );
      expect(notCompletedResult.result).toBeBool(false);
    });
  });

  describe("Task Management", () => {
    beforeEach(() => {
      // Create test tasks
      simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Task 1"),
          Cl.stringAscii("Description 1"),
          Cl.uint(1000000),
          Cl.stringAscii("category1"),
          Cl.uint(1),
        ],
        wallet1
      );
    });

    it("should allow task creator to deactivate task", () => {
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "deactivate-task",
        [Cl.uint(1)],
        wallet1 // Task creator
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify task is deactivated
      const taskResult = simnet.callReadOnlyFn(
        "task-tracker",
        "get-task",
        [Cl.uint(1)],
        deployer
      );
      
      const task = cvToJSON(taskResult.result).value.value;
      expect(task["is-active"].value).toBe(false);
    });

    it("should allow contract owner to deactivate any task", () => {
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "deactivate-task",
        [Cl.uint(1)],
        deployer // Contract owner
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should not allow unauthorized users to deactivate tasks", () => {
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "deactivate-task",
        [Cl.uint(1)],
        wallet2 // Not creator or owner
      );
      expect(result).toBeErr(Cl.uint(204)); // ERR_UNAUTHORIZED
    });

    it("should not allow deactivating non-existent tasks", () => {
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "deactivate-task",
        [Cl.uint(999)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(201)); // ERR_TASK_NOT_FOUND
    });
  });

  describe("User Level System", () => {
    it("should calculate user levels correctly", () => {
      // Test different task completion counts
      const level1 = simnet.callReadOnlyFn(
        "task-tracker",
        "calculate-user-level",
        [Cl.uint(5)],
        deployer
      );
      expect(level1.result).toBeUint(1);

      const level2 = simnet.callReadOnlyFn(
        "task-tracker",
        "calculate-user-level",
        [Cl.uint(15)],
        deployer
      );
      expect(level2.result).toBeUint(2);

      const level3 = simnet.callReadOnlyFn(
        "task-tracker",
        "calculate-user-level",
        [Cl.uint(35)],
        deployer
      );
      expect(level3.result).toBeUint(3);

      const level6 = simnet.callReadOnlyFn(
        "task-tracker",
        "calculate-user-level",
        [Cl.uint(300)],
        deployer
      );
      expect(level6.result).toBeUint(6);
    });

    it("should allow updating user levels", () => {
      // First complete some tasks to create user profile
      simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Test Task"),
          Cl.stringAscii("Test Description"),
          Cl.uint(1000000),
          Cl.stringAscii("test"),
          Cl.uint(1),
        ],
        wallet1
      );

      // Complete multiple tasks to increase level
      for (let i = 0; i < 15; i++) {
        simnet.callPublicFn(
          "task-tracker",
          "create-task",
          [
            Cl.stringAscii(`Task ${i + 2}`),
            Cl.stringAscii(`Description ${i + 2}`),
            Cl.uint(1000000),
            Cl.stringAscii("test"),
            Cl.uint(1),
          ],
          wallet1
        );
        simnet.callPublicFn(
          "task-tracker",
          "complete-task",
          [Cl.uint(i + 2)],
          wallet2
        );
        // Simulate different days by advancing block height
        simnet.mineEmptyBlocks(144); // ~1 day worth of blocks
      }

      // Update user level
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "update-user-level",
        [Cl.principal(wallet2)],
        deployer
      );
      expect(result).toBeOk(Cl.uint(2)); // Should be level 2 for 15 tasks

      // Check user profile
      const profileResult = simnet.callReadOnlyFn(
        "task-tracker",
        "get-user-profile",
        [Cl.principal(wallet2)],
        deployer
      );
      
      const profile = cvToJSON(profileResult.result).value.value;
      expect(profile.level.value).toBe("2");
    });
  });

  describe("Daily Statistics", () => {
    beforeEach(() => {
      // Create test task
      simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Daily Task"),
          Cl.stringAscii("Daily task for stats testing"),
          Cl.uint(1000000),
          Cl.stringAscii("daily"),
          Cl.uint(2),
        ],
        wallet1
      );
    });

    it("should track daily statistics", () => {
      // Complete task
      simnet.callPublicFn("task-tracker", "complete-task", [Cl.uint(1)], wallet2);

      // Get current date for stats check
      const currentDate = simnet.callReadOnlyFn(
        "task-tracker",
        "get-current-date",
        [],
        deployer
      );

      // Check daily stats
      const statsResult = simnet.callReadOnlyFn(
        "task-tracker",
        "get-user-daily-stats",
        [Cl.principal(wallet2), currentDate.result],
        deployer
      );
      
      const stats = cvToJSON(statsResult.result).value.value;
      expect(stats["tasks-completed"].value).toBe("1");
      expect(stats["total-rewards"].value).toBe("1000000");
    });

    it("should return current date correctly", () => {
      const { result } = simnet.callReadOnlyFn(
        "task-tracker",
        "get-current-date",
        [],
        deployer
      );
      
      // Current date should be block height divided by 144
      const expectedDate = Math.floor(simnet.blockHeight / 144);
      expect(result).toBeUint(expectedDate);
    });
  });

  describe("Security and Edge Cases", () => {
    it("should not allow operations when paused", () => {
      // Pause contract
      simnet.callPublicFn("task-tracker", "pause-contract", [], deployer);

      // Try to complete task
      const { result } = simnet.callPublicFn(
        "task-tracker",
        "complete-task",
        [Cl.uint(1)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(205)); // ERR_CONTRACT_PAUSED
    });

    it("should handle non-existent user profiles gracefully", () => {
      const { result } = simnet.callReadOnlyFn(
        "task-tracker",
        "get-user-profile",
        [Cl.principal(wallet3)],
        deployer
      );
      expect(result).toBeNone();
    });

    it("should emit proper events on task completion", () => {
      // Create task
      simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Event Test Task"),
          Cl.stringAscii("Task for event testing"),
          Cl.uint(1000000),
          Cl.stringAscii("test"),
          Cl.uint(1),
        ],
        wallet1
      );

      // Complete task and check events
      const { events } = simnet.callPublicFn(
        "task-tracker",
        "complete-task",
        [Cl.uint(1)],
        wallet2
      );

      // Should have events from both task-tracker and achiv-token
      expect(events.length).toBeGreaterThan(0);
      
      const printEvents = events.filter(e => e.event === 'print');
      expect(printEvents.length).toBeGreaterThan(0);
    });

    it("should validate task creation parameters", () => {
      // Test with invalid difficulty (0)
      const result1 = simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Invalid Task"),
          Cl.stringAscii("Task with invalid difficulty"),
          Cl.uint(1000000),
          Cl.stringAscii("test"),
          Cl.uint(0), // Invalid difficulty
        ],
        wallet1
      );
      expect(result1.result).toBeErr(Cl.uint(203)); // ERR_INVALID_TASK_ID

      // Test with invalid difficulty (> 5)
      const result2 = simnet.callPublicFn(
        "task-tracker",
        "create-task",
        [
          Cl.stringAscii("Invalid Task 2"),
          Cl.stringAscii("Task with invalid difficulty 2"),
          Cl.uint(1000000),
          Cl.stringAscii("test"),
          Cl.uint(10), // Invalid difficulty
        ],
        wallet1
      );
      expect(result2.result).toBeErr(Cl.uint(203)); // ERR_INVALID_TASK_ID
    });
  });
});
