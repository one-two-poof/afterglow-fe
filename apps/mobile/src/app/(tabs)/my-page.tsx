import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * 내 정보 탭. 실제 내용(프로필/설정/로그인)은 PR 19에서 이식한다.
 */
export default function MyPageScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-1 items-center justify-center gap-2 px-6">
        <Text className="text-heading-sm text-text">내 정보</Text>
        <Text className="text-body-sm text-text-muted">준비 중 (PR 19)</Text>
      </View>
    </SafeAreaView>
  );
}
