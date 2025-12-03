"use client";

import {
  DynamicContextProvider,
  FilterChain,
} from "@dynamic-labs/sdk-react-core";

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { SuiWalletConnectors } from "@dynamic-labs/sui";
import { env } from "~/env";
import {
  EthereumIcon,
  SolanaIcon,
  ArbitrumIcon,
  SuiIcon,
} from "@dynamic-labs/iconic";

export const DynamicProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: env.NEXT_PUBLIC_DYNAMIC_PROJECT_ID,
        walletConnectors: [
          EthereumWalletConnectors,
          SolanaWalletConnectors,
          SuiWalletConnectors,
        ],
        overrides: {
          views: [
            {
              type: "wallet-list",
              tabs: {
                items: [
                  {
                    label: { text: "All chains" },
                  },
                  {
                    label: { icon: <EthereumIcon /> },
                    walletsFilter: FilterChain("EVM"),
                    recommendedWallets: [
                      {
                        walletKey: "phantomevm",
                      },
                    ],
                  },
                  {
                    label: { icon: <SolanaIcon /> },
                    walletsFilter: FilterChain("SOL"),
                  },
                  {
                    label: { icon: <ArbitrumIcon /> },
                    walletsFilter: FilterChain("EVM"),
                  },
                  {
                    label: { icon: <SuiIcon /> },
                    walletsFilter: FilterChain("SUI"),
                  },
                ],
              },
            },
          ],
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
};
