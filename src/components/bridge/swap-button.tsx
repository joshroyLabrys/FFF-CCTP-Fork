"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { cn } from "~/lib/utils";

interface SwapButtonProps {
  onSwap: () => void;
}

export function SwapButton({ onSwap }: SwapButtonProps) {
  const [rotation, setRotation] = useState(0);

  const handleClick = () => {
    setRotation((prev) => prev + 180);
    onSwap();
  };

  return (
    <div className="relative flex justify-center">
      <motion.button
        onClick={handleClick}
        className={cn(
          "relative z-10 flex size-9 items-center justify-center rounded-full transition-colors",
          "bg-black/[0.04] dark:bg-white/[0.07]",
          "hover:bg-black/[0.07] dark:hover:bg-white/[0.11]",
          "focus:ring-0 focus:outline-none",
        )}
        whileTap={{ scale: 0.92 }}
        animate={{ rotate: rotation }}
        transition={{
          type: "tween",
          duration: 0.25,
          ease: "easeInOut",
        }}
        aria-label="Swap source and destination chains"
      >
        <ArrowDown className="text-muted-foreground size-4" />
      </motion.button>
    </div>
  );
}
