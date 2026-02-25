"use client";

import { useStatsWindowState } from "../stats-window/stats-window.hooks";
import { HistoryDrawerView } from "./history-drawer.view";

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function HistoryDrawer({ open, onClose }: HistoryDrawerProps) {
  const { stats, isLoading } = useStatsWindowState({ onClose });

  return (
    <HistoryDrawerView
      open={open}
      onClose={onClose}
      stats={stats}
      isLoadingStats={isLoading}
    />
  );
}
