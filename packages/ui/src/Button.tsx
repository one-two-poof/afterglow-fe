"use client";

import { cn } from "@afterglow/utils";
import { ReactNode, ElementType, ComponentPropsWithRef } from "react";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "secondary" | "ghost";

const BUTTON_BASE_STYLE =
  "flex items-center justify-center disabled:bg-action-disabled disabled:text-on-action-disabled cursor-pointer";

const BUTTON_SIZE: Record<Size, string> = {
  sm: "w-[80px] h-[30px] text-label-sm",
  md: "w-[100px] h-[35px] text-label-md",
  lg: "w-[320px] h-[48px] text-label-lg",
};

const STYLE_BY_VARIANT: Record<Variant, string> = {
  primary:
    "bg-action-primary text-on-action-primary hover:bg-action-primary-hover rounded-[8px]",
  secondary:
    "bg-action-secondary text-on-action-secondary hover:bg-action-secondary-hover border border-action-secondary-border rounded-[8px]",
  ghost: "bg-action-ghost text-on-action-ghost hover:bg-action-ghost-hover",
};

export interface ButtonOwnProps<T extends ElementType> {
  as?: T;
  variant: Variant;
  size?: Size;
  children: ReactNode;
}

type ButtonProps<T extends ElementType> = ButtonOwnProps<T> &
  Omit<ComponentPropsWithRef<T>, keyof ButtonOwnProps<T>>;

export const Button = <T extends ElementType = "button">({
  variant,
  children,
  size = "lg",
  as,
  className,
  ...rest
}: ButtonProps<T>) => {
  const Component = as || "button";
  return (
    <Component
      className={cn(
        BUTTON_BASE_STYLE,
        BUTTON_SIZE[size],
        STYLE_BY_VARIANT[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
};
