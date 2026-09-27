/**
 * Reusable CTA Button Component
 * @author ColdByDefault
 * @copyright 2026 ColdByDefault. All Rights Reserved.
*/

"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { servicesPageData } from "@/data/hubs/servicesData";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface CTAButtonProps {
  /** Button text label */
  readonly label: string;
  /** Optional variant for the button */
  readonly variant?: ButtonVariants["variant"];
  /** Optional size for the button */
  readonly size?: ButtonVariants["size"];
  /** Optional custom className */
  readonly className?: string;
  /** Whether to show the Mail icon */
  readonly showIcon?: boolean;
  /** Optional onClick handler for when the link is clicked */
  readonly onClick?: () => void;
  /** Optional custom link (defaults to servicesPageData.contactLink) */
  readonly href?: string;
}

/**
 * Dynamic CTA button component for getting in touch.
 * Uses the mailto contact link from servicesData by default, which opens the
 * visitor's own mail app — no third-party service is involved.
 */
export function CTAButton({
  label,
  variant = "default",
  size,
  className = "",
  showIcon = true,
  onClick,
  href = servicesPageData.contactLink,
}: CTAButtonProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={href} {...(onClick && { onClick })}>
        {showIcon && <Mail className="h-4 w-4 mr-2" aria-hidden="true" />}
        {label}
      </a>
    </Button>
  );
}
