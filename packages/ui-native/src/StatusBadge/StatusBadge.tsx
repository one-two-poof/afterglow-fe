import { Text, View } from "react-native";

/**
 * 웹 `@afterglow/ui`의 StatusBadge를 RN으로 이식.
 *
 * 웹과의 차이:
 * - 바깥 `<span>` → `View`(배경·모서리·패딩 담당), 라벨 `<span>` → `<Text>`(글자색·타이포 담당).
 * - `current > max`면 아무것도 렌더하지 않는다(웹과 동일).
 *
 * 토큰 클래스(bg-primary-100, text-label-sm, text-primary 등)는 웹과 동일하게 유지한다.
 */

interface StatusBadgeProps {
  current: number;
  max: number;
}

export const StatusBadge = ({ current, max }: StatusBadgeProps) => {
  if (current > max) {
    return null;
  }

  return (
    <View className="items-center justify-center self-start rounded-[12px] bg-primary-100 px-[10px] py-1">
      <Text className="text-label-sm text-primary">{`${current} / ${max} 단계`}</Text>
    </View>
  );
};
