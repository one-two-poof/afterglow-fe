import type { RecommendedCourse } from "@/types/recommendation";

export interface ResultStepProps {
  course: RecommendedCourse;
  /** 현재 보고 있는 코스의 0-based 순번 */
  index: number;
  /** 전체 추천 코스 수 */
  total: number;
}

/** 결과 단계: 추천 코스(완성 일정) 하나를 rank 순으로 보여준다. */
export const ResultStep = ({ course, index, total }: ResultStepProps) => {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-surface-accent px-3 py-1 text-label-sm text-primary">
          추천 {course.rank}순위
        </span>
        <span className="text-body-sm text-text-muted">
          {index + 1} / {total}
        </span>
      </div>

      <p className="text-body-sm text-text-secondary">
        총 이동 거리 {course.total_distance_km}km
      </p>

      {course.daily_schedules.map((day) => (
        <div key={day.date} className="rounded-[12px] border border-border p-4">
          <p className="text-label-md text-text">{day.date}</p>
          <p className="text-body-sm text-text-muted">
            출발 · {day.start_location.name}
          </p>
          <ol className="mt-2 flex flex-col gap-1">
            {day.places.map((place) => (
              <li key={place.visit_order} className="text-body-sm text-text">
                {place.visit_order}. {place.place_name}
                <span className="text-text-muted">
                  {" · "}
                  {place.place_category}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
};
