import { cn } from "@afterglow/utils";
import {
  type ReactNode,
  createContext,
  useContext,
} from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

/**
 * 웹 `@afterglow/ui`의 TagList를 RN으로 이식.
 *
 * 웹과의 차이:
 * - 웹은 마우스 드래그로 가로 스크롤을 pointer 이벤트로 직접 구현했지만,
 *   RN은 `ScrollView`(horizontal)가 네이티브 가로 스크롤을 제공하므로
 *   그 드래그 로직 전체가 불필요하다 → 크게 단순화한다.
 * - `<button>` → `Pressable`, 라벨/아이콘 컨테이너는 `<Text>`/`<View>`.
 * - selected 여부에 따라 컨테이너 배경/글자색을 바꾼다(웹과 동일 토큰).
 *
 * Context로 `{value, onChange}`를 공유하고 `Object.assign`으로 `.Item`을 붙이는
 * 합성 컴포넌트 패턴은 웹과 동일하게 유지한다.
 */

interface TagListContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TagListContext = createContext<TagListContextValue | null>(null);

const useTagListContext = () => {
  const context = useContext(TagListContext);

  if (!context) {
    throw new Error("TagList.Item은 <TagList> 안에서만 사용할 수 있습니다.");
  }
  return context;
};

interface TagListRootProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

const TagListRoot = ({
  value,
  onChange,
  children,
  className,
  "aria-label": ariaLabel,
}: TagListRootProps) => {
  return (
    <TagListContext.Provider value={{ value, onChange }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="tablist"
        accessibilityLabel={ariaLabel}
      >
        {/* contentContainerClassName(NativeWind content-container 인터롭)은 css-interop의
            "변수 upgrade" 오탐 → 경고 직렬화 크래시를 유발한다. 안쪽 flex-row View에
            className을 주는 방식으로 동일 레이아웃을 얻으면서 그 경로를 피한다. */}
        <View className={cn("flex-row items-center gap-2", className)}>
          {children}
        </View>
      </ScrollView>
    </TagListContext.Provider>
  );
};

interface TagListItemProps {
  value: string;
  icon?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

const TagListItem = ({
  value,
  icon,
  children,
  disabled,
  className,
}: TagListItemProps) => {
  const { value: selectedValue, onChange } = useTagListContext();
  const selected = value === selectedValue;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onChange(value)}
      className={cn(
        "shrink-0 flex-row items-center gap-1.5 rounded-full px-4 py-2",
        disabled && "opacity-50",
        selected ? "bg-primary" : "bg-neutral-0 shadow-sm",
        className,
      )}
    >
      {icon != null && (
        <View aria-hidden className="items-center justify-center">
          {icon}
        </View>
      )}
      <Text
        className={cn(
          "text-label-md",
          selected ? "text-neutral-0" : "text-text-secondary",
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
};

export const TagList = Object.assign(TagListRoot, {
  Item: TagListItem,
});
