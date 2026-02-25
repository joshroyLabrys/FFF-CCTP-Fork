"use client";

import { motion } from "motion/react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "~/lib/utils";
import type { DestinationAddressInputViewProps } from "./destination-address-input.types";

export function DestinationAddressInputView({
  value,
  onChange,
  validationError,
  isValid,
  formatDescription,
}: DestinationAddressInputViewProps) {
  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 transition-all",
          "bg-black/[0.03] dark:bg-white/[0.05]",
          "focus-within:ring-1 focus-within:ring-[#0071e3]/30",
          validationError && value
            ? "ring-1 ring-red-500/20"
            : isValid && value
              ? "ring-1 ring-green-500/20"
              : "",
        )}
      >
        <input
          id="destination-address"
          type="text"
          placeholder={`Enter ${formatDescription}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "flex-1 bg-transparent font-mono text-[13px] outline-none",
            "placeholder:text-muted-foreground/40",
            validationError && value
              ? "text-red-500"
              : isValid && value
                ? "text-green-600 dark:text-green-500"
                : "text-foreground",
          )}
        />

        {value && (
          <div className="shrink-0">
            {isValid ? (
              <CheckCircle2 className="size-4 text-green-500" />
            ) : (
              <AlertCircle className="size-4 text-red-500" />
            )}
          </div>
        )}
      </div>

      {value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-1.5 text-[12px]">
            {validationError ? (
              <>
                <AlertCircle className="mt-0.5 size-3 shrink-0 text-red-500" />
                <span className="text-red-500">{validationError}</span>
              </>
            ) : isValid ? (
              <>
                <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-green-500" />
                <span className="text-green-600 dark:text-green-500">
                  Valid {formatDescription}
                </span>
              </>
            ) : null}
          </div>
        </motion.div>
      )}
    </div>
  );
}
