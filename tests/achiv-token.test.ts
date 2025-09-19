import { describe, it, expect, beforeEach } from "vitest";
import { Cl, cvToJSON } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

/*
  ACHIV Token Contract Tests
  Testing the core fungible token functionality with security features
*/

describe("ACHIV Token Contract", () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe("Token Metadata", () => {
    it("should return correct token name", () => {
      const { result } = simnet.callReadOnlyFn(
        "achiv-token",
        "get-name",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.stringAscii("Achivio Token"));
    });

    it("should return correct token symbol", () => {
      const { result } = simnet.callReadOnlyFn(
        "achiv-token",
        "get-symbol",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.stringAscii("ACHIV"));
    });

    it("should return correct decimals", () => {
      const { result } = simnet.callReadOnlyFn(
        "achiv-token",
        "get-decimals",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(6));
    });

    it("should return token URI", () => {
      const { result } = simnet.callReadOnlyFn(
        "achiv-token",
        "get-token-uri",
        [],
        deployer
      );
      expect(result).toBeOk(
        Cl.some(Cl.stringUtf8("https://achivio.app/token-metadata"))
      );
    });
  });

  describe("Initial State", () => {
    it("should start with zero total supply", () => {
      const { result } = simnet.callReadOnlyFn(
        "achiv-token",
        "get-total-supply",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("should have deployer as contract owner", () => {
      const { result } = simnet.callReadOnlyFn(
        "achiv-token",
        "is-authorized-minter",
        [Cl.principal(deployer)],
        deployer
      );
      expect(result).toBeBool(true);
    });

    it("should not be paused initially", () => {
      const { result } = simnet.callReadOnlyFn(
        "achiv-token",
        "is-paused",
        [],
        deployer
      );
      expect(result).toBeBool(false);
    });

    it("should have zero rewards distributed initially", () => {
      const { result } = simnet.callReadOnlyFn(
        "achiv-token",
        "get-total-rewards-distributed",
        [],
        deployer
      );
      expect(result).toBeUint(0);
    });
  });

  describe("Admin Functions", () => {
    it("should allow owner to add authorized minter", () => {
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "add-authorized-minter",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify minter was added
      const checkResult = simnet.callReadOnlyFn(
        "achiv-token",
        "is-authorized-minter",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(checkResult.result).toBeBool(true);
    });

    it("should not allow non-owner to add authorized minter", () => {
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "add-authorized-minter",
        [Cl.principal(wallet2)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_OWNER_ONLY
    });

    it("should allow owner to remove authorized minter", () => {
      // First add a minter
      simnet.callPublicFn(
        "achiv-token",
        "add-authorized-minter",
        [Cl.principal(wallet1)],
        deployer
      );

      // Then remove it
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "remove-authorized-minter",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify minter was removed
      const checkResult = simnet.callReadOnlyFn(
        "achiv-token",
        "is-authorized-minter",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(checkResult.result).toBeBool(false);
    });

    it("should allow owner to pause contract", () => {
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "pause-contract",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify contract is paused
      const checkResult = simnet.callReadOnlyFn(
        "achiv-token",
        "is-paused",
        [],
        deployer
      );
      expect(checkResult.result).toBeBool(true);
    });

    it("should allow owner to unpause contract", () => {
      // First pause
      simnet.callPublicFn("achiv-token", "pause-contract", [], deployer);

      // Then unpause
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "unpause-contract",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify contract is unpaused
      const checkResult = simnet.callReadOnlyFn(
        "achiv-token",
        "is-paused",
        [],
        deployer
      );
      expect(checkResult.result).toBeBool(false);
    });
  });

  describe("Minting Functions", () => {
    beforeEach(() => {
      // Add wallet1 as authorized minter for tests
      simnet.callPublicFn(
        "achiv-token",
        "add-authorized-minter",
        [Cl.principal(wallet1)],
        deployer
      );
    });

    it("should allow authorized minter to mint rewards", () => {
      const amount = 1000000; // 1 ACHIV token
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "mint-reward",
        [Cl.uint(amount), Cl.principal(wallet2)],
        wallet1
      );
      expect(result).toBeOk(Cl.uint(amount));

      // Check recipient balance
      const balanceResult = simnet.callReadOnlyFn(
        "achiv-token",
        "get-balance",
        [Cl.principal(wallet2)],
        deployer
      );
      expect(balanceResult.result).toBeOk(Cl.uint(amount));

      // Check total supply
      const supplyResult = simnet.callReadOnlyFn(
        "achiv-token",
        "get-total-supply",
        [],
        deployer
      );
      expect(supplyResult.result).toBeOk(Cl.uint(amount));

      // Check total rewards distributed
      const rewardsResult = simnet.callReadOnlyFn(
        "achiv-token",
        "get-total-rewards-distributed",
        [],
        deployer
      );
      expect(rewardsResult.result).toBeUint(amount);
    });

    it("should not allow unauthorized user to mint rewards", () => {
      const amount = 1000000;
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "mint-reward",
        [Cl.uint(amount), Cl.principal(wallet2)],
        wallet2
      );
      expect(result).toBeErr(Cl.uint(105)); // ERR_UNAUTHORIZED_MINTER
    });

    it("should not allow minting zero amount", () => {
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "mint-reward",
        [Cl.uint(0), Cl.principal(wallet2)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(103)); // ERR_INVALID_AMOUNT
    });

    it("should not allow minting when contract is paused", () => {
      // Pause contract
      simnet.callPublicFn("achiv-token", "pause-contract", [], deployer);

      const amount = 1000000;
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "mint-reward",
        [Cl.uint(amount), Cl.principal(wallet2)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(104)); // ERR_CONTRACT_PAUSED
    });

    it("should allow owner to admin mint", () => {
      const amount = 5000000; // 5 ACHIV tokens
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "admin-mint",
        [Cl.uint(amount), Cl.principal(wallet2)],
        deployer
      );
      expect(result).toBeOk(Cl.uint(amount));

      // Check recipient balance
      const balanceResult = simnet.callReadOnlyFn(
        "achiv-token",
        "get-balance",
        [Cl.principal(wallet2)],
        deployer
      );
      expect(balanceResult.result).toBeOk(Cl.uint(amount));
    });
  });

  describe("Transfer Functions", () => {
    beforeEach(() => {
      // Mint some tokens to wallet1 for transfer tests
      simnet.callPublicFn(
        "achiv-token",
        "add-authorized-minter",
        [Cl.principal(wallet1)],
        deployer
      );
      simnet.callPublicFn(
        "achiv-token",
        "mint-reward",
        [Cl.uint(10000000), Cl.principal(wallet1)],
        wallet1
      );
    });

    it("should allow token owner to transfer tokens", () => {
      const amount = 2000000; // 2 ACHIV tokens
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "transfer",
        [
          Cl.uint(amount),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));

      // Check sender balance
      const senderBalance = simnet.callReadOnlyFn(
        "achiv-token",
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(senderBalance.result).toBeOk(Cl.uint(8000000));

      // Check recipient balance
      const recipientBalance = simnet.callReadOnlyFn(
        "achiv-token",
        "get-balance",
        [Cl.principal(wallet2)],
        deployer
      );
      expect(recipientBalance.result).toBeOk(Cl.uint(amount));
    });

    it("should not allow non-owner to transfer tokens", () => {
      const amount = 2000000;
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "transfer",
        [
          Cl.uint(amount),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet2
      );
      expect(result).toBeErr(Cl.uint(101)); // ERR_NOT_TOKEN_OWNER
    });

    it("should not allow transfer of more tokens than balance", () => {
      const amount = 20000000; // More than wallet1 has
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "transfer",
        [
          Cl.uint(amount),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR_INSUFFICIENT_BALANCE
    });

    it("should not allow transfer when contract is paused", () => {
      // Pause contract
      simnet.callPublicFn("achiv-token", "pause-contract", [], deployer);

      const amount = 1000000;
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "transfer",
        [
          Cl.uint(amount),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(104)); // ERR_CONTRACT_PAUSED
    });
  });

  describe("Burn Functions", () => {
    beforeEach(() => {
      // Mint some tokens to wallet1 for burn tests
      simnet.callPublicFn(
        "achiv-token",
        "add-authorized-minter",
        [Cl.principal(wallet1)],
        deployer
      );
      simnet.callPublicFn(
        "achiv-token",
        "mint-reward",
        [Cl.uint(10000000), Cl.principal(wallet1)],
        wallet1
      );
    });

    it("should allow token owner to burn tokens", () => {
      const burnAmount = 3000000; // 3 ACHIV tokens
      const initialSupply = 10000000;

      const { result } = simnet.callPublicFn(
        "achiv-token",
        "burn",
        [Cl.uint(burnAmount), Cl.principal(wallet1)],
        wallet1
      );
      expect(result).toBeOk(Cl.uint(burnAmount));

      // Check owner balance decreased
      const balanceResult = simnet.callReadOnlyFn(
        "achiv-token",
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(balanceResult.result).toBeOk(Cl.uint(initialSupply - burnAmount));

      // Check total supply decreased
      const supplyResult = simnet.callReadOnlyFn(
        "achiv-token",
        "get-total-supply",
        [],
        deployer
      );
      expect(supplyResult.result).toBeOk(Cl.uint(initialSupply - burnAmount));
    });

    it("should not allow burning more tokens than balance", () => {
      const burnAmount = 20000000; // More than wallet1 has
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "burn",
        [Cl.uint(burnAmount), Cl.principal(wallet1)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR_INSUFFICIENT_BALANCE
    });

    it("should not allow non-owner to burn tokens", () => {
      const burnAmount = 1000000;
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "burn",
        [Cl.uint(burnAmount), Cl.principal(wallet1)],
        wallet2
      );
      expect(result).toBeErr(Cl.uint(101)); // ERR_NOT_TOKEN_OWNER
    });
  });

  describe("Security Features", () => {
    it("should prevent adding minter when paused", () => {
      // Pause contract
      simnet.callPublicFn("achiv-token", "pause-contract", [], deployer);

      const { result } = simnet.callPublicFn(
        "achiv-token",
        "add-authorized-minter",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(104)); // ERR_CONTRACT_PAUSED
    });

    it("should track total rewards distributed correctly", () => {
      // Add minter
      simnet.callPublicFn(
        "achiv-token",
        "add-authorized-minter",
        [Cl.principal(wallet1)],
        deployer
      );

      // Mint multiple rewards
      simnet.callPublicFn(
        "achiv-token",
        "mint-reward",
        [Cl.uint(1000000), Cl.principal(wallet2)],
        wallet1
      );
      simnet.callPublicFn(
        "achiv-token",
        "mint-reward",
        [Cl.uint(2000000), Cl.principal(wallet3)],
        wallet1
      );

      // Check total rewards distributed
      const rewardsResult = simnet.callReadOnlyFn(
        "achiv-token",
        "get-total-rewards-distributed",
        [],
        deployer
      );
      expect(rewardsResult.result).toBeUint(3000000);
    });

    it("should emit proper events on minting", () => {
      // Add minter
      simnet.callPublicFn(
        "achiv-token",
        "add-authorized-minter",
        [Cl.principal(wallet1)],
        deployer
      );

      const amount = 1000000;
      const { events } = simnet.callPublicFn(
        "achiv-token",
        "mint-reward",
        [Cl.uint(amount), Cl.principal(wallet2)],
        wallet1
      );

      // Check that print event was emitted
      expect(events).toHaveLength(2); // ft_mint_event + print event
      
      const printEvent = events.find(e => e.event === 'print');
      expect(printEvent).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple minters correctly", () => {
      // Add multiple minters
      simnet.callPublicFn(
        "achiv-token",
        "add-authorized-minter",
        [Cl.principal(wallet1)],
        deployer
      );
      simnet.callPublicFn(
        "achiv-token",
        "add-authorized-minter",
        [Cl.principal(wallet2)],
        deployer
      );

      // Both should be able to mint
      const result1 = simnet.callPublicFn(
        "achiv-token",
        "mint-reward",
        [Cl.uint(1000000), Cl.principal(wallet3)],
        wallet1
      );
      expect(result1.result).toBeOk(Cl.uint(1000000));

      const result2 = simnet.callPublicFn(
        "achiv-token",
        "mint-reward",
        [Cl.uint(2000000), Cl.principal(wallet3)],
        wallet2
      );
      expect(result2.result).toBeOk(Cl.uint(2000000));

      // Check total balance
      const balanceResult = simnet.callReadOnlyFn(
        "achiv-token",
        "get-balance",
        [Cl.principal(wallet3)],
        deployer
      );
      expect(balanceResult.result).toBeOk(Cl.uint(3000000));
    });

    it("should handle zero balance transfers gracefully", () => {
      const { result } = simnet.callPublicFn(
        "achiv-token",
        "transfer",
        [
          Cl.uint(1000000),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR_INSUFFICIENT_BALANCE
    });

    it("should validate recipient addresses", () => {
      // Add minter
      simnet.callPublicFn(
        "achiv-token",
        "add-authorized-minter",
        [Cl.principal(wallet1)],
        deployer
      );

      // This should work with valid principal
      const validResult = simnet.callPublicFn(
        "achiv-token",
        "mint-reward",
        [Cl.uint(1000000), Cl.principal(wallet2)],
        wallet1
      );
      expect(validResult.result).toBeOk(Cl.uint(1000000));
    });
  });
});
