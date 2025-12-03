"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "~/lib/utils";

export function ThemeToggle() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;

    // Check localStorage first, then fall back to system preference
    const stored = localStorage.getItem("theme");
    if (stored) {
      return stored === "dark";
    }

    return document.documentElement.classList.contains("dark");
  });

  // Prevent hydration mismatch and initialize theme from localStorage
  useEffect(() => {
    setMounted(true);

    // Apply stored theme on mount
    const stored = localStorage.getItem("theme");
    if (stored) {
      const isDarkTheme = stored === "dark";
      setIsDark(isDarkTheme);
      document.documentElement.classList.toggle("dark", isDarkTheme);
    }
  }, []);

  // Sync with theme changes from other sources
  useEffect(() => {
    const syncTheme = () =>
      setIsDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    // Check if View Transition API is supported
    if (!document.startViewTransition) {
      // Fallback for browsers without View Transition API
      const toggled = !isDark;
      setIsDark(toggled);
      document.documentElement.classList.toggle("dark", toggled);
      localStorage.setItem("theme", toggled ? "dark" : "light");
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        const toggled = !isDark;
        setIsDark(toggled);
        document.documentElement.classList.toggle("dark", toggled);
        localStorage.setItem("theme", toggled ? "dark" : "light");
      });
    }).ready;

    const { left, top, width, height } =
      buttonRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const maxDistance = Math.hypot(
      Math.max(centerX, window.innerWidth - centerX),
      Math.max(centerY, window.innerHeight - centerY),
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${centerX}px ${centerY}px)`,
          `circle(${maxDistance}px at ${centerX}px ${centerY}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  }, [isDark]);

  if (!mounted) {
    return (
      <div className="size-10 rounded-xl border border-border/50 bg-card/50" />
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      type="button"
      className={cn(
        "relative flex size-10 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl transition-all",
        "hover:border-border hover:bg-card/80 focus:outline-none focus:ring-0 cursor-pointer",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun-icon"
            initial={{ opacity: 0, scale: 0.55, rotate: 25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.33 }}
          >
            <Sun className="size-5 text-foreground" />
          </motion.span>
        ) : (
          <motion.span
            key="moon-icon"
            initial={{ opacity: 0, scale: 0.55, rotate: -25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.33 }}
          >
            <Moon className="size-5 text-foreground" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}



