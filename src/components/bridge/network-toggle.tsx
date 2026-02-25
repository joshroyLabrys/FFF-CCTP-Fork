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
          ? "bg-emerald-500/12 text-emerald-800 hover:bg-emerald-500/15 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-800 hover:bg-amber-500/15 dark:text-amber-400",
      )}
      aria-label={`Switch to ${isMainnet ? "testnet" : "mainnet"}`}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isMainnet ? "bg-emerald-600 dark:bg-emerald-400" : "bg-amber-600 dark:bg-amber-400",
        )}
      />
      {isMainnet ? "Mainnet" : "Testnet"}
    </button>
  );
}
