/**
 * Dynamic Labs Wallet Provider Adapter
 *
 * Implements the IWalletProviderAdapter interface to allow the bridge logic
 * to work with Dynamic Labs wallets in a provider-agnostic way.
 */

import type { IWalletProviderAdapter } from "../../provider-registry";
import type { IWallet } from "../../types";
import { DynamicWalletWrapper, type DynamicWallet } from "./wallet-wrapper";

/**
 * Dynamic Labs wallet provider adapter
 *
 * Converts Dynamic's wallet objects to the common IWallet interface.
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
}
