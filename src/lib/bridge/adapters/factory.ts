/**
 * Adapter Factory - Extensible pattern for creating blockchain adapters
 * This design allows easy addition of new chains without modifying core service logic
 */

import { createViemAdapterFromProvider as createEvmAdapter } from "@circle-fin/adapter-viem-v2";
import { createSolanaAdapterFromProvider as createSolanaAdapter } from "@circle-fin/adapter-solana";
import type { AdapterContext } from "@circle-fin/bridge-kit";
import { Connection } from "@solana/web3.js";
import type { IWallet } from "~/lib/wallet/types";
import {
  type NetworkType,
  NETWORK_CONFIGS,
  type SupportedChainId,
} from "../networks";

// Solana RPC endpoints (from Circle's adapter defaults)
const SOLANA_RPC_ENDPOINTS = {
  mainnet: "https://solana-mainnet.public.blastapi.io",
  testnet: "https://api.devnet.solana.com",
} as const;

// Use the adapter type from Circle's bridge-kit
type BridgeAdapter = AdapterContext["adapter"];

/**
 * Base adapter creator interface
 * Implement this for each blockchain type
 */
export interface IAdapterCreator {
  readonly networkType: NetworkType;
  canHandle(wallet: IWallet): boolean;
  createAdapter(
    wallet: IWallet,
    chainId?: SupportedChainId,
  ): Promise<BridgeAdapter>;
}

/**
 * EVM Adapter Creator
 * Handles all Ethereum-compatible chains
 */
export class EVMAdapterCreator implements IAdapterCreator {
  readonly networkType: NetworkType = "evm";

  canHandle(wallet: IWallet): boolean {
    return wallet.chainType === "evm";
  }

  /**
   * Switch EVM wallet to target network before creating adapter
   * This is critical for cross-chain bridges where the destination chain
   * may be different from the wallet's current network
   */
  static async switchNetwork(
    wallet: IWallet,
    targetChainId: number,
  ): Promise<void> {
    if (wallet.chainType !== "evm") {
      console.warn(
        "[EVMAdapter] Cannot switch network: wallet is not an EVM wallet",
      );
      return;
    }

    if (!wallet.switchNetwork) {
      console.warn("[EVMAdapter] Wallet does not support network switching");
      return;
    }

    try {
      console.log(`[EVMAdapter] Switching to chain ${targetChainId}...`);
      await wallet.switchNetwork(targetChainId);
      console.log(
        `[EVMAdapter] Successfully switched to chain ${targetChainId}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[EVMAdapter] Failed to switch network:`, error);
      throw new Error(`Failed to switch to chain ${targetChainId}: ${message}`);
    }
  }

  async createAdapter(
    wallet: IWallet,
    _chainId?: SupportedChainId,
  ): Promise<BridgeAdapter> {
    if (wallet.chainType !== "evm") {
      throw new Error("Wallet is not an Ethereum wallet");
    }

    if (!wallet.getEVMProvider) {
      throw new Error("Wallet does not support EVM provider");
    }

    const providerResult = await wallet.getEVMProvider();

    if (!providerResult) {
      throw new Error("Failed to get EVM wallet client");
    }

    // Create EVM adapter using Circle's factory
    return await createEvmAdapter({
      provider: providerResult as unknown as Parameters<
        typeof createEvmAdapter
      >[0]["provider"],
    });
  }
}

/**
 * Solana Adapter Creator
 * Handles Solana and Solana Devnet
 */
export class SolanaAdapterCreator implements IAdapterCreator {
  readonly networkType: NetworkType = "solana";

  canHandle(wallet: IWallet): boolean {
    return wallet.chainType === "solana";
  }

  async createAdapter(
    wallet: IWallet,
    chainId?: SupportedChainId,
  ): Promise<BridgeAdapter> {
    if (wallet.chainType !== "solana") {
      throw new Error("Wallet is not a Solana wallet");
    }

    if (!wallet.getSolanaProvider) {
      throw new Error("Wallet does not support Solana provider");
    }

    // Get Solana provider from wallet abstraction
    const solanaProvider = await wallet.getSolanaProvider();

    // Determine RPC endpoint based on chain environment
    let rpcEndpoint: string;
    if (chainId) {
      const network = NETWORK_CONFIGS[chainId];
      rpcEndpoint =
        network?.environment === "mainnet"
          ? SOLANA_RPC_ENDPOINTS.mainnet
          : SOLANA_RPC_ENDPOINTS.testnet;
      console.log(
        `[SolanaAdapter] Using ${network?.environment} RPC for chain ${chainId}: ${rpcEndpoint}`,
      );
    } else if (wallet.getSolanaConnection) {
      // Fallback to wallet's current RPC if no chain specified
      const connection = await wallet.getSolanaConnection();
      rpcEndpoint = connection.rpcEndpoint;
      console.log(
        `[SolanaAdapter] Using wallet RPC (no chain specified): ${rpcEndpoint}`,
      );
    } else {
      // Default to mainnet if we can't determine
      rpcEndpoint = SOLANA_RPC_ENDPOINTS.mainnet;
      console.log(`[SolanaAdapter] Defaulting to mainnet RPC: ${rpcEndpoint}`);
    }

    const connection = new Connection(rpcEndpoint);

    // Create Solana adapter using Circle's factory
    return await createSolanaAdapter({
      provider: solanaProvider,
      connection,
    });
  }
}

/**
 * Adapter Factory
 * Central registry for adapter creators, extensible for future chains
 */
export class AdapterFactory {
  private readonly creators: Map<NetworkType, IAdapterCreator>;
  private readonly adapterCache: Map<string, BridgeAdapter>;

  constructor() {
    this.creators = new Map();
    this.adapterCache = new Map();

    // Register built-in adapter creators
    this.registerCreator(new EVMAdapterCreator());
    this.registerCreator(new SolanaAdapterCreator());
  }

  /**
   * Register a new adapter creator for a specific network type
   * This enables extension for future chains (SUI, etc.)
   */
  registerCreator(creator: IAdapterCreator): void {
    if (this.creators.has(creator.networkType)) {
      console.warn(
        `Overwriting existing adapter creator for ${creator.networkType}`,
      );
    }
    this.creators.set(creator.networkType, creator);
  }

  /**
   * Get or create an adapter for the given wallet and network type
   * @param wallet - The wallet to create an adapter for
   * @param networkType - The network type (evm, solana, etc.)
   * @param chainId - Optional chain ID for environment-specific RPC selection
   */
  async getAdapter(
    wallet: IWallet,
    networkType: NetworkType,
    chainId?: SupportedChainId,
  ): Promise<BridgeAdapter> {
    // Include chainId in cache key for environment differentiation
    const cacheKey = chainId
      ? `${wallet.address}-${networkType}-${chainId}`
      : `${wallet.address}-${networkType}`;

    const cached = this.adapterCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get the appropriate creator
    const creator = this.creators.get(networkType);
    if (!creator) {
      throw new Error(`No adapter creator registered for ${networkType}`);
    }

    // Verify wallet compatibility
    if (!creator.canHandle(wallet)) {
      throw new Error(
        `Wallet ${wallet.connectorKey} is not compatible with ${networkType}`,
      );
    }

    // Create and cache the adapter (pass chainId for environment-based RPC)
    const adapter = await creator.createAdapter(wallet, chainId);
    this.adapterCache.set(cacheKey, adapter);

    return adapter;
  }

  /**
   * Clear adapter cache for a specific wallet or all wallets
   */
  clearCache(walletAddress?: string): void {
    if (walletAddress) {
      // Clear only adapters for this wallet
      const keysToDelete = Array.from(this.adapterCache.keys()).filter((key) =>
        key.startsWith(walletAddress),
      );
      keysToDelete.forEach((key) => this.adapterCache.delete(key));
    } else {
      // Clear all
      this.adapterCache.clear();
    }
  }

  /**
   * Get all supported network types
   */
  getSupportedNetworkTypes(): NetworkType[] {
    return Array.from(this.creators.keys());
  }

  /**
   * Check if a network type is supported
   */
  supports(networkType: NetworkType): boolean {
    return this.creators.has(networkType);
  }

  /**
   * Get creator for a network type
   */
  getCreator(networkType: NetworkType): IAdapterCreator | undefined {
    return this.creators.get(networkType);
  }
}

// Singleton instance
let factoryInstance: AdapterFactory | null = null;

/**
 * Get the global adapter factory instance
 */
export function getAdapterFactory(): AdapterFactory {
  if (!factoryInstance) {
    factoryInstance = new AdapterFactory();
  }
  return factoryInstance;
}
