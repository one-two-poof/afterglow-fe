import { cn } from "@afterglow/utils";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUsers } from "@/hooks/use-users";

/**
 * 홈 화면 + PR 2 인프라 검증.
 *
 * `useUsers`(react-query + @afterglow/api) 결과를 표시해 워크스페이스 의존 연결,
 * Provider, 서버 상태 흐름이 앱에서 동작함을 확인한다. `cn`(@afterglow/utils)으로
 * 상태별 색 클래스를 합성한다.
 */
export default function HomeScreen() {
  const { data: users, isPending, isError, error } = useUsers();

  return (
    <SafeAreaView className="flex-1 bg-bg">
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
      </View>
    </SafeAreaView>
  );
}
