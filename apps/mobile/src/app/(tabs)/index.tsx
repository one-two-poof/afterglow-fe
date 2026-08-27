import { colors } from "@afterglow/tokens";
import { Input, TagList } from "@afterglow/ui-native";
import { toLatLng } from "@afterglow/utils";
import { Plus, Search, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapLibreMap } from "@/components/MapLibreMap";
import { TripPlanPanel } from "@/components/TripPlanPanel";
import { useAccessToken } from "@/hooks/use-access-token";
import { useCategoryPlaces } from "@/hooks/use-category-places";
import { useDebounce } from "@/hooks/use-debounce";
import { usePlaces } from "@/hooks/use-places";
import { useRecommendations } from "@/hooks/use-recommendations";
import { type PlaceCategory } from "@/lib/places";
import { type Place } from "@/types/place";
import { savedCourseToMarkers } from "@/types/recommendation";

// 필터 해제(기본) 값. "전체" = 모든 마커 해제. 저장 코스 태그는 selectionId 문자열,
// 카테고리 태그는 PlaceCategory 문자열을 값으로 쓴다.
const FILTER_ALL = "all";

// 지도 카테고리 필터 태그 (웹 홈과 동일). "전체"는 필터 해제.
const CATEGORY_ITEMS: { value: string; name: string; icon?: string }[] = [
  { value: FILTER_ALL, name: "전체" },
  { value: "hospital", icon: "🏥", name: "병원" },
  { value: "attraction", icon: "🗺️", name: "관광명소" },
  { value: "accommodation", icon: "🏨", name: "숙소" },
];

const PLACE_CATEGORIES: PlaceCategory[] = [
  "hospital",
  "attraction",
  "accommodation",
];

/**
 * 홈 = 전체화면 지도 + 상단 검색 오버레이 + 하단 카테고리/코스 태그 + 여행 계획(+)
 * 버튼 (웹 홈과 동일 구조).
 *
 * 검색: 입력을 300ms 디바운스해 /api/places 조회, 결과를 지도 위 드롭다운으로.
 * 태그: 카테고리(병원/관광명소/숙소) 또는 저장 코스를 고르면 해당 지점들을 마커로.
 * "전체"는 모든 마커를 해제한다.
 */
export default function HomeScreen() {
  const [planOpen, setPlanOpen] = useState(false);

  const [search, setSearch] = useState("");
  // 드롭다운 열림 여부. 결과 선택 시 닫아 재요청을 막는다.
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  // 선택된 저장 코스 태그(selectionId 문자열) 또는 FILTER_ALL(해제).
  const [filter, setFilter] = useState(FILTER_ALL);

  const debouncedSearch = useDebounce(search, 300);
  const searchEnabled = searchOpen && debouncedSearch.trim() !== "";
  const { data: results = [], isFetching } = usePlaces(debouncedSearch, {
    enabled: searchEnabled,
  });

  // 저장된 내 코스 — 로그인 상태에서만 조회 (하단 태그로 표시). 웹 홈과 동일.
  const token = useAccessToken();
  const { data: courses = [] } = useRecommendations(typeof token === "string");
  const selectedCourse = courses.find(
    (course) => String(course.selectionId) === filter,
  );

  // 카테고리 태그(병원/관광명소/숙소) 선택 시 그 카테고리 전체를 조회.
  // "전체"·코스 선택 시엔 null이라 요청하지 않는다.
  const category = (PLACE_CATEGORIES as string[]).includes(filter)
    ? (filter as PlaceCategory)
    : null;
  const { data: categoryPlaces = [] } = useCategoryPlaces(category);

  const showResults = searchOpen && search.trim() !== "";

  const handleChange = (value: string) => {
    setSearch(value);
    setSearchOpen(true);
  };

  const clearSearch = () => {
    setSearch("");
    setSearchOpen(false);
  };

  const selectPlace = (place: Place) => {
    setSearch(place.placeName);
    setSearchOpen(false);
    setSelectedPlace(place);
    // 검색 장소를 고르면 코스 선택은 해제한다(마커 대상은 하나만).
    setFilter(FILTER_ALL);
  };

  // 코스 태그 선택 시: 검색 마커를 지우고 그 코스로 전환. FILTER_ALL이면 해제.
  const selectFilter = (value: string) => {
    setFilter(value);
    setSelectedPlace(null);
  };

  // 마커 우선순위: 검색 장소 → 선택 코스 → 선택 카테고리 (전체는 없음). 웹 홈과 동일.
  const markers = useMemo(() => {
    if (selectedPlace) {
      return [{ ...toLatLng(selectedPlace), label: selectedPlace.placeName }];
    }
    if (selectedCourse) {
      return savedCourseToMarkers(selectedCourse);
    }
    return categoryPlaces.map((place) => ({
      ...toLatLng(place),
      label: place.placeName,
    }));
  }, [selectedPlace, selectedCourse, categoryPlaces]);

  return (
    <View className="flex-1 bg-bg">
      <MapLibreMap markers={markers} />

      {/* 상단 검색 오버레이 (map은 빈 영역에서 계속 조작 가능하도록 box-none) */}
      <SafeAreaView
        edges={["top"]}
        pointerEvents="box-none"
        className="absolute inset-x-0 top-0"
      >
        <View pointerEvents="box-none" className="px-4 pt-2">
          <Input
            size="lg"
            placeholder="병원 또는 관광지를 검색해보세요"
            accessibilityLabel="장소 검색"
            value={search}
            onChangeText={handleChange}
            leftIcon={<Search size={18} color={colors["text-muted"]} />}
            rightIcon={
              search ? (
                <Pressable accessibilityLabel="검색어 지우기" onPress={clearSearch}>
                  <X size={18} color={colors["text-muted"]} />
                </Pressable>
              ) : undefined
            }
          />

          {showResults && (
            <View className="mt-2 max-h-64 overflow-hidden rounded-[8px] border border-border bg-neutral-0 shadow-md">
              <ScrollView keyboardShouldPersistTaps="handled">
                {results.length > 0 ? (
                  results.map((place) => (
                    <Pressable
                      key={place.id}
                      onPress={() => selectPlace(place)}
                      className="border-b border-border px-4 py-3 active:bg-surface-muted"
                    >
                      <Text className="text-body-sm text-text">
                        {place.placeName}
                      </Text>
                    </Pressable>
                  ))
                ) : (
                  <View className="px-4 py-3">
                    <Text className="text-body-sm text-text-muted">
                      {isFetching ? "검색 중…" : "검색 결과가 없습니다."}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* 하단 태그: 카테고리(전체/병원/관광명소/숙소) + 저장 코스(로그인 시).
          카테고리를 고르면 그 카테고리 장소를, 코스를 고르면 코스 지점들을 마커로
          찍는다. "전체"는 모든 마커 해제. FAB/recenter(bottom-24) 위에 얹는다. */}
      <View pointerEvents="box-none" className="absolute inset-x-0 bottom-40">
        <TagList
          value={filter}
          onChange={selectFilter}
          aria-label="지도 필터"
          className="px-4"
        >
          {CATEGORY_ITEMS.map((item) => (
            <TagList.Item
              key={item.value}
              value={item.value}
              icon={item.icon ? <Text>{item.icon}</Text> : undefined}
            >
              {item.name}
            </TagList.Item>
          ))}
          {courses.map((course) => (
            <TagList.Item
              key={course.selectionId}
              value={String(course.selectionId)}
              icon={<Text>📍</Text>}
            >
              {course.daily_schedules[0]?.start_location.name ??
                course.course_id}
            </TagList.Item>
          ))}
        </TagList>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="여행 계획 짜기"
        onPress={() => setPlanOpen(true)}
        className="absolute bottom-24 right-5 size-14 items-center justify-center rounded-full bg-primary shadow-md active:bg-action-primary-hover"
      >
        <Plus size={28} color={colors["on-action-primary"]} />
      </Pressable>

      <TripPlanPanel open={planOpen} onClose={() => setPlanOpen(false)} />
    </View>
  );
}
