"use client";

import { motion, AnimatePresence } from "motion/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import type { BridgeHeaderViewProps } from "../bridge-header.types";
import type { NavMenuItem } from "./nav-menu.types";
import { NavDropdownItem } from "./nav-dropdown-item";

interface NavMenuEntryProps {
  menu: NavMenuItem;
  viewProps: BridgeHeaderViewProps;
}

export function NavMenuEntry({ menu, viewProps }: NavMenuEntryProps) {
  const isVisible = !menu.visible || menu.visible(viewProps);

  const buttonClassName = cn(
    "text-foreground h-7 rounded-md px-2 text-xs font-medium transition-colors",
    "hover:bg-muted/50 focus:ring-0 focus:outline-none",
  );

  const content =
    menu.type === "button" ? (
      <Button
        variant="ghost"
        onClick={() => menu.onClick?.(viewProps)}
        className={buttonClassName}
      >
        {menu.label}
      </Button>
    ) : (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={buttonClassName}>
            {menu.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="border-border/50 bg-card/95 w-56 backdrop-blur-xl"
        >
          {menu.items?.map((item) => (
            <NavDropdownItem key={item.id} item={item} viewProps={viewProps} />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );

  // Wrap with animation if menu has custom animation (e.g., Faucet)
  if (menu.animation) {
    return (
      <AnimatePresence mode="popLayout">
        {isVisible && (
          <motion.div
            layout
            initial={menu.animation.initial}
            animate={menu.animation.animate}
            exit={menu.animation.exit}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Skip rendering if not visible (for non-animated conditional menus)
  if (!isVisible) return null;

  return (
    <motion.div layout transition={{ duration: 0.2, ease: "easeInOut" }}>
      {content}
    </motion.div>
  );
}
