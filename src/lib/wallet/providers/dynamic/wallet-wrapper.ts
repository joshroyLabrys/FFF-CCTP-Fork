/**
 * Dynamic Labs Wallet Wrapper
 *
 * Wraps Dynamic Labs' wallet type to implement the provider-agnostic IWallet interface.
 * This allows the bridge logic to work with Dynamic wallets without knowing about
 * Dynamic-specific APIs.
 */

import type { Connection } from "@solana/web3.js";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { isSuiWallet } from "@dynamic-labs/sui";
import type {
  Wallet,
  WalletConnectorCore,
} from "@dynamic-labs/wallet-connector-core";
import type { SolanaWallet } from "@dynamic-labs/solana-core";

import type {
  IWallet,
  WalletChainType,
  EVMProvider,
  SolanaWalletProvider,
} from "../../types";
import { DynamicSolanaWalletAdapter } from "~/lib/solana/provider";

/**
 * Type alias for Dynamic's wallet type
 */
export type DynamicWallet = Wallet<WalletConnectorCore.WalletConnector>;

/**
 * Wrapper class that adapts Dynamic's wallet to the IWallet interface
 */
export class DynamicWalletWrapper implements IWallet {
  private readonly _dynamicWallet: DynamicWallet;
  private readonly _chainType: WalletChainType;

  constructor(dynamicWallet: DynamicWallet) {
    this._dynamicWallet = dynamicWallet;
    this._chainType = this.determineChainType();
  }

  /**
   * Get the underlying Dynamic wallet (for internal use)
   */
  get dynamicWallet(): DynamicWallet {
    return this._dynamicWallet;
  }

  // ============================================
  // IWallet interface implementation
  // ============================================

  get id(): string {
    return this._dynamicWallet.id;
  }

  get address(): string {
    return this._dynamicWallet.address;
  }

  get chainType(): WalletChainType {
    return this._chainType;
  }

  get connectorKey(): string {
    return String(this._dynamicWallet.connector.key);
  }

  get connectorName(): string | undefined {
    // Dynamic wallet connector may have a name property
    const connector = this._dynamicWallet.connector;
    return (connector as { name?: string }).name ?? undefined;
  }

  /**
   * Get EVM provider for transaction signing
   */
  async getEVMProvider(): Promise<EVMProvider> {
    if (this._chainType !== "evm") {
      throw new Error(`Cannot get EVM provider from ${this._chainType} wallet`);
    }

    if (!isEthereumWallet(this._dynamicWallet)) {
      throw new Error("Wallet is not an Ethereum wallet");
    }

    const walletClient = await this._dynamicWallet.getWalletClient();

    if (!walletClient) {
      throw new Error("Failed to get EVM wallet client");
    }

    // Dynamic's wallet client is EIP-1193 compatible
    return walletClient as unknown as EVMProvider;
  }

  /**
   * Get Solana provider for transaction signing
   */
  async getSolanaProvider(): Promise<SolanaWalletProvider> {
    if (this._chainType !== "solana") {
      throw new Error(
        `Cannot get Solana provider from ${this._chainType} wallet`,
      );
    }

    if (!isSolanaWallet(this._dynamicWallet)) {
      throw new Error("Wallet is not a Solana wallet");
    }

    // Cast to SolanaWallet to access Solana-specific methods
    const solanaWallet = this._dynamicWallet as unknown as SolanaWallet;

    // Return wrapped adapter
    return new DynamicSolanaWalletAdapter(solanaWallet);
  }

  /**
   * Get Solana RPC connection
   */
  async getSolanaConnection(): Promise<Connection> {
    if (this._chainType !== "solana") {
      throw new Error(
        `Cannot get Solana connection from ${this._chainType} wallet`,
      );
    }

    if (!isSolanaWallet(this._dynamicWallet)) {
      throw new Error("Wallet is not a Solana wallet");
    }

    // Cast to SolanaWallet to access Solana-specific methods
    const solanaWallet = this._dynamicWallet as unknown as SolanaWallet;
    return await solanaWallet.getConnection();
  }

  /**
   * Switch the wallet to a different network
   */
  async switchNetwork(chainId: number | string): Promise<void> {
    const numericChainId =
      typeof chainId === "string" ? parseInt(chainId, 10) : chainId;

    // switchNetwork is available on most wallet types
    if (typeof this._dynamicWallet.switchNetwork === "function") {
      await this._dynamicWallet.switchNetwork(numericChainId);
    } else {
      throw new Error(
        `Wallet ${this.connectorKey} does not support network switching`,
      );
    }
  }

  /**
   * Check if the wallet is connected
   */
  isConnected(): boolean {
    return !!this._dynamicWallet.address;
  }

  /**
   * Disconnect the wallet
   */
  async disconnect(): Promise<void> {
    await this._dynamicWallet.connector.endSession();
  }

  // ============================================
  // Private helpers
  // ============================================

  /**
   * Determine the chain type based on the wallet type
   */
  private determineChainType(): WalletChainType {
    if (isEthereumWallet(this._dynamicWallet)) {
      return "evm";
    }
    if (isSolanaWallet(this._dynamicWallet)) {
      return "solana";
    }
    if (isSuiWallet(this._dynamicWallet)) {
      return "sui";
    }

    // Default to EVM if we can't determine the type
    console.warn(
      `[DynamicWalletWrapper] Unknown wallet type for ${this._dynamicWallet.connector.key}, defaulting to EVM`,
    );
    return "evm";
  }
}

/**
 * Type guard to check if an IWallet is a DynamicWalletWrapper
 */
export function isDynamicWalletWrapper(
  wallet: IWallet,
): wallet is DynamicWalletWrapper {
  return wallet instanceof DynamicWalletWrapper;
}

/**
 * Get the underlying Dynamic wallet from an IWallet
 * Returns undefined if the wallet is not a Dynamic wallet
 */
export function getDynamicWallet(wallet: IWallet): DynamicWallet | undefined {
  if (isDynamicWalletWrapper(wallet)) {
    return wallet.dynamicWallet;
  }
  return undefined;
}
