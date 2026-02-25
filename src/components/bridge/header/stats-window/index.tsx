"use client";

// Stats data hook is consumed by HistoryDrawer — this module now only exports types and the hook.
export { useStatsWindowState } from "./stats-window.hooks";
export type { StatsWindowProps, BridgeStats } from "./stats-window.types";
