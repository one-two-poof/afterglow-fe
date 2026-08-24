import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * PR 1 검증 화면.
 *
 * 모든 스타일을 StyleSheet 대신 NativeWind className으로 지정했다. 색(bg-bg,
 * text-text-secondary, bg-primary 등)과 타이포(text-heading-md, text-body-sm 등)
 * 클래스가 `@afterglow/tokens` 값으로 실제 렌더되면 토큰 연결이 성공한 것.
 */
export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Text className="text-heading-md text-text">Hello afterglow 👋</Text>
        <Text className="text-body-sm text-text-secondary text-center">
          NativeWind + 디자인 토큰 연결 확인 — 이 텍스트/버튼 색이 토큰에서 온다.
        </Text>

        <Pressable className="mt-2 rounded-xl bg-primary px-5 py-3 active:bg-action-primary-hover">
          <Text className="text-label-lg text-on-action-primary">
            Primary 버튼
          </Text>
        </Pressable>

        <View className="mt-2 rounded-lg border border-border-accent bg-surface-accent px-4 py-2">
          <Text className="text-body-xs text-primary-700">surface-accent 배지</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
