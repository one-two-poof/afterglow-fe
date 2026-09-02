import { useToastStore } from "@afterglow/stores";
import { colors } from "@afterglow/tokens";
import { Input, TagList } from "@afterglow/ui-native";
import { toLatLng } from "@afterglow/utils";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Crosshair,
  Flag,
  LocateFixed,
  MapPin,
  Navigation,
  Plus,
  Search,
  X,
} from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapLibreMap } from "@/components/MapLibreMap";
import {
  type MapLibreMapRef,
  type MapMarker,
  type MarkerDetail,
  type RoutePin,
} from "@/components/MapLibreMap/types";
import { getCurrentLocation } from "@/lib/location";
import { fetchRouteLines, ROUTE_COLORS, type RouteLine } from "@/lib/route";
import { TripPlanPanel } from "@/components/TripPlanPanel";
import { useAccessToken } from "@/hooks/use-access-token";
import { useCategoryPlaces } from "@/hooks/use-category-places";
import { useDebounce } from "@/hooks/use-debounce";
import { usePlaces } from "@/hooks/use-places";
import { useRecommendations } from "@/hooks/use-recommendations";
import { type PlaceCategory } from "@/lib/places";
import { type Place } from "@/types/place";
import { courseTitle, savedCourseToMarkers } from "@/types/recommendation";

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

/** 경로 시작/도착 지점 좌표 */
type LatLngPoint = { lat: number; lng: number };

/** 장소(Place) → 마커 상세 카드 정보. */
const placeToDetail = (place: Place): MarkerDetail => ({
  title: place.placeName,
  subtitle: place.categoryName || place.categoryGroupName || undefined,
  description: place.roadAddressName || place.addressName || undefined,
  image: place.image || undefined,
});

/**
 * 홈 = 전체화면 지도 + 상단 검색 오버레이 + 하단 카테고리/코스 태그 + 여행 계획(+)
 * 버튼 (웹 홈과 동일 구조).
 *
 * 검색: 입력을 300ms 디바운스해 /api/places 조회, 결과를 지도 위 드롭다운으로.
 * 태그: 카테고리(병원/관광명소/숙소) 또는 저장 코스를 고르면 해당 지점들을 마커로.
 * "전체"는 모든 마커를 해제한다.
 */
export default function HomeScreen() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.show);
  const [planOpen, setPlanOpen] = useState(false);

  const [search, setSearch] = useState("");
  // 드롭다운 열림 여부. 결과 선택 시 닫아 재요청을 막는다.
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  // 선택된 저장 코스 태그(selectionId 문자열) 또는 FILTER_ALL(해제).
  const [filter, setFilter] = useState(FILTER_ALL);
  // 마커 클릭 시 하단에 띄울 상세. 마커 셋을 바꾸는 동작(검색/코스/카테고리 전환)에서 닫는다.
  const [detail, setDetail] = useState<MapMarker | null>(null);
  // 경로 안내로 그린 경로(최단·그늘). 상세/마커가 바뀌면 지운다.
  const [routeLines, setRouteLines] = useState<RouteLine[]>([]);
  const [routing, setRouting] = useState(false);
  // 진행 중인 경로 요청 취소용. 카드 닫기·다른 대상 선택 시 abort한다.
  const routeAbortRef = useRef<AbortController | null>(null);
  // 지도 중앙 좌표를 읽기 위한 핸들(지점 선택 십자선 확정용).
  const mapRef = useRef<MapLibreMapRef>(null);

  // 경로 설정 패널: "경로 안내"를 누르면 열려 시작지·도착지를 정한 뒤 경로를 찾는다.
  const [routePlanOpen, setRoutePlanOpen] = useState(false);
  // 시작지. null이면 "현위치"(요청 시점에 위치 조회), 좌표면 지도에서 고른 지점.
  const [startPoint, setStartPoint] = useState<LatLngPoint | null>(null);
  // 도착지. 기본은 클릭한 장소, 지도로 변경 가능. label은 표시용(없으면 "지도에서 선택한 지점").
  const [endPoint, setEndPoint] = useState<
    (LatLngPoint & { label?: string }) | null
  >(null);
  // 중앙 십자선으로 지정 중인 지점. null이면 지정 모드 아님.
  const [picking, setPicking] = useState<"start" | "end" | null>(null);

  // 진행 중인 경로 요청이 있으면 취소하고 로딩 상태를 내린다.
  const cancelRoute = useCallback(() => {
    routeAbortRef.current?.abort();
    routeAbortRef.current = null;
    setRouting(false);
  }, []);

  const debouncedSearch = useDebounce(search, 300);
  const searchEnabled = searchOpen && debouncedSearch.trim() !== "";
  const { data: results = [], isFetching } = usePlaces(debouncedSearch, {
    enabled: searchEnabled,
  });

  // 저장된 내 코스 — 로그인 상태에서만 조회 (하단 태그로 표시). 웹 홈과 동일.
  const token = useAccessToken();
  const isAuthed = typeof token === "string";
  const { data: courses = [], refetch: refetchCourses } =
    useRecommendations(isAuthed);

  // 비활성 탭은 freeze되어 blur 중 토큰 변경(로그인)을 놓칠 수 있다. 홈이 다시
  // 포커스될 때(예: 로그인 직후 replace("/"))마다 저장 코스를 재조회해, 별도 탭을
  // 거치지 않아도 태그리스트가 바로 뜨도록 한다.
  useFocusEffect(
    useCallback(() => {
      if (isAuthed) void refetchCourses();
    }, [isAuthed, refetchCourses]),
  );
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

  // 여행 계획(코스 추천)은 로그인 필요. 비로그인 시 안내 후 로그인 화면으로 유도.
  const openPlan = () => {
    if (!isAuthed) {
      showToast("로그인 후 코스를 추천받을 수 있어요");
      router.push("/my-page");
      return;
    }
    setPlanOpen(true);
  };

  // 경로 설정 패널·그린 경로·진행 중 요청을 모두 정리한다(대상이 바뀔 때 호출).
  const resetRoutePlan = useCallback(() => {
    cancelRoute();
    setRoutePlanOpen(false);
    setPicking(null);
    setStartPoint(null);
    setEndPoint(null);
    setRouteLines([]);
  }, [cancelRoute]);

  const selectPlace = (place: Place) => {
    setSearch(place.placeName);
    setSearchOpen(false);
    setSelectedPlace(place);
    // 검색 장소를 고르면 코스 선택은 해제한다(마커 대상은 하나만).
    setFilter(FILTER_ALL);
    setDetail(null);
    resetRoutePlan();
  };

  // 코스 태그 선택 시: 검색 마커를 지우고 그 코스로 전환. FILTER_ALL이면 해제.
  const selectFilter = (value: string) => {
    setFilter(value);
    setSelectedPlace(null);
    setDetail(null);
    resetRoutePlan();
  };

  // 상세 카드 닫기: 상세와 그린 경로를 정리하고 진행 중 경로 요청은 취소한다.
  const closeDetail = () => {
    setDetail(null);
    resetRoutePlan();
  };

  // "경로 안내": 경로 설정 패널을 연다. 시작지=현위치(기본), 도착지=클릭한 장소(기본).
  const openRoutePlan = () => {
    if (!detail) {
      return;
    }
    cancelRoute();
    setStartPoint(null);
    setEndPoint({
      lat: detail.lat,
      lng: detail.lng,
      label: detail.detail?.title,
    });
    setPicking(null);
    setRouteLines([]);
    setRoutePlanOpen(true);
  };

  // 설정 패널 닫기(경로 안내 취소). 상세 카드는 그대로 두어 다시 열 수 있게 한다.
  const closeRoutePlan = () => {
    cancelRoute();
    setRoutePlanOpen(false);
    setPicking(null);
    setStartPoint(null);
    setEndPoint(null);
    setRouteLines([]);
  };

  // 중앙 십자선 확정 → 현재 지도 중앙 좌표를 지정 중인 지점(시작/도착)에 넣고 종료.
  const confirmPick = async () => {
    const center = await mapRef.current?.getCenter();
    if (!center) {
      return;
    }
    if (picking === "start") {
      setStartPoint(center);
    } else if (picking === "end") {
      setEndPoint(center);
    }
    setPicking(null);
  };

  // 경로 찾기: 시작지(현위치 or 지정) → 도착지 경로(최단·그늘)를 조회해 지도에 그린다.
  // 진행 중에 취소되면 결과는 무시한다.
  const confirmRoute = async () => {
    if (!endPoint || routing) {
      return;
    }
    const controller = new AbortController();
    routeAbortRef.current = controller;
    setRouting(true);
    try {
      let from: LatLngPoint;
      if (startPoint) {
        from = startPoint;
      } else {
        // 시작지가 "현위치"면 이 시점에 위치를 조회한다.
        const loc = await getCurrentLocation();
        if (controller.signal.aborted) {
          return;
        }
        if (!loc) {
          showToast("위치 권한이 필요해요");
          return;
        }
        from = { lat: loc[1], lng: loc[0] };
      }
      const lines = await fetchRouteLines(
        from,
        { lat: endPoint.lat, lng: endPoint.lng },
        controller.signal,
      );
      if (controller.signal.aborted) {
        return;
      }
      if (lines.length === 0) {
        showToast("경로를 찾지 못했어요");
        return;
      }
      setRouteLines(lines);
    } catch {
      // 취소로 인한 에러는 사용자가 의도한 것이므로 알리지 않는다.
      if (!controller.signal.aborted) {
        showToast("경로를 불러오지 못했어요");
      }
    } finally {
      // 취소(cancelRoute)로 이미 다른 요청이 시작됐다면 그쪽 상태를 건드리지 않는다.
      if (routeAbortRef.current === controller) {
        routeAbortRef.current = null;
        setRouting(false);
      }
    }
  };

  // 경로 설정 중 시작/도착 핀. 시작은 지도에서 고른 경우에만(현위치는 요청 시 조회).
  const routePins = useMemo<RoutePin[]>(() => {
    if (!routePlanOpen) {
      return [];
    }
    const pins: RoutePin[] = [];
    if (startPoint) {
      pins.push({ ...startPoint, kind: "start" });
    }
    if (endPoint) {
      pins.push({ lat: endPoint.lat, lng: endPoint.lng, kind: "end" });
    }
    return pins;
  }, [routePlanOpen, startPoint, endPoint]);

  // 마커 우선순위: 검색 장소 → 선택 코스 → 선택 카테고리 (전체는 없음). 웹 홈과 동일.
  const markers = useMemo<MapMarker[]>(() => {
    if (selectedPlace) {
      return [
        {
          ...toLatLng(selectedPlace),
          label: selectedPlace.placeName,
          detail: placeToDetail(selectedPlace),
        },
      ];
    }
    if (selectedCourse) {
      return savedCourseToMarkers(selectedCourse);
    }
    return categoryPlaces.map((place) => ({
      ...toLatLng(place),
      label: place.placeName,
      detail: placeToDetail(place),
    }));
  }, [selectedPlace, selectedCourse, categoryPlaces]);

  return (
    <View className="flex-1 bg-bg">
      <MapLibreMap
        ref={mapRef}
        markers={markers}
        onMarkerPress={setDetail}
        routeLines={routeLines}
        routePins={routePins}
      />

      {/* 지점 지정 중: 지도 중앙 고정 십자선. 지도를 움직여 원하는 곳에 맞춘다.
          touch를 막지 않도록 pointerEvents=none. */}
      {routePlanOpen && picking && (
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
        >
          <Crosshair
            size={40}
            color={picking === "start" ? "#7c3aed" : "#ef4444"}
            strokeWidth={2.5}
          />
        </View>
      )}

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
                <Pressable
                  accessibilityLabel="검색어 지우기"
                  onPress={clearSearch}
                >
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
          찍는다. "전체"는 모든 마커 해제. 웹 홈처럼 지도 맨 하단에 둔다. */}
      <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0">
        <TagList
          value={filter}
          onChange={selectFilter}
          aria-label="지도 필터"
          className="px-4 pb-4"
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
              {courseTitle(course)}
            </TagList.Item>
          ))}
        </TagList>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="여행 계획 짜기"
        onPress={openPlan}
        className="absolute right-5 bottom-24 size-14 items-center justify-center rounded-full bg-primary shadow-md active:bg-action-primary-hover"
      >
        <Plus size={28} color={colors["on-action-primary"]} />
      </Pressable>

      <TripPlanPanel open={planOpen} onClose={() => setPlanOpen(false)} />

      {/* 마커 클릭 상세 카드 — 하단 오버레이(태그리스트 위). 경로 설정 중엔 패널로 대체. */}
      {detail?.detail && !routePlanOpen && (
        <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0">
          <SafeAreaView
            edges={["bottom"]}
            className="rounded-t-[16px] bg-neutral-0 shadow-md"
          >
            <View className="flex-row items-start gap-3 px-5 pt-4 pb-2">
              {detail.detail.image ? (
                <Image
                  source={{ uri: detail.detail.image }}
                  accessibilityIgnoresInvertColors
                  className="size-16 rounded-[8px] bg-surface-muted"
                />
              ) : null}
              <View className="flex-1">
                <Text numberOfLines={1} className="text-heading-sm text-text">
                  {detail.detail.title}
                </Text>
                {detail.detail.subtitle ? (
                  <Text
                    numberOfLines={1}
                    className="mt-1 text-body-sm text-text-secondary"
                  >
                    {detail.detail.subtitle}
                  </Text>
                ) : null}
                {detail.detail.description ? (
                  <Text
                    numberOfLines={2}
                    className="mt-0.5 text-body-sm text-text-muted"
                  >
                    {detail.detail.description}
                  </Text>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="상세 닫기"
                onPress={closeDetail}
                hitSlop={8}
              >
                <X size={20} color={colors["text-muted"]} />
              </Pressable>
            </View>

            {/* 경로 안내: 시작지·도착지를 정하는 설정 패널을 연다. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="경로 안내"
              onPress={openRoutePlan}
              className="mx-5 mt-1 mb-2 h-11 flex-row items-center justify-center gap-2 rounded-[8px] bg-primary active:bg-action-primary-hover"
            >
              <Navigation size={16} color={colors["on-action-primary"]} />
              <Text className="text-label-lg text-on-action-primary">
                경로 안내
              </Text>
            </Pressable>
          </SafeAreaView>
        </View>
      )}

      {/* 지점 지정 안내 바 — 지도가 대부분 보이도록 하단에 얇게. 지도를 움직여 중앙
          십자선에 맞춘 뒤 "이 위치로 지정"으로 좌표를 확정한다. */}
      {routePlanOpen && picking && (
        <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0">
          <SafeAreaView
            edges={["bottom"]}
            className="rounded-t-[16px] bg-neutral-0 shadow-md"
          >
            <View className="flex-row items-center gap-2 px-5 pt-4 pb-1">
              <MapPin size={16} color={colors.primary} />
              <Text className="flex-1 text-body-md text-text">
                {picking === "start" ? "시작지" : "도착지"}를 지도 중앙에 맞춰
                주세요
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="지점 지정 취소"
                onPress={() => setPicking(null)}
                hitSlop={8}
              >
                <Text className="text-label-lg text-text-muted">취소</Text>
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이 위치로 지정"
              onPress={() => void confirmPick()}
              className="mx-5 mt-2 mb-2 h-11 flex-row items-center justify-center gap-2 rounded-[8px] bg-primary active:bg-action-primary-hover"
            >
              <Crosshair size={16} color={colors["on-action-primary"]} />
              <Text className="text-label-lg text-on-action-primary">
                이 위치로 지정
              </Text>
            </Pressable>
          </SafeAreaView>
        </View>
      )}

      {/* 경로 설정 패널 — 시작지(현위치/지도)·도착지(장소 기본, 지도 변경) 설정 후 경로 찾기. */}
      {routePlanOpen && !picking && (
        <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0">
          <SafeAreaView
            edges={["bottom"]}
            className="rounded-t-[16px] bg-neutral-0 shadow-md"
          >
            <View className="flex-row items-center gap-2 px-5 pt-4 pb-1">
              <Text className="flex-1 text-heading-sm text-text">
                경로 설정
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="경로 설정 닫기"
                onPress={closeRoutePlan}
                hitSlop={8}
              >
                <X size={20} color={colors["text-muted"]} />
              </Pressable>
            </View>

            {/* 시작지: 현위치 / 지도에서 선택 (택1) */}
            <View className="px-5 pt-2">
              <Text className="mb-1 text-label-sm text-text-muted">시작지</Text>
              <View className="flex-row gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: startPoint === null }}
                  onPress={() => setStartPoint(null)}
                  style={{
                    backgroundColor:
                      startPoint === null
                        ? colors.primary
                        : colors["surface-muted"],
                  }}
                  className="h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-[8px]"
                >
                  <LocateFixed
                    size={15}
                    color={
                      startPoint === null
                        ? colors["on-action-primary"]
                        : colors.text
                    }
                  />
                  <Text
                    className="text-label-md"
                    style={{
                      color:
                        startPoint === null
                          ? colors["on-action-primary"]
                          : colors.text,
                    }}
                  >
                    현위치
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: startPoint !== null }}
                  onPress={() => setPicking("start")}
                  style={{
                    backgroundColor:
                      startPoint !== null
                        ? colors.primary
                        : colors["surface-muted"],
                  }}
                  className="h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-[8px]"
                >
                  <MapPin
                    size={15}
                    color={
                      startPoint !== null
                        ? colors["on-action-primary"]
                        : colors.text
                    }
                  />
                  <Text
                    className="text-label-md"
                    style={{
                      color:
                        startPoint !== null
                          ? colors["on-action-primary"]
                          : colors.text,
                    }}
                  >
                    지도에서 선택
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 도착지: 클릭한 장소가 기본, 지도에서 변경 가능 */}
            <View className="px-5 pt-3">
              <Text className="mb-1 text-label-sm text-text-muted">도착지</Text>
              <View className="flex-row items-center gap-2">
                <View className="flex-1 flex-row items-center gap-1.5">
                  <Flag size={15} color={colors.text} />
                  <Text
                    numberOfLines={1}
                    className="flex-1 text-body-md text-text"
                  >
                    {endPoint?.label ?? "지도에서 선택한 지점"}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="도착지 지도에서 변경"
                  onPress={() => setPicking("end")}
                  className="h-9 flex-row items-center justify-center gap-1.5 rounded-[8px] border border-border px-3 active:bg-surface-muted"
                >
                  <MapPin size={14} color={colors.text} />
                  <Text className="text-label-md text-text">변경</Text>
                </Pressable>
              </View>
            </View>

            {/* 경로가 그려졌을 때 색 범례 (최단=파랑, 그늘길=초록) */}
            {routeLines.length > 0 && (
              <View className="flex-row items-center gap-4 px-5 pt-3">
                <View className="flex-row items-center gap-1.5">
                  <View
                    className="h-1 w-5 rounded-full"
                    style={{ backgroundColor: ROUTE_COLORS.shortest }}
                  />
                  <Text className="text-body-sm text-text-secondary">최단</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <View
                    className="h-1 w-5 rounded-full"
                    style={{ backgroundColor: ROUTE_COLORS.shady }}
                  />
                  <Text className="text-body-sm text-text-secondary">
                    그늘길
                  </Text>
                </View>
              </View>
            )}

            {/* 경로 찾기: 시작지→도착지 경로(최단·그늘)를 지도에 그린다. 진행 중엔
                disabled 색+스피너. 조건부 배경색은 style로 처리해 css-interop 크래시 회피. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="경로 찾기"
              accessibilityState={{ disabled: routing, busy: routing }}
              disabled={routing}
              onPress={confirmRoute}
              style={
                routing
                  ? { backgroundColor: colors["action-disabled"] }
                  : undefined
              }
              className="mx-5 mt-4 mb-2 h-11 flex-row items-center justify-center gap-2 rounded-[8px] bg-primary active:bg-action-primary-hover"
            >
              {routing ? (
                <ActivityIndicator
                  size="small"
                  color={colors["on-action-disabled"]}
                />
              ) : (
                <Navigation size={16} color={colors["on-action-primary"]} />
              )}
              <Text
                className="text-label-lg"
                style={{
                  color: routing
                    ? colors["on-action-disabled"]
                    : colors["on-action-primary"],
                }}
              >
                {routing
                  ? "경로 찾는 중…"
                  : routeLines.length > 0
                    ? "경로 다시 찾기"
                    : "경로 찾기"}
              </Text>
            </Pressable>
          </SafeAreaView>
        </View>
      )}
    </View>
  );
}
