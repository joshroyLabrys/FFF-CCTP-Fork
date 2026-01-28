import { describe, it, expect, afterEach } from "vitest";
import { BridgeStorage } from "../storage";
import type { BridgeTransaction } from "../types";

// Helper to create a mock transaction
function createMockTransaction(
  overrides: Partial<BridgeTransaction> = {},
): BridgeTransaction {
  return {
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    userAddress: "0x1234567890123456789012345678901234567890",
    fromChain: "Ethereum",
    toChain: "Base",
    amount: "100.00",
    token: "USDC",
    status: "pending",
    steps: [
      {
        id: "approve",
        name: "Approve",
        status: "pending",
        timestamp: Date.now(),
      },
      { id: "burn", name: "Burn", status: "pending", timestamp: Date.now() },
      {
        id: "attestation",
        name: "Attestation",
        status: "pending",
        timestamp: Date.now(),
      },
      { id: "mint", name: "Mint", status: "pending", timestamp: Date.now() },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("BridgeStorage", () => {
  // Clean up after each test
  afterEach(async () => {
    // Clear all transactions by getting and deleting them
    const evmAddress = "0x1234567890123456789012345678901234567890";
    const solanaAddress = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK";

    try {
      await BridgeStorage.clearUserTransactions(evmAddress);
      await BridgeStorage.clearUserTransactions(solanaAddress);
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("saveTransaction", () => {
    it("should save a new transaction", async () => {
      const tx = createMockTransaction();

      await BridgeStorage.saveTransaction(tx);

      const retrieved = await BridgeStorage.getTransaction(tx.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(tx.id);
      expect(retrieved?.amount).toBe(tx.amount);
    });

    it("should update an existing transaction", async () => {
      const tx = createMockTransaction();
      await BridgeStorage.saveTransaction(tx);

      // Update the transaction
      tx.status = "completed";
      tx.updatedAt = Date.now();
      await BridgeStorage.saveTransaction(tx);

      const retrieved = await BridgeStorage.getTransaction(tx.id);
      expect(retrieved?.status).toBe("completed");
    });
  });

  describe("getTransaction", () => {
    it("should return undefined for non-existent transaction", async () => {
      const result = await BridgeStorage.getTransaction("non-existent-id");
      expect(result).toBeUndefined();
    });

    it("should return the correct transaction by ID", async () => {
      const tx1 = createMockTransaction({ id: "tx-1" });
      const tx2 = createMockTransaction({ id: "tx-2" });

      await BridgeStorage.saveTransaction(tx1);
      await BridgeStorage.saveTransaction(tx2);

      const retrieved = await BridgeStorage.getTransaction("tx-1");
      expect(retrieved?.id).toBe("tx-1");
    });
  });

  describe("getTransactionsByUser", () => {
    it("should return all transactions for a user", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";
      const tx1 = createMockTransaction({ userAddress, id: "user-tx-1" });
      const tx2 = createMockTransaction({ userAddress, id: "user-tx-2" });

      await BridgeStorage.saveTransaction(tx1);
      await BridgeStorage.saveTransaction(tx2);

      const transactions =
        await BridgeStorage.getTransactionsByUser(userAddress);
      expect(transactions.length).toBe(2);
    });

    it("should NOT return transactions for different users", async () => {
      const user1 = "0x1111111111111111111111111111111111111111";
      const user2 = "0x2222222222222222222222222222222222222222";

      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress: user1, id: "user1-tx" }),
      );
      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress: user2, id: "user2-tx" }),
      );

      const user1Txs = await BridgeStorage.getTransactionsByUser(user1);
      expect(user1Txs.length).toBe(1);
      expect(user1Txs[0]!.userAddress).toBe(user1);

      // Clean up
      await BridgeStorage.clearUserTransactions(user1);
      await BridgeStorage.clearUserTransactions(user2);
    });

    it("should preserve Solana address case (Base58 is case-sensitive)", async () => {
      const solanaAddress = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK";
      const tx = createMockTransaction({
        userAddress: solanaAddress,
        id: "solana-tx",
      });

      await BridgeStorage.saveTransaction(tx);

      // Query with exact case should work
      const transactions =
        await BridgeStorage.getTransactionsByUser(solanaAddress);
      expect(transactions.length).toBe(1);
      expect(transactions[0]!.userAddress).toBe(solanaAddress);

      // Query with lowercase should NOT find the transaction
      // (This is the fix we implemented - addresses are no longer lowercased)
      const lowercaseTxs = await BridgeStorage.getTransactionsByUser(
        solanaAddress.toLowerCase(),
      );
      expect(lowercaseTxs.length).toBe(0);
    });

    it("should work with EVM addresses in any case since they're stored as-is", async () => {
      const checksumAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      const tx = createMockTransaction({
        userAddress: checksumAddress,
        id: "evm-tx",
      });

      await BridgeStorage.saveTransaction(tx);

      // Query with exact case should work
      const transactions =
        await BridgeStorage.getTransactionsByUser(checksumAddress);
      expect(transactions.length).toBe(1);

      // Clean up
      await BridgeStorage.clearUserTransactions(checksumAddress);
    });
  });

  describe("clearUserTransactions", () => {
    it("should remove all transactions for a user", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";

      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress, id: "tx-1" }),
      );
      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress, id: "tx-2" }),
      );

      await BridgeStorage.clearUserTransactions(userAddress);

      const transactions =
        await BridgeStorage.getTransactionsByUser(userAddress);
      expect(transactions.length).toBe(0);
    });

    it("should not affect other users' transactions", async () => {
      const user1 = "0x1111111111111111111111111111111111111111";
      const user2 = "0x2222222222222222222222222222222222222222";

      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress: user1, id: "user1-tx" }),
      );
      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress: user2, id: "user2-tx" }),
      );

      await BridgeStorage.clearUserTransactions(user1);

      const user1Txs = await BridgeStorage.getTransactionsByUser(user1);
      const user2Txs = await BridgeStorage.getTransactionsByUser(user2);

      expect(user1Txs.length).toBe(0);
      expect(user2Txs.length).toBe(1);

      // Clean up
      await BridgeStorage.clearUserTransactions(user2);
    });
  });
});
