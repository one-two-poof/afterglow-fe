import { Button } from "@afterglow/ui-native";
import { colors } from "@afterglow/tokens";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAccessToken } from "@/hooks/use-access-token";
import { useRecommendations } from "@/hooks/use-recommendations";
import { courseTitle } from "@/types/recommendation";

import { CourseItinerary } from "./CourseItinerary";
import { MyCourseSkeleton } from "./MyCourseSkeleton";

/** 상단 고정 헤더 (뒤로가기 + 제목). */
function DetailHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <SafeAreaView edges={["top"]} className="bg-bg">
      <View className="flex-row items-center gap-2 border-b border-border px-2 py-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
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

/** 코스를 찾지 못했을 때(캐시 없음/삭제됨 등)의 안내 화면. */
function NotFound() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-bg">
      <DetailHeader title="코스 상세" />
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <View className="items-center gap-2">
          <Text className="text-heading-sm text-text">코스를 찾을 수 없어요</Text>
          <Text className="text-center text-body-sm text-text-muted">
            목록에서 다시 선택해 주세요.
          </Text>
        </View>
        <Button variant="secondary" size="md" onPress={() => router.back()}>
          목록으로
        </Button>
      </View>
    </View>
  );
}

/**
 * 저장된 코스 상세 화면. 헤더 + 제목 + 공통 CourseItinerary(요약·시술·타임라인).
 * 데이터는 목록 화면에서 이미 채워진 useRecommendations 캐시에서 selectionId로 찾는다.
 */
export function CourseDetail({ selectionId }: { selectionId: number }) {
  const token = useAccessToken();
  const isAuthed = typeof token === "string";
  const { data: courses = [], isLoading } = useRecommendations(isAuthed);

  const course = courses.find((c) => c.selectionId === selectionId);

  if (token === undefined || (isAuthed && isLoading && !course)) {
    return (
      <View className="flex-1 bg-bg">
        <DetailHeader title="코스 상세" />
        <MyCourseSkeleton />
      </View>
    );
  }

  if (!course) {
    return <NotFound />;
  }

  const title = courseTitle(course);

  return (
    <View className="flex-1 bg-bg">
      <DetailHeader title={title} />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5 pb-10">
        <Text className="text-heading-sm text-text">{title}</Text>
        <CourseItinerary course={course} />
      </ScrollView>
    </View>
  );
}
