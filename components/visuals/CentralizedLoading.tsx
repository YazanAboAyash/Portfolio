/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import React from "react";
import {LoadingSkeleton} from "@/components/visuals";
import { cn } from "@/lib/utils";

interface CentralizedLoadingProps {
  variant?: "page" | "card" | "list" | "profile" | "blog" | "dashboard";
  fullScreen?: boolean;
  title?: string;
  description?: string;
  className?: string;
  count?: number;
}

/**
 * Centralized loading component for the entire application
 * Can be used as a full-screen loading overlay or inline loading state
 * Follows Next.js loading.tsx conventions
 */
const CentralizedLoading: React.FC<CentralizedLoadingProps> = ({
  variant = "page",
  fullScreen = false,
  title,
  description,
  className,
  count,
}) => {
  const content = (
    <div className="space-y-4">
      {(title || description) && (
        <div className="text-center space-y-2 mb-8">
          {title && (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
              <h2 className="text-lg font-semibold text-muted-foreground ml-3">
                {title}
              </h2>
            </div>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <LoadingSkeleton
        variant={variant}
        {...(count !== undefined && { count })}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center",
          className
        )}
      >
        <div className="container max-w-4xl mx-auto px-4">{content}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full min-h-[calc(100vh-4rem)] items-center justify-center px-4",
        className
      )}
    >
      <div className="w-full max-w-4xl">{content}</div>
    </div>
  );
};

export default CentralizedLoading;
