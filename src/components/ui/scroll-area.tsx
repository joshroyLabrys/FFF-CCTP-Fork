"use client";

import SimpleBar from "simplebar-react";
import { cn } from "~/lib/utils";

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  autoHide?: boolean;
}

export function ScrollArea({
  children,
  className,
  autoHide = true,
}: ScrollAreaProps) {
  return (
    <SimpleBar
      autoHide={autoHide}
      className={cn("h-full", className)}
    >
      {children}
    </SimpleBar>
  );
}

interface RootScrollAreaProps {
  children: React.ReactNode;
}

export function RootScrollArea({ children }: RootScrollAreaProps) {
  return (
    <SimpleBar
      autoHide
      style={{ height: "100vh", width: "100%" }}
    >
      {children}
    </SimpleBar>
  );
}
