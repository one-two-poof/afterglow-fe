"use client";

import { cn } from "@afterglow/utils";
import { ComponentPropsWithRef, ReactNode, useId } from "react";

type Size = "sm" | "md" | "lg";

const INPUT_BASE_STYLE =
  "w-full rounded-[8px] border bg-neutral-0 text-text placeholder:text-text-muted outline-none transition-colors focus:border-border-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-disabled";

const INPUT_SIZE: Record<Size, string> = {
  sm: "h-[30px] px-2 text-label-sm",
  md: "h-[35px] px-3 text-label-md",
  lg: "h-[48px] px-4 text-label-lg",
};

interface InputProps extends Omit<ComponentPropsWithRef<"input">, "size"> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: string;
  size?: Size;
}

export const Input = ({
  label,
  helperText,
  error,
  size = "lg",
  id,
  className,
  disabled,
  ...rest
}: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasError = Boolean(error);
  const description = error ?? helperText;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-label-sm text-text">
          {label}
        </label>
      )}

      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={descriptionId}
        className={cn(
          INPUT_BASE_STYLE,
          INPUT_SIZE[size],
          hasError && "border-border-error focus:border-border-error",
          className,
        )}
        {...rest}
      />

      {description && (
        <span
          id={descriptionId}
          className={cn(
            "text-body-xs",
            hasError ? "text-error" : "text-text-muted",
          )}
        >
          {description}
        </span>
      )}
    </div>
  );
};
