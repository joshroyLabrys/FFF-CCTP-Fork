"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { flushSync } from "react-dom";

const duration = 700;

export function useThemeToggle() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;

    const stored = localStorage.getItem("theme");
    if (stored) {
      return stored === "dark";
    }

    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    setMounted(true);

    const stored = localStorage.getItem("theme");
    if (stored) {
      const isDarkTheme = stored === "dark";
      setIsDark(isDarkTheme);
      document.documentElement.classList.toggle("dark", isDarkTheme);
    }
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;
    await document.startViewTransition(() => {
      flushSync(() => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", newTheme ? "dark" : "light");
      });
    }).ready;
    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top),
    );
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  }, [isDark]);

  return {
    buttonRef,
    mounted,
    isDark,
    toggleTheme,
  };
}
