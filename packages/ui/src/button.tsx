"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@afterglow/utils";

type Variant = "primary" | "secondary";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-foreground text-background hover:opacity-90",
  secondary: "border border-foreground/20 hover:bg-foreground/5",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
