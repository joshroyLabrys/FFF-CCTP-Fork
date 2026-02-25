"use client";

import { motion } from "motion/react";
import { cn } from "~/lib/utils";
import type { TransferMethod } from "~/lib/bridge";

interface TransferMethodToggleProps {
  value: TransferMethod;
  onChange: (method: TransferMethod) => void;
}

const methods = [
  {
    id: "standard" as const,
    label: "Standard",
    description: "~15 min · Free",
  },
  {
    id: "fast" as const,
    label: "Fast",
    description: "~1 min · 0.1%",
    dot: true,
  },
];

export function TransferMethodToggle({
  value,
  onChange,
}: TransferMethodToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-black/[0.04] p-1 dark:bg-white/[0.05]">
      {methods.map((method) => {
        const isSelected = value === method.id;

        return (
          <motion.button
            key={method.id}
            onClick={() => onChange(method.id)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[13px] font-medium transition-colors select-none",
              isSelected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70",
            )}
            whileTap={{ scale: 0.97 }}
          >
            {isSelected && (
              <motion.div
                layoutId="transfer-method-bg"
                className="absolute inset-0 rounded-[10px] bg-white shadow-sm dark:bg-white/[0.12]"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {method.dot && (
                <span
                  className={cn(
                    "size-1.5 rounded-full transition-colors",
                    isSelected ? "bg-amber-600 dark:bg-amber-400" : "bg-amber-500/60 dark:bg-amber-400/50",
                  )}
                />
              )}
              <span>{method.label}</span>
              <span
                className={cn(
                  "text-[11px] transition-colors",
                  isSelected
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50",
                )}
              >
                {method.description}
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
