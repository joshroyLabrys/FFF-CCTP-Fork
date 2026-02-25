"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, TrendingUp, ArrowRightLeft, Zap, PiggyBank } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { WindowPortal } from "~/components/ui/window-portal";
import { RecentTransactions } from "~/components/bridge/recent-transactions";
import { useEnvironment } from "~/lib/bridge";
import type { BridgeStats } from "../stats-window/stats-window.types";

interface HistoryDrawerViewProps {
  open: boolean;
  onClose: () => void;
  stats: BridgeStats;
  isLoadingStats: boolean;
}

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

// ─── Stats content — shared between desktop and mobile ───────────────────────
function StatsContent({
  stats,
  isLoading,
}: {
  stats: BridgeStats;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-[13px] text-muted-foreground">Loading stats…</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Hero — total bridged */}
      <div className="rounded-xl bg-black/[0.03] px-4 py-3.5 dark:bg-white/[0.04]">
        <div className="mb-1.5 flex items-center gap-1.5">
          <TrendingUp className="size-3.5 text-[#0071e3]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Bridged
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[26px] font-semibold tracking-tight text-foreground">
            ${stats.totalBridged}
          </span>
          <span className="text-[13px] text-muted-foreground">USDC</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-black/[0.03] px-3 py-3 dark:bg-white/[0.04]">
          <div className="mb-1.5 flex items-center gap-1.5">
            <ArrowRightLeft className="size-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Transfers
            </span>
          </div>
          <p className="text-[20px] font-semibold tracking-tight text-foreground">
            {stats.totalTransactions.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            <span className="text-amber-700 dark:text-amber-400">
              {stats.fastTransactions.toLocaleString("en-US")} fast
            </span>
            {" · "}
            <span>{stats.standardTransactions.toLocaleString("en-US")} standard</span>
          </p>
        </div>

        <div className="rounded-xl bg-black/[0.03] px-3 py-3 dark:bg-white/[0.04]">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Zap className="size-3.5 text-amber-700 dark:text-amber-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Fees Paid
            </span>
          </div>
          <p className="text-[20px] font-semibold tracking-tight text-foreground">
            ${stats.totalFeesPaid}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">USDC (fast mode)</p>
        </div>
      </div>

      {/* Savings */}
      <div className="rounded-xl bg-emerald-500/[0.07] px-4 py-3 dark:bg-emerald-500/[0.1]">
        <div className="mb-1.5 flex items-center gap-1.5">
          <PiggyBank className="size-3.5 text-emerald-700 dark:text-emerald-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            Estimated Savings
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[20px] font-semibold tracking-tight text-emerald-800 dark:text-emerald-300">
            ~${stats.estimatedSavings}
          </span>
          <span className="text-[12px] text-emerald-700/80 dark:text-emerald-400/80">
            USDC
          </span>
        </div>
        <p className="mt-1 text-[11px] text-emerald-700/70 dark:text-emerald-400/70">
          vs. third-party bridges at ~0.2% fee
        </p>
      </div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

export function HistoryDrawerView({
  open,
  onClose,
  stats,
  isLoadingStats,
}: HistoryDrawerViewProps) {
  const environment = useEnvironment();

  return (
    <WindowPortal>
      <AnimatePresence>
        {open && (
          <>
            {/* ── Backdrop ─────────────────────────────────────────── */}
            <motion.div
              key="history-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: easeOut }}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] dark:bg-black/40"
              style={{ zIndex: 290 }}
              onClick={onClose}
            />

            {/* ── Desktop drawer — slides in from the right ─────────── */}
            <motion.div
              key="history-drawer-desktop"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: easeOut }}
              className="fixed bottom-0 top-14 right-0 hidden w-[420px] flex-col border-l border-border bg-white/[0.97] backdrop-blur-2xl dark:bg-[#111111]/[0.97] lg:flex"
              style={{ zIndex: 291 }}
            >
              {/* Drawer header */}
              <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
                  Activity
                </h2>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.92 }}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.07]"
                  aria-label="Close activity panel"
                >
                  <X className="size-4" />
                </motion.button>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-6 px-5 py-5">
                  {/* Stats section */}
                  <div className="space-y-3">
                    <SectionHeading>My Stats</SectionHeading>
                    <StatsContent stats={stats} isLoading={isLoadingStats} />
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Transaction history section */}
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <SectionHeading>Transactions</SectionHeading>
                      <span className="text-[11px] text-muted-foreground capitalize">
                        {environment}
                      </span>
                    </div>
                    <RecentTransactions hideHeader />
                  </div>
                </div>
              </ScrollArea>
            </motion.div>

            {/* ── Mobile bottom sheet ───────────────────────────────── */}
            <motion.div
              key="history-drawer-mobile"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 bottom-0 left-0 flex max-h-[90vh] flex-col rounded-t-3xl border-t border-border bg-white/[0.97] backdrop-blur-2xl dark:bg-[#111111]/[0.97] lg:hidden"
              style={{ zIndex: 291 }}
            >
              {/* Drag handle */}
              <div className="flex shrink-0 items-center justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-black/[0.12] dark:bg-white/[0.18]" />
              </div>

              {/* Mobile header */}
              <div className="flex shrink-0 items-center justify-between border-b border-border px-5 pb-3 pt-2">
                <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
                  Activity
                </h2>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.92 }}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.07]"
                  aria-label="Close activity panel"
                >
                  <X className="size-4" />
                </motion.button>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-6 px-5 py-5">
                  {/* Stats */}
                  <div className="space-y-3">
                    <SectionHeading>My Stats</SectionHeading>
                    <StatsContent stats={stats} isLoading={isLoadingStats} />
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Transactions */}
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <SectionHeading>Transactions</SectionHeading>
                      <span className="text-[11px] text-muted-foreground capitalize">
                        {environment}
                      </span>
                    </div>
                    <RecentTransactions hideHeader />
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </WindowPortal>
  );
}
