"use client";

import { motion } from "motion/react";
import { X, ArrowRight } from "lucide-react";
import { cn } from "~/lib/utils";
import type { NotificationItemViewProps } from "./notification-item.types";

export function NotificationItemView({
  notification,
  formattedTimestamp,
  statusIcon,
  onItemClick,
  onDismiss,
}: NotificationItemViewProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      onClick={onItemClick}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl p-3.5 transition-colors",
        "bg-black/[0.03] hover:bg-black/[0.05] dark:bg-white/[0.04] dark:hover:bg-white/[0.07]",
        !notification.read && "ring-1 ring-[#0071e3]/20",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className="mt-0.5 shrink-0">{statusIcon}</div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title + timestamp */}
          <div className="mb-1 flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold leading-tight text-foreground">
              {notification.title}
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">
                {formattedTimestamp}
              </span>
              <button
                onClick={onDismiss}
                className="rounded-md p-0.5 opacity-0 transition-all hover:bg-black/[0.06] group-hover:opacity-100 dark:hover:bg-white/[0.08]"
                aria-label="Dismiss notification"
              >
                <X className="size-3 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Message */}
          <p className="mb-2 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
            {notification.message}
          </p>

          {/* Bridge route chip */}
          {notification.fromChain && notification.toChain && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] dark:bg-white/[0.06]">
              <span className="font-medium text-foreground">{notification.fromChain}</span>
              <ArrowRight className="size-2.5 text-muted-foreground" />
              <span className="font-medium text-foreground">{notification.toChain}</span>
              {notification.amount && (
                <>
                  <span className="text-muted-foreground/60">·</span>
                  <span className="font-semibold text-foreground">
                    {notification.amount} {notification.token ?? "USDC"}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Action button */}
          {notification.actionLabel && !notification.fromChain && (
            <button
              className={cn(
                "mt-2 rounded-lg px-3 py-1 text-[12px] font-semibold transition-all",
                notification.status === "failed"
                  ? "bg-rose-500/12 text-rose-700 hover:bg-rose-500/15 dark:text-rose-400"
                  : "bg-[#0071e3]/10 text-[#0071e3] hover:bg-[#0071e3]/15",
              )}
            >
              {notification.actionLabel}
            </button>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <div className="absolute top-3 right-3 size-1.5 rounded-full bg-[#0071e3]" />
      )}
    </motion.div>
  );
}
