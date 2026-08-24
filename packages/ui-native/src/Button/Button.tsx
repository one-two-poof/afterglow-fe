import { cn } from "@afterglow/utils";
import { type ReactNode } from "react";
import { Pressable, Text, type PressableProps } from "react-native";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "secondary" | "ghost";

/**
 * 웹 `@afterglow/ui`의 Button을 RN으로 이식.
 *
 * 웹과의 차이:
 * - `<button>`/폴리모픽 `as` → `Pressable`. 라벨은 반드시 `<Text>`로 감싼다.
 * - 웹의 `hover:`는 네이티브에서 발생하지 않으므로, 눌림 피드백은 `active:`로 준다.
 * - 색은 컨테이너(Pressable)에, 타이포·글자색은 Text에 나눠 적용한다.
 *
 * 토큰 클래스(bg-action-primary, text-label-lg 등)는 웹과 동일하게 유지한다.
 */

const CONTAINER_BASE = "flex-row items-center justify-center";

const CONTAINER_SIZE: Record<Size, string> = {
  sm: "w-[80px] h-[30px]",
  md: "w-[100px] h-[35px]",
  lg: "w-[320px] h-[48px]",
};

const CONTAINER_BY_VARIANT: Record<Variant, string> = {
  primary: "bg-action-primary active:bg-action-primary-hover rounded-[8px]",
  secondary:
    "bg-action-secondary active:bg-action-secondary-hover border border-action-secondary-border rounded-[8px]",
  ghost: "bg-action-ghost active:bg-action-ghost-hover",
};

const LABEL_SIZE: Record<Size, string> = {
  sm: "text-label-sm",
  md: "text-label-md",
  lg: "text-label-lg",
};

const LABEL_BY_VARIANT: Record<Variant, string> = {
  primary: "text-on-action-primary",
  secondary: "text-on-action-secondary",
  ghost: "text-on-action-ghost",
};

export interface ButtonProps extends Omit<PressableProps, "children"> {
  variant: Variant;
  size?: Size;
  children: ReactNode;
  /** Pressable(컨테이너) 클래스 오버라이드 */
  className?: string;
  /** 라벨 Text 클래스 오버라이드 */
  textClassName?: string;
}

export const Button = ({
  variant,
  size = "lg",
  children,
  className,
  textClassName,
  disabled,
  ...rest
}: ButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cn(
        CONTAINER_BASE,
        CONTAINER_SIZE[size],
        disabled ? "bg-action-disabled rounded-[8px]" : CONTAINER_BY_VARIANT[variant],
        className,
      )}
      {...rest}
    >
      <Text
        className={cn(
          LABEL_SIZE[size],
          disabled ? "text-on-action-disabled" : LABEL_BY_VARIANT[variant],
          textClassName,
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
};
