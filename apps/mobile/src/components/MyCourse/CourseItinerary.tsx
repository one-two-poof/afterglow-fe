import { colors } from "@afterglow/tokens";
import { CalendarDays, Home, MapPin, Route, Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";

import {
  courseSummary,
  type DailySchedule,
  type RecommendedCourse,
  type RecommendedPlace,
} from "@/types/recommendation";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** "YYYY-MM-DD" → "M월 D일 (요일)" (정오 기준으로 만들어 타임존 영향 제거) */
const formatDayLong = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const weekday = WEEKDAYS[new Date(y, m - 1, d, 12).getDay()];
  return `${m}월 ${d}일 (${weekday})`;
};

/** 요약 통계 카드 한 칸 (아이콘 + 값 + 라벨). */
function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View className="flex-1 items-center gap-1 rounded-[12px] bg-surface-muted py-3">
      {icon}
      <Text className="text-label-lg text-text">{value}</Text>
      <Text className="text-caption text-text-muted">{label}</Text>
    </View>
  );
}

/** 장소 메타 정보 칩 (카테고리 · 실내/실외 · 도보 난이도). */
function MetaChip({ children }: { children: string }) {
  return (
    <View className="rounded-full bg-surface-muted px-2 py-0.5">
      <Text className="text-caption text-text-secondary">{children}</Text>
    </View>
  );
}

/** 타임라인의 한 노드(출발지 또는 방문 장소). 왼쪽 레일(원+세로선) + 오른쪽 내용. */
function TimelineNode({
  isLast,
  node,
  children,
}: {
  isLast: boolean;
  /** 원 안에 들어갈 표시 (숫자 또는 아이콘) */
  node: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row gap-3">
      <View className="items-center">
        <View className="size-7 items-center justify-center rounded-full border border-primary bg-surface">
          {node}
        </View>
        {/* 마지막 노드가 아니면 다음 노드로 이어지는 세로선 */}
        <View
          className={isLast ? "w-px" : "w-px flex-1 bg-border"}
          accessibilityElementsHidden
        />
      </View>
      <View className="min-w-0 flex-1 pb-5">{children}</View>
    </View>
  );
}

/** 방문 장소 한 곳. */
function PlaceNode({
  place,
  isLast,
}: {
  place: RecommendedPlace;
  isLast: boolean;
}) {
  const meta = [
    place.place_category,
    place.is_indoor === 1 ? "실내" : "실외",
    place.walk_hard ? `도보 ${place.walk_hard}/5` : "",
  ].filter(Boolean);

  return (
    <TimelineNode
      isLast={isLast}
      node={
        <Text className="text-label-sm text-primary">{place.visit_order}</Text>
      }
    >
      {place.dist_to_prev_km > 0 ? (
        <Text className="text-caption text-text-muted">
          이전 지점서 {place.dist_to_prev_km}km 이동
        </Text>
      ) : null}
      <Text className="text-label-lg text-text">{place.place_name}</Text>
      {meta.length > 0 ? (
        <View className="mt-1.5 flex-row flex-wrap gap-1.5">
          {meta.map((m) => (
            <MetaChip key={m}>{m}</MetaChip>
          ))}
        </View>
      ) : null}
    </TimelineNode>
  );
}

/** 하루치 일정 섹션 (날짜 헤더 + 시술 안내 + 출발지 + 방문 장소 타임라인). */
function DaySection({
  day,
  index,
  treatments,
}: {
  day: DailySchedule;
  index: number;
  treatments: RecommendedCourse["treatment"];
}) {
  const dayTreatments = treatments.filter((t) => t.date === day.date);

  return (
    <View className="rounded-[16px] border border-border bg-surface p-4">
      <View className="mb-3 flex-row items-baseline gap-2">
        <Text className="text-overline text-primary">DAY {index + 1}</Text>
        <Text className="text-label-md text-text">{formatDayLong(day.date)}</Text>
      </View>

      {dayTreatments.length > 0 ? (
        <View className="mb-3 flex-row flex-wrap items-center gap-1.5 rounded-[12px] bg-surface-accent px-3 py-2">
          <Sparkles size={14} color={colors.primary} />
          {dayTreatments.map((t) => (
            <Text key={t.name} className="text-label-sm text-primary">
              {t.name}
            </Text>
          ))}
          <Text className="text-caption text-text-secondary">시술 예정</Text>
        </View>
      ) : null}

      {/* 출발지 노드 */}
      <TimelineNode
        isLast={day.places.length === 0}
        node={<Home size={14} color={colors.primary} />}
      >
        <Text className="text-caption text-primary">출발</Text>
        <Text className="text-label-lg text-text">{day.start_location.name}</Text>
      </TimelineNode>

      {day.places.map((place, i) => (
        <PlaceNode
          key={place.visit_order}
          place={place}
          isLast={i === day.places.length - 1}
        />
      ))}
    </View>
  );
}

/**
 * 코스 하나의 본문(요약 통계 + 시술 태그 + 날짜별 일정 타임라인).
 * 저장 코스 상세(CourseDetail)와 추천 결과(ResultStep)가 동일한 표현을 공유하도록
 * 분리한 재사용 컴포넌트. RecommendedCourse면 되므로 SavedCourse도 그대로 받는다.
 */
export function CourseItinerary({ course }: { course: RecommendedCourse }) {
  const { days, placeCount, distanceKm } = courseSummary(course);

  return (
    <View className="gap-4">
      {course.treatment.length > 0 ? (
        <View className="flex-row flex-wrap gap-1.5">
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

      <View className="flex-row gap-2">
        <StatCard
          icon={<CalendarDays size={18} color={colors.primary} />}
          value={`${days}일`}
          label="일정"
        />
        <StatCard
          icon={<MapPin size={18} color={colors.primary} />}
          value={`${placeCount}곳`}
          label="방문지"
        />
        <StatCard
          icon={<Route size={18} color={colors.primary} />}
          value={`${distanceKm}km`}
          label="총 이동"
        />
      </View>

      {course.daily_schedules.map((day, i) => (
        <DaySection
          key={day.date}
          day={day}
          index={i}
          treatments={course.treatment}
        />
      ))}
    </View>
  );
}
