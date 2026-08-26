import { Text, View } from "react-native";

/**
 * PR 10(패널 골격) 단계 자리표시자. 각 스텝의 실제 UI는 PR 11·12에서 구현한다.
 * 훅(use-trip-plan-form)이 넘기는 prop 시그니처는 이미 확정돼 있으므로, 이후
 * PR은 이 자리에 실제 컴포넌트 본문만 채우면 된다.
 */
export function StepPlaceholder({ label }: { label: string }) {
  return (
    <View className="items-center justify-center gap-1 py-16">
      <Text className="text-body-md text-text">{label}</Text>
      <Text className="text-body-sm text-text-muted">준비 중 (PR 11·12)</Text>
    </View>
  );
}
