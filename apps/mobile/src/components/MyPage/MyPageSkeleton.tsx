import { View } from "react-native";

/** 인증 확인 / 내 정보 로딩 중 스켈레톤. animate-pulse 대신 정적 회색 박스. */
export function MyPageSkeleton() {
  return (
    <View accessibilityLabel="내 정보 불러오는 중">
      <View className="flex-row items-center gap-4 bg-surface px-5 py-6">
        <View className="size-20 rounded-full bg-surface-muted" />
        <View className="flex-1 gap-2">
          <View className="h-6 w-40 rounded bg-surface-muted" />
          <View className="h-4 w-56 rounded bg-surface-muted" />
        </View>
      </View>

      <View className="mt-2 bg-surface">
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} className="border-b border-border px-5 py-4">
            <View className="h-5 w-32 rounded bg-surface-muted" />
            <View className="mt-2 h-4 w-48 rounded bg-surface-muted" />
          </View>
        ))}
      </View>
    </View>
  );
}
