/**
 * EVM network definitions for Dynamic Labs
 *
 * Dynamic's switchNetwork(chainId) looks up the chain in its "network mapping".
 * If a chain isn't registered (e.g. in the dashboard or via evmNetworks), it throws
 * "Could not find network mapping for chain {chainId}".
 *
 * We register all EVM chains we support here so switching works for every chain
 * (mainnet and testnet) without requiring dashboard configuration.
 *
 * @see https://docs.dynamic.xyz/chains/evmNetwork
 * @see https://www.dynamic.xyz/docs/react-sdk/objects/evmNetwork
 */

import { getViemChain } from "~/lib/bridge/chain-utils";
import { NETWORK_CONFIGS } from "~/lib/bridge/networks";
import type { SupportedChainId } from "~/lib/bridge/networks";

const EVM_CHAIN_IDS: SupportedChainId[] = [
  "Ethereum",
  "Base",
  "Arbitrum",
  "Monad",
  "HyperEVM",
  "Ethereum_Sepolia",
  "Base_Sepolia",
  "Arbitrum_Sepolia",
  "Monad_Testnet",
  "HyperEVM_Testnet",
];

export interface DynamicEvmNetwork {
  chainId: number;
  name: string;
  networkId: number;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  iconUrls?: string[];
}

/**
 * Build Dynamic EvmNetwork entries for all EVM chains we support.
 * Used in DynamicContextProvider overrides.evmNetworks so switchNetwork(chainId)
 * finds a mapping for every chain (fixes "Could not find network mapping for chain X").
 */
export function getDynamicEvmNetworks(): DynamicEvmNetwork[] {
  return EVM_CHAIN_IDS.map((id): DynamicEvmNetwork => {
    const config = NETWORK_CONFIGS[id];
    const viemChain = getViemChain(id);

    const rpcUrls = viemChain?.rpcUrls?.default?.http?.length
      ? (viemChain.rpcUrls.default.http as string[])
      : [];

    const blockExplorerUrl = viemChain?.blockExplorers?.default?.url
      ? [viemChain.blockExplorers.default.url]
      : [config.explorerUrl];

    return {
      chainId: config.evmChainId!,
      name: config.name,
      networkId: config.evmChainId!,
      rpcUrls,
      blockExplorerUrls: blockExplorerUrl,
      nativeCurrency: config.nativeCurrency,
      iconUrls: [],
    };
  });
}
