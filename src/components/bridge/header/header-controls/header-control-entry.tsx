"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wallet, ChevronDown, LogOut, User } from "lucide-react";
import { cn } from "~/lib/utils";
import type { BridgeHeaderViewProps } from "../bridge-header.types";
import type { HeaderControlItem } from "./header-controls.types";

interface HeaderControlEntryProps {
  control: HeaderControlItem;
  viewProps: BridgeHeaderViewProps;
}

export function HeaderControlEntry({
  control,
  viewProps,
}: HeaderControlEntryProps) {
  if (control.visible && !control.visible(viewProps)) {
    return null;
  }

  const getVisibilityClasses = () => {
    switch (control.visibleBreakpoint) {
      case "mobile":
        return "lg:hidden";
      case "desktop":
        return "hidden lg:block";
      default:
        return "";
    }
  };

  const visibilityClasses = getVisibilityClasses();

  if (control.type === "divider") {
    return (
      <div
        className={cn(
          "bg-border/30 hidden h-4 w-px sm:block",
          visibilityClasses,
        )}
      />
    );
  }

  if (control.type === "component" && control.component) {
    const Component = control.component as React.ComponentType<{
      isDragging?: boolean;
    }>;
    return (
      <div className={visibilityClasses}>
        <Component isDragging={viewProps.isDraggingControls} />
      </div>
    );
  }

  if (control.type === "icon-button" && control.icon) {
    const Icon = control.icon;
    const badge =
      typeof control.badge === "function"
        ? control.badge(viewProps)
        : control.badge;

    return (
      <motion.button
        onClick={() => {
          if (!viewProps.isDraggingControls) {
            control.onClick?.(viewProps);
          }
        }}
        whileTap={{ scale: 0.94 }}
        className={cn(
          "text-foreground relative flex size-8 items-center justify-center rounded-lg transition-colors",
          "hover:bg-black/[0.05] dark:hover:bg-white/[0.07] focus:ring-0 focus:outline-none",
          visibilityClasses,
        )}
        aria-label={control.ariaLabel}
      >
        <Icon className={cn("size-[18px]", control.iconClassName)} />
        {badge && (
          <kbd className="bg-muted/80 text-muted-foreground absolute -bottom-0.5 left-1/2 hidden -translate-x-1/2 rounded px-1 text-[8px] leading-tight font-medium sm:block">
            {badge}
          </kbd>
        )}
      </motion.button>
    );
  }

  if (control.type === "wallet") {
    return <WalletButton viewProps={viewProps} />;
  }

  return null;
}

/**
 * Wallet button with simple click-to-toggle menu (avoids Radix onPointerDown issues)
 */
function WalletButton({ viewProps }: { viewProps: BridgeHeaderViewProps }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const {
    isConnected,
    walletAddress,
    onConnectWallet,
    onManageWallets,
    onLogout,
    isDraggingControls,
  } = viewProps;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close menu when dragging starts
  useEffect(() => {
    if (isDraggingControls && isOpen) {
      setIsOpen(false);
    }
  }, [isDraggingControls, isOpen]);

  const handleClick = () => {
    if (!isDraggingControls) {
      setIsOpen((prev) => !prev);
    }
  };

  if (isConnected) {
    return (
      <div className="relative">
        <motion.button
          ref={buttonRef}
          onClick={handleClick}
          whileTap={{ scale: 0.96 }}
          className={cn(
            "text-foreground flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 transition-colors",
            "hover:bg-black/[0.05] dark:hover:bg-white/[0.07] focus:ring-0 focus:outline-none",
          )}
        >
          <div className="size-1.5 rounded-full bg-green-500" />
          <span className="text-[13px] font-medium">
            {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
          </span>
          <ChevronDown className="size-3 opacity-60" />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="border-border bg-card absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border p-1 shadow-xl backdrop-blur-2xl"
            >
              <button
                onClick={() => {
                  onManageWallets();
                  setIsOpen(false);
                }}
                className="text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-[13px]"
              >
                <User className="mr-2.5 size-3.5 opacity-70" />
                Manage Wallets
              </button>
              <div className="bg-border my-1 h-px" />
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-[13px] text-red-600 hover:bg-red-500/[0.06] dark:text-red-400"
              >
                <LogOut className="mr-2.5 size-3.5" />
                Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.button
      onClick={() => {
        if (!isDraggingControls) {
          onConnectWallet();
        }
      }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#0071e3] px-3.5 text-white transition-all",
        "hover:brightness-90 focus:ring-0 focus:outline-none",
      )}
    >
      <Wallet className="size-3.5" />
      <span className="text-[13px] font-semibold">Connect</span>
    </motion.button>
  );
}
