"use client";

import { useMemo, useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
  useTransactionHistoryInfinite,
  NETWORK_CONFIGS,
  useEnvironment,
  useBridgeStore,
  type BridgeTransaction,
} from "~/lib/bridge";
import { env } from "~/env";
import { MOCK_ACTIVITY_TRANSACTIONS } from "~/lib/mocks/activity-mocks";

export function useRecentTransactionsState() {
  const {
    transactions: queryTransactions,
    isLoading: queryLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useTransactionHistoryInfinite();

  const environment = useEnvironment();
  const openTransactionWindow = useBridgeStore(
    (state) => state.openTransactionWindow,
  );

  const useMock = env.NEXT_PUBLIC_USE_MOCK_ACTIVITY === "true";
  const transactions = useMock ? MOCK_ACTIVITY_TRANSACTIONS : queryTransactions;
  const isLoading = useMock ? false : queryLoading;

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: "100px",
  });

  // Fetch next page when scrolled into view (no-op when mock)
  useEffect(() => {
    if (!useMock && inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [useMock, inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleOpenTransaction = useCallback(
    (transaction: BridgeTransaction) => {
      openTransactionWindow(transaction);
    },
    [openTransactionWindow],
  );

  // Filter transactions by current environment
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const fromNetwork = NETWORK_CONFIGS[tx.fromChain];
      return fromNetwork?.environment === environment;
    });
  }, [transactions, environment]);

  return {
    filteredTransactions,
    isLoading,
    isFetchingNextPage: useMock ? false : isFetchingNextPage,
    hasNextPage: useMock ? false : hasNextPage,
    environment,
    onOpenTransaction: handleOpenTransaction,
    loadMoreRef,
  };
}
