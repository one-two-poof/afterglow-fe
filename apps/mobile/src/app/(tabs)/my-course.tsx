import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * 내 코스 탭. 실제 내용(저장한 코스 목록)은 PR 17에서 이식한다.
 */
export default function MyCourseScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-1 items-center justify-center gap-2 px-6">
        <Text className="text-heading-sm text-text">내 코스</Text>
        <Text className="text-body-sm text-text-muted">준비 중 (PR 17)</Text>
      </View>
    </SafeAreaView>
  );
}
