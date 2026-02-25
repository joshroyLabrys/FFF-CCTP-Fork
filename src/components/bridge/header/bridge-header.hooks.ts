"use client";

import { useState, useCallback } from "react";
import { useWalletContext } from "~/lib/wallet/wallet-context";
import {
  useEnvironment,
  useHeaderControlOrder,
  useSetHeaderControlOrder,
} from "~/lib/bridge";
import { useCCTPExplainer } from "../cctp-explainer";

export function useHeaderState() {
  const walletContext = useWalletContext();
  const { primaryWallet, isWalletManagerOpen } = walletContext;

  const environment = useEnvironment();
  const headerControlOrder = useHeaderControlOrder();
  const setHeaderControlOrder = useSetHeaderControlOrder();

  // Unified history + stats drawer
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showPongGame, setShowPongGame] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isDraggingControls, setIsDraggingControls] = useState(false);

  // CCTP Explainer (managed via store)
  const {
    isOpen: showExplainer,
    onClose: handleCloseExplainer,
    onOpen: handleOpenExplainer,
  } = useCCTPExplainer();

  const isConnected = !!primaryWallet;
  const walletAddress = primaryWallet?.address ?? null;

  const handleConnectWallet = useCallback(() => {
    walletContext.showConnectModal();
  }, [walletContext]);

  const handleManageWallets = useCallback(() => {
    walletContext.showWalletManager();
  }, [walletContext]);

  const handleLogout = useCallback(() => {
    void walletContext.disconnect();
  }, [walletContext]);

  const handleCloseDynamicProfile = useCallback(() => {
    walletContext.hideWalletManager();
  }, [walletContext]);

  // History drawer — both transaction history and stats route here
  const handleOpenHistoryDrawer = useCallback(() => {
    setShowHistoryDrawer(true);
  }, []);

  const handleCloseHistoryDrawer = useCallback(() => {
    setShowHistoryDrawer(false);
  }, []);

  const handleToggleHistoryDrawer = useCallback(() => {
    setShowHistoryDrawer((prev) => !prev);
  }, []);

  const handleToggleDisclaimer = useCallback(() => {
    setShowDisclaimer((prev) => !prev);
  }, []);

  const handleTogglePongGame = useCallback(() => {
    setShowPongGame((prev) => !prev);
  }, []);

  const handleCloseDisclaimer = useCallback(() => {
    setShowDisclaimer(false);
  }, []);

  const handleClosePongGame = useCallback(() => {
    setShowPongGame(false);
  }, []);

  const handleOpenDisclaimer = useCallback(() => {
    setShowDisclaimer(true);
  }, []);

  const handleOpenPongGame = useCallback(() => {
    setShowPongGame(true);
  }, []);

  const handleOpenCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  const handleCloseCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false);
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDraggingControls(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    // Small delay to prevent click events from firing after drag ends
    setTimeout(() => setIsDraggingControls(false), 100);
  }, []);

  return {
    // Wallet state
    isConnected,
    walletAddress,
    showDynamicUserProfile: isWalletManagerOpen,

    // Panel visibility
    // Both showTransactionHistory and showStats alias to the unified drawer
    showHistoryDrawer,
    showTransactionHistory: showHistoryDrawer,
    showStats: showHistoryDrawer,
    showDisclaimer,
    showPongGame,
    showExplainer,
    commandPaletteOpen,

    // Environment
    environment,

    // Header control order (for drag-to-reorder)
    headerControlOrder,
    onReorderHeaderControls: setHeaderControlOrder,
    isDraggingControls,
    onDragStartControls: handleDragStart,
    onDragEndControls: handleDragEnd,

    // Actions
    onConnectWallet: handleConnectWallet,
    onManageWallets: handleManageWallets,
    onLogout: handleLogout,
    onCloseDynamicProfile: handleCloseDynamicProfile,

    // History drawer — both history and stats route here
    onOpenHistoryDrawer: handleOpenHistoryDrawer,
    onCloseHistoryDrawer: handleCloseHistoryDrawer,
    onToggleHistoryDrawer: handleToggleHistoryDrawer,

    // Aliases kept for nav-menu and header-controls compatibility
    onToggleTransactionHistory: handleToggleHistoryDrawer,
    onToggleStats: handleToggleHistoryDrawer,
    onCloseTransactionHistory: handleCloseHistoryDrawer,
    onCloseStats: handleCloseHistoryDrawer,
    onOpenTransactionHistory: handleOpenHistoryDrawer,
    onOpenStats: handleOpenHistoryDrawer,

    // Other panels
    onToggleDisclaimer: handleToggleDisclaimer,
    onTogglePongGame: handleTogglePongGame,
    onCloseDisclaimer: handleCloseDisclaimer,
    onClosePongGame: handleClosePongGame,
    onCloseExplainer: handleCloseExplainer,
    onOpenDisclaimer: handleOpenDisclaimer,
    onOpenPongGame: handleOpenPongGame,
    onOpenExplainer: handleOpenExplainer,
    onOpenCommandPalette: handleOpenCommandPalette,
    onCloseCommandPalette: handleCloseCommandPalette,
  };
}
