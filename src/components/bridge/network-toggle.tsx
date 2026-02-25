"use client";

import { useEnvironment, useSetEnvironment } from "~/lib/bridge";
import { cn } from "~/lib/utils";

export function NetworkToggle() {
  const environment = useEnvironment();
  const setEnvironment = useSetEnvironment();

  const isMainnet = environment === "mainnet";

  return (
    <button
      onClick={() => setEnvironment(isMainnet ? "testnet" : "mainnet")}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all select-none",
        "focus:ring-0 focus:outline-none",
        isMainnet
          ? "bg-green-500/10 text-green-700 hover:bg-green-500/15 dark:text-green-400"
          : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-400",
      )}
      aria-label={`Switch to ${isMainnet ? "testnet" : "mainnet"}`}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isMainnet ? "bg-green-500" : "bg-amber-500",
        )}
      />
      {isMainnet ? "Mainnet" : "Testnet"}
    </button>
  );
}
