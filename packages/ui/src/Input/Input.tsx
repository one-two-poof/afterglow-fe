"use client";

import { cn } from "@afterglow/utils";
import { ComponentPropsWithRef, ReactNode, useId } from "react";

type Size = "sm" | "md" | "lg";

// 테두리·배경·포커스는 wrapper(field)가 담당하고, input은 투명 배경으로 둔다.
// 이렇게 하면 좌우 아이콘을 flex 형제로 넣어 정렬이 안정적이다.
const FIELD_BASE_STYLE =
  "flex w-full items-center rounded-[8px] border bg-neutral-0 text-text transition-colors focus-within:border-border-focus";

const FIELD_SIZE: Record<Size, string> = {
  sm: "h-[30px] gap-1.5 px-2 text-label-sm",
  md: "h-[35px] gap-2 px-3 text-label-md",
  lg: "h-[48px] gap-2 px-4 text-label-lg",
};

const INPUT_BASE_STYLE =
  "h-full w-full min-w-0 bg-transparent text-inherit outline-none placeholder:text-text-muted disabled:cursor-not-allowed disabled:text-text-disabled";

interface InputProps extends Omit<ComponentPropsWithRef<"input">, "size"> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: string;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  inputClassName?: string;
}

export const Input = ({
  label,
  helperText,
  error,
  size = "lg",
  leftIcon,
  rightIcon,
  id,
  className,
  inputClassName,
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

      <div
        className={cn(
          FIELD_BASE_STYLE,
          FIELD_SIZE[size],
          hasError && "border-border-error focus-within:border-border-error",
          disabled && "cursor-not-allowed bg-surface-muted text-text-disabled",
          className,
        )}
      >
        {leftIcon && (
          <span className="flex shrink-0 items-center text-text-muted">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={descriptionId}
          className={cn(INPUT_BASE_STYLE, inputClassName)}
          {...rest}
        />

        {rightIcon && (
          <span className="flex shrink-0 items-center text-text-muted">
            {rightIcon}
          </span>
        )}
      </div>

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
