import type { ComponentType } from "react";
import type { TargetAndTransition, VariantLabels } from "motion/react";
import type { BridgeHeaderViewProps } from "../bridge-header.types";

/**
 * Menu dropdown item configuration
 */
export interface MenuDropdownItem {
  id: string;
  icon?: ComponentType<{ className?: string }>;
  label: string | ((props: BridgeHeaderViewProps) => string);
  href?: string;
  onClick?: (props: BridgeHeaderViewProps) => void;
  separatorBefore?: boolean;
}

/**
 * Top-level navbar menu configuration
 */
export interface NavMenuItem {
  id: string;
  label: string;
  type: "dropdown" | "button";
  visible?: (props: BridgeHeaderViewProps) => boolean;
  animation?: {
    initial: TargetAndTransition | VariantLabels | boolean;
    animate: TargetAndTransition | VariantLabels | boolean;
    exit: TargetAndTransition | VariantLabels;
  };
  items?: MenuDropdownItem[];
  onClick?: (props: BridgeHeaderViewProps) => void;
}
