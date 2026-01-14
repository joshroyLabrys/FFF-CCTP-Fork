"use client";

/**
 * Provider-agnostic wallet React context
 *
 * This context provides a unified API for accessing wallet state and actions,
 * regardless of which wallet provider (Dynamic, RainbowKit, Privy) is being used.
 */

import { createContext, useContext } from "react";
import type { IWalletContext } from "./types";

/**
 * The wallet context instance
 * This should be provided by a wallet provider implementation
 */
const WalletContext = createContext<IWalletContext | null>(null);

/**
 * Hook to access the wallet context
 *
 * @throws Error if used outside of a WalletProvider
 * @returns The wallet context with all wallet state and actions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { primaryWallet, connect, isConnected } = useWalletContext();
 *
 *   if (!isConnected) {
 *     return <button onClick={connect}>Connect Wallet</button>;
 *   }
 *
 *   return <div>Connected: {primaryWallet?.address}</div>;
 * }
 * ```
 */
export function useWalletContext(): IWalletContext {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error(
      "useWalletContext must be used within a WalletProvider. " +
        "Make sure your component is wrapped with a wallet provider implementation.",
    );
  }

  return context;
}

/**
 * The wallet context provider component
 *
 * This is used by wallet provider implementations to provide the context value.
 * Application code should not use this directly - instead use the provider-specific
 * wrapper (e.g., DynamicWalletProvider).
 */
export const WalletProvider = WalletContext.Provider;

/**
 * Display name for React DevTools
 */
WalletContext.displayName = "WalletContext";
