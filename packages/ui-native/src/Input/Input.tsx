import { colors } from "@afterglow/tokens";
import { cn } from "@afterglow/utils";
import { type ReactNode, useState } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

type Size = "sm" | "md" | "lg";

/**
 * 웹 `@afterglow/ui`의 Input을 RN으로 이식.
 *
 * 웹과의 차이:
 * - `<div>`→`View`, `<label>`→`<Text>`, `<input>`→`TextInput`. 라벨/설명 문자열은 반드시 `<Text>`로 감싼다.
 * - 웹의 `focus-within:border-border-focus`는 네이티브에 없다. `useState`로 focused 상태를 두고
 *   TextInput의 `onFocus`/`onBlur`로 토글해 field 컨테이너 border 클래스를 조건부 적용한다.
 * - 웹의 `placeholder:text-text-muted`는 없다. TextInput의 `placeholderTextColor` prop에
 *   토큰 값(colors["text-muted"])을 넘겨 색을 지정한다. (className으로 placeholder 색을 못 준다.)
 * - `useId`/`htmlFor`/`aria-*`는 RN에 없어 제거했다. 접근성은 `accessibilityLabel`로 대체 가능.
 *
 * 토큰 클래스(bg-neutral-0, border-border-error, text-label-sm 등)와
 * size별 높이/패딩/타이포 값은 웹과 동일하게 유지한다.
 */

// 테두리·배경·포커스는 wrapper(field)가 담당하고, TextInput은 투명 배경으로 둔다.
// 이렇게 하면 좌우 아이콘을 flex 형제로 넣어 정렬이 안정적이다.
const FIELD_BASE_STYLE =
  "flex-row w-full items-center rounded-[8px] border bg-neutral-0";

const FIELD_SIZE: Record<Size, string> = {
  sm: "h-[30px] gap-1.5 px-2",
  md: "h-[35px] gap-2 px-3",
  lg: "h-[48px] gap-2 px-4",
};

// 타이포는 문자열을 렌더하는 TextInput(=Text 계열)에 적용해야 하므로 input 쪽으로 옮겼다.
const INPUT_SIZE: Record<Size, string> = {
  sm: "text-label-sm",
  md: "text-label-md",
  lg: "text-label-lg",
};

const INPUT_BASE_STYLE = "flex-1 min-w-0 bg-transparent text-text";

export interface InputProps
  extends Omit<TextInputProps, "editable" | "placeholderTextColor"> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: string;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** 비활성화 여부. 웹의 `disabled`를 RN `editable`로 매핑한다. */
  disabled?: boolean;
  /** 바깥 컨테이너(View) 클래스 오버라이드 */
  className?: string;
  /** field(테두리·배경) View 클래스 오버라이드 */
  fieldClassName?: string;
  /** TextInput 클래스 오버라이드 */
  inputClassName?: string;
}

export const Input = ({
  label,
  helperText,
  error,
  size = "lg",
  leftIcon,
  rightIcon,
  disabled,
  className,
  fieldClassName,
  inputClassName,
  onFocus,
  onBlur,
  ...rest
}: InputProps) => {
  // focus-within을 대체하는 상태. onFocus/onBlur로 토글한다.
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const description = error ?? helperText;

  return (
    <View className={cn("flex flex-col gap-1", className)}>
      {label && <Text className="text-label-sm text-text">{label}</Text>}

      <View
        className={cn(
          FIELD_BASE_STYLE,
          FIELD_SIZE[size],
          // error가 우선, 그다음 focused. 둘 다 아니면 기본 border(border-border) 사용.
          hasError
            ? "border-border-error"
            : focused
              ? "border-border-focus"
              : "border-border",
          disabled && "bg-surface-muted",
          fieldClassName,
        )}
      >
        {leftIcon && (
          <View className="shrink-0 items-center justify-center">
            {leftIcon}
          </View>
        )}

        <TextInput
          editable={!disabled}
          placeholderTextColor={colors["text-muted"]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            INPUT_BASE_STYLE,
            INPUT_SIZE[size],
            disabled && "text-text-disabled",
            inputClassName,
          )}
          {...rest}
        />

        {rightIcon && (
          <View className="shrink-0 items-center justify-center">
            {rightIcon}
          </View>
        )}
      </View>

      {description && (
        <Text
          className={cn(
            "text-body-xs",
            hasError ? "text-error" : "text-text-muted",
          )}
        >
          {description}
        </Text>
      )}
    </View>
  );
};
