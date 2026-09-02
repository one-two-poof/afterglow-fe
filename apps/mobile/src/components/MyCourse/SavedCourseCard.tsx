import { colors } from "@afterglow/tokens";
import { useRouter } from "expo-router";
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Route,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import {
  courseSummary,
  courseTitle,
  type SavedCourse,
} from "@/types/recommendation";

/** "YYYY-MM-DDTHH:mm..." → "M월 D일 저장" (앞 10자리만 파싱, 타임존 무관) */
const formatSavedAt = (iso: string) => {
  const [, month, day] = iso.slice(0, 10).split("-");
  if (!month || !day) return "";
  return `${Number(month)}월 ${Number(day)}일 저장`;
};

/** 요약 통계 한 칸 (아이콘 + 값). 카드 하단 메타 행에 3개 나열. */
function Stat({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      {icon}
      <Text className="text-label-sm text-text-secondary">{value}</Text>
    </View>
  );
}

/**
 * 저장된 코스 하나를 요약 카드로 보여준다. 탭하면 상세 화면(/course/[selectionId])으로.
 *
 * 구성: 출발지 아이콘 + 코스 제목(태그와 동일한 courseTitle 규칙) + 저장일,
 * 시술 태그, 그리고 일수·장소 수·총 거리 요약 메타 행.
 */
export function SavedCourseCard({ course }: { course: SavedCourse }) {
  const router = useRouter();
  const title = courseTitle(course);
  const { days, placeCount, distanceKm } = courseSummary(course);
  const savedAt = formatSavedAt(course.selectedAt);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title} 코스 상세 보기`}
      onPress={() => router.push(`/course/${course.selectionId}`)}
      className="rounded-[16px] border border-border bg-surface p-4 active:opacity-90"
    >
      <View className="flex-row items-center gap-3">
        <View className="size-11 items-center justify-center rounded-full bg-surface-accent">
          <MapPin size={20} color={colors.primary} />
        </View>
        <View className="min-w-0 flex-1">
          {savedAt ? (
            <Text className="text-caption text-text-muted">{savedAt}</Text>
          ) : null}
          <Text numberOfLines={1} className="text-label-lg text-text">
            {title}
          </Text>
        </View>
        <ChevronRight size={20} color={colors["text-muted"]} />
      </View>

      {course.treatment.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap gap-1.5">
          {course.treatment.map((t) => (
            <View
              key={`${t.name}-${t.date}`}
              className="rounded-full bg-surface-accent px-2.5 py-1"
            >
              <Text className="text-caption text-primary">{t.name}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View className="mt-3 flex-row items-center gap-4 border-t border-border pt-3">
        <Stat
          icon={<CalendarDays size={15} color={colors["text-muted"]} />}
          value={`${days}일`}
        />
        <Stat
          icon={<MapPin size={15} color={colors["text-muted"]} />}
          value={`${placeCount}곳`}
        />
        <Stat
          icon={<Route size={15} color={colors["text-muted"]} />}
          value={`${distanceKm}km`}
        />
      </View>
    </Pressable>
  );
}
