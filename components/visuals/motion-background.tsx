/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";

const emptySubscribe = () => () => {};

// Shared grid styling so the background reads identically on every route
const GRID_COLOR_DARK = "rgba(255, 255, 255, 0.07)";
const GRID_COLOR_LIGHT = "rgba(0, 0, 0, 0.07)";

// Softens the grid toward the edges so it never reads as a hard, high-contrast mesh
const GRID_FADE =
  "radial-gradient(ellipse 110% 90% at 50% 30%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.18) 80%, transparent 100%)";

function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function subscribeToMediaQuery(callback: () => void) {
  const mql = window.matchMedia(`(max-width: 1024px)`);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function useIsMediumScreen() {
  return useSyncExternalStore(
    subscribeToMediaQuery,
    () => window.innerWidth <= 1024,
    () => false
  );
}

export function Background() {
  const { theme, resolvedTheme } = useTheme();

  const hasMounted = useHasMounted();
  const isMobile = useIsMobile();
  const isMediumScreen = useIsMediumScreen();

  const isDarkTheme =
    hasMounted && (theme === "dark" || resolvedTheme === "dark");

  // Only create motion values for desktop
  const shouldUseMotion = hasMounted && !isMobile && !isMediumScreen;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // For the bubble - tracks actual mouse position
  const bubbleX = useMotionValue(0);
  const bubbleY = useMotionValue(0);

  const gridX = useSpring(mouseX, { stiffness: 50, damping: 20, mass: 0.5 });
  const gridY = useSpring(mouseY, { stiffness: 50, damping: 20, mass: 0.5 });

  const springBubbleX = useSpring(bubbleX, {
    stiffness: 150,
    damping: 15,
    mass: 0.1,
  });
  const springBubbleY = useSpring(bubbleY, {
    stiffness: 150,
    damping: 15,
    mass: 0.1,
  });

  useEffect(() => {
    if (!shouldUseMotion) return;

    // Throttle mouse move events for better performance
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          mouseX.set(((e.clientX - centerX) / centerX) * 15); // Reduced movement intensity
          mouseY.set(((e.clientY - centerY) / centerY) * 15);

          // Bubble follows actual mouse position
          bubbleX.set(e.clientX - 300); // 300 = half of bubble width
          bubbleY.set(e.clientY - 300); // 300 = half of bubble height
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY, bubbleX, bubbleY, shouldUseMotion]);

  if (!hasMounted) {
    return null;
  }

  const gridColor = isDarkTheme ? GRID_COLOR_DARK : GRID_COLOR_LIGHT;

  // Use static background for mobile/medium screens for better performance
  if (!shouldUseMotion) {
    return (
      <div className="fixed inset-0 -z-10">
        <div
          className={`absolute inset-0 ${
            isDarkTheme ? "bg-black/5" : "bg-white/5"
          }`}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
            backgroundSize: "clamp(25px, 5vw, 35px) clamp(25px, 5vw, 35px)",
            maskImage: GRID_FADE,
            WebkitMaskImage: GRID_FADE,
          }}
        />
      </div>
    );
  }

  return (
    <motion.div className="fixed inset-0 -z-10">
      <div
        className={`absolute inset-0 ${
          isDarkTheme ? "bg-black/5" : "bg-white/5"
        }`}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "clamp(20px, 4vw, 40px) clamp(20px, 4vw, 40px)",
          maskImage: GRID_FADE,
          WebkitMaskImage: GRID_FADE,
          x: gridX,
          y: gridY,
        }}
      />
      {/* Glowing bubble that follows mouse */}
      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: isDarkTheme
            ? "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%)"
            : "radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.04) 40%, transparent 70%)",
          left: springBubbleX,
          top: springBubbleY,
        }}
      />
    </motion.div>
  );
}
