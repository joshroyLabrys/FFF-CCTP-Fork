/**
 * xReserve deposit service: USDC on Ethereum/Sepolia → USDCx on Canton
 * Approve USDC, call depositToRemote, then poll for deposit attestation (or show claim instructions).
 */

import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  parseUnits,
  keccak256,
  bytesToHex,
  type WalletClient,
  type PublicClient,
  type Chain,
} from "viem";
import {
  getXReserveConfig,
  CANTON_XRESERVE_DOMAIN,
} from "./config";
import { XRESERVE_ABI, ERC20_APPROVE_ABI } from "./abi";
import type { SupportedChainId } from "~/lib/bridge/networks";
import type { IWallet } from "~/lib/wallet/types";
import { getViemChain } from "~/lib/bridge/chain-utils";

const USDC_DECIMALS = 6;

/**
 * Encode Canton recipient for depositToRemote: remoteRecipient = keccak256(utf8), hookData = hex(utf8)
 */
function encodeCantonRecipient(cantonRecipient: string): {
  remoteRecipient: `0x${string}`;
  hookData: `0x${string}`;
} {
  const bytes = new Uint8Array(new TextEncoder().encode(cantonRecipient));
  const remoteRecipient = keccak256(bytes) as `0x${string}`;
  const hookData = bytesToHex(bytes) as `0x${string}`;
  return { remoteRecipient, hookData };
}

export interface XReserveDepositResult {
  approveTxHash: `0x${string}`;
  depositTxHash: `0x${string}`;
  /** Deposit attestation is used on Canton when claiming; we don't fetch it in-app for v1 */
  attestationReady: boolean;
}

export interface XReserveDepositCallbacks {
  onApproveTx?: (txHash: string) => void;
  onDepositTx?: (txHash: string) => void;
  onAttestationPending?: () => void;
  onAttestationReady?: () => void;
}

/**
 * Execute xReserve deposit: approve USDC, then depositToRemote.
 * Caller is responsible for switching wallet to source chain before calling.
 */
export async function executeXReserveDeposit(
  params: {
    sourceChainId: SupportedChainId;
    amount: string;
    cantonRecipient: string;
    depositorAddress: string;
    wallet: IWallet;
  },
  callbacks: XReserveDepositCallbacks = {},
): Promise<XReserveDepositResult> {
  const { sourceChainId, amount, cantonRecipient, wallet } = params;

  const config = getXReserveConfig(sourceChainId);
  if (!config) {
    throw new Error(
      `xReserve not supported for source chain: ${sourceChainId}. Use Ethereum or Ethereum_Sepolia.`,
    );
  }

  if (wallet.chainType !== "evm" || !wallet.getEVMProvider) {
    throw new Error("EVM wallet required for xReserve deposit");
  }

  const chain = getViemChain(sourceChainId);
  if (!chain) {
    throw new Error(`No chain config for ${sourceChainId}`);
  }

  const provider = await wallet.getEVMProvider();
  if (!provider) {
    throw new Error("Failed to get EVM provider");
  }

  const walletClient = createWalletClient({
    transport: custom(provider as import("viem").Transport),
    chain,
  }) as WalletClient;

  const rpcUrl =
    chain.rpcUrls?.default?.http?.[0] ??
    (sourceChainId === "Ethereum"
      ? "https://eth.llamarpc.com"
      : "https://ethereum-sepolia.publicnode.com");

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  }) as PublicClient;

  const value = parseUnits(amount, USDC_DECIMALS);
  const maxFee = 0n;
  const { remoteRecipient, hookData } = encodeCantonRecipient(cantonRecipient);

  // Step 1: Approve USDC for xReserve
  const approveTxHash = await walletClient.writeContract({
    address: config.usdcContract,
    abi: ERC20_APPROVE_ABI,
    functionName: "approve",
    args: [config.xReserveContract, value],
  });
  callbacks.onApproveTx?.(approveTxHash);

  await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

  // Step 2: depositToRemote
  const depositTxHash = await walletClient.writeContract({
    address: config.xReserveContract,
    abi: XRESERVE_ABI,
    functionName: "depositToRemote",
    args: [
      value,
      CANTON_XRESERVE_DOMAIN,
      remoteRecipient,
      config.usdcContract,
      maxFee,
      hookData,
    ],
  });
  callbacks.onDepositTx?.(depositTxHash);

  await publicClient.waitForTransactionReceipt({ hash: depositTxHash });

  // Attestation is produced by Circle after Ethereum finality (~13-15 min).
  // Caller keeps tx in "confirming" and uses resume/check-status to mark ready later.
  callbacks.onAttestationPending?.();

  return {
    approveTxHash,
    depositTxHash,
    attestationReady: false,
  };
}
