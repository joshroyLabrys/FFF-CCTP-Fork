"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell } from "lucide-react";
import {
  useUnreadCount,
  useToggleNotificationPanel,
  useIsNotificationPanelOpen,
  useLoadNotifications,
} from "~/lib/notifications";
import { cn } from "~/lib/utils";

interface NotificationBellProps {
  isDragging?: boolean;
}

export function NotificationBell({ isDragging }: NotificationBellProps) {
  const unreadCount = useUnreadCount();
  const togglePanel = useToggleNotificationPanel();
  const isOpen = useIsNotificationPanelOpen();
  const loadNotifications = useLoadNotifications();

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleClick = () => {
    if (!isDragging) {
      togglePanel();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      data-notification-bell="true"
      className={cn(
        "relative flex size-8 items-center justify-center rounded-lg transition-colors",
        "hover:bg-black/[0.05] dark:hover:bg-white/[0.07]",
        isOpen && "bg-black/[0.06] dark:bg-white/[0.09]",
      )}
      whileTap={{ scale: 0.94 }}
      aria-label="Notifications"
    >
      <Bell
        className={cn(
          "size-[18px] transition-colors",
          isOpen || unreadCount > 0 ? "text-[#0071e3]" : "text-muted-foreground",
        )}
      />

      {/* Unread badge */}
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#0071e3] text-[9px] font-bold text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
