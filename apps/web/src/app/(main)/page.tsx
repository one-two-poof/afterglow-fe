"use client";

import { MapLibreMap, TripPlanPanel } from "@/components";
import { useDebounce } from "@/hooks/use-debounce";
import { usePlaces } from "@/hooks/use-places";
import { getAccessToken } from "@/lib/auth";
import { fetchCourseRouteLines, type RouteLine } from "@/lib/route";
import { useAdoptedCoursesStore } from "@/stores/adopted-courses-store";
import {
  courseToMarkers,
  type RecommendedCourse,
} from "@/types/recommendation";
import { Input, TagList } from "@afterglow/ui";
import { Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

// 임시: 경로 그리기 테스트용 목 코스들 (서울 각지). mapX=경도/mapY=위도.
// TODO: 제거 — 실제 GET /my-courses 하이드레이션으로 대체.
const MOCK_COURSES: RecommendedCourse[] = [
  {
    rank: 1,
    course_id: "MOCK-001",
    total_distance_km: 3.1,
    treatment: [{ name: "리프팅", date: "2026-06-08" }],
    daily_schedules: [
      {
        date: "2026-06-07",
        start_location: {
          name: "도미인 서울 강남",
          mapX: 127.0276,
          mapY: 37.4999,
        },
        places: [
          {
            visit_order: 1,
            place_name: "봉은사",
            place_category: "명소",
            mapX: 127.0577,
            mapY: 37.5153,
            is_indoor: 0,
            walk_hard: 2,
            dist_to_prev_km: 0,
          },
          {
            visit_order: 2,
            place_name: "스타필드 코엑스몰",
            place_category: "쇼핑",
            mapX: 127.0589,
            mapY: 37.5127,
            is_indoor: 1,
            walk_hard: 1,
            dist_to_prev_km: 0.4,
          },
        ],
      },
    ],
  },
  {
    rank: 1,
    course_id: "MOCK-002",
    total_distance_km: 2.4,
    treatment: [{ name: "보톡스", date: "2026-06-09" }],
    daily_schedules: [
      {
        date: "2026-06-07",
        start_location: { name: "명동", mapX: 126.985, mapY: 37.5637 },
        places: [
          {
            visit_order: 1,
            place_name: "명동성당",
            place_category: "명소",
            mapX: 126.9873,
            mapY: 37.5633,
            is_indoor: 0,
            walk_hard: 2,
            dist_to_prev_km: 0,
          },
          {
            visit_order: 2,
            place_name: "남산서울타워",
            place_category: "명소",
            mapX: 126.9882,
            mapY: 37.5512,
            is_indoor: 0,
            walk_hard: 4,
            dist_to_prev_km: 1.4,
          },
        ],
      },
    ],
  },
  {
    rank: 1,
    course_id: "MOCK-003",
    total_distance_km: 1.8,
    treatment: [{ name: "제모", date: "2026-06-08" }],
    daily_schedules: [
      {
        date: "2026-06-07",
        start_location: { name: "홍대입구역", mapX: 126.9241, mapY: 37.5572 },
        places: [
          {
            visit_order: 1,
            place_name: "연남동 경의선숲길",
            place_category: "명소",
            mapX: 126.9255,
            mapY: 37.5605,
            is_indoor: 0,
            walk_hard: 1,
            dist_to_prev_km: 0,
          },
          {
            visit_order: 2,
            place_name: "연트럴파크",
            place_category: "명소",
            mapX: 126.9268,
            mapY: 37.5628,
            is_indoor: 0,
            walk_hard: 1,
            dist_to_prev_km: 0.3,
          },
        ],
      },
    ],
  },
  {
    rank: 1,
    course_id: "MOCK-004",
    total_distance_km: 4.2,
    treatment: [{ name: "필러", date: "2026-06-10" }],
    daily_schedules: [
      {
        date: "2026-06-07",
        start_location: { name: "경복궁", mapX: 126.977, mapY: 37.5796 },
        places: [
          {
            visit_order: 1,
            place_name: "인사동",
            place_category: "쇼핑",
            mapX: 126.9857,
            mapY: 37.574,
            is_indoor: 0,
            walk_hard: 2,
            dist_to_prev_km: 0,
          },
          {
            visit_order: 2,
            place_name: "광장시장",
            place_category: "맛집",
            mapX: 126.9997,
            mapY: 37.5701,
            is_indoor: 1,
            walk_hard: 2,
            dist_to_prev_km: 1.3,
          },
        ],
      },
      {
        date: "2026-06-08",
        start_location: { name: "북촌한옥마을", mapX: 126.9849, mapY: 37.5826 },
        places: [
          {
            visit_order: 1,
            place_name: "삼청동길",
            place_category: "명소",
            mapX: 126.9812,
            mapY: 37.5844,
            is_indoor: 0,
            walk_hard: 3,
            dist_to_prev_km: 0,
          },
        ],
      },
    ],
  },
];

export default function Home() {
  const router = useRouter();
  // 선택된 태그(카테고리 값 또는 채택 코스의 course_id)
  const [filter, setFilter] = useState("all");
  const [planOpen, setPlanOpen] = useState(false);

  // 장소 검색: 입력값을 300ms 디바운스해 요청. 빈 문자열이면 요청하지 않음.
  const [search, setSearch] = useState("");
  // 드롭다운 열림 여부. 검색어와 분리해, 결과 선택 시 닫아 재요청을 막는다.
  const [searchOpen, setSearchOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  // 선택으로 닫힌 상태(searchOpen=false)에서는 요청하지 않는다.
  const searchEnabled = searchOpen && debouncedSearch.trim() !== "";
  const { data: searchResults = [], isFetching: isSearching } = usePlaces(
    debouncedSearch,
    { enabled: searchEnabled },
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSearchOpen(true);
  };

  const clearSearch = () => {
    setSearch("");
    setSearchOpen(false);
  };

  // 결과 선택: 입력값만 그 장소명으로 바꾸고, 드롭다운을 닫아 재요청을 막는다.
  const selectPlace = (placeName: string) => {
    setSearch(placeName);
    setSearchOpen(false);
  };

  const showSearchResults = searchOpen && search.trim() !== "";

  // "내 코스" — 페이지 로드 시 GET으로 하이드레이트 예정(현재는 채택으로만 채워짐)
  const courses = useAdoptedCoursesStore((s) => s.courses);
  const adopt = useAdoptedCoursesStore((s) => s.adopt);

  // 임시: 목 코스들을 스토어에 넣어 코스 Tag 생성 (경로 그리기 테스트). TODO: 제거
  useEffect(() => {
    MOCK_COURSES.forEach((course) => adopt(course));
  }, [adopt]);

  // 선택된 태그가 채택 코스면 그 장소들을 마커로. 카테고리면 마커 없음.
  const selectedCourse = courses.find((c) => c.course_id === filter);
  const markers = useMemo(
    () => (selectedCourse ? courseToMarkers(selectedCourse) : []),
    [selectedCourse],
  );

  // 코스 선택 시 경로 API로 구간별 경로를 받아 그린다. 선택 해제 시 비운다.
  const [routeLines, setRouteLines] = useState<RouteLine[]>([]);
  useEffect(() => {
    if (!selectedCourse) return;
    let cancelled = false;
    fetchCourseRouteLines(selectedCourse)
      .then((lines) => {
        if (!cancelled) {
          setRouteLines(lines);
        }
      })
      .catch((err) => {
        console.error("[route] 경로 요청 실패", err);
        if (!cancelled) {
          setRouteLines([]);
        }
      });
    // 선택 해제/코스 전환 시 이전 경로를 비운다.
    return () => {
      cancelled = true;
      setRouteLines([]);
    };
  }, [selectedCourse]);

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
      <MapLibreMap markers={markers} routeLines={routeLines} />
      <div className="absolute top-4 left-1/2 z-20 w-[95%] -translate-x-1/2">
        <Input
          className="w-full"
          placeholder="병원 또는 관광지를 검색해보세요"
          aria-label="장소 검색"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          leftIcon={<Search size={18} />}
          rightIcon={
            search ? (
              <button
                type="button"
                aria-label="검색어 지우기"
                onClick={clearSearch}
                className="flex items-center text-text-muted hover:text-text focus-visible:outline-none"
              >
                <X size={18} />
              </button>
            ) : undefined
          }
          size="lg"
        />

        {showSearchResults && (
          <ul className="mt-2 max-h-64 overflow-y-auto rounded-[8px] border border-border bg-neutral-0 shadow-md">
            {searchResults.length > 0 ? (
              searchResults.map((place) => (
                <li key={place.id} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    onClick={() => selectPlace(place.placeName)}
                    className="w-full px-4 py-3 text-left text-body-sm text-text hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
                  >
                    {place.placeName}
                  </button>
                </li>
              ))
            ) : isSearching ? (
              <li className="px-4 py-3 text-body-sm text-text-muted">
                검색 중…
              </li>
            ) : (
              <li className="px-4 py-3 text-body-sm text-text-muted">
                검색 결과가 없습니다.
              </li>
            )}
          </ul>
        )}
      </div>

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
