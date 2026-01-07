import { describe, it, expect } from "vitest";
import {
  isValidEVMAddress,
  isValidSolanaAddress,
  isValidSuiAddress,
  validateAddressForNetwork,
  getAddressFormatDescription,
} from "../address-validation";

describe("Address Validation", () => {
  describe("isValidEVMAddress", () => {
    it("should return true for valid checksummed EVM addresses", () => {
      expect(isValidEVMAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")).toBe(true);
    });

    it("should return true for valid lowercase EVM addresses", () => {
      expect(isValidEVMAddress("0x71c7656ec7ab88b098defb751b7401b5f6d8976f")).toBe(true);
    });

    it("should return false for all-uppercase EVM addresses (invalid checksum)", () => {
      // All-uppercase is not a valid checksummed address in EIP-55
      // viem's isAddress() correctly rejects these
      expect(isValidEVMAddress("0x71C7656EC7AB88B098DEFB751B7401B5F6D8976F")).toBe(false);
    });

    it("should return false for invalid EVM addresses", () => {
      expect(isValidEVMAddress("invalid")).toBe(false);
      expect(isValidEVMAddress("0x")).toBe(false);
      expect(isValidEVMAddress("0x123")).toBe(false);
      expect(isValidEVMAddress("")).toBe(false);
    });

    it("should return false for addresses without 0x prefix", () => {
      expect(isValidEVMAddress("71C7656EC7ab88b098defB751B7401B5f6d8976F")).toBe(false);
    });
  });

  describe("isValidSolanaAddress", () => {
    it("should return true for valid Solana addresses", () => {
      // Valid Solana mainnet addresses (Base58 encoded, case-sensitive)
      expect(isValidSolanaAddress("DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK")).toBe(true);
      expect(isValidSolanaAddress("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")).toBe(true);
    });

    it("should return false for invalid Solana addresses", () => {
      expect(isValidSolanaAddress("invalid")).toBe(false);
      expect(isValidSolanaAddress("")).toBe(false);
      expect(isValidSolanaAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")).toBe(false);
    });

    it("should be case-sensitive for Solana addresses (Base58)", () => {
      // Base58 is case-sensitive - lowercase version is a different address
      const validAddress = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK";
      const lowercasedAddress = validAddress.toLowerCase();

      expect(isValidSolanaAddress(validAddress)).toBe(true);
      // Lowercased version should be invalid (different checksum/encoding)
      expect(isValidSolanaAddress(lowercasedAddress)).toBe(false);
    });

    it("should reject addresses with invalid Base58 characters", () => {
      // Base58 doesn't include 0, O, I, l
      expect(isValidSolanaAddress("0YW8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK")).toBe(false);
      expect(isValidSolanaAddress("OYW8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK")).toBe(false);
      expect(isValidSolanaAddress("IYW8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK")).toBe(false);
      expect(isValidSolanaAddress("lYW8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK")).toBe(false);
    });
  });

  describe("isValidSuiAddress", () => {
    it("should return true for valid SUI addresses", () => {
      // SUI addresses are 0x + 64 hex characters
      const validSuiAddress = "0x" + "a".repeat(64);
      expect(isValidSuiAddress(validSuiAddress)).toBe(true);

      const mixedCaseAddress = "0x" + "aAbBcCdDeEfF001122334455667788990011223344556677889900aabbccddee";
      expect(isValidSuiAddress(mixedCaseAddress)).toBe(true);
    });

    it("should return false for invalid SUI addresses", () => {
      expect(isValidSuiAddress("invalid")).toBe(false);
      expect(isValidSuiAddress("")).toBe(false);
      expect(isValidSuiAddress("0x")).toBe(false);
      // Too short
      expect(isValidSuiAddress("0x" + "a".repeat(63))).toBe(false);
      // Too long
      expect(isValidSuiAddress("0x" + "a".repeat(65))).toBe(false);
      // EVM address (40 hex chars, not 64)
      expect(isValidSuiAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F")).toBe(false);
    });

    it("should require 0x prefix", () => {
      expect(isValidSuiAddress("a".repeat(64))).toBe(false);
    });
  });

  describe("validateAddressForNetwork", () => {
    describe("EVM validation", () => {
      it("should return valid for correct EVM addresses", () => {
        const result = validateAddressForNetwork(
          "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          "evm"
        );
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should return error for invalid EVM addresses", () => {
        const result = validateAddressForNetwork("invalid", "evm");
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Invalid EVM address");
      });
    });

    describe("Solana validation", () => {
      it("should return valid for correct Solana addresses", () => {
        const result = validateAddressForNetwork(
          "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
          "solana"
        );
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should return error for invalid Solana addresses", () => {
        const result = validateAddressForNetwork("invalid", "solana");
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Invalid Solana address");
      });

      it("should reject lowercased Solana addresses", () => {
        const validAddress = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK";
        const result = validateAddressForNetwork(validAddress.toLowerCase(), "solana");
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Invalid Solana address");
      });
    });

    describe("SUI validation", () => {
      it("should return valid for correct SUI addresses", () => {
        const validSuiAddress = "0x" + "a".repeat(64);
        const result = validateAddressForNetwork(validSuiAddress, "sui");
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should return error for invalid SUI addresses", () => {
        const result = validateAddressForNetwork("invalid", "sui");
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Invalid SUI address");
      });
    });

    describe("Empty/missing address handling", () => {
      it("should return error for empty addresses", () => {
        expect(validateAddressForNetwork("", "evm").valid).toBe(false);
        expect(validateAddressForNetwork("", "solana").valid).toBe(false);
        expect(validateAddressForNetwork("", "sui").valid).toBe(false);
      });

      it("should return error for whitespace-only addresses", () => {
        expect(validateAddressForNetwork("   ", "evm").valid).toBe(false);
        expect(validateAddressForNetwork("   ", "solana").valid).toBe(false);
      });
    });
  });

  describe("getAddressFormatDescription", () => {
    it("should return correct description for EVM", () => {
      expect(getAddressFormatDescription("evm")).toBe("EVM address (0x...)");
    });

    it("should return correct description for Solana", () => {
      expect(getAddressFormatDescription("solana")).toBe("Solana address (base58)");
    });

    it("should return correct description for SUI", () => {
      expect(getAddressFormatDescription("sui")).toBe("SUI address (0x...)");
    });
  });
});
