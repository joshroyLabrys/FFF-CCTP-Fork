"use client";

import { Clock, ArrowRight } from "lucide-react";
import type { BridgeEstimate, TransferMethod } from "~/lib/bridge/types";
import { getAttestationTimeDisplay } from "~/lib/bridge/attestation-times";
import type { SupportedChainId } from "~/lib/bridge/networks";
import { NETWORK_CONFIGS } from "~/lib/bridge/networks";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

/** Format USDC amounts — always 2dp, comma-separated thousands */
function formatUSDC(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "0.00";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format a gas fee (ETH, SOL, MATIC, etc.) with smart precision.
 * Large values get commas + 2dp. Tiny values (< 0.01) show up to 6
 * significant figures so they don't round to "0.00".
 */
function formatGasFee(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n) || n === 0) return "0";
  if (n >= 0.01) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  }
  // For very small values (e.g. 0.000123 ETH), show 4 significant figures
  return n.toLocaleString("en-US", { maximumSignificantDigits: 4 });
}

interface FeeSummaryCardProps {
  estimate: BridgeEstimate | null;
  isEstimating: boolean;
  fromChain: SupportedChainId | null;
  toChain: SupportedChainId | null;
  amount: string;
  transferMethod?: TransferMethod;
}

export function FeeSummaryCard({
  estimate,
  isEstimating,
  fromChain,
  toChain,
  amount,
  transferMethod = "standard",
}: FeeSummaryCardProps) {
  const fromNetwork = fromChain ? NETWORK_CONFIGS[fromChain] : null;
  const toNetwork = toChain ? NETWORK_CONFIGS[toChain] : null;
  const isFast = transferMethod === "fast";

  const cctpFeeRaw = estimate?.providerFees
    ? estimate.providerFees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0)
    : 0;
  const cctpFeeAmount = formatUSDC(cctpFeeRaw);
  const hasCctpFee = cctpFeeRaw > 0;

  if (!fromChain || !toChain) return null;

  return (
    <div className="space-y-3">
      {/* Route & Amount */}
      <div className="rounded-xl bg-black/[0.03] px-3 py-2.5 dark:bg-white/[0.05]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span className="truncate">{fromNetwork?.name}</span>
            <ArrowRight className="size-3 shrink-0" />
            <span className="truncate">{toNetwork?.name}</span>
          </div>
          <span className="font-mono text-[13px] font-medium text-foreground">
            {formatUSDC(amount || "0")} USDC
          </span>
        </div>
      </div>

      {/* Estimated time */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground" />
          <span className="text-[13px] text-muted-foreground">Est. time</span>
        </div>
        {isEstimating ? (
          <Skeleton className="h-3.5 w-16" />
        ) : (
          <span className="text-[13px] font-medium text-foreground">
            {fromChain ? getAttestationTimeDisplay(fromChain, isFast) : getAttestationTimeDisplay("Ethereum", false)}
          </span>
        )}
      </div>

      {/* Network fee breakdown */}
      {estimate?.detailedGasFees && estimate.detailedGasFees.length > 0 && (
        <div className="space-y-2">
          <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Network Fees
          </p>

          {estimate.detailedGasFees.map((fee, index) => {
            const network = NETWORK_CONFIGS[fee.blockchain as SupportedChainId];
            return (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl bg-black/[0.03] px-3 py-2.5 dark:bg-white/[0.05]"
              >
                <div>
                  <p className="text-[13px] font-medium text-foreground">
                    {fee.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {network?.name ?? fee.blockchain}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[13px] font-medium text-foreground">
                    {formatGasFee(fee.fees.fee)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{fee.token}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CCTP fee */}
      <div className="space-y-1.5">
        <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          CCTP Fee
        </p>
        <div
          className={cn(
            "flex items-center justify-between rounded-xl px-3 py-2.5",
            isFast && hasCctpFee
              ? "bg-amber-500/[0.08] dark:bg-amber-500/[0.1]"
              : "bg-emerald-500/[0.07] dark:bg-emerald-500/[0.1]",
          )}
        >
          <span className="text-[13px] text-muted-foreground">
            {isFast ? "Fast transfer fee" : "Standard transfer"}
          </span>
          <span
            className={cn(
              "font-mono text-[13px] font-semibold",
              isFast && hasCctpFee
                ? "text-amber-800 dark:text-amber-400"
                : "text-emerald-800 dark:text-emerald-400",
            )}
          >
            {isFast && hasCctpFee ? `${cctpFeeAmount} USDC` : "Free · 0%"}
          </span>
        </div>
      </div>

      {/* Footer note */}
      <p className="px-0.5 text-[11px] leading-relaxed text-muted-foreground/60">
        {isFast
          ? "Network fees go to validators. Fast transfers include a small CCTP fee (~0.1%) for instant finality."
          : "Network fees go to validators. Standard transfers have no CCTP fees."}
      </p>
    </div>
  );
}
