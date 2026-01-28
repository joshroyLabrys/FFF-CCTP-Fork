"use client";

/**
 * Dynamic Labs Context Bridge
 *
 * Bridges Dynamic Labs' SDK hooks to the provider-agnostic IWalletContext interface.
 * This allows components to use the unified wallet API while Dynamic handles the
 * actual wallet connections.
 */

import { useMemo, useCallback } from "react";
import {
  useDynamicContext,
  useDynamicModals,
  useUserWallets,
  useSwitchWallet,
} from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { isSuiWallet } from "@dynamic-labs/sui";

import type { IWalletContext, IWallet } from "../../types";
import { DynamicWalletWrapper, type DynamicWallet } from "./wallet-wrapper";

/**
 * Hook that provides the Dynamic-powered wallet context
 *
 * This hook wraps all Dynamic SDK hooks and converts their output
 * to the provider-agnostic IWalletContext interface.
 *
 * @returns IWalletContext with Dynamic wallet data
 */
export function useDynamicWalletContext(): IWalletContext {
  // Get Dynamic SDK state
  const {
    primaryWallet,
    setShowAuthFlow,
    handleLogOut,
    setShowDynamicUserProfile,
    showDynamicUserProfile,
  } = useDynamicContext();

  const rawWallets = useUserWallets();
  const switchWalletFn = useSwitchWallet();

  // Convert all Dynamic wallets to IWallet instances
  // Type assertion needed because useUserWallets returns Wallet<any>[]
  const allWallets = useMemo<IWallet[]>(() => {
    return rawWallets.map((w) => new DynamicWalletWrapper(w as DynamicWallet));
  }, [rawWallets]);

  // Filter wallets by chain type
  const evmWallets = useMemo<IWallet[]>(() => {
    return rawWallets
      .filter(isEthereumWallet)
      .map((w) => new DynamicWalletWrapper(w as DynamicWallet));
  }, [rawWallets]);

  const solanaWallets = useMemo<IWallet[]>(() => {
    return rawWallets
      .filter(isSolanaWallet)
      .map((w) => new DynamicWalletWrapper(w as DynamicWallet));
  }, [rawWallets]);

  const suiWallets = useMemo<IWallet[]>(() => {
    return rawWallets
      .filter(isSuiWallet)
      .map((w) => new DynamicWalletWrapper(w as DynamicWallet));
  }, [rawWallets]);

  // Convert primary wallet
  const primaryWalletWrapped = useMemo<IWallet | null>(() => {
    if (!primaryWallet) return null;
    return new DynamicWalletWrapper(primaryWallet);
  }, [primaryWallet]);

  // Actions
  const connect = useCallback(() => {
    setShowAuthFlow(true);
  }, [setShowAuthFlow]);

  const disconnect = useCallback(async () => {
    await handleLogOut();
  }, [handleLogOut]);

  const switchWallet = useCallback(
    async (walletId: string) => {
      await switchWalletFn(walletId);
    },
    [switchWalletFn],
  );

  const showConnectModal = useCallback(() => {
    setShowAuthFlow(true);
  }, [setShowAuthFlow]);

  const showWalletManager = useCallback(() => {
    setShowDynamicUserProfile(true);
  }, [setShowDynamicUserProfile]);

  const hideWalletManager = useCallback(() => {
    setShowDynamicUserProfile(false);
  }, [setShowDynamicUserProfile]);

  // Return the IWalletContext interface
  return useMemo<IWalletContext>(
    () => ({
      isConnected: !!primaryWallet,
      primaryWallet: primaryWalletWrapped,
      allWallets,
      evmWallets,
      solanaWallets,
      suiWallets,
      connect,
      disconnect,
      switchWallet,
      showConnectModal,
      showWalletManager,
      hideWalletManager,
      isWalletManagerOpen: showDynamicUserProfile,
    }),
    [
      primaryWallet,
      primaryWalletWrapped,
      allWallets,
      evmWallets,
      solanaWallets,
      suiWallets,
      connect,
      disconnect,
      switchWallet,
      showConnectModal,
      showWalletManager,
      hideWalletManager,
      showDynamicUserProfile,
    ],
  );
}

/**
 * Additional Dynamic-specific hooks that may be needed
 * These can be used when you need features not in IWalletContext
 */

/**
 * Hook to show the link new wallet modal (Dynamic-specific)
 */
export function useDynamicLinkWalletModal() {
  const { setShowLinkNewWalletModal } = useDynamicModals();

  const showLinkWalletModal = useCallback(() => {
    setShowLinkNewWalletModal(true);
  }, [setShowLinkNewWalletModal]);

  return { showLinkWalletModal };
}
