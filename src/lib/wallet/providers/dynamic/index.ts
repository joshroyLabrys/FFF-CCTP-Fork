/**
 * Dynamic Labs wallet provider implementation
 *
 * This module provides the Dynamic Labs implementation of the wallet abstraction layer.
 */

// Adapter for converting Dynamic wallets to IWallet
export { DynamicWalletAdapter, getDynamicWalletAdapter } from "./adapter";

// Wallet wrapper class
export {
  DynamicWalletWrapper,
  isDynamicWalletWrapper,
  getDynamicWallet,
  type DynamicWallet,
} from "./wallet-wrapper";

// Context hook for bridging Dynamic to IWalletContext
export {
  useDynamicWalletContext,
  useDynamicLinkWalletModal,
  useRawDynamicWallets,
} from "./context";
