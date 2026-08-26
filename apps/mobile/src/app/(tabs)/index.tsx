import { useToastStore } from "@afterglow/stores";
import { Button } from "@afterglow/ui-native";
import { cn } from "@afterglow/utils";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUsers } from "@/hooks/use-users";

/**
 * 홈 화면 + 전환 인프라 검증.
 *
 * - react-query + @afterglow/api (PR 2)
 * - ui-native Button (PR 3) + 전역 Toast (PR 7): 버튼을 누르면 토스트가 뜬다.
 */
export default function HomeScreen() {
  const { data: users, isPending, isError, error } = useUsers();
  const showToast = useToastStore((s) => s.show);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Text className="text-heading-md text-text">Hello afterglow 👋</Text>

        <View className="items-center gap-1">
          <Text className="text-label-sm text-text-muted">
            react-query + @afterglow/api 검증
          </Text>
          {isPending ? (
            <ActivityIndicator />
          ) : (
            <Text
              className={cn(
                "text-body-sm",
                isError ? "text-error" : "text-success-700",
              )}
            >
              {isError
                ? `에러: ${error.message}`
                : `유저 ${users.length}명 로드 성공`}
            </Text>
          )}
        </View>

        <Button variant="primary" onPress={() => showToast("토스트 테스트 🎉")}>
          토스트 띄우기
        </Button>
      </View>
    </SafeAreaView>
  );
}
