/**
 * xReserve flow types
 */

import type { SupportedChainId } from "~/lib/bridge/networks";

export type { XReserveDestinationId } from "./config";

/** Params for xReserve deposit (USDC → USDCx on Canton) */
export interface XReserveDepositParams {
  sourceChainId: SupportedChainId;
  amount: string;
  /** Canton recipient address (encoded for remoteRecipient + hookData) */
  cantonRecipient: string;
  /** Max fee on destination (e.g. "0") */
  maxFee?: string;
}
