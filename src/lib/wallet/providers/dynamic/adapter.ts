/**
 * Dynamic Labs Wallet Provider Adapter
 *
 * Implements the IWalletProviderAdapter interface to allow the bridge logic
 * to work with Dynamic Labs wallets in a provider-agnostic way.
 */

import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { isSuiWallet } from "@dynamic-labs/sui";
import type {
  Wallet,
  WalletConnectorCore,
} from "@dynamic-labs/wallet-connector-core";

import type { IWalletProviderAdapter } from "../../provider-registry";
import type { IWallet } from "../../types";
import { DynamicWalletWrapper, type DynamicWallet } from "./wallet-wrapper";

/**
 * Dynamic Labs wallet provider adapter
 *
 * Converts Dynamic's wallet objects to the common IWallet interface
 * and provides type checking utilities for wallet classification.
 */
export class DynamicWalletAdapter implements IWalletProviderAdapter {
  readonly providerName = "dynamic";

  /**
   * Convert a Dynamic wallet to an IWallet instance
   *
   * @param providerWallet - The Dynamic wallet object
   * @returns An IWallet wrapping the Dynamic wallet
   * @throws Error if the wallet is not a valid Dynamic wallet
   */
  createWallet(providerWallet: unknown): IWallet {
    // Validate that this looks like a Dynamic wallet
    const wallet = providerWallet as DynamicWallet;

    if (!wallet || typeof wallet !== "object") {
      throw new Error("Invalid wallet: expected a Dynamic wallet object");
    }

    if (!wallet.address || !wallet.connector) {
      throw new Error(
        "Invalid wallet: missing required properties (address, connector)",
      );
    }

    return new DynamicWalletWrapper(wallet);
  }

  /**
   * Check if a Dynamic wallet is an EVM wallet
   */
  isEVMWallet(wallet: unknown): boolean {
    try {
      return isEthereumWallet(
        wallet as Wallet<WalletConnectorCore.WalletConnector>,
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if a Dynamic wallet is a Solana wallet
   */
  isSolanaWallet(wallet: unknown): boolean {
    try {
      return isSolanaWallet(
        wallet as Wallet<WalletConnectorCore.WalletConnector>,
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if a Dynamic wallet is a SUI wallet
   */
  isSuiWallet(wallet: unknown): boolean {
    try {
      return isSuiWallet(wallet as Wallet<WalletConnectorCore.WalletConnector>);
    } catch {
      return false;
    }
  }
}

/**
 * Singleton instance of the Dynamic wallet adapter
 */
let adapterInstance: DynamicWalletAdapter | null = null;

/**
 * Get the singleton Dynamic wallet adapter instance
 */
export function getDynamicWalletAdapter(): DynamicWalletAdapter {
  if (!adapterInstance) {
    adapterInstance = new DynamicWalletAdapter();
  }
  return adapterInstance;
}
