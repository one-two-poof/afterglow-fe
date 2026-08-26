import { Text, View } from "react-native";

import { type SavedCourse } from "@/types/recommendation";

/** "YYYY-MM-DD" → "M월 D일" (타임존 영향 없이 문자열 파싱) */
const formatDay = (iso: string) => {
  const [, month, day] = iso.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
};

/** 저장된 코스 하나를 요약 카드로 보여준다. 웹 SavedCourseCard의 RN 버전. */
export function SavedCourseCard({ course }: { course: SavedCourse }) {
  return (
    <View className="rounded-[16px] border border-border bg-surface p-4">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 flex-row flex-wrap gap-1.5">
          {course.treatment.map((t) => (
            <View
              key={`${t.name}-${t.date}`}
              className="rounded-full bg-surface-accent px-2.5 py-1"
            >
              <Text className="text-caption text-primary">{t.name}</Text>
            </View>
          ))}
        </View>
        <Text className="text-body-sm text-text-muted">
          총 {course.total_distance_km}km
        </Text>
      </View>

      <View className="mt-3 gap-2">
        {course.daily_schedules.map((day) => (
          <View key={day.date} className="rounded-[12px] bg-surface-muted p-3">
            <View className="flex-row items-center justify-between gap-2">
              <Text className="text-label-md text-text">
                {formatDay(day.date)}
              </Text>
              <Text
                numberOfLines={1}
                className="flex-1 text-right text-caption text-text-muted"
              >
                출발 · {day.start_location.name}
              </Text>
            </View>
            <View className="mt-2 gap-1">
              {day.places.map((place) => (
                <Text
                  key={place.visit_order}
                  className="text-body-sm text-text"
                >
                  <Text className="text-text-muted">{place.visit_order}.</Text>{" "}
                  {place.place_name}
                  {place.place_category ? (
                    <Text className="text-text-muted">
                      {" · "}
                      {place.place_category}
                    </Text>
                  ) : null}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
