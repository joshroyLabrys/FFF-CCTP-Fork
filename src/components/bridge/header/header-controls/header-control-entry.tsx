"use client";

import { Wallet, ChevronDown, LogOut, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
  // Check visibility condition
  if (control.visible && !control.visible(viewProps)) {
    return null;
  }

  // Get responsive visibility classes
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

  // Render divider
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

  // Render component
  if (control.type === "component" && control.component) {
    const Component = control.component;
    return (
      <div className={visibilityClasses}>
        <Component />
      </div>
    );
  }

  // Render icon button
  if (control.type === "icon-button" && control.icon) {
    const Icon = control.icon;
    const badge =
      typeof control.badge === "function"
        ? control.badge(viewProps)
        : control.badge;

    return (
      <Button
        onClick={() => control.onClick?.(viewProps)}
        variant="ghost"
        className={cn(
          "text-foreground relative h-7 w-7 rounded-md p-0 transition-colors",
          "hover:bg-muted/50 focus:ring-0 focus:outline-none",
          "flex items-center justify-center",
          visibilityClasses,
        )}
        aria-label={control.ariaLabel}
      >
        <Icon className="size-4" />
        {badge && (
          <kbd className="bg-muted/80 text-muted-foreground absolute -bottom-0.5 left-1/2 hidden -translate-x-1/2 rounded px-1 text-[8px] leading-tight font-medium sm:block">
            {badge}
          </kbd>
        )}
      </Button>
    );
  }

  // Render wallet button
  if (control.type === "wallet") {
    const {
      isConnected,
      walletAddress,
      onConnectWallet,
      onManageWallets,
      onLogout,
    } = viewProps;

    if (isConnected) {
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "text-foreground h-7 w-[90px] rounded-md px-1.5 transition-colors sm:h-8 sm:min-w-[100px] sm:px-2.5",
                "hover:bg-muted/50 focus:ring-0 focus:outline-none",
                "flex items-center justify-center gap-1 sm:gap-1.5",
              )}
            >
              <div className="size-1.5 rounded-full bg-green-500" />
              <span className="text-[11px] font-medium sm:text-xs">
                {walletAddress?.slice(0, 4)}...
                {walletAddress?.slice(-3)}
              </span>
              <ChevronDown className="size-2.5 sm:size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-border/50 bg-card/95 w-48 backdrop-blur-xl"
          >
            <DropdownMenuItem
              onClick={onManageWallets}
              className="text-foreground hover:bg-muted/50 focus:bg-muted/50 cursor-pointer"
            >
              <User className="mr-2 size-3.5" />
              <span className="text-sm">Manage Wallets</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/30" />
            <DropdownMenuItem
              onClick={onLogout}
              className="hover:bg-muted/50 focus:bg-muted/50 cursor-pointer text-red-600 hover:text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:text-red-400 dark:focus:text-red-400"
            >
              <LogOut className="mr-2 size-3.5" />
              <span className="text-sm">Disconnect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button
        onClick={onConnectWallet}
        variant="ghost"
        className={cn(
          "text-foreground h-7 w-[90px] rounded-md px-1.5 transition-colors sm:h-8 sm:min-w-[100px] sm:px-2.5",
          "hover:bg-muted/50 focus:ring-0 focus:outline-none",
          "flex items-center justify-center gap-1 sm:gap-1.5",
        )}
      >
        <Wallet className="size-3 sm:size-3.5" />
        <span className="text-[11px] font-medium sm:text-xs">Connect</span>
      </Button>
    );
  }

  return null;
}
