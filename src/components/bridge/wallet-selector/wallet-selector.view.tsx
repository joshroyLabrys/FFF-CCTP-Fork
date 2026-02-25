"use client";

import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown, Wallet } from "lucide-react";
import { cn } from "~/lib/utils";
import { formatAddress, getWalletName } from "./wallet-selector.utils";
import type { WalletSelectorViewProps } from "./wallet-selector.types";

export function WalletSelectorView({
  label,
  placeholder,
  isOpen,
  setIsOpen,
  dropdownRef,
  compatibleWallets,
  selectedWallet,
  selectedWalletId,
  onSelectWallet,
  networkType,
}: WalletSelectorViewProps) {
  if (compatibleWallets.length === 0) {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
        )}
        <div className="flex items-center gap-2 rounded-xl bg-black/[0.03] px-4 py-3 text-[13px] text-muted-foreground dark:bg-white/[0.05]">
          <Wallet className="size-4 opacity-50" />
          <span>No compatible {networkType?.toUpperCase()} wallets connected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors",
          "bg-black/[0.03] dark:bg-white/[0.05]",
          "hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
          "focus:ring-0 focus:outline-none",
          isOpen && "bg-black/[0.05] dark:bg-white/[0.08]",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-black/[0.05] dark:bg-white/[0.08]">
            <Wallet className="size-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            {selectedWallet ? (
              <>
                <span className="text-[14px] font-medium text-foreground">
                  {getWalletName(selectedWallet)}
                </span>
                <span className="text-[12px] text-muted-foreground">
                  {formatAddress(selectedWallet.address)}
                </span>
              </>
            ) : (
              <span className="text-[14px] text-muted-foreground">
                {placeholder ?? "Select wallet"}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="border-border bg-white dark:bg-[#1c1c1e] absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl border shadow-2xl"
          >
            <div className="max-h-60 overflow-y-auto p-1.5">
              {compatibleWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => {
                    onSelectWallet(wallet.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                    wallet.id === selectedWalletId &&
                      "bg-black/[0.03] dark:bg-white/[0.05]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-black/[0.05] dark:bg-white/[0.08]">
                      <Wallet className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-foreground">
                        {getWalletName(wallet)}
                      </span>
                      <span className="text-[12px] text-muted-foreground">
                        {formatAddress(wallet.address)}
                      </span>
                    </div>
                  </div>
                  {wallet.id === selectedWalletId && (
                    <Check className="size-3.5 text-[#0071e3]" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
