import { cn } from "@afterglow/utils";
import { HTMLAttributes, ReactNode } from "react";

type ButtonSize = "sm" | "md" | "lg";

const BUTTON_BASE_STYLE = "";

const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: "flex",
  md: "",
  lg: "",
};

export interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: ButtonSize;
}

export const Button = ({
  children,
  size = "lg",
  className,
  ...rest
}: ButtonProps) => {
  return (
    <button className={cn(BUTTON_SIZE[size], BUTTON_BASE_STYLE, className)}>
      {children}
    </button>
  );
};
