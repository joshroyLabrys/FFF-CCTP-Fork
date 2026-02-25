"use client";

import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { WindowPortal } from "~/components/ui/window-portal";
import { ScrollArea } from "~/components/ui/scroll-area";

interface DisclaimerModalProps {
  open: boolean;
  onClose: () => void;
}

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export function DisclaimerModal({ open, onClose }: DisclaimerModalProps) {
  return (
    <WindowPortal>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="disclaimer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
              style={{ zIndex: 290 }}
              onClick={onClose}
            />

            {/* Modal panel */}
            <motion.div
              key="disclaimer-panel"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2, ease }}
              className="fixed left-1/2 top-1/2 w-[480px] max-w-[calc(100vw-32px)] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-white/[0.97] shadow-2xl backdrop-blur-2xl dark:bg-[#111111]/[0.97]"
              style={{ zIndex: 291 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                  Disclaimer
                </h3>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.92 }}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.07]"
                  aria-label="Close"
                >
                  <X className="size-3.5" />
                </motion.button>
              </div>

              {/* Scrollable content */}
              <ScrollArea style={{ maxHeight: "calc(80vh - 57px)" }}>
                <div className="space-y-5 px-5 py-5">
                  <p className="text-[13px] leading-[1.7] text-muted-foreground">
                    This is an{" "}
                    <strong className="font-semibold text-foreground">
                      unofficial, open-source interface
                    </strong>{" "}
                    for Circle&apos;s Cross-Chain Transfer Protocol (CCTP). It
                    is not developed, maintained, or endorsed by Circle Internet
                    Financial, LLC.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-xl bg-black/[0.03] px-4 py-3.5 dark:bg-white/[0.04]">
                      <p className="text-[13px] font-semibold text-foreground">
                        Unaudited Software
                      </p>
                      <p className="mt-1 text-[13px] leading-[1.65] text-muted-foreground">
                        This software has not undergone a formal security audit.
                        While we follow best practices, undiscovered
                        vulnerabilities may exist.
                      </p>
                    </div>

                    <div className="rounded-xl bg-black/[0.03] px-4 py-3.5 dark:bg-white/[0.04]">
                      <p className="text-[13px] font-semibold text-foreground">
                        Use at Your Own Risk
                      </p>
                      <p className="mt-1 text-[13px] leading-[1.65] text-muted-foreground">
                        By using this application you accept all risks
                        associated with blockchain transactions, including loss
                        of funds, failed transactions, and smart contract
                        vulnerabilities.
                      </p>
                    </div>

                    <div className="rounded-xl bg-black/[0.03] px-4 py-3.5 dark:bg-white/[0.04]">
                      <p className="text-[13px] font-semibold text-foreground">
                        No Warranty
                      </p>
                      <p className="mt-1 text-[13px] leading-[1.65] text-muted-foreground">
                        Provided &ldquo;as is&rdquo; without warranty of any
                        kind. The developers assume no liability for any damages
                        arising from the use of this application.
                      </p>
                    </div>
                  </div>

                  <p className="text-[12px] leading-relaxed text-muted-foreground/50">
                    Always verify transaction details before confirming. Never
                    bridge more than you can afford to lose.
                  </p>
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </WindowPortal>
  );
}
