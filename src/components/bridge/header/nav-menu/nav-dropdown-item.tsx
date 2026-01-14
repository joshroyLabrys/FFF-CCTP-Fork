"use client";

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import type { BridgeHeaderViewProps } from "../bridge-header.types";
import type { MenuDropdownItem } from "./nav-menu.types";

interface NavDropdownItemProps {
  item: MenuDropdownItem;
  viewProps: BridgeHeaderViewProps;
}

export function NavDropdownItem({ item, viewProps }: NavDropdownItemProps) {
  const label =
    typeof item.label === "function" ? item.label(viewProps) : item.label;

  const handleClick = item.href
    ? () => window.open(item.href, "_blank", "noopener,noreferrer")
    : item.onClick
      ? () => item.onClick!(viewProps)
      : undefined;

  const Icon = item.icon;

  return (
    <>
      {item.separatorBefore && (
        <DropdownMenuSeparator className="bg-border/30" />
      )}
      <DropdownMenuItem
        onClick={handleClick}
        className="text-foreground hover:bg-muted/50 focus:bg-muted/50 cursor-pointer"
      >
        {Icon && <Icon className="mr-2 size-4" />}
        <span className="text-sm">{label}</span>
      </DropdownMenuItem>
    </>
  );
}
