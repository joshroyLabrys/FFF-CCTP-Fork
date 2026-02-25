"use client";

import { motion } from "motion/react";
import { WindowPortal } from "~/components/ui/window-portal";
import { PongGame } from "./pong-game";
import type { PongWindowViewProps } from "./pong.types";

export function PongWindowView({
  windowRef,
  isMinimized,
  currentPosition,
  initialPosition,
  zIndex,
  dragControls,
  onDragStart,
  onDragEnd,
  onClose,
  onMinimize,
  onFocus,
}: PongWindowViewProps) {
  return (
    <WindowPortal>
      <motion.div
        ref={windowRef}
        drag
        dragControls={dragControls}
        dragListener={false}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        initial={{
          opacity: 0,
          scale: 0.95,
          x: initialPosition.x,
          y: initialPosition.y,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          x: currentPosition.x,
          y: currentPosition.y,
        }}
        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 left-0 hidden lg:block"
        style={{ touchAction: "none", zIndex }}
        onPointerDown={onFocus}
      >
        <div className="border-border bg-white/95 dark:bg-[#1c1c1e]/95 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl">
          {/* Title bar */}
          <div
            className="border-border flex cursor-grab items-center justify-between border-b bg-black/[0.02] px-3.5 py-2.5 dark:bg-white/[0.03] active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="group/btn relative size-3 rounded-full bg-[#ff5f57] transition-opacity hover:opacity-80"
                aria-label="Close window"
              >
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-red-900 opacity-0 transition-opacity group-hover/btn:opacity-100">
                  ×
                </span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onMinimize();
                }}
                className="group/btn relative size-3 rounded-full bg-[#febc2e] transition-opacity hover:opacity-80"
                aria-label="Minimize window"
              >
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-yellow-900 opacity-0 transition-opacity group-hover/btn:opacity-100">
                  −
                </span>
              </motion.button>
              <div className="size-3 rounded-full bg-[#28c840]/40" />
            </div>
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[12px] font-medium text-muted-foreground">
              Pong
            </div>
            <div className="w-[52px]" />
          </div>

          {/* Content */}
          <motion.div
            animate={{
              height: isMinimized ? 0 : "auto",
              opacity: isMinimized ? 0 : 1,
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              <PongGame />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </WindowPortal>
  );
}
