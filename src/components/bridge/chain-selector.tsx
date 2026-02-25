"use client";

import { motion } from "motion/react";
import { ChevronDown, Check, Layers } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  NETWORK_CONFIGS,
  getNetworksByEnvironment,
  getAvailableToChains,
  useEnvironment,
  type SupportedChainId,
  type BridgeToChainId,
} from "~/lib/bridge";
import {
  NetworkEthereum,
  NetworkArbitrumOne,
  NetworkBase,
  NetworkSolana,
  NetworkMonad,
  NetworkHyperEvm,
  NetworkBaseSepolia,
  NetworkArbitrumSepolia,
  NetworkMonadTestnet,
} from "@web3icons/react";

interface ChainSelectorProps {
  /** For "To" selector can be Canton */
  selectedChain: BridgeToChainId | null;
  onSelectChain: (chain: BridgeToChainId) => void;
  label: string;
  excludeChainId?: SupportedChainId | null;
  /** When true, uses getAvailableToChains so Canton (USDCx) appears when from is Ethereum/Sepolia */
  isToSelector?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

function ChainIcon({
  chainId,
  size = 24,
}: {
  chainId: BridgeToChainId;
  size?: number;
}) {
  const props = { size, variant: "branded" as const };

  if (chainId === "Canton") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/20">
        <Layers className="size-[22px] text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  switch (chainId) {
    case "Ethereum":
    case "Ethereum_Sepolia":
      return <NetworkEthereum {...props} />;
    case "Base":
      return <NetworkBase {...props} />;
    case "Base_Sepolia":
      return <NetworkBaseSepolia {...props} />;
    case "Arbitrum":
      return <NetworkArbitrumOne {...props} />;
    case "Arbitrum_Sepolia":
      return <NetworkArbitrumSepolia {...props} />;
    case "Solana":
    case "Solana_Devnet":
      return <NetworkSolana {...props} />;
    case "Monad":
      return <NetworkMonad {...props} />;
    case "Monad_Testnet":
      return <NetworkMonadTestnet {...props} />;
    case "HyperEVM":
    case "HyperEVM_Testnet":
      return <NetworkHyperEvm {...props} />;
    default:
      return null;
  }
}

export function ChainSelector({
  selectedChain,
  onSelectChain,
  label,
  excludeChainId,
  isToSelector,
  containerRef,
}: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const environment = useEnvironment();

  const availableToChains = isToSelector
    ? getAvailableToChains(excludeChainId ?? null, environment)
    : null;

  const availableChains = availableToChains
    ? null
    : getNetworksByEnvironment(environment).filter(
        (chain) => chain.id !== excludeChainId,
      );

  const selected =
    selectedChain === "Canton"
      ? { id: "Canton" as const, displayName: "Canton (USDCx)" }
      : selectedChain
        ? NETWORK_CONFIGS[selectedChain] ?? null
        : null;

  const list =
    availableToChains ??
    (availableChains ?? []).map((c) => ({
      id: c.id,
      displayName: c.displayName,
      isXReserve: false,
    }));
  const listLength = list.length;

  const calculateMaxHeight = useCallback(() => {
    if (!dropdownRef.current || !containerRef?.current) {
      setMaxHeight(undefined);
      return;
    }

    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const availableSpace = containerRect.bottom - dropdownRect.top - 16;
    const estimatedContentHeight = listLength * 56 + 16;

    if (estimatedContentHeight > availableSpace && availableSpace > 100) {
      setMaxHeight(availableSpace);
    } else {
      setMaxHeight(undefined);
    }
  }, [containerRef, listLength]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        calculateMaxHeight();
      });
    }
  }, [isOpen, calculateMaxHeight]);

  const chainList = (
    <div className="space-y-0.5 p-1.5">
      {list.map((chain) => (
        <button
          key={chain.id}
          onClick={() => {
            onSelectChain(chain.id);
            setIsOpen(false);
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
            "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
            selectedChain === chain.id &&
              "bg-black/[0.03] dark:bg-white/[0.05]",
          )}
        >
          <div className="size-8 shrink-0 overflow-hidden rounded-full">
            <ChainIcon chainId={chain.id} size={32} />
          </div>
          <div className="flex-1 text-left">
            <div className="text-foreground text-[14px] font-medium">
              {chain.displayName}
            </div>
            <div className="text-muted-foreground text-[12px]">
              {chain.isXReserve ? "USDCx" : "USDC"}
            </div>
          </div>
          {selectedChain === chain.id && (
            <Check className="size-3.5 text-[#0071e3]" />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative">
      <label className="text-muted-foreground mb-1.5 block text-[11px] font-semibold uppercase tracking-wider">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full overflow-hidden rounded-xl transition-all",
          "bg-black/[0.03] dark:bg-white/[0.05]",
          "hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
          "focus:ring-0 focus:outline-none",
          isOpen && "bg-black/[0.05] dark:bg-white/[0.08]",
        )}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {selected ? (
            <>
              <div className="size-8 shrink-0 overflow-hidden rounded-full">
                <ChainIcon chainId={selected.id} size={32} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-foreground text-[15px] font-medium">
                  {selected.displayName}
                </div>
                <div className="text-muted-foreground text-[12px]">
                  {selectedChain === "Canton" ? "USDCx" : "USDC"}
                </div>
              </div>
            </>
          ) : (
            <span className="text-muted-foreground flex-1 text-left text-[15px]">
              Select network
            </span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="text-muted-foreground size-4" />
          </motion.div>
        </div>
      </button>

      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "border-border bg-white dark:bg-[#1c1c1e]",
              "absolute top-full right-0 left-0 z-50 mt-1.5 overflow-hidden rounded-2xl border shadow-2xl",
            )}
          >
            {maxHeight ? (
              <ScrollArea style={{ maxHeight }}>{chainList}</ScrollArea>
            ) : (
              chainList
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
