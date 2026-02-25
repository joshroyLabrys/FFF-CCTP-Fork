"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  X,
  Zap,
} from "lucide-react";
import {
  parseStepError,
  getExplorerTxUrl,
  getExplorerAddressUrl,
  getTransactionDisplayAddress,
  formatAddressShort,
} from "~/lib/bridge";
import {
  CANTON_CLAIM_DOCS_URL,
  CANTON_CLAIM_UI_URL,
  XRESERVE_ATTESTATION_DISPLAY,
} from "~/lib/xreserve/config";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";
import { StepIcon } from "./components/step-icon";
import { formatTime } from "./transaction-windows.hooks";
import type { TransactionWindowViewProps } from "./transaction-windows.types";

export function TransactionWindowView({
  windowRef,
  transaction,
  position,
  currentPosition,
  zIndex,
  isMinimized,
  isMaximized,
  copiedHash,
  isRetrying,
  isCompleted,
  isFailed,
  isInProgress,
  isCancelled,
  isConfirmingXReserve,
  onCheckXReserveStatus,
  isCheckingXReserve,
  fromNetworkDisplayName,
  toNetworkDisplayName,
  onDragStart,
  onDragEnd,
  onClose,
  onFocus,
  onMinimize,
  onMaximize,
  onCopyToClipboard,
  onRetryStep,
  onDismiss,
  dragControls,
}: TransactionWindowViewProps) {
  return (
    <motion.div
      ref={windowRef}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragElastic={0}
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      initial={{
        opacity: 0,
        scale: 0.95,
        x: position.x,
        y: position.y,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        x: currentPosition.x,
        y: currentPosition.y,
      }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 300,
      }}
      className="fixed top-0 left-0"
      style={{
        touchAction: "none",
        zIndex: zIndex,
      }}
      onPointerDown={onFocus}
    >
      <div
        className={cn(
          "border-border/50 overflow-hidden rounded-[20px] border shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300",
          "bg-card/95",
          isMaximized ? "w-[650px]" : "w-[540px]",
        )}
      >
        {/* macOS-style title bar */}
        <div
          className="group border-border/30 bg-muted/40 flex cursor-grab items-center justify-between border-b px-3 py-2.5 active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
          onDoubleClick={onMaximize}
        >
          {/* Traffic light buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="group/btn relative size-3 rounded-full bg-red-500 transition-all hover:bg-red-600"
              aria-label="Close window"
            >
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-red-900 opacity-0 transition-opacity group-hover/btn:opacity-100">
                ×
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
              className="group/btn relative size-3 rounded-full bg-yellow-500 transition-all hover:bg-yellow-600"
              aria-label="Minimize window"
            >
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-yellow-900 opacity-0 transition-opacity group-hover/btn:opacity-100">
                −
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onMaximize();
              }}
              className="group/btn relative size-3 rounded-full bg-green-500 transition-all hover:bg-green-600"
              aria-label={isMaximized ? "Restore window" : "Maximize window"}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-green-900 opacity-0 transition-opacity group-hover/btn:opacity-100">
                {isMaximized ? "−" : "+"}
              </span>
            </motion.button>
          </div>

          {/* Window title with transfer method badge */}
          <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium">
              Bridge Progress - {transaction.amount} USDC
            </span>
            {transaction.transferMethod === "fast" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                <Zap className="size-3" />
                Fast
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500">
                Standard
              </span>
            )}
          </div>

          {/* Spacer for centering */}
          <div className="w-[52px]" />
        </div>

        {/* Window content */}
        <motion.div
          animate={{
            height: isMinimized ? 0 : "auto",
            opacity: isMinimized ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <ScrollArea className="macos-window-scrollbar max-h-[70vh]">
            <div className="space-y-3 p-5">
              {/* Transaction header */}
              <div className="space-y-2">
                {/* Amount and route */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                      <div className="bg-muted/50 flex items-center gap-1 rounded-full px-2 py-0.5">
                        <span className="text-foreground text-xs font-semibold">
                          {fromNetworkDisplayName}
                        </span>
                      </div>
                      <ArrowRight className="size-3" />
                      <div className="bg-muted/50 flex items-center gap-1 rounded-full px-2 py-0.5">
                        <span className="text-foreground text-xs font-semibold">
                          {toNetworkDisplayName}
                        </span>
                      </div>
                    </div>
                    {/* Amount, fee, and addresses on same line */}
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <h3 className="text-foreground text-2xl font-bold tracking-tight">
                        {transaction.amount}
                      </h3>
                      <span className="text-muted-foreground text-sm font-semibold">
                        USDC
                      </span>
                      {transaction.transferMethod === "fast" &&
                        transaction.providerFeeUsdc &&
                        parseFloat(transaction.providerFeeUsdc) > 0 && (
                          <span className="text-muted-foreground text-[10px]">
                            (fee:{" "}
                            <span className="text-amber-500">
                              {parseFloat(transaction.providerFeeUsdc).toFixed(
                                6,
                              )}
                            </span>
                            )
                          </span>
                        )}
                      <span className="text-muted-foreground mx-1 text-[10px]">
                        |
                      </span>
                      <div className="text-muted-foreground flex items-center gap-1 text-[10px]">
                        <a
                          href={getExplorerAddressUrl(
                            transaction.fromChain,
                            transaction.sourceAddress ??
                              transaction.userAddress,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary font-mono transition-colors"
                        >
                          {formatAddressShort(
                            transaction.sourceAddress ??
                              transaction.userAddress,
                          )}
                        </a>
                        <ArrowRight className="size-2.5" />
                        {transaction.toChain === "Canton" ? (
                          <span className="font-mono">
                            {formatAddressShort(
                              getTransactionDisplayAddress(transaction),
                            )}
                          </span>
                        ) : (
                          <a
                            href={getExplorerAddressUrl(
                              transaction.toChain,
                              getTransactionDisplayAddress(transaction),
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary font-mono transition-colors"
                          >
                            {formatAddressShort(
                              getTransactionDisplayAddress(transaction),
                            )}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  {transaction.estimatedTime && (isInProgress || isConfirmingXReserve) && (
                    <div className="bg-muted/50 flex items-center gap-1 rounded-full px-2 py-1">
                      <Clock className="text-muted-foreground size-3" />
                      <span className="text-muted-foreground text-[10px] font-semibold">
                        ~{formatTime(transaction.estimatedTime)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Overall status */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "relative overflow-hidden rounded-xl border p-3",
                    isCompleted && "border-green-500/30 bg-green-500/10",
                    isFailed && "border-red-500/30 bg-red-500/10",
                    isInProgress && "border-border/50 bg-muted/30",
                    isConfirmingXReserve && "border-border/50 bg-muted/30",
                    isCancelled && "border-gray-500/30 bg-gray-500/10",
                  )}
                >
                  <div className="relative z-10 flex items-center gap-2.5">
                    {isCompleted && (
                      <>
                        <div className="flex size-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                          <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                            Transfer Completed!
                          </p>
                          <p className="text-[10px] text-green-600/80 dark:text-green-400/80">
                            {transaction.toChain === "Canton"
                              ? "Deposit confirmed. Claim USDCx on Canton."
                              : "Your funds have arrived successfully"}
                          </p>
                        </div>
                      </>
                    )}
                    {isFailed && (
                      <>
                        <div className="flex size-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                          <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                            Transfer Failed
                          </p>
                          <p className="text-[10px] text-red-600/80 dark:text-red-400/80">
                            Click retry below to try again
                          </p>
                        </div>
                      </>
                    )}
                    {isInProgress && !isConfirmingXReserve && (
                      <>
                        <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700/50">
                          <Loader2 className="size-5 animate-spin text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Transfer In Progress
                          </p>
                          <p className="text-[10px] text-gray-600/80 dark:text-gray-400/80">
                            Please wait while we process your transfer
                          </p>
                        </div>
                        <ConfirmDismissButton onDismiss={onDismiss} />
                      </>
                    )}
                    {isConfirmingXReserve && (
                      <>
                        <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
                          <Clock className="size-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                            Waiting for attestation
                          </p>
                          <p className="text-[10px] text-amber-700/90 dark:text-amber-300/90">
                            Deposit confirmed. Attestation usually takes{" "}
                            {XRESERVE_ATTESTATION_DISPLAY}. You can close and
                            return — use Check status when ready.
                          </p>
                          {transaction.estimatedTime && (
                            <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                              Est. wait ~{formatTime(transaction.estimatedTime)}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onCheckXReserveStatus}
                          disabled={isCheckingXReserve}
                          className="shrink-0 border-amber-500/50 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300 dark:hover:bg-amber-500/20"
                        >
                          {isCheckingXReserve ? (
                            <>
                              <Loader2 className="size-3.5 animate-spin" />
                              Checking...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="size-3.5" />
                              Check status
                            </>
                          )}
                        </Button>
                      </>
                    )}
                    {isCancelled && (
                      <>
                        <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700/50">
                          <X className="size-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Transfer Cancelled
                          </p>
                          <p className="text-[10px] text-gray-600/80 dark:text-gray-400/80">
                            This transfer was dismissed by user
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Claim on Canton (xReserve) — in-app retrieval */}
              {isCompleted && transaction.toChain === "Canton" && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-3">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Claim your USDCx
                  </p>
                  <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90">
                    Use the form below to claim the minted USDCx with your Canton
                    wallet. If the form does not load, open it in a new tab.
                  </p>
                  <div className="rounded-lg overflow-hidden border border-emerald-500/20 bg-black/20 min-h-[280px]">
                    <iframe
                      title="Claim USDCx on Canton"
                      src={CANTON_CLAIM_UI_URL}
                      className="w-full h-[280px] border-0"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={
                        transaction.sourceTxHash
                          ? `${CANTON_CLAIM_UI_URL}?depositTx=${encodeURIComponent(transaction.sourceTxHash)}`
                          : CANTON_CLAIM_UI_URL
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      <ExternalLink className="size-3.5" />
                      Open claim page in new tab
                    </a>
                    <span className="text-emerald-600/60 dark:text-emerald-400/60 text-[11px]">
                      |
                    </span>
                    <a
                      href={CANTON_CLAIM_DOCS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600/80 hover:text-emerald-700 dark:text-emerald-400/80 dark:hover:text-emerald-300"
                    >
                      Canton xReserve docs
                    </a>
                  </div>
                </div>
              )}

              {/* Steps */}
              <div className="space-y-2">
                <h4 className="text-muted-foreground px-1 text-[10px] font-semibold tracking-wider uppercase">
                  Transaction Steps
                </h4>
                <div className="relative space-y-2">
                  {transaction.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "group relative overflow-hidden rounded-lg border backdrop-blur-sm transition-all duration-300",
                        step.status === "completed" &&
                          "border-green-500/30 bg-green-500/10",
                        step.status === "failed" &&
                          "border-red-500/30 bg-red-500/10",
                        step.status === "in_progress" &&
                          "border-border/50 bg-muted/30 ring-border/50 shadow-lg ring-2",
                        step.status === "pending" &&
                          "border-border/30 bg-muted/20",
                      )}
                    >
                      <div className="flex items-start gap-3 p-3">
                        <StepIcon step={step} />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-foreground text-sm font-semibold">
                              {step.name}
                            </p>
                            {step.status === "failed" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={onRetryStep}
                                disabled={isRetrying}
                                className="h-6 gap-1 rounded-full bg-red-100 px-2 text-[10px] font-semibold text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
                              >
                                {isRetrying ? (
                                  <>
                                    <Loader2 className="size-3 animate-spin" />
                                    Retrying...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="size-3" />
                                    Retry
                                  </>
                                )}
                              </Button>
                            )}
                          </div>

                          {step.id === "attestation" &&
                            step.status === "in_progress" && (
                              <p className="text-muted-foreground text-[10px]">
                                Waiting for Circle&apos;s attestation service
                                (may take a few minutes)
                              </p>
                            )}

                          {step.error && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/20 px-2 py-1.5">
                              <p className="text-[10px] font-medium text-red-600 dark:text-red-400">
                                {parseStepError(step.name, step.error)}
                              </p>
                            </div>
                          )}

                          {step.txHash && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => onCopyToClipboard(step.txHash!)}
                                className="group/copy bg-muted/50 text-foreground hover:bg-muted/80 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all"
                              >
                                {copiedHash === step.txHash ? (
                                  <>
                                    <Check className="size-3 text-green-500" />
                                    <span className="text-green-500">
                                      Copied!
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="size-3" />
                                    <span className="font-mono">
                                      {step.txHash.slice(0, 6)}...
                                      {step.txHash.slice(-4)}
                                    </span>
                                  </>
                                )}
                              </button>
                              <a
                                href={getExplorerTxUrl(
                                  step.id === "mint"
                                    ? transaction.toChain
                                    : transaction.fromChain,
                                  step.txHash,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-muted/50 text-foreground hover:bg-muted/80 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all"
                              >
                                <ExternalLink className="size-3" />
                                Explorer
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      </div>
    </motion.div>
  );
}

const DISMISS_ARM_TIMEOUT_MS = 3000;

function ConfirmDismissButton({ onDismiss }: { onDismiss: () => void }) {
  const [isArmed, setIsArmed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const handleClick = useCallback(() => {
    if (isArmed) {
      clearTimer();
      onDismiss();
      return;
    }
    setIsArmed(true);
    timerRef.current = setTimeout(
      () => setIsArmed(false),
      DISMISS_ARM_TIMEOUT_MS,
    );
  }, [isArmed, onDismiss, clearTimer]);

  return (
    <motion.button
      layout
      onClick={handleClick}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "flex h-7 items-center gap-1 rounded-full px-2.5 text-[10px] font-semibold transition-colors hover:cursor-pointer",
        isArmed
          ? "bg-red-500/10 text-red-500"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700",
      )}
    >
      <X className="size-3" />
      <AnimatePresence mode="wait" initial={false}>
        {isArmed ? (
          <motion.span
            key="confirm"
            className="whitespace-nowrap"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.15 }}
          >
            Click again to dismiss
          </motion.span>
        ) : (
          <motion.span
            key="dismiss"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.15 }}
          >
            Dismiss
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
