import { cn } from "@afterglow/utils";
import { ReactNode } from "react";

type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  size: BadgeSize;
}

const STYLE_BY_SIZE = {
  sm: "w-[50px] text-label-sm",
  md: "w-25 text-label-sm",
  lg: "w-[150px] text-label-md",
};

export const Badge = ({ children, size = "md" }: BadgeProps) => {
  return (
    <span
      className={cn(
        "flex h-6 items-center justify-center rounded-[30px] bg-primary text-neutral-50",
        STYLE_BY_SIZE[size],
      )}
    >
      {children}
    </span>
  );
};
