"use client";

import { motion } from "motion/react";
import { Zap, Clock } from "lucide-react";
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
    icon: Clock,
    description: "~15 min",
    feeLabel: "0% fee",
  },
  {
    id: "fast" as const,
    label: "Fast",
    icon: Zap,
    description: "~1 min",
    feeLabel: "~0.1% fee",
  },
];

export function TransferMethodToggle({
  value,
  onChange,
}: TransferMethodToggleProps) {
  return (
    <div className="bg-muted/30 flex items-center gap-1 rounded-xl p-1 backdrop-blur-xl">
      {methods.map((method) => {
        const isSelected = value === method.id;
        const Icon = method.icon;

        return (
          <motion.button
            key={method.id}
            onClick={() => onChange(method.id)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              isSelected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80",
            )}
            whileTap={{ scale: 0.98 }}
          >
            {isSelected && (
              <motion.div
                layoutId="transfer-method-bg"
                className="bg-card border-border/50 absolute inset-0 rounded-lg border shadow-sm"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon
                className={cn(
                  "size-3.5",
                  isSelected && method.id === "fast" && "text-amber-500",
                )}
              />
              <span>{method.label}</span>
              <span
                className={cn(
                  "hidden text-[10px] sm:inline",
                  isSelected
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60",
                )}
              >
                ({method.feeLabel})
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
