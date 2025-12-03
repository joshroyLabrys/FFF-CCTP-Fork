"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  validateAddressForNetwork,
  getAddressFormatDescription,
} from "~/lib/bridge/address-validation";
import type { NetworkType } from "~/lib/bridge/networks";

interface DestinationAddressInputProps {
  networkType: NetworkType;
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
  useCustomAddress: boolean;
  onToggleCustomAddress: (useCustom: boolean) => void;
  connectedWalletAddress?: string;
}

export function DestinationAddressInput({
  networkType,
  value,
  onChange,
  onValidationChange,
  useCustomAddress,
  onToggleCustomAddress,
  connectedWalletAddress,
}: DestinationAddressInputProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Validate address whenever it changes
  useEffect(() => {
    if (!useCustomAddress) {
      setValidationError(null);
      setIsValid(true);
      onValidationChange(true);
      return;
    }

    if (!value || value.trim() === "") {
      setValidationError(null);
      setIsValid(false);
      onValidationChange(false);
      return;
    }

    const validation = validateAddressForNetwork(value, networkType);
    setIsValid(validation.valid);
    setValidationError(validation.error ?? null);
    onValidationChange(validation.valid);
  }, [value, networkType, useCustomAddress, onValidationChange]);

  const formatDescription = getAddressFormatDescription(networkType);

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toggle between wallet connection and custom address */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="custom-address"
          checked={useCustomAddress}
          onCheckedChange={onToggleCustomAddress}
        />
        <label
          htmlFor="custom-address"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Send to a different address
        </label>
      </div>

      <AnimatePresence mode="wait">
        {useCustomAddress ? (
          <motion.div
            key="custom-address-input"
            initial={{ opacity: 0, rotateX: -90, transformPerspective: 1000 }}
            animate={{ opacity: 1, rotateX: 0, transformPerspective: 1000 }}
            exit={{ opacity: 0, rotateX: 90, transformPerspective: 1000 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="space-y-2"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="space-y-2">
              <Label htmlFor="destination-address" className="text-sm">
                Destination Address
              </Label>
              <div className="relative">
                <Input
                  id="destination-address"
                  type="text"
                  placeholder={`Enter ${formatDescription}`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className={cn(
                    "pr-10 font-mono text-sm",
                    validationError && value
                      ? "border-red-500 focus-visible:ring-red-500"
                      : isValid && value
                        ? "border-green-500 focus-visible:ring-green-500"
                        : "",
                  )}
                />
                {value && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValid ? (
                      <CheckCircle2 className="size-4 text-green-500" />
                    ) : (
                      <AlertCircle className="size-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>

              {/* Helper text */}
              {!value && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <Info className="size-3 mt-0.5 flex-shrink-0" />
                  <span>
                    Enter the {formatDescription} where you want to receive
                    USDC
                  </span>
                </motion.div>
              )}

              {/* Validation error */}
              {validationError && value && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 text-xs text-red-500"
                >
                  <AlertCircle className="size-3 mt-0.5 flex-shrink-0" />
                  <span>{validationError}</span>
                </motion.div>
              )}

              {/* Success message */}
              {isValid && value && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 text-xs text-green-500"
                >
                  <CheckCircle2 className="size-3 mt-0.5 flex-shrink-0" />
                  <span>Valid {formatDescription}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="wallet-connection-info"
            initial={{ opacity: 0, rotateX: -90, transformPerspective: 1000 }}
            animate={{ opacity: 1, rotateX: 0, transformPerspective: 1000 }}
            exit={{ opacity: 0, rotateX: 90, transformPerspective: 1000 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="bg-muted/30 rounded-xl border border-border/30 p-3"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="size-3 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p>
                  {connectedWalletAddress
                    ? "USDC will be sent to your connected wallet address"
                    : "Connect your destination wallet to receive USDC"}
                </p>
                {connectedWalletAddress && (
                  <p className="font-mono text-foreground">
                    {connectedWalletAddress.slice(0, 6)}...
                    {connectedWalletAddress.slice(-4)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
