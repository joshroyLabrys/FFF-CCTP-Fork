"use client";

import { CheckCircle2, AlertCircle, Loader2, Clock, Ban } from "lucide-react";
import type { StepIconProps } from "../transaction-windows.types";

export function StepIcon({ step }: StepIconProps) {
  switch (step.status) {
    case "completed":
      return (
        <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/12 ring-2 ring-emerald-500/15 dark:bg-emerald-500/15 dark:ring-emerald-500/20">
          <CheckCircle2 className="size-4 text-emerald-700 dark:text-emerald-400" />
        </div>
      );
    case "failed":
      return (
        <div className="flex size-6 items-center justify-center rounded-full bg-rose-500/12 ring-2 ring-rose-500/15 dark:bg-rose-500/15 dark:ring-rose-500/20">
          <AlertCircle className="size-4 text-rose-700 dark:text-rose-400" />
        </div>
      );
    case "in_progress":
      return (
        <div className="flex size-6 items-center justify-center rounded-full bg-blue-500/10 ring-2 ring-blue-500/15 dark:ring-blue-500/20">
          <Loader2 className="size-4 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      );
    case "cancelled":
      return (
        <div className="flex size-6 items-center justify-center rounded-full bg-zinc-400/15 ring-2 ring-zinc-400/20 dark:bg-zinc-500/15 dark:ring-zinc-500/20">
          <Ban className="size-4 text-zinc-600 dark:text-zinc-400" />
        </div>
      );
    case "pending":
    default:
      return (
        <div className="flex size-6 items-center justify-center rounded-full bg-zinc-400/10 ring-2 ring-zinc-400/10 dark:bg-zinc-500/10 dark:ring-zinc-500/15">
          <Clock className="size-4 text-zinc-500 dark:text-zinc-400" />
        </div>
      );
  }
}
