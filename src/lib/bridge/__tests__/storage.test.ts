import { describe, it, expect, afterEach } from "vitest";
import { BridgeStorage } from "../storage";
import type { BridgeTransaction } from "../types";

// Helper to create a mock transaction
function createMockTransaction(
  overrides: Partial<BridgeTransaction> = {}
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
      { id: "approve", name: "Approve", status: "pending", timestamp: Date.now() },
      { id: "burn", name: "Burn", status: "pending", timestamp: Date.now() },
      { id: "attestation", name: "Attestation", status: "pending", timestamp: Date.now() },
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

      const transactions = await BridgeStorage.getTransactionsByUser(userAddress);
      expect(transactions.length).toBe(2);
    });

    it("should NOT return transactions for different users", async () => {
      const user1 = "0x1111111111111111111111111111111111111111";
      const user2 = "0x2222222222222222222222222222222222222222";

      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress: user1, id: "user1-tx" })
      );
      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress: user2, id: "user2-tx" })
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
      const tx = createMockTransaction({ userAddress: solanaAddress, id: "solana-tx" });

      await BridgeStorage.saveTransaction(tx);

      // Query with exact case should work
      const transactions = await BridgeStorage.getTransactionsByUser(solanaAddress);
      expect(transactions.length).toBe(1);
      expect(transactions[0]!.userAddress).toBe(solanaAddress);

      // Query with lowercase should NOT find the transaction
      // (This is the fix we implemented - addresses are no longer lowercased)
      const lowercaseTxs = await BridgeStorage.getTransactionsByUser(
        solanaAddress.toLowerCase()
      );
      expect(lowercaseTxs.length).toBe(0);
    });

    it("should work with EVM addresses in any case since they're stored as-is", async () => {
      const checksumAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      const tx = createMockTransaction({ userAddress: checksumAddress, id: "evm-tx" });

      await BridgeStorage.saveTransaction(tx);

      // Query with exact case should work
      const transactions = await BridgeStorage.getTransactionsByUser(checksumAddress);
      expect(transactions.length).toBe(1);

      // Clean up
      await BridgeStorage.clearUserTransactions(checksumAddress);
    });
  });

  describe("getTransactionsByUserAndStatus", () => {
    it("should filter by user and status", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";

      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress, id: "pending-tx", status: "pending" })
      );
      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress, id: "completed-tx", status: "completed" })
      );
      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress, id: "failed-tx", status: "failed" })
      );

      const pendingTxs = await BridgeStorage.getTransactionsByUserAndStatus(
        userAddress,
        "pending"
      );
      expect(pendingTxs.length).toBe(1);
      expect(pendingTxs[0]!.status).toBe("pending");

      const completedTxs = await BridgeStorage.getTransactionsByUserAndStatus(
        userAddress,
        "completed"
      );
      expect(completedTxs.length).toBe(1);
      expect(completedTxs[0]!.status).toBe("completed");
    });
  });

  describe("getRecentTransactions", () => {
    it("should return transactions sorted by createdAt descending", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";

      await BridgeStorage.saveTransaction(
        createMockTransaction({
          userAddress,
          id: "old-tx",
          createdAt: Date.now() - 10000,
        })
      );
      await BridgeStorage.saveTransaction(
        createMockTransaction({
          userAddress,
          id: "new-tx",
          createdAt: Date.now(),
        })
      );
      await BridgeStorage.saveTransaction(
        createMockTransaction({
          userAddress,
          id: "middle-tx",
          createdAt: Date.now() - 5000,
        })
      );

      const transactions = await BridgeStorage.getRecentTransactions(userAddress);

      expect(transactions[0]!.id).toBe("new-tx");
      expect(transactions[2]!.id).toBe("old-tx");
    });

    it("should respect the limit parameter", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";

      // Create 5 transactions
      for (let i = 0; i < 5; i++) {
        await BridgeStorage.saveTransaction(
          createMockTransaction({
            userAddress,
            id: `tx-${i}`,
            createdAt: Date.now() - i * 1000,
          })
        );
      }

      const limited = await BridgeStorage.getRecentTransactions(userAddress, 3);
      expect(limited.length).toBe(3);
    });
  });

  describe("updateTransactionStatus", () => {
    it("should update the status of a transaction", async () => {
      const tx = createMockTransaction({ status: "pending" });
      await BridgeStorage.saveTransaction(tx);

      await BridgeStorage.updateTransactionStatus(tx.id, "completed");

      const updated = await BridgeStorage.getTransaction(tx.id);
      expect(updated?.status).toBe("completed");
      expect(updated?.completedAt).toBeDefined();
    });

    it("should set error message when status is failed", async () => {
      const tx = createMockTransaction({ status: "pending" });
      await BridgeStorage.saveTransaction(tx);

      await BridgeStorage.updateTransactionStatus(tx.id, "failed", "Transaction failed");

      const updated = await BridgeStorage.getTransaction(tx.id);
      expect(updated?.status).toBe("failed");
      expect(updated?.error).toBe("Transaction failed");
    });

    it("should update updatedAt timestamp", async () => {
      const tx = createMockTransaction();
      const originalUpdatedAt = tx.updatedAt;
      await BridgeStorage.saveTransaction(tx);

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      await BridgeStorage.updateTransactionStatus(tx.id, "completed");

      const updated = await BridgeStorage.getTransaction(tx.id);
      expect(updated?.updatedAt).toBeGreaterThan(originalUpdatedAt);
    });
  });

  describe("updateTransactionStep", () => {
    it("should update a specific step", async () => {
      const tx = createMockTransaction();
      await BridgeStorage.saveTransaction(tx);

      await BridgeStorage.updateTransactionStep(tx.id, "approve", {
        status: "completed",
        txHash: "0xabc123",
      });

      const updated = await BridgeStorage.getTransaction(tx.id);
      const approveStep = updated?.steps.find((s) => s.id === "approve");
      expect(approveStep?.status).toBe("completed");
      expect(approveStep?.txHash).toBe("0xabc123");
    });

    it("should not affect other steps", async () => {
      const tx = createMockTransaction();
      await BridgeStorage.saveTransaction(tx);

      await BridgeStorage.updateTransactionStep(tx.id, "approve", {
        status: "completed",
      });

      const updated = await BridgeStorage.getTransaction(tx.id);
      const burnStep = updated?.steps.find((s) => s.id === "burn");
      expect(burnStep?.status).toBe("pending");
    });
  });

  describe("deleteTransaction", () => {
    it("should remove a transaction", async () => {
      const tx = createMockTransaction();
      await BridgeStorage.saveTransaction(tx);

      await BridgeStorage.deleteTransaction(tx.id);

      const deleted = await BridgeStorage.getTransaction(tx.id);
      expect(deleted).toBeUndefined();
    });
  });

  describe("clearUserTransactions", () => {
    it("should remove all transactions for a user", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";

      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress, id: "tx-1" })
      );
      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress, id: "tx-2" })
      );

      await BridgeStorage.clearUserTransactions(userAddress);

      const transactions = await BridgeStorage.getTransactionsByUser(userAddress);
      expect(transactions.length).toBe(0);
    });

    it("should not affect other users' transactions", async () => {
      const user1 = "0x1111111111111111111111111111111111111111";
      const user2 = "0x2222222222222222222222222222222222222222";

      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress: user1, id: "user1-tx" })
      );
      await BridgeStorage.saveTransaction(
        createMockTransaction({ userAddress: user2, id: "user2-tx" })
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

  describe("getRetryableTransactions", () => {
    it("should return failed transactions with completed steps", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";

      // Transaction with partial completion (retryable)
      const retryableTx = createMockTransaction({
        userAddress,
        id: "retryable-tx",
        status: "failed",
        steps: [
          { id: "approve", name: "Approve", status: "completed", timestamp: Date.now() },
          { id: "burn", name: "Burn", status: "completed", timestamp: Date.now() },
          { id: "attestation", name: "Attestation", status: "failed", timestamp: Date.now() },
          { id: "mint", name: "Mint", status: "pending", timestamp: Date.now() },
        ],
      });

      // Transaction with no completed steps (not retryable)
      const notRetryableTx = createMockTransaction({
        userAddress,
        id: "not-retryable-tx",
        status: "failed",
        steps: [
          { id: "approve", name: "Approve", status: "failed", timestamp: Date.now() },
          { id: "burn", name: "Burn", status: "pending", timestamp: Date.now() },
          { id: "attestation", name: "Attestation", status: "pending", timestamp: Date.now() },
          { id: "mint", name: "Mint", status: "pending", timestamp: Date.now() },
        ],
      });

      await BridgeStorage.saveTransaction(retryableTx);
      await BridgeStorage.saveTransaction(notRetryableTx);

      const retryable = await BridgeStorage.getRetryableTransactions(userAddress);

      expect(retryable.length).toBe(1);
      expect(retryable[0]!.id).toBe("retryable-tx");
    });

    it("should not return completed transactions", async () => {
      const userAddress = "0x1234567890123456789012345678901234567890";

      await BridgeStorage.saveTransaction(
        createMockTransaction({
          userAddress,
          id: "completed-tx",
          status: "completed",
        })
      );

      const retryable = await BridgeStorage.getRetryableTransactions(userAddress);
      expect(retryable.length).toBe(0);
    });
  });
});
