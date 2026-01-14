/**
 * Address validation utilities for different blockchain networks
 */

import { isAddress } from "viem";
import { PublicKey } from "@solana/web3.js";

/**
 * Validate Ethereum/EVM address
 */
export function isValidEVMAddress(address: string): boolean {
  try {
    return isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Validate Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate SUI address (basic validation)
 * SUI addresses are 32 bytes hex strings starting with "0x"
 */
export function isValidSuiAddress(address: string): boolean {
  // SUI addresses: 0x followed by 64 hex characters
  const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/;
  return suiAddressRegex.test(address);
}

/**
 * Validate address based on network type
 */
export function validateAddressForNetwork(
  address: string,
  networkType: "evm" | "solana" | "sui",
): { valid: boolean; error?: string } {
  if (!address || address.trim() === "") {
    return { valid: false, error: "Address is required" };
  }

  switch (networkType) {
    case "evm":
      if (isValidEVMAddress(address)) {
        return { valid: true };
      }
      return {
        valid: false,
        error: "Invalid EVM address. Must be a valid Ethereum address (0x...)",
      };

    case "solana":
      if (isValidSolanaAddress(address)) {
        return { valid: true };
      }
      return {
        valid: false,
        error: "Invalid Solana address. Must be a valid base58 encoded address",
      };

    case "sui":
      if (isValidSuiAddress(address)) {
        return { valid: true };
      }
      return {
        valid: false,
        error: "Invalid SUI address. Must be 0x followed by 64 hex characters",
      };

    default:
      return { valid: false, error: "Unsupported network type" };
  }
}

/**
 * Get address format description for a network type
 */
export function getAddressFormatDescription(
  networkType: "evm" | "solana" | "sui",
): string {
  switch (networkType) {
    case "evm":
      return "EVM address (0x...)";
    case "solana":
      return "Solana address (base58)";
    case "sui":
      return "SUI address (0x...)";
    default:
      return "Address";
  }
}
