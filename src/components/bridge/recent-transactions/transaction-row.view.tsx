"use client";

import { motion } from "motion/react";
import {
  ExternalLink,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  Wallet,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { NETWORK_CONFIGS, getExplorerAddressUrl } from "~/lib/bridge";
import {
  formatTimestamp,
  formatUSDC,
} from "./recent-transactions.utils";
import type { TransactionRowProps } from "./recent-transactions.types";

/** Truncate address for display (0x1234...5678) */
function truncateAddress(address: string): string {
  if (!address) return "";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function TransactionRow({
  transaction: tx,
  index,
  onOpenTransaction,
  disableClick = false,
}: TransactionRowProps) {
  const fromNetwork = NETWORK_CONFIGS[tx.fromChain];
  const toNetwork = NETWORK_CONFIGS[tx.toChain];
  const isPending = tx.status === "pending" || tx.status === "bridging";
  const isFailed = tx.status === "failed";
  const isCompleted = tx.status === "completed";
  const isCancelled = tx.status === "cancelled";
  const isFastMode = tx.transferMethod === "fast";

  // Get addresses with fallbacks for older transactions
  const sourceAddress = tx.sourceAddress ?? tx.userAddress;
  const destAddress =
    tx.destinationAddress ?? tx.recipientAddress ?? tx.userAddress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.2 + index * 0.08 }}
      onClick={disableClick ? undefined : () => onOpenTransaction(tx)}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-black/[0.03] transition-colors dark:bg-white/[0.04]",
        disableClick
          ? "p-3"
          : "cursor-pointer p-4 hover:bg-black/[0.05] dark:hover:bg-white/[0.07]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex min-w-0 flex-1 items-start overflow-hidden",
            disableClick ? "gap-3" : "gap-4",
          )}
        >
          {/* Status Icon — fixed size so it stays a circle when row has multiple lines */}
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full",
              disableClick ? "size-8" : "size-10",
              isCompleted && "bg-emerald-500/12 dark:bg-emerald-500/15",
              isPending && "bg-blue-500/10 dark:bg-blue-500/15",
              isFailed && "bg-rose-500/12 dark:bg-rose-500/15",
              isCancelled && "bg-zinc-400/15 dark:bg-zinc-500/15",
            )}
          >
            {isCompleted && (
              <CheckCircle2
                className={cn(
                  disableClick ? "size-4" : "size-5",
                  "text-emerald-700 dark:text-emerald-400",
                )}
              />
            )}
            {isPending && (
              <Clock
                className={cn(
                  disableClick ? "size-4" : "size-5",
                  "animate-pulse text-blue-600 dark:text-blue-400",
                )}
              />
            )}
            {isFailed && (
              <AlertCircle
                className={cn(
                  disableClick ? "size-4" : "size-5",
                  "text-rose-700 dark:text-rose-400",
                )}
              />
            )}
            {isCancelled && (
              <X
                className={cn(
                  disableClick ? "size-4" : "size-5",
                  "text-zinc-600 dark:text-zinc-400",
                )}
              />
            )}
          </div>

          {/* Transaction Details — min-w-0 so route can truncate and never overlap status badge */}
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                "text-foreground flex items-center gap-2 font-medium",
                disableClick ? "text-xs" : "text-sm",
              )}
            >
              <span
                className="min-w-0 flex-1 truncate"
                title={`${fromNetwork?.displayName} → ${toNetwork?.displayName}`}
              >
                {fromNetwork?.displayName} → {toNetwork?.displayName}
              </span>
              {/* Fast = lightning only (no text) to avoid overlap with status badge */}
              {!disableClick && isFastMode && (
                <span
                  className="shrink-0 rounded-full bg-amber-500/10 p-0.5 text-amber-700 dark:text-amber-400"
                  title="Fast transfer"
                  aria-label="Fast transfer"
                >
                  <Zap className="size-3" />
                </span>
              )}
            </div>
            <div
              className={cn(
                "text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1",
                disableClick ? "text-[10px]" : "text-xs",
              )}
            >
              <span>{formatUSDC(tx.amount)} USDC</span>
              <span>•</span>
              <span>{formatTimestamp(tx.createdAt)}</span>
              {/* Show provider fee for completed fast transactions (hide on mobile) */}
              {!disableClick &&
                isCompleted &&
                isFastMode &&
                tx.providerFeeUsdc &&
                parseFloat(tx.providerFeeUsdc) > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-amber-700 dark:text-amber-400">
                      Fee: {formatUSDC(tx.providerFeeUsdc)} USDC
                    </span>
                  </>
                )}
            </div>
            {/* Wallet addresses (hide on mobile) */}
            {!disableClick && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                <Wallet className="text-muted-foreground size-3" />
                <a
                  href={getExplorerAddressUrl(tx.fromChain, sourceAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground font-mono transition-colors"
                >
                  {truncateAddress(sourceAddress)}
                </a>
                <ArrowRight className="text-muted-foreground size-2.5" />
                <a
                  href={getExplorerAddressUrl(tx.toChain, destAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground font-mono transition-colors"
                >
                  {truncateAddress(destAddress)}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Status badge — shrink-0 so it never overlaps the route */}
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "rounded-full font-semibold",
              disableClick
                ? "px-2 py-0.5 text-[9px]"
                : "px-2.5 py-1 text-[10px]",
              isCompleted &&
                "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
              isPending &&
                "bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
              isFailed &&
                "bg-rose-500/12 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
              isCancelled &&
                "bg-zinc-400/15 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-400",
            )}
          >
            {isCompleted && "Completed"}
            {isPending && "In Progress"}
            {isFailed && "Failed"}
            {isCancelled && "Cancelled"}
          </span>
          {!disableClick && (
            <ExternalLink className="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
      </div>

      {/* Gradient effect on hover (hide on mobile) */}
      {!disableClick && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </motion.div>
  );
}
