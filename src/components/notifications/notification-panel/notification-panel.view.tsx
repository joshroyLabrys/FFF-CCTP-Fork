"use client";

import { motion, AnimatePresence } from "motion/react";
import { Bell } from "lucide-react";
import { NotificationItem } from "../notification-item";
import { Button } from "~/components/ui/button";
import { WindowPortal } from "~/components/ui/window-portal";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { NotificationPanelViewProps } from "./notification-panel.types";

/**
 * Inner content component for NotificationPanel.
 * Exported separately for use in Storybook without WindowPortal.
 */
export function NotificationPanelContent({
  isOpen,
  panelRef,
  notifications,
  onClose,
  onNotificationClick,
  onClearAll,
}: NotificationPanelViewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            style={{ zIndex: 199 }}
            onClick={onClose}
          />

          {/* Panel - Desktop only (mobile uses MobileNotificationDrawer) */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="fixed top-14 right-4 hidden w-full max-w-md lg:block"
            style={{ zIndex: 200 }}
          >
            {/* Notification panel container */}
            <div className="border-border bg-white/95 dark:bg-[#1c1c1e]/95 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl">
              {/* Header */}
              <div className="border-border border-b bg-black/[0.02] px-4 py-3 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-semibold text-foreground">
                      Notifications
                    </h3>
                    {notifications.length > 0 && (
                      <span className="rounded-full bg-[#0071e3] px-2 py-0.5 text-[10px] font-semibold text-white">
                        {notifications.length}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="h-7 gap-1.5 px-2 text-[12px] font-medium text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>

              {/* Notifications list */}
              <ScrollArea className="macos-window-scrollbar max-h-[32rem]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <div className="bg-muted/30 flex size-16 items-center justify-center rounded-full">
                      <Bell className="text-muted-foreground/50 size-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-foreground text-sm font-medium">
                        No notifications
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        You&apos;re all caught up!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 p-3">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <NotificationItem
                          notification={notification}
                          onAction={onNotificationClick}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * NotificationPanel with WindowPortal wrapper for production use.
 */
export function NotificationPanelView(props: NotificationPanelViewProps) {
  return (
    <WindowPortal>
      <NotificationPanelContent {...props} />
    </WindowPortal>
  );
}
