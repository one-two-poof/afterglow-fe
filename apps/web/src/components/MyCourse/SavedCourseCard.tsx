import type { SavedCourse } from "@/types/recommendation";

/** "YYYY-MM-DD" → "M월 D일" (타임존 영향 없이 문자열 파싱) */
const formatDay = (iso: string) => {
  const [, month, day] = iso.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
};

/** 저장된 코스 하나를 요약 카드로 보여준다. */
export const SavedCourseCard = ({ course }: { course: SavedCourse }) => (
  <article className="rounded-[16px] border border-border bg-surface p-4 shadow-sm">
    <div className="flex items-start justify-between gap-2">
      <div className="flex flex-wrap gap-1.5">
        {course.treatment.map((t) => (
          <span
            key={`${t.name}-${t.date}`}
            className="rounded-full bg-surface-accent px-2.5 py-1 text-caption text-primary"
          >
            {t.name}
          </span>
        ))}
      </div>
      <span className="shrink-0 text-body-sm text-text-muted">
        총 {course.total_distance_km}km
      </span>
    </div>

    <div className="mt-3 flex flex-col gap-2">
      {course.daily_schedules.map((day) => (
        <div key={day.date} className="rounded-[12px] bg-surface-muted/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-label-md text-text">{formatDay(day.date)}</p>
            <p className="truncate text-caption text-text-muted">
              출발 · {day.start_location.name}
            </p>
          </div>
          <ol className="mt-2 flex flex-col gap-1">
            {day.places.map((place, i) => (
              <li key={`${place.id}-${i}`} className="text-body-sm text-text">
                <span className="text-text-muted">{i + 1}.</span>{" "}
                {place.placeName}
                {place.categoryName && (
                  <span className="text-text-muted"> · {place.categoryName}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  </article>
);
