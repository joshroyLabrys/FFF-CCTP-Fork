"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

function useParallaxMouse() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      // Normalise to -1..1 relative to viewport centre
      x.set((e.clientX / window.innerWidth - 0.5) * 2);
      y.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [x, y]);

  return { x, y };
}

interface OrbProps {
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  /** How strongly this orb tracks the mouse. Near = 1, Far ≈ 0.15 */
  depth: number;
  springConfig: { stiffness: number; damping: number };
  /** Pixels the near orb (depth=1) can travel. Scaled by depth for others. */
  travelX?: number;
  travelY?: number;
  style: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    width: number;
    height: number;
    gradient: string;
  };
  breathDuration: number;
  breathDelay?: number;
}

function ParallaxOrb({
  mouseX,
  mouseY,
  depth,
  springConfig,
  travelX = 160,
  travelY = 100,
  style,
  breathDuration,
  breathDelay = 0,
}: OrbProps) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const tx = useSpring(rawX, springConfig);
  const ty = useSpring(rawY, springConfig);

  useEffect(() => {
    const unsubX = mouseX.on("change", (v) => rawX.set(v * travelX * depth));
    const unsubY = mouseY.on("change", (v) => rawY.set(v * travelY * depth));
    return () => {
      unsubX();
      unsubY();
    };
  }, [mouseX, mouseY, rawX, rawY, depth, travelX, travelY]);

  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        x: tx,
        y: ty,
        top: style.top,
        left: style.left,
        right: style.right,
        bottom: style.bottom,
        width: style.width,
        height: style.height,
        background: style.gradient,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
    >
      {/* Inner breathing div — keeps opacity separate from entrance fade */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "inherit" }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{
          duration: breathDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: breathDelay,
        }}
      />
    </motion.div>
  );
}

export function AnimatedBackground() {
  const { x: mouseX, y: mouseY } = useParallaxMouse();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base */}
      <div className="absolute inset-0 bg-background" />

      {/*
       * Far orb — sluggish, blue-grey, upper-right corner.
       * Acts as a distant light source.
       */}
      <ParallaxOrb
        mouseX={mouseX}
        mouseY={mouseY}
        depth={0.15}
        springConfig={{ stiffness: 10, damping: 20 }}
        style={{
          top: "-10%",
          right: "-10%",
          width: 1000,
          height: 1000,
          gradient:
            "radial-gradient(circle, rgba(160,192,240,0.28) 0%, rgba(160,192,240,0.12) 35%, transparent 60%)",
        }}
        breathDuration={36}
        breathDelay={0}
      />

      {/*
       * Mid orb — moderate response, soft blue, lower-left.
       */}
      <ParallaxOrb
        mouseX={mouseX}
        mouseY={mouseY}
        depth={0.45}
        springConfig={{ stiffness: 24, damping: 22 }}
        style={{
          bottom: "0%",
          left: "-5%",
          width: 850,
          height: 850,
          gradient:
            "radial-gradient(circle, rgba(40,120,220,0.22) 0%, rgba(40,120,220,0.08) 40%, transparent 62%)",
        }}
        breathDuration={28}
        breathDelay={10}
      />

      {/*
       * Near orb — most responsive, Apple blue, centre stage.
       * Primary focal glow.
       */}
      <ParallaxOrb
        mouseX={mouseX}
        mouseY={mouseY}
        depth={1}
        springConfig={{ stiffness: 50, damping: 18 }}
        style={{
          top: "15%",
          left: "25%",
          width: 800,
          height: 800,
          gradient:
            "radial-gradient(circle, rgba(0,113,227,0.26) 0%, rgba(0,113,227,0.10) 38%, transparent 58%)",
        }}
        breathDuration={22}
        breathDelay={5}
      />
    </div>
  );
}
