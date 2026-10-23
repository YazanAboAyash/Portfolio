/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenshotGalleryProps {
  screenshots: string[];
  projectTitle: string;
}

export function ScreenshotGallery({
  screenshots,
  projectTitle,
}: ScreenshotGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  }, [screenshots.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  }, [screenshots.length]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose, goToPrevious, goToNext]);

  return (
    <div className="space-y-3">
      {/* Main screenshot - clickable thumbnail */}
      <div
        className="relative aspect-video overflow-hidden rounded-lg border bg-muted cursor-zoom-in group"
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleOpen()}
        aria-label={`Open ${projectTitle} screenshot in fullscreen`}
      >
        <Image
          src={screenshots[currentIndex] || "/placeholder.svg"}
          alt={`${projectTitle} screenshot ${currentIndex + 1}`}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Fullscreen overlay — rendered via portal so fixed positioning is always relative to viewport */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-label={`${projectTitle} screenshot viewer`}
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
              onClick={handleClose}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation arrows - fixed position */}
            {screenshots.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-50 opacity-80 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-50 opacity-80 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  aria-label="Next screenshot"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Image container - stop propagation so clicking image doesn't close */}
            <div
              className="relative flex items-center justify-center p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={screenshots[currentIndex] || "/placeholder.svg"}
                alt={`${projectTitle} screenshot ${currentIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-[65vw] max-h-[75vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                priority
              />

              {/* Image counter */}
              {screenshots.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {screenshots.length}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* Thumbnail navigation - only show if multiple screenshots */}
      {screenshots.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {screenshots.map((screenshot, index) => (
            <button
              key={`screenshot-thumb-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative shrink-0 h-16 w-24 overflow-hidden rounded border-2 transition-all",
                currentIndex === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50",
              )}
            >
              <Image
                src={screenshot || "/placeholder.svg"}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
