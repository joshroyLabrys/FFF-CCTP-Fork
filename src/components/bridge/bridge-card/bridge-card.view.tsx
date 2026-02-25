"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChainSelector } from "../chain-selector";
import { AmountInput } from "../amount-input";
import { SwapButton } from "../swap-button";
import { DestinationAddressInput } from "../destination-address-input";
import { WalletSelector } from "../wallet-selector";
import { TransferMethodToggle } from "../transfer-method-toggle";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Clock,
  X,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { NETWORK_CONFIGS } from "~/lib/bridge/networks";
import { getAttestationTimeDisplay } from "~/lib/bridge/attestation-times";
import { getNetworkTypeLabel } from "~/lib/bridge/utils";
import { FeeSummaryCard } from "../fee-summary-card";
import { WindowPortal } from "~/components/ui/window-portal";
import type { BridgeCardViewProps } from "./bridge-card.types";
import type { SupportedChainId } from "~/lib/bridge/networks";

function formatUSDC(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "0.00";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Shared spring config for section expand/collapse
const expandTransition = {
  duration: 0.22,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

interface BridgeButtonState {
  isBridging: boolean;
  isInitialized: boolean;
  fromChain: SupportedChainId | null;
  toChain: SupportedChainId | null;
  needsSourceWallet: boolean;
  needsDestinationWallet: boolean;
  needsWalletForMinting: boolean;
  destNetworkName: string | undefined;
  isValidAmount: boolean;
}

function getBridgeButtonContent(state: BridgeButtonState): React.ReactNode {
  if (!state.isInitialized) return <span>Connect Wallet</span>;
  if (!state.fromChain || !state.toChain) return <span>Select Networks</span>;
  if (state.needsSourceWallet) return <span>Select Source Wallet</span>;
  if (state.needsDestinationWallet)
    return <span>Select Destination Wallet</span>;
  if (state.needsWalletForMinting) {
    return <span>Connect {state.destNetworkName} Wallet</span>;
  }
  if (!state.isValidAmount) return <span>Enter Amount</span>;

  return (
    <span className="flex items-center gap-2">
      Bridge USDC
      <ArrowRight className="size-4" />
    </span>
  );
}

export function BridgeCardView({
  isInitialized,
  transferMethod,
  onTransferMethodChange,
  fromChain,
  toChain,
  onFromChainChange,
  onToChainChange,
  onSwapChains,
  sourceWallets,
  selectedSourceWalletId,
  onSelectSourceWallet,
  destWallets,
  selectedDestWalletId,
  onSelectDestWallet,
  selectedDestWalletAddress,
  destWalletAddress,
  toNetworkType,
  amount,
  onAmountChange,
  balance,
  isValidAmount,
  useCustomAddress,
  customAddress,
  onUseCustomAddressChange,
  onCustomAddressChange,
  onAddressValidationChange,
  showFeeDetails,
  onToggleFeeDetails,
  estimate,
  isEstimating,
  switchError,
  bridgeError,
  isBridging,
  canBridge,
  needsSourceWallet,
  needsDestinationWallet,
  needsWalletForMinting,
  destNetworkName,
  onBridge,
  onPromptDestWallet,
  onPromptSourceWallet,
  fromNetworkType,
  bridgeCardRef,
  beamContainerRef,
}: BridgeCardViewProps) {
  return (
    <>
      <div ref={beamContainerRef} className="relative">
        <motion.div
          ref={bridgeCardRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative mx-auto w-full max-w-[95vw] sm:max-w-md"
        >
          {/* Card */}
          <div className="overflow-hidden rounded-[28px] border border-black/[0.08] bg-white/[0.82] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.1)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.05]">

            {/* Transfer Method Toggle */}
            <div className="mb-5">
              <TransferMethodToggle
                value={transferMethod}
                onChange={onTransferMethodChange}
              />
            </div>

            {/* Network Switch Error */}
            <AnimatePresence initial={false}>
              {switchError && (
                <motion.div
                  key="switch-error"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={expandTransition}
                  className="overflow-hidden"
                >
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/[0.08]">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-amber-700 dark:text-amber-400">
                        Network switch failed
                      </p>
                      <p className="mt-0.5 text-[12px] text-amber-600/80 dark:text-amber-500/80">
                        {switchError}. Switch networks manually in your wallet.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── From section ─── */}
            <div className="space-y-3">
              <ChainSelector
                selectedChain={fromChain}
                onSelectChain={onFromChainChange}
                label="From"
                excludeChainId={toChain}
                containerRef={bridgeCardRef}
              />

              {/* Source Wallet — animates in when chain is selected */}
              <AnimatePresence initial={false} mode="wait">
                {fromChain && sourceWallets.length > 0 ? (
                  <motion.div
                    key="source-wallet-selector"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={expandTransition}
                    className="overflow-hidden"
                  >
                    <WalletSelector
                      wallets={sourceWallets}
                      selectedWalletId={selectedSourceWalletId}
                      onSelectWallet={onSelectSourceWallet}
                      label="Source Wallet"
                      networkType={NETWORK_CONFIGS[fromChain]?.type ?? "evm"}
                    />
                  </motion.div>
                ) : needsSourceWallet && fromChain ? (
                  <motion.div
                    key="source-wallet-warning"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={expandTransition}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 rounded-xl border border-blue-200/60 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/[0.08]">
                      <AlertCircle className="size-4 shrink-0 text-blue-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-blue-700 dark:text-blue-400">
                          Connect {getNetworkTypeLabel(fromNetworkType)} wallet
                        </p>
                        <p className="mt-0.5 text-[12px] text-blue-600/70 dark:text-blue-400/70">
                          Required to send from {NETWORK_CONFIGS[fromChain]?.name}
                        </p>
                      </div>
                      <Button
                        onClick={() =>
                          onPromptSourceWallet(NETWORK_CONFIGS[fromChain]?.name)
                        }
                        size="sm"
                        className="h-7 shrink-0 rounded-lg border-0 bg-blue-500/10 px-3 text-[12px] font-semibold text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
                      >
                        Connect
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Amount Input */}
              <AmountInput
                value={amount}
                onChange={onAmountChange}
                balance={balance}
                label="Amount"
              />
            </div>

            {/* Swap Button */}
            <div className="my-3">
              <SwapButton onSwap={onSwapChains} />
            </div>

            {/* ─── To section ─── */}
            <div className="space-y-3">
              <ChainSelector
                selectedChain={toChain}
                onSelectChain={onToChainChange}
                label="To"
                excludeChainId={fromChain}
                containerRef={bridgeCardRef}
              />

              {/* Destination wallet/address — animates in when To chain is selected */}
              <AnimatePresence initial={false}>
                {toChain && toNetworkType && (
                  <motion.div
                    key="dest-section"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={expandTransition}
                    className="relative z-10 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Destination
                        </label>
                        <button
                          onClick={() => onUseCustomAddressChange(!useCustomAddress)}
                          className="text-[12px] text-[#0071e3] transition-opacity hover:opacity-70"
                        >
                          {useCustomAddress
                            ? "Use connected wallet"
                            : "Use custom address"}
                        </button>
                      </div>

                      <AnimatePresence initial={false} mode="wait">
                        <motion.div
                          key={useCustomAddress ? "custom-input" : "wallet-selector"}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.12 }}
                        >
                          {useCustomAddress ? (
                            <DestinationAddressInput
                              networkType={toNetworkType}
                              value={customAddress}
                              onChange={onCustomAddressChange}
                              onValidationChange={onAddressValidationChange}
                              useCustomAddress={useCustomAddress}
                              onToggleCustomAddress={onUseCustomAddressChange}
                              connectedWalletAddress={
                                selectedDestWalletAddress ?? destWalletAddress
                              }
                            />
                          ) : (
                            <WalletSelector
                              wallets={destWallets}
                              selectedWalletId={selectedDestWalletId}
                              onSelectWallet={onSelectDestWallet}
                              label=""
                              networkType={NETWORK_CONFIGS[toChain]?.type ?? "evm"}
                              placeholder="Select destination wallet"
                            />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Destination Wallet Warnings */}
              <AnimatePresence initial={false} mode="wait">
                {needsWalletForMinting && toChain ? (
                  <motion.div
                    key="minting-wallet-warning"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={expandTransition}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 rounded-xl border border-amber-200/60 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/[0.08]">
                      <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-amber-700 dark:text-amber-400">
                          {destNetworkName} wallet required
                        </p>
                        <p className="mt-0.5 text-[12px] text-amber-600/70 dark:text-amber-400/70">
                          Needed to pay gas fees on the destination chain
                        </p>
                      </div>
                      <Button
                        onClick={() => onPromptDestWallet(destNetworkName)}
                        size="sm"
                        className="h-7 shrink-0 rounded-lg border-0 bg-amber-500/10 px-3 text-[12px] font-semibold text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
                      >
                        Connect
                      </Button>
                    </div>
                  </motion.div>
                ) : needsDestinationWallet && toChain ? (
                  <motion.div
                    key="destination-wallet-warning"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={expandTransition}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 rounded-xl border border-blue-200/60 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/[0.08]">
                      <AlertCircle className="size-4 shrink-0 text-blue-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-blue-700 dark:text-blue-400">
                          Connect{" "}
                          {getNetworkTypeLabel(
                            NETWORK_CONFIGS[toChain]?.type ?? null,
                          )}{" "}
                          wallet
                        </p>
                        <p className="mt-0.5 text-[12px] text-blue-600/70 dark:text-blue-400/70">
                          Required to receive USDC on{" "}
                          {NETWORK_CONFIGS[toChain]?.name}
                        </p>
                      </div>
                      <Button
                        onClick={() =>
                          onPromptDestWallet(NETWORK_CONFIGS[toChain]?.name)
                        }
                        size="sm"
                        className="h-7 shrink-0 rounded-lg border-0 bg-blue-500/10 px-3 text-[12px] font-semibold text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
                      >
                        Connect
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* ─── Fee Summary — inline rows ─── */}
            <div className="mt-4">
              <div className="flex items-center justify-between px-1 py-1.5">
                <span className="text-[13px] text-muted-foreground">
                  You&apos;ll receive
                </span>
                {isEstimating ? (
                  <Skeleton className="h-3.5 w-24" />
                ) : (
                  <span className="text-[13px] font-medium text-foreground">
                    {formatUSDC(Number(estimate?.receiveAmount ?? 0))} USDC
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between px-1 py-1.5">
                <span className="text-[13px] text-muted-foreground">Fee</span>
                {isEstimating ? (
                  <Skeleton className="h-3.5 w-20" />
                ) : transferMethod === "fast" &&
                  estimate?.providerFees &&
                  estimate.providerFees.length > 0 ? (
                  <span className="text-[13px] font-medium text-amber-600 dark:text-amber-400">
                    ~0.1% (
                    {formatUSDC(
                      estimate.providerFees.reduce(
                        (sum, fee) => sum + parseFloat(fee.amount),
                        0,
                      ),
                    )}{" "}
                    USDC)
                  </span>
                ) : (
                  <span className="text-[13px] font-medium text-green-600 dark:text-green-500">
                    Free · 0%
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between px-1 py-1.5">
                <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <Clock className="size-3.5" />
                  Est. time
                </span>
                {isEstimating ? (
                  <Skeleton className="h-3.5 w-16" />
                ) : (
                  <span className="text-[13px] font-medium text-foreground">
                    {fromChain
                      ? getAttestationTimeDisplay(
                          fromChain,
                          transferMethod === "fast",
                        )
                      : "~13 min"}
                  </span>
                )}
              </div>

              {/* Fee details toggle */}
              <div className="flex justify-center pt-1">
                <button
                  onClick={onToggleFeeDetails}
                  className="flex items-center gap-1 text-[12px] text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                >
                  <span>{showFeeDetails ? "Hide" : "View"} breakdown</span>
                  <ChevronRight
                    className={cn(
                      "size-3 transition-transform duration-200",
                      showFeeDetails && "rotate-90",
                    )}
                  />
                </button>
              </div>

              {/* Fee breakdown modal */}
              <WindowPortal>
                <AnimatePresence>
                  {showFeeDetails && fromChain && toChain && (
                    <>
                      <motion.div
                        key="fee-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0"
                        style={{ zIndex: 290 }}
                        onClick={onToggleFeeDetails}
                      />
                      <motion.div
                        key="fee-modal-panel"
                        initial={{ opacity: 0, scale: 0.97, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 8 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="fixed left-1/2 top-1/2 w-[360px] max-h-[72vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-white/[0.97] shadow-2xl backdrop-blur-2xl dark:bg-[#111111]/[0.97]"
                        style={{ zIndex: 291 }}
                      >
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                          <h3 className="text-[14px] font-semibold text-foreground">
                            Fee Breakdown
                          </h3>
                          <motion.button
                            onClick={onToggleFeeDetails}
                            whileTap={{ scale: 0.92 }}
                            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.07]"
                          >
                            <X className="size-3.5" />
                          </motion.button>
                        </div>
                        {/* Scrollable content */}
                        <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(72vh - 48px)" }}>
                          <FeeSummaryCard
                            estimate={estimate}
                            isEstimating={isEstimating}
                            fromChain={fromChain}
                            toChain={toChain}
                            amount={amount || "0.00"}
                            transferMethod={transferMethod}
                          />
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </WindowPortal>
            </div>

            {/* Error Display */}
            <AnimatePresence initial={false}>
              {bridgeError && (
                <motion.div
                  key="bridge-error"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={expandTransition}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-xl border border-red-200/60 bg-red-50 p-3 text-[13px] text-red-600 dark:border-red-500/20 dark:bg-red-500/[0.08] dark:text-red-400">
                    {bridgeError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bridge Button */}
            <div className="mt-5">
              <button
                onClick={onBridge}
                disabled={!canBridge}
                className={cn(
                  "flex h-[52px] w-full items-center justify-center rounded-[14px] text-[15px] font-semibold text-white transition-all",
                  "bg-[#0071e3] hover:brightness-90 active:brightness-75",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                {getBridgeButtonContent({
                  isBridging,
                  isInitialized,
                  fromChain,
                  toChain,
                  needsSourceWallet,
                  needsDestinationWallet,
                  needsWalletForMinting,
                  destNetworkName,
                  isValidAmount,
                })}
              </button>
            </div>

            {/* Footer */}
            <p className="mt-4 text-center text-[11px] font-medium tracking-wide text-muted-foreground/50">
              Powered by Circle CCTP
            </p>
          </div>
        </motion.div>

      </div>
    </>
  );
}
