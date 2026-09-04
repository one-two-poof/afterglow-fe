import { colors } from "@afterglow/tokens";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/i18n/i18n-provider";

/**
 * 서브 화면 공용 상단 헤더 (뒤로가기 + 제목).
 * 루트 Stack이 headerShown:false라, 스택 위로 푸시되는 화면들이 각자 이 헤더를 쓴다.
 * (코스 상세 · 고객센터 · 이용약관 등에서 공유)
 */
export function ScreenHeader({ title }: { title: string }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <SafeAreaView edges={["top"]} className="bg-bg">
      <View className="flex-row items-center gap-2 border-b border-border px-2 py-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          onPress={() => router.back()}
          hitSlop={8}
          className="size-10 items-center justify-center rounded-full active:bg-surface-muted"
        >
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text numberOfLines={1} className="flex-1 text-label-lg text-text">
          {title}
        </Text>
      </View>
    </SafeAreaView>
  );
}
