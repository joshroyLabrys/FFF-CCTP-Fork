/**
 * xReserve module: USDC → USDCx on Canton
 */

export {
  getXReserveConfig,
  isXReserveSourceChain,
  XRESERVE_SOURCE_CHAIN_IDS,
  CANTON_XRESERVE_DOMAIN,
  CANTON_DESTINATION_ID,
  CANTON_CLAIM_DOCS_URL,
} from "./config";
export type { XReserveChainConfig, XReserveDestinationId } from "./config";
export type { XReserveDepositParams } from "./types";
export {
  executeXReserveDeposit,
  type XReserveDepositResult,
  type XReserveDepositCallbacks,
} from "./deposit-service";
