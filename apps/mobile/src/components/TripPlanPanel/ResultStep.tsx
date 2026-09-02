import { Text, View } from "react-native";

import { CourseItinerary } from "@/components/MyCourse/CourseItinerary";
import { type RecommendedCourse } from "@/types/recommendation";

export interface ResultStepProps {
  course: RecommendedCourse;
  /** 현재 보고 있는 코스의 0-based 순번 */
  index: number;
  /** 전체 추천 코스 수 */
  total: number;
}

/**
 * 결과 단계: 추천 코스(완성 일정) 하나를 rank 순으로 보여준다.
 * 본문(요약·시술·타임라인)은 저장 코스 상세와 동일한 CourseItinerary를 공유하고,
 * 여기서는 추천 순위 배지 + 진행(현재/전체)만 상단에 얹는다.
 */
export function ResultStep({ course, index, total }: ResultStepProps) {
  return (
    <View className="gap-4 pt-2">
      <View className="flex-row items-center justify-between">
        <View className="rounded-full bg-surface-accent px-3 py-1">
          <Text className="text-label-sm text-primary">
            추천 {course.rank}순위
          </Text>
        </View>
        <Text className="text-body-sm text-text-muted">
          {index + 1} / {total}
        </Text>
      </View>

      <CourseItinerary course={course} />
    </View>
  );
}
