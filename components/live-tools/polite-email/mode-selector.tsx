/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { AppMode } from "@/types/live-tools/email-rewriter";
import { Mail, MessageSquareText } from "lucide-react";

interface ModeSelectorProps {
  value: AppMode;
  onChange: (value: AppMode) => void;
  disabled?: boolean;
}

const modes = [
  { value: "analyze", label: "Analyze & Reply", icon: Mail },
  { value: "rewrite", label: "Rewrite", icon: MessageSquareText },
] as const;

// Segmented control: a radio group, not a tablist — the mode drives sibling
// fields rather than a tab panel, so tab semantics would leave aria-controls
// pointing at an element that never exists.
export function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(v) => onChange(v as AppMode)}
      disabled={disabled}
      aria-label="Mode"
      className="bg-muted text-muted-foreground grid h-9 w-full grid-cols-2 items-center justify-center rounded-lg p-0.75"
    >
      {modes.map(({ value: modeValue, label, icon: Icon }) => (
        <RadioGroupPrimitive.Item
          key={modeValue}
          value={modeValue}
          className="data-[state=checked]:bg-background dark:data-[state=checked]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=checked]:border-input dark:data-[state=checked]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
