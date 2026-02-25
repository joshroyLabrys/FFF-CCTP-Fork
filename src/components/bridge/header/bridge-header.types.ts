export interface BridgeHeaderViewProps {
  // Wallet state
  isConnected: boolean;
  walletAddress: string | null;
  showDynamicUserProfile: boolean;

  // Panel visibility
  showHistoryDrawer: boolean;
  /** @deprecated alias for showHistoryDrawer — kept for nav-menu/controls compat */
  showTransactionHistory: boolean;
  /** @deprecated alias for showHistoryDrawer — kept for nav-menu/controls compat */
  showStats: boolean;
  showDisclaimer: boolean;
  showPongGame: boolean;
  showExplainer: boolean;
  commandPaletteOpen: boolean;

  // Environment
  environment: "mainnet" | "testnet";

  // Header control order (for drag-to-reorder)
  headerControlOrder: string[];
  onReorderHeaderControls: (order: string[]) => void;
  isDraggingControls: boolean;
  onDragStartControls: () => void;
  onDragEndControls: () => void;

  // Actions
  onConnectWallet: () => void;
  onManageWallets: () => void;
  onLogout: () => void;
  onCloseDynamicProfile: () => void;

  // Unified history drawer
  onOpenHistoryDrawer: () => void;
  onCloseHistoryDrawer: () => void;
  onToggleHistoryDrawer: () => void;

  // Aliases kept for nav-menu and header-controls compat
  onToggleTransactionHistory: () => void;
  onToggleStats: () => void;
  onCloseTransactionHistory: () => void;
  onCloseStats: () => void;
  onOpenTransactionHistory: () => void;
  onOpenStats: () => void;

  // Other panels
  onToggleDisclaimer: () => void;
  onTogglePongGame: () => void;
  onCloseDisclaimer: () => void;
  onClosePongGame: () => void;
  onCloseExplainer: () => void;
  onOpenDisclaimer: () => void;
  onOpenPongGame: () => void;
  onOpenExplainer: () => void;
  onOpenCommandPalette: () => void;
  onCloseCommandPalette: () => void;
}

export interface WindowControlsProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  showMaximize?: boolean;
}
