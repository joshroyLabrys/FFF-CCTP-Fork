import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BridgeEventManager } from "../event-manager";
import type { BridgeTransaction } from "../types";

// Mock BridgeKit
const mockOn = vi.fn();
const mockOff = vi.fn();

const createMockBridgeKit = () => ({
  on: mockOn,
  off: mockOff,
});

// Mock storage
const createMockStorage = () => ({
  getTransaction: vi.fn(),
  saveTransaction: vi.fn(),
});

// Helper to create a mock transaction
function createMockTransaction(
  overrides: Partial<BridgeTransaction> = {}
): BridgeTransaction {
  return {
    id: "test-tx-id",
    userAddress: "0x1234567890123456789012345678901234567890",
    fromChain: "Ethereum",
    toChain: "Base",
    amount: "100.00",
    token: "USDC",
    status: "bridging",
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

describe("BridgeEventManager", () => {
  let mockKit: ReturnType<typeof createMockBridgeKit>;
  let mockStorage: ReturnType<typeof createMockStorage>;
  let eventManager: BridgeEventManager;
  let eventHandler: (event: { method: string; values?: Record<string, unknown> }) => void;

  beforeEach(() => {
    mockKit = createMockBridgeKit();
    mockStorage = createMockStorage();

    // Capture the event handler when it's registered
    mockOn.mockImplementation((eventName: string, handler: typeof eventHandler) => {
      if (eventName === "*") {
        eventHandler = handler;
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    eventManager = new BridgeEventManager(mockKit as any, mockStorage as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should register wildcard event listener", () => {
      expect(mockOn).toHaveBeenCalledWith("*", expect.any(Function));
    });
  });

  describe("trackTransaction", () => {
    it("should register a transaction for tracking", () => {
      const callback = vi.fn();

      eventManager.trackTransaction("tx-123", callback);

      // Verify internal state by triggering an event
      // The callback should be called when relevant events fire
    });

    it("should allow multiple transactions to be tracked", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventManager.trackTransaction("tx-1", callback1);
      eventManager.trackTransaction("tx-2", callback2);

      // Both should be registered (no errors thrown)
    });
  });

  describe("untrackTransaction", () => {
    it("should remove a transaction from tracking", async () => {
      const callback = vi.fn();
      const tx = createMockTransaction({ id: "tx-123" });

      mockStorage.getTransaction.mockResolvedValue(tx);

      eventManager.trackTransaction("tx-123", callback);
      eventManager.untrackTransaction("tx-123");

      // Trigger an event
      eventHandler({ method: "approve", values: { txHash: "0xabc" } });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Callback should NOT be called since transaction was untracked
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("event handling", () => {
    it("should update approve step when approve event fires", async () => {
      const callback = vi.fn();
      const tx = createMockTransaction({ id: "tx-123" });

      mockStorage.getTransaction.mockResolvedValue(tx);

      eventManager.trackTransaction("tx-123", callback);

      // Trigger approve event
      eventHandler({ method: "approve", values: { txHash: "0xapprove123" } });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Check that storage was updated
      expect(mockStorage.saveTransaction).toHaveBeenCalled();
      const savedTx = mockStorage.saveTransaction.mock.calls[0]![0] as BridgeTransaction;
      const approveStep = savedTx.steps.find((s) => s.id === "approve");
      expect(approveStep!.status).toBe("completed");
      expect(approveStep!.txHash).toBe("0xapprove123");
    });

    it("should update burn step when burn event fires", async () => {
      const callback = vi.fn();
      const tx = createMockTransaction({ id: "tx-123" });

      mockStorage.getTransaction.mockResolvedValue(tx);

      eventManager.trackTransaction("tx-123", callback);

      // Trigger burn event
      eventHandler({ method: "burn", values: { txHash: "0xburn456" } });

      await new Promise((resolve) => setTimeout(resolve, 50));

      const savedTx = mockStorage.saveTransaction.mock.calls[0]![0] as BridgeTransaction;
      const burnStep = savedTx.steps.find((s) => s.id === "burn");
      expect(burnStep!.status).toBe("completed");
      expect(burnStep!.txHash).toBe("0xburn456");
    });

    it("should update attestation step when fetchAttestation event fires", async () => {
      const callback = vi.fn();
      const tx = createMockTransaction({ id: "tx-123" });

      mockStorage.getTransaction.mockResolvedValue(tx);

      eventManager.trackTransaction("tx-123", callback);

      // Trigger attestation event
      eventHandler({
        method: "fetchAttestation",
        values: { data: "attestation-hash-123" },
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      const savedTx = mockStorage.saveTransaction.mock.calls[0]![0] as BridgeTransaction;
      expect(savedTx.attestationHash).toBe("attestation-hash-123");
    });

    it("should update mint step when mint event fires", async () => {
      const callback = vi.fn();
      const tx = createMockTransaction({ id: "tx-123" });

      mockStorage.getTransaction.mockResolvedValue(tx);

      eventManager.trackTransaction("tx-123", callback);

      // Trigger mint event
      eventHandler({ method: "mint", values: { txHash: "0xmint789" } });

      await new Promise((resolve) => setTimeout(resolve, 50));

      const savedTx = mockStorage.saveTransaction.mock.calls[0]![0] as BridgeTransaction;
      const mintStep = savedTx.steps.find((s) => s.id === "mint");
      expect(mintStep!.status).toBe("completed");
      expect(mintStep!.txHash).toBe("0xmint789");
    });

    it("should advance next step to in_progress when current step completes", async () => {
      const callback = vi.fn();
      const tx = createMockTransaction({
        id: "tx-123",
        steps: [
          { id: "approve", name: "Approve", status: "in_progress", timestamp: Date.now() },
          { id: "burn", name: "Burn", status: "pending", timestamp: Date.now() },
          { id: "attestation", name: "Attestation", status: "pending", timestamp: Date.now() },
          { id: "mint", name: "Mint", status: "pending", timestamp: Date.now() },
        ],
      });

      mockStorage.getTransaction.mockResolvedValue(tx);

      eventManager.trackTransaction("tx-123", callback);

      // Approve completes
      eventHandler({ method: "approve", values: { txHash: "0xapprove" } });

      await new Promise((resolve) => setTimeout(resolve, 50));

      const savedTx = mockStorage.saveTransaction.mock.calls[0]![0] as BridgeTransaction;

      // Approve should be completed
      const approveStep = savedTx.steps.find((s) => s.id === "approve");
      expect(approveStep!.status).toBe("completed");

      // Burn should now be in_progress
      const burnStep = savedTx.steps.find((s) => s.id === "burn");
      expect(burnStep!.status).toBe("in_progress");
    });

    it("should call callback with updated transaction", async () => {
      const callback = vi.fn();
      const tx = createMockTransaction({ id: "tx-123" });

      mockStorage.getTransaction.mockResolvedValue(tx);

      eventManager.trackTransaction("tx-123", callback);

      eventHandler({ method: "approve", values: { txHash: "0xabc" } });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ id: "tx-123" })
      );
    });

    it("should ignore unrecognized event methods", async () => {
      const callback = vi.fn();
      const tx = createMockTransaction({ id: "tx-123" });

      mockStorage.getTransaction.mockResolvedValue(tx);

      eventManager.trackTransaction("tx-123", callback);

      eventHandler({ method: "unknownMethod", values: {} });

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Storage should not be updated for unknown methods
      expect(mockStorage.saveTransaction).not.toHaveBeenCalled();
    });

    it("should handle missing transaction gracefully", async () => {
      const callback = vi.fn();

      mockStorage.getTransaction.mockResolvedValue(undefined);

      eventManager.trackTransaction("non-existent", callback);

      eventHandler({ method: "approve", values: { txHash: "0xabc" } });

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should not throw, and callback should not be called
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("dispose", () => {
    it("should remove event listeners", () => {
      eventManager.dispose();

      expect(mockOff).toHaveBeenCalledWith("*", expect.any(Function));
    });

    it("should clear all tracked transactions", async () => {
      const callback = vi.fn();
      const tx = createMockTransaction({ id: "tx-123" });

      mockStorage.getTransaction.mockResolvedValue(tx);

      eventManager.trackTransaction("tx-123", callback);
      eventManager.dispose();

      // Trigger event after dispose
      eventHandler({ method: "approve", values: { txHash: "0xabc" } });

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Callback should not be called after dispose
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
