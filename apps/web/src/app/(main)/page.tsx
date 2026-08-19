"use client";

import { MapLibreMap, TripPlanPanel } from "@/components";
import { getAccessToken } from "@/lib/auth";
import { useAdoptedCoursesStore } from "@/stores/adopted-courses-store";
import { courseToMarkers } from "@/types/recommendation";
import { Input, TagList } from "@afterglow/ui";
import { Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// 카테고리 필터 (코스 태그는 아래에서 채택 코스로 동적 생성)
const CATEGORY_ITEMS = [
  {
    value: "all",
    icon: "🏥",
    name: "전체",
  },
  {
    value: "hospital",
    icon: "🏥",
    name: "병원",
  },
];

export default function Home() {
  const router = useRouter();
  // 선택된 태그(카테고리 값 또는 채택 코스의 course_id)
  const [filter, setFilter] = useState("all");
  // TODO: 추후 검색 구현 시 Input value x 구현
  const [planOpen, setPlanOpen] = useState(false);

  // "내 코스" — 페이지 로드 시 GET으로 하이드레이트 예정(현재는 채택으로만 채워짐)
  const courses = useAdoptedCoursesStore((s) => s.courses);

  // 선택된 태그가 채택 코스면 그 장소들을 마커로. 카테고리면 마커 없음.
  const selectedCourse = courses.find((c) => c.course_id === filter);
  const markers = useMemo(
    () => (selectedCourse ? courseToMarkers(selectedCourse) : []),
    [selectedCourse],
  );

  // 여행 일정 만들기는 로그인 필요 — 미로그인 시 내 정보(로그인) 화면으로 이동
  const handleCreatePlan = () => {
    if (!getAccessToken()) {
      router.push("/my-page");
      return;
    }
    setPlanOpen(true);
  };

  return (
    <div className="relative h-full">
      <MapLibreMap markers={markers} />
      <Input
        className="absolute top-4 left-1/2 w-[95%] -translate-x-1/2"
        placeholder="병원 또는 관광지를 검색해보세요"
        leftIcon={<Search size={18} />}
        rightIcon={<X size={18} />}
        size="lg"
      />

      <TagList
        value={filter}
        onChange={setFilter}
        className="absolute bottom-0 p-5"
      >
        {CATEGORY_ITEMS.map((item) => (
          <TagList.Item key={item.value} value={item.value} icon={item.icon}>
            {item.name}
          </TagList.Item>
        ))}
        {courses.map((course) => (
          <TagList.Item key={course.course_id} value={course.course_id} icon="📍">
            {course.daily_schedules[0]?.start_location.name ?? course.course_id}
          </TagList.Item>
        ))}
      </TagList>

      <button
        type="button"
        aria-label="여행 일정 만들기"
        onClick={handleCreatePlan}
        className="absolute right-5 bottom-28 z-10 flex size-14 items-center justify-center rounded-full bg-action-primary text-on-action-primary shadow-md hover:bg-action-primary-hover focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none"
      >
        <Plus size={26} />
      </button>

      <TripPlanPanel open={planOpen} onClose={() => setPlanOpen(false)} />
    </div>
  );
}
