import { colors } from "@afterglow/tokens";
import { Input } from "@afterglow/ui-native";
import { toLatLng } from "@afterglow/utils";
import { Plus, Search, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapLibreMap } from "@/components/MapLibreMap";
import { TripPlanPanel } from "@/components/TripPlanPanel";
import { useDebounce } from "@/hooks/use-debounce";
import { usePlaces } from "@/hooks/use-places";
import { type Place } from "@/types/place";

/**
 * 홈 = 전체화면 지도 + 상단 검색 오버레이 + 여행 계획 열기(+) 버튼 (웹 홈과 동일 구조).
 *
 * 검색: 입력을 300ms 디바운스해 /api/places 조회, 결과를 지도 위 드롭다운으로.
 * 선택하면 그 장소를 지도 마커로 찍고 카메라를 이동한다.
 * (카테고리 TagList/저장 코스 태그는 후속 PR)
 */
export default function HomeScreen() {
  const [planOpen, setPlanOpen] = useState(false);

  const [search, setSearch] = useState("");
  // 드롭다운 열림 여부. 결과 선택 시 닫아 재요청을 막는다.
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const searchEnabled = searchOpen && debouncedSearch.trim() !== "";
  const { data: results = [], isFetching } = usePlaces(debouncedSearch, {
    enabled: searchEnabled,
  });

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
  };

  const markers = useMemo(
    () =>
      selectedPlace
        ? [{ ...toLatLng(selectedPlace), label: selectedPlace.placeName }]
        : [],
    [selectedPlace],
  );

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
