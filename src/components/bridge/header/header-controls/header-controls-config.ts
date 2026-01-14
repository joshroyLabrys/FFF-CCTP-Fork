import { History, Search } from "lucide-react";
import { ThemeToggle } from "../../theme-toggle";
import { NetworkToggle } from "../../network-toggle";
import { NotificationBell } from "~/components/notifications";
import type { HeaderControlItem } from "./header-controls.types";

export const HEADER_CONTROLS_CONFIG: HeaderControlItem[] = [
  // Transaction History button - Mobile only
  {
    id: "transaction-history-mobile",
    type: "icon-button",
    icon: History,
    onClick: (props) => props.onToggleTransactionHistory(),
    ariaLabel: "Transaction History",
    visibleBreakpoint: "mobile",
  },
  {
    id: "divider-1",
    type: "divider",
    visibleBreakpoint: "mobile",
  },

  // Network toggle
  {
    id: "network-toggle",
    type: "component",
    component: NetworkToggle,
  },
  {
    id: "divider-2",
    type: "divider",
  },

  // Theme toggle
  {
    id: "theme-toggle",
    type: "component",
    component: ThemeToggle,
  },
  {
    id: "divider-3",
    type: "divider",
  },

  // Search / Command Palette
  {
    id: "search",
    type: "icon-button",
    icon: Search,
    onClick: (props) => props.onOpenCommandPalette(),
    ariaLabel: "Open command palette",
  },
  {
    id: "divider-4",
    type: "divider",
  },

  // Notifications
  {
    id: "notifications",
    type: "component",
    component: NotificationBell,
  },
  {
    id: "divider-5",
    type: "divider",
  },

  // Wallet button (special handling for connected/disconnected)
  {
    id: "wallet",
    type: "wallet",
  },
];
