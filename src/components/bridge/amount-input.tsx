"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "~/lib/utils";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  balance?: string;
  label: string;
}

function formatWithCommas(raw: string): string {
  if (!raw || raw === "") return "";
  const num = parseFloat(raw);
  if (isNaN(num)) return raw;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(num);
}

function formatBalance(balance: string): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return balance;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function AmountInput({
  value,
  onChange,
  balance = "0.00",
  label,
}: AmountInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const displayValue = isFocused
    ? value
    : value
      ? formatWithCommas(value)
      : "";

  const hasValue = value && parseFloat(value) > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip commas when user types (in case they paste a formatted number)
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      onChange(raw);
    }
  };

  const handleFocus = () => setIsFocused(true);

  const handleBlur = () => {
    setIsFocused(false);
    // Normalize to 2 decimal places on blur for USDC
    if (value && !isNaN(parseFloat(value))) {
      const normalized = parseFloat(value).toFixed(2);
      // Only update if it meaningfully changes (avoid "0.00" replacing "")
      if (parseFloat(normalized) > 0) {
        onChange(normalized);
      } else {
        onChange("");
      }
    }
  };

  const handleMaxClick = () => {
    onChange(balance);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        <button
          onClick={handleMaxClick}
          className="flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          tabIndex={-1}
        >
          Balance:{" "}
          <span className="font-medium">{formatBalance(balance)} USDC</span>
        </button>
      </div>

      <div
        className={cn(
          "rounded-xl bg-black/[0.03] dark:bg-white/[0.05] transition-all duration-150",
          isFocused
            ? "ring-1 ring-[#0071e3]/40"
            : "ring-0",
        )}
      >
        {/* Main input row */}
        <div className="flex items-center gap-1.5 px-4 pb-2.5 pt-3">
          {/* Dollar prefix — always visible */}
          <span
            className={cn(
              "shrink-0 text-[32px] font-semibold tracking-tight transition-colors duration-150 select-none",
              hasValue || isFocused
                ? "text-foreground"
                : "text-muted-foreground/30",
            )}
          >
            $
          </span>

          <input
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="0"
            className={cn(
              "flex-1 bg-transparent text-[32px] font-semibold tracking-tight outline-none",
              "placeholder:text-muted-foreground/20",
              hasValue || isFocused ? "text-foreground" : "text-muted-foreground/30",
            )}
          />

          <button
            onClick={handleMaxClick}
            tabIndex={-1}
            className="shrink-0 text-[12px] font-semibold text-[#0071e3] transition-opacity hover:opacity-70"
          >
            MAX
          </button>
        </div>

        {/* USD subtext row — animates in when there's a value */}
        <AnimatePresence initial={false}>
          {hasValue && (
            <motion.div
              key="usd-row"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="border-t border-black/[0.04] px-4 py-2 dark:border-white/[0.04]">
                <span className="text-[12px] text-muted-foreground">
                  ≈ {formatWithCommas(value)} USDC
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
