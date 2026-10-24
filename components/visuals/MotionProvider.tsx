/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

// Load animation features asynchronously so the heavy animation engine
// lands in a separate webpack chunk that doesn't block initial page render.
const loadFeatures = () =>
  import("./motion-features").then((mod) => mod.domAnimation);

interface MotionProviderProps {
  readonly children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
