"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface WindowPortalProps {
  children: React.ReactNode;
}

/**
 * Portal component that renders children to document.body
 * Used for draggable windows to ensure they share the same stacking context
 * for consistent z-index management across all window types.
 */
export function WindowPortal({ children }: WindowPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server or before mount to avoid hydration mismatch
  if (!mounted) return null;

  return createPortal(children, document.body);
}
