/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { m, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/** Shared scroll-reveal timing. Change here to retune every card grid at once. */
const STAGGER = 0.08;
const DURATION = 0.45;
const OFFSET = 20;

/** Orchestrates the stagger; children opt in via {@link RevealItem}. */
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: OFFSET },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION, ease: "easeOut" },
  },
};

/** No movement, no fade — used when the OS asks for reduced motion. */
const staticVariants: Variants = { hidden: {}, visible: {} };

interface RevealProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Wraps a card grid so its children fade in and rise once, when scrolled into
 * view. Must contain {@link RevealItem} children for the stagger to apply.
 */
export function RevealGroup({ children, className }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className={className}
      variants={reduceMotion ? staticVariants : containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </m.div>
  );
}

/** A single card slot inside a {@link RevealGroup}. */
export function RevealItem({ children, className }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      className={className}
      variants={reduceMotion ? staticVariants : itemVariants}
    >
      {children}
    </m.div>
  );
}
