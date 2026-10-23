/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface CertificationShowcaseLogic {
  readonly isMobile: boolean;
  readonly isTablet: boolean;
  readonly expandedCards: Set<number>;
  readonly hoveredCard: number | null;
  readonly toggleCard: (id: number) => void;
  readonly setHoveredCard: (id: number | null) => void;
}

export function useCertificationShowcaseLogic(): CertificationShowcaseLogic {
  const isMobile = useIsMobile();
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [isTablet, setIsTablet] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const checkIsTablet = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkIsTablet();
    window.addEventListener("resize", checkIsTablet);

    return () => window.removeEventListener("resize", checkIsTablet);
  }, []);

  const toggleCard = (id: number) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return {
    isMobile,
    isTablet,
    expandedCards,
    hoveredCard,
    toggleCard,
    setHoveredCard,
  };
}
