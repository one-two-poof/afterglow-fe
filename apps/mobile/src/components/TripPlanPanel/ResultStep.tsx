import { Text, View } from "react-native";

import { type RecommendedCourse } from "@/types/recommendation";

export interface ResultStepProps {
  course: RecommendedCourse;
  /** 현재 보고 있는 코스의 0-based 순번 */
  index: number;
  /** 전체 추천 코스 수 */
  total: number;
}

/** 결과 단계: 추천 코스(완성 일정) 하나를 rank 순으로 보여준다. 웹 ResultStep의 RN 버전. */
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

      <Text className="text-body-sm text-text-secondary">
        총 이동 거리 {course.total_distance_km}km
      </Text>

      {course.daily_schedules.map((day) => (
        <View key={day.date} className="rounded-[12px] border border-border p-4">
          <Text className="text-label-md text-text">{day.date}</Text>
          <Text className="text-body-sm text-text-muted">
            출발 · {day.start_location.name}
          </Text>
          <View className="mt-2 gap-1">
            {day.places.map((place) => (
              <Text
                key={place.visit_order}
                className="text-body-sm text-text"
              >
                {place.visit_order}. {place.place_name}
                <Text className="text-text-muted">
                  {" · "}
                  {place.place_category}
                </Text>
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
