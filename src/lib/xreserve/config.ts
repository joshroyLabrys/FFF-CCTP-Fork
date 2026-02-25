/**
 * xReserve configuration for USDC → USDCx on Canton
 * See: https://developers.circle.com/xreserve/tutorials/deposit-usdc-on-ethereum-for-usdcx-on-canton
 * Contract source: https://github.com/circlefin/evm-xreserve-contracts
 */

import type { SupportedChainId } from "~/lib/bridge/networks";

/** xReserve remote domain for Canton (remote domains start at 10001) */
export const CANTON_XRESERVE_DOMAIN = 10001;

/** Destination id used in the app for "Canton (USDCx)" - not a CCTP chain */
export const CANTON_DESTINATION_ID = "Canton" as const;
export type XReserveDestinationId = typeof CANTON_DESTINATION_ID;

/** Source chains that have xReserve contract (Ethereum mainnet + Sepolia) */
export const XRESERVE_SOURCE_CHAIN_IDS: SupportedChainId[] = [
  "Ethereum",
  "Ethereum_Sepolia",
];

export interface XReserveChainConfig {
  sourceChainId: SupportedChainId;
  xReserveContract: `0x${string}`;
  usdcContract: `0x${string}`;
}

/** xReserve and USDC contract addresses per source chain */
export const XRESERVE_CHAIN_CONFIGS: Record<
  (typeof XRESERVE_SOURCE_CHAIN_IDS)[number],
  XReserveChainConfig
> = {
  Ethereum: {
    sourceChainId: "Ethereum",
    xReserveContract: "0x9B85aC04A09c8C813c37de9B3d563C2D3F936162" as `0x${string}`,
    usdcContract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as `0x${string}`,
  },
  Ethereum_Sepolia: {
    sourceChainId: "Ethereum_Sepolia",
    xReserveContract: "0x008888878f94C0d87defdf0B07f46B93C1934442" as `0x${string}`,
    usdcContract: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`,
  },
};

export function getXReserveConfig(
  sourceChainId: SupportedChainId,
): XReserveChainConfig | null {
  if (!XRESERVE_SOURCE_CHAIN_IDS.includes(sourceChainId)) return null;
  return XRESERVE_CHAIN_CONFIGS[sourceChainId as keyof typeof XRESERVE_CHAIN_CONFIGS] ?? null;
}

export function isXReserveSourceChain(
  chainId: SupportedChainId,
): boolean {
  return XRESERVE_SOURCE_CHAIN_IDS.includes(chainId);
}

/** xReserve attestation wait (Ethereum finality + Circle attestation), single source for estimate/tx/check-status */
export const XRESERVE_ATTESTATION_WAIT_MS = 15 * 60 * 1000;

/** Human-readable xReserve attestation time for UI copy */
export const XRESERVE_ATTESTATION_DISPLAY = "~13–15 min";

/** Canton xReserve docs for claiming USDCx */
export const CANTON_CLAIM_DOCS_URL =
  "https://docs.digitalasset.com/usdc/xreserve/index.html";

/** Official xReserve deposits UI for in-app claim (embed or open in new tab) */
export const CANTON_CLAIM_UI_URL =
  "https://digital-asset.github.io/xreserve-deposits/";
