/**
 * Wallet Provider Registry
 *
 * A singleton registry that manages the active wallet provider adapter.
 * This allows the application to swap wallet providers at runtime without
 * changing the core bridge logic.
 */

import type { IWallet } from "./types";

/**
 * Interface for wallet provider adapters
 *
 * Each wallet provider (Dynamic, RainbowKit, Privy) implements this interface
 * to convert their provider-specific wallet types to the common IWallet interface.
 */
export interface IWalletProviderAdapter {
  /**
   * Name identifier for this provider
   * @example "dynamic", "rainbowkit", "privy"
   */
  readonly providerName: string;

  /**
   * Convert a provider-specific wallet to the common IWallet interface
   * @param providerWallet - The wallet object from the specific provider
   * @returns An IWallet instance wrapping the provider wallet
   */
  createWallet(providerWallet: unknown): IWallet;
}

/**
 * Singleton registry for the active wallet provider adapter
 *
 * @example
 * ```typescript
 * // During app initialization (in a provider component):
 * WalletProviderRegistry.register(new DynamicWalletAdapter());
 *
 * // Later, in bridge logic:
 * const adapter = WalletProviderRegistry.getAdapter();
 * const wallet = adapter.createWallet(dynamicWallet);
 * ```
 */
export class WalletProviderRegistry {
  private static adapter: IWalletProviderAdapter | null = null;

  /**
   * Register a wallet provider adapter
   *
   * This should be called during application initialization,
   * typically in the wallet provider component.
   *
   * @param adapter - The wallet provider adapter to register
   */
  static register(adapter: IWalletProviderAdapter): void {
    this.adapter = adapter;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[WalletProviderRegistry] Registered provider: ${adapter.providerName}`,
      );
    }
  }

  /**
   * Get the registered wallet provider adapter
   *
   * @throws Error if no adapter has been registered
   * @returns The registered wallet provider adapter
   */
  static getAdapter(): IWalletProviderAdapter {
    if (!this.adapter) {
      throw new Error(
        "No wallet provider adapter registered. " +
          "Make sure to call WalletProviderRegistry.register() during app initialization.",
      );
    }

    return this.adapter;
  }

  /**
   * Check if an adapter has been registered
   */
  static hasAdapter(): boolean {
    return this.adapter !== null;
  }
}
