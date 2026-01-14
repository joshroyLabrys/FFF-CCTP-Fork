/**
 * Wallet Abstraction Layer
 *
 * This module provides a provider-agnostic wallet abstraction that allows
 * the bridge logic to work with any wallet provider (Dynamic, RainbowKit, Privy, etc.)
 * without knowing about provider-specific APIs.
 *
 * ## Usage
 *
 * ### In Components (React)
 * ```tsx
 * import { useWalletContext } from '~/lib/wallet';
 *
 * function MyComponent() {
 *   const { primaryWallet, connect, isConnected } = useWalletContext();
 *
 *   if (!isConnected) {
 *     return <button onClick={connect}>Connect</button>;
 *   }
 *
 *   return <div>Connected: {primaryWallet?.address}</div>;
 * }
 * ```
 *
 * ### In Bridge Logic
 * ```typescript
 * import type { IWallet } from '~/lib/wallet';
 *
 * async function bridgeTokens(wallet: IWallet, amount: string) {
 *   const provider = await wallet.getEVMProvider();
 *   // Use provider for signing...
 * }
 * ```
 *
 * ### Adding a New Wallet Provider
 * 1. Create a new folder in `providers/` (e.g., `providers/rainbowkit/`)
 * 2. Implement `IWalletProviderAdapter` interface
 * 3. Create a context hook that returns `IWalletContext`
 * 4. Register the adapter in your provider component
 */

// Core types
export type {
  IWallet,
  IWalletContext,
  WalletChainType,
  EVMProvider,
  SolanaWalletProvider,
} from "./types";

// React context
export { useWalletContext, WalletProvider } from "./wallet-context";

// Provider registry
export {
  WalletProviderRegistry,
  type IWalletProviderAdapter,
} from "./provider-registry";

// Dynamic Labs provider (default implementation)
export {
  DynamicWalletAdapter,
  getDynamicWalletAdapter,
  DynamicWalletWrapper,
  isDynamicWalletWrapper,
  getDynamicWallet,
  useDynamicWalletContext,
  useDynamicLinkWalletModal,
  useRawDynamicWallets,
  type DynamicWallet,
} from "./providers/dynamic";
