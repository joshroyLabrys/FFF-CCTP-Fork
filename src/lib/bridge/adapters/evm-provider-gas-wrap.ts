/**
 * Wraps an EIP-1193 EVM provider to ensure outbound transactions never send
 * maxFeePerGas below the current block base fee (fixes "fee cap cannot be lower
 * than the block base fee" on chains like Arbitrum where base fee can spike).
 */

export type EIP1193Provider = {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
};

/**
 * Wraps `provider` so that for eth_sendTransaction, if the tx has maxFeePerGas
 * set and it is below the current block's baseFeePerGas, we bump maxFeePerGas
 * to at least baseFeePerGas (plus priority fee if present).
 */
export function wrapProviderWithMinGasFee(provider: EIP1193Provider): EIP1193Provider {
  return {
    request: async (args: { method: string; params?: unknown[] }) => {
      if (
        args.method === "eth_sendTransaction" &&
        args.params?.[0] &&
        typeof args.params[0] === "object"
      ) {
        const tx = args.params[0] as {
          maxFeePerGas?: string;
          maxPriorityFeePerGas?: string;
        };
        if (tx.maxFeePerGas) {
          try {
            const block = (await provider.request({
              method: "eth_getBlockByNumber",
              params: ["latest", false],
            })) as { baseFeePerGas?: string } | null;
            const baseFeeHex = block?.baseFeePerGas;
            if (baseFeeHex) {
              const baseFee = BigInt(baseFeeHex);
              const currentMax = BigInt(tx.maxFeePerGas);
              if (currentMax < baseFee) {
                const priority = tx.maxPriorityFeePerGas
                  ? BigInt(tx.maxPriorityFeePerGas)
                  : 0n;
                const minMaxFee = baseFee + priority;
                (args.params[0] as Record<string, string>).maxFeePerGas =
                  "0x" + minMaxFee.toString(16);
              }
            }
          } catch {
            // If we can't get block, send as-is
          }
        }
      }
      return provider.request(args);
    },
  };
}
