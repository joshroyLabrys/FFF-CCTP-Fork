"use client";

import { motion } from "motion/react";
import { ArrowRightLeft } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { TransactionRow } from "./transaction-row.view";
import type { RecentTransactionsViewProps } from "./recent-transactions.types";

export function RecentTransactionsView({
  filteredTransactions,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  environment,
  hideHeader,
  disableClick,
  maxItems,
  onOpenTransaction,
  loadMoreRef,
}: RecentTransactionsViewProps) {
  // Limit transactions when maxItems is set
  const displayTransactions = maxItems
    ? filteredTransactions.slice(0, maxItems)
    : filteredTransactions;
  if (isLoading && filteredTransactions.length === 0) {
    return (
      <div className="w-full max-w-4xl space-y-3">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-black/[0.03] p-4 dark:bg-white/[0.04]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (filteredTransactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-4xl flex-col items-center justify-center gap-3 py-8"
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-black/[0.03] dark:bg-white/[0.04]">
          <ArrowRightLeft className="size-8 text-muted-foreground/50" />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium text-foreground">
            No transactions yet
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Your bridge activity will appear here
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="w-full max-w-4xl"
    >
      {!hideHeader && (
        <div className="mb-6">
          <h3 className="text-[15px] font-semibold text-foreground">
            Recent Transactions
          </h3>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Your latest {environment} bridge activity
          </p>
        </div>
      )}

      <div className="space-y-3">
        {displayTransactions.map((tx, index) => (
          <TransactionRow
            key={tx.id}
            transaction={tx}
            index={index}
            onOpenTransaction={onOpenTransaction}
            disableClick={disableClick}
          />
        ))}

        {/* Infinite scroll trigger via intersection observer (hide when maxItems is set) */}
        {!maxItems && <div ref={loadMoreRef} className="h-1" />}

        {!maxItems && isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="size-6 animate-spin rounded-full border-2 border-[#0071e3] border-t-transparent" />
          </div>
        )}

        {!maxItems && !hasNextPage && filteredTransactions.length > 0 && (
          <p className="py-2 text-center text-[12px] text-muted-foreground">
            No more transactions
          </p>
        )}
      </div>
    </motion.div>
  );
}
