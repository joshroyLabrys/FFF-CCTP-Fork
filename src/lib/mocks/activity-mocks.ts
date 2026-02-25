/**
 * Mock data for notifications and transaction history when
 * NEXT_PUBLIC_USE_MOCK_ACTIVITY is "true" (local/dev only).
 */

import type { BridgeTransaction, BridgeStep } from "~/lib/bridge";
import type { Notification } from "~/lib/notifications";
import type { SupportedChainId } from "~/lib/bridge/networks";

// ============================================================================
// Mock Bridge Steps
// ============================================================================

function createMockStep(
  name: string,
  status: BridgeStep["status"],
  txHash?: string,
  error?: string,
): BridgeStep {
  return {
    id: `step-${name}`,
    name,
    status,
    txHash,
    error,
    timestamp: Date.now(),
  };
}

const stepsPending = [
  createMockStep("approve", "pending"),
  createMockStep("burn", "pending"),
  createMockStep("attestation", "pending"),
  createMockStep("mint", "pending"),
];

const stepsInProgress = [
  createMockStep("approve", "completed", "0xabc123..."),
  createMockStep("burn", "completed", "0xdef456..."),
  createMockStep("attestation", "in_progress"),
  createMockStep("mint", "pending"),
];

const stepsCompleted = [
  createMockStep("approve", "completed", "0xabc123..."),
  createMockStep("burn", "completed", "0xdef456..."),
  createMockStep("attestation", "completed", "0xghi789..."),
  createMockStep("mint", "completed", "0xjkl012..."),
];

const stepsFailed = [
  createMockStep("approve", "completed", "0xabc123..."),
  createMockStep("burn", "failed", undefined, "Insufficient gas"),
  createMockStep("attestation", "pending"),
  createMockStep("mint", "pending"),
];

// ============================================================================
// Mock Transactions (varied statuses, chains, amounts, fast with fee)
// ============================================================================

function createMockTransaction(
  id: string,
  status: BridgeTransaction["status"],
  fromChain: SupportedChainId,
  toChain: SupportedChainId,
  steps: BridgeStep[],
  overrides: Partial<BridgeTransaction> = {},
): BridgeTransaction {
  const base: BridgeTransaction = {
    id,
    userAddress: "0x1234567890abcdef1234567890abcdef12345678",
    fromChain,
    toChain,
    amount: "100.00",
    token: "USDC",
    status,
    steps,
    sourceTxHash:
      status !== "pending"
        ? "0xabc123def456abc123def456abc123def456abc123def456abc123def456abcd"
        : undefined,
    destinationTxHash:
      status === "completed"
        ? "0xdef456abc123def456abc123def456abc123def456abc123def456abc123defg"
        : undefined,
    createdAt: Date.now() - 900000,
    updatedAt: Date.now(),
    completedAt: status === "completed" ? Date.now() : undefined,
    estimatedTime: 780000,
    fees: { network: "0.001", bridge: "0", total: "0.001" },
    transferMethod: "standard",
    sourceAddress: "0x1234567890abcdef1234567890abcdef12345678",
    destinationAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    ...overrides,
  };
  return base;
}

export const MOCK_ACTIVITY_TRANSACTIONS: BridgeTransaction[] = [
  createMockTransaction(
    "mock-tx-1",
    "completed",
    "Ethereum",
    "Base",
    stepsCompleted,
    {
      amount: "1500.00",
      transferMethod: "fast",
      providerFeeUsdc: "1.50",
      createdAt: Date.now() - 3600000,
    },
  ),
  createMockTransaction(
    "mock-tx-2",
    "bridging",
    "Base",
    "Arbitrum",
    stepsInProgress,
    { amount: "250.50", createdAt: Date.now() - 300000 },
  ),
  createMockTransaction(
    "mock-tx-3",
    "completed",
    "Arbitrum",
    "Solana",
    stepsCompleted,
    {
      amount: "50000.00",
      transferMethod: "standard",
      createdAt: Date.now() - 86400000,
    },
  ),
  createMockTransaction(
    "mock-tx-4",
    "failed",
    "Ethereum",
    "Base",
    stepsFailed,
    {
      amount: "75.25",
      error: "Insufficient gas for transaction",
      createdAt: Date.now() - 600000,
    },
  ),
  createMockTransaction(
    "mock-tx-5",
    "pending",
    "Solana",
    "Ethereum",
    stepsPending,
    { amount: "1000.00", createdAt: Date.now() - 120000 },
  ),
  createMockTransaction(
    "mock-tx-6",
    "cancelled",
    "Ethereum",
    "Solana",
    stepsPending,
    { amount: "500.00", createdAt: Date.now() - 1800000 },
  ),
  createMockTransaction(
    "mock-tx-7",
    "completed",
    "Ethereum",
    "Arbitrum",
    stepsCompleted,
    {
      amount: "2250.75",
      transferMethod: "fast",
      providerFeeUsdc: "2.25",
      createdAt: Date.now() - 7200000,
    },
  ),
  // Testnet so both mainnet and testnet environments show mock data
  createMockTransaction(
    "mock-tx-8",
    "completed",
    "Base_Sepolia",
    "Arbitrum_Sepolia",
    stepsCompleted,
    { amount: "100.00", createdAt: Date.now() - 3600000 },
  ),
  createMockTransaction(
    "mock-tx-9",
    "bridging",
    "Arbitrum_Sepolia",
    "Base_Sepolia",
    stepsInProgress,
    { amount: "50.00", createdAt: Date.now() - 60000 },
  ),
];

// ============================================================================
// Mock Notifications (read/unread, bridge + system, various statuses)
// ============================================================================

function createMockNotification(
  id: string,
  type: Notification["type"],
  status: Notification["status"],
  title: string,
  message: string,
  read: boolean,
  extras?: Partial<Notification>,
): Notification {
  return {
    id,
    type,
    status,
    title,
    message,
    timestamp: Date.now() - 300000,
    read,
    ...extras,
  };
}

export const MOCK_ACTIVITY_NOTIFICATIONS: Notification[] = [
  createMockNotification(
    "mock-notif-1",
    "bridge",
    "success",
    "Bridge Complete",
    "Your USDC has been successfully bridged from Ethereum to Base.",
    false,
    {
      fromChain: "Ethereum",
      toChain: "Base",
      amount: "1,500",
      token: "USDC",
      bridgeTransactionId: "mock-tx-1",
    },
  ),
  createMockNotification(
    "mock-notif-2",
    "bridge",
    "in_progress",
    "Waiting for Attestation",
    "Circle is verifying your transaction.",
    false,
    {
      fromChain: "Base",
      toChain: "Arbitrum",
      amount: "250.50",
      token: "USDC",
    },
  ),
  createMockNotification(
    "mock-notif-3",
    "bridge",
    "failed",
    "Bridge Failed",
    "Transaction failed due to insufficient gas. Please retry.",
    false,
    {
      actionLabel: "Retry",
      actionType: "retry",
      bridgeTransactionId: "mock-tx-4",
    },
  ),
  createMockNotification(
    "mock-notif-4",
    "bridge",
    "success",
    "Bridge Complete",
    "Your USDC has arrived on Arbitrum.",
    true,
    {
      fromChain: "Base",
      toChain: "Arbitrum",
      amount: "250.50",
      token: "USDC",
    },
  ),
  createMockNotification(
    "mock-notif-5",
    "bridge",
    "pending",
    "Bridge Started",
    "Your transfer is being processed.",
    false,
    {
      fromChain: "Ethereum",
      toChain: "Solana",
      amount: "1,000",
      token: "USDC",
    },
  ),
  createMockNotification(
    "mock-notif-6",
    "system",
    "info",
    "System Update",
    "CCTP Bridge has been updated with new features.",
    true,
  ),
  createMockNotification(
    "mock-notif-7",
    "warning",
    "info",
    "Network Congestion",
    "Ethereum network is experiencing high traffic. Transactions may take longer.",
    false,
  ),
];
