import { colors } from "@afterglow/tokens";
import { buildShadows } from "@afterglow/utils";
import {
  Camera,
  type CameraRef,
  GeoJSONSource,
  Layer,
  Map,
  type MapRef,
  VectorSource,
} from "@maplibre/maplibre-react-native";
import { LocateFixed } from "lucide-react-native";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { env } from "@/lib/env";
import { getCurrentLocation } from "@/lib/location";
import { ROUTE_COLORS } from "@/lib/route";
import { useI18n } from "@/i18n/i18n-provider";

import { type MapLibreMapProps, type MapLibreMapRef } from "./types";

// OpenFreeMap: 무료 OSM 벡터 배경지도(웹과 동일). 등록·API 키 불필요.
const BASEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// buildings.pmtiles: PMTiles v3 / MVT / zoom 0~14 / 단일 레이어 "buildings".
// ⚠️ 기본 fallback을 두지 않는다. EC2 원본(http://ec2-.../data/buildings.pmtiles)은
//    Cache-Control: no-store 라 MapLibre Native의 PMTilesFileSource가 SIGSEGV로
//    죽는다(백엔드 캐시헤더 수정 대기). 유효한 URL이 env로 주어질 때만 건물 레이어를
//    렌더하고, 없으면 basemap만 띄운다(크래시·404 에러 회피).
const BUILDINGS_PMTILES_URL = env.buildingsPmtilesUrl;
const BUILDINGS_SOURCE_LAYER = "buildings";

// 그림자(그늘) 색 — 웹과 동일(디자인 토큰 secondary-900). 반투명으로 지면에 깔린다.
const SHADOW_COLOR = "#1c2b45";

// 경로 지점 핀 색: 시작=보라, 도착=빨강 (경로 라인 파랑/초록과 겹치지 않게).
const ROUTE_PIN_START = "#7c3aed";
const ROUTE_PIN_END = "#ef4444";
const EMPTY_SHADOWS: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

// [lng, lat] 서울시청 (기본값). MapLibre는 [lng, lat] 순서.
const SEOUL: [number, number] = [126.978, 37.5665];

/**
 * 지도 렌더 (RN). 배경지도 + 건물 PMTiles + 마커.
 * markers가 주어지면 그 지점들이 보이도록 카메라를 이동한다(웹 fitBounds와 동일 의도).
 *
 * ⚠️ 네이티브 전용(웹은 MapLibreMap.web.tsx). 건물 PMTiles 렌더 크래시(서버 no-store
 *    이슈)는 [[pmtiles-tile-caching]] 참고 — 백엔드 캐시헤더 수정 대기.
 */
export const MapLibreMap = forwardRef<MapLibreMapRef, MapLibreMapProps>(
  function MapLibreMap(
    {
      markers = [],
      autoFitMarkers = true,
      onMarkerPress,
      onMapPress,
      routeLines = [],
      routePins = [],
      onRegionChange,
    },
    ref,
  ) {
    const { t } = useI18n();
    const cameraRef = useRef<CameraRef>(null);
    const mapRef = useRef<MapRef>(null);

    // 지도 중앙 좌표를 호출부에 노출(지점 선택 십자선 확정용). getCenter는 [lng,lat].
    useImperativeHandle(
      ref,
      () => ({
        getCenter: async () => {
          const map = mapRef.current;
          if (!map) {
            return null;
          }
          try {
            const c = await map.getCenter();
            return { lng: c[0], lat: c[1] };
          } catch {
            return null;
          }
        },
      }),
      [],
    );

    // 프론트에서 계산하는 건물 그림자(항상 "지금" 태양 기준). 뷰포트 이동마다 갱신.
    const [shadows, setShadows] =
      useState<GeoJSON.FeatureCollection>(EMPTY_SHADOWS);
    // 초기 1회(타일 최초 렌더 완료) 그림자를 계산했는지.
    const didInitialShadowRef = useRef(false);

    // 뷰포트의 건물을 조회해 그림자 폴리곤을 계산한다.
    const updateShadows = useCallback(async () => {
      // 건물 레이어가 없으면(건물 pmtiles 미설정) 그림자도 없다.
      if (!BUILDINGS_PMTILES_URL) {
        return;
      }
      const map = mapRef.current;
      if (!map) {
        return;
      }
      try {
        const [features, center] = await Promise.all([
          map.queryRenderedFeatures({ layers: ["buildings-fill"] }),
          map.getCenter(),
        ]);
        setShadows(
          buildShadows(
            features,
            { lng: center[0], lat: center[1] },
            new Date(),
          ),
        );
      } catch {
        // 쿼리 실패(스타일 미로드 등)는 다음 이동에서 다시 시도되므로 무시.
      }
    }, []);

    // 현재 뷰포트 경계를 호출부에 보고한다(뷰포트 기반 장소 조회용).
    // getBounds는 LngLatBounds = [west, south, east, north] 형태를 준다.
    const reportRegion = useCallback(async () => {
      if (!onRegionChange) {
        return;
      }
      const map = mapRef.current;
      if (!map) {
        return;
      }
      try {
        const [west, south, east, north] = await map.getBounds();
        onRegionChange({
          swLng: west,
          swLat: south,
          neLng: east,
          neLat: north,
        });
      } catch {
        // 스타일 미로드 등 실패는 다음 이동에서 다시 시도되므로 무시.
      }
    }, [onRegionChange]);

    // 마커를 개별 <Marker> 뷰 오버레이로 그리면 지점 수만큼 네이티브 View가 생기고
    // 지도를 움직일 때마다 전부 재배치돼 느리다(카테고리는 전체를 받아 수십~수백 건).
    // 하나의 GeoJSON 소스 + circle 레이어로 GPU에서 렌더해 지점이 많아도 매끄럽게 한다.
    const markersGeoJSON = useMemo<GeoJSON.FeatureCollection>(
      () => ({
        type: "FeatureCollection",
        features: markers.map((m, i) => ({
          type: "Feature",
          // 클릭 시 어떤 마커인지 되찾도록 인덱스를 실어 보낸다(복잡한 객체 대신).
          properties: { index: i },
          geometry: { type: "Point", coordinates: [m.lng, m.lat] },
        })),
      }),
      [markers],
    );

    // 경로(최단·그늘)를 LineString FeatureCollection으로. shady 여부를 실어 색을 구분.
    const routesGeoJSON = useMemo<GeoJSON.FeatureCollection>(
      () => ({
        type: "FeatureCollection",
        features: routeLines.map((line) => ({
          type: "Feature",
          properties: { shady: line.shady },
          geometry: { type: "LineString", coordinates: line.coordinates },
        })),
      }),
      [routeLines],
    );

    // 경로 시작/도착 핀 — 시작(start) 여부를 실어 색을 구분.
    const routePinsGeoJSON = useMemo<GeoJSON.FeatureCollection>(
      () => ({
        type: "FeatureCollection",
        features: routePins.map((pin) => ({
          type: "Feature",
          properties: { start: pin.kind === "start" },
          geometry: { type: "Point", coordinates: [pin.lng, pin.lat] },
        })),
      }),
      [routePins],
    );

    // 확보한 현위치([lng, lat]). 최초 포커스 + 나침반 버튼에서 재사용. (웹의 userLocationRef 대응)
    const userLocationRef = useRef<[number, number] | null>(null);
    // 마커(검색/코스)로 카메라를 이미 옮겼는지. 진입 시 현위치 확보가 늦게 끝나면
    // 사용자가 검색으로 이동한 위치를 시뮬레이터 기본 위치(샌프란시스코) 등으로
    // 덮어쓰는 문제가 있어, 마커가 카메라를 잡은 뒤엔 초기 현위치 이동을 건너뛴다.
    const cameraLockedRef = useRef(false);

    // 마커(circle) 탭 → 인덱스로 원본 마커를 되찾아 상세를 호출부에 알린다.
    const handleMarkerPress = (
      e: NativeSyntheticEvent<{ features: GeoJSON.Feature[] }>,
    ) => {
      const index = e.nativeEvent.features?.[0]?.properties?.index;
      if (typeof index === "number" && markers[index]) {
        onMarkerPress?.(markers[index]!);
      }
    };

    // 나침반 버튼: 현위치로 이동 (없으면 다시 요청, 거부/실패 시 기본값 유지). 웹과 동일 의도.
    const recenter = async () => {
      const loc = userLocationRef.current ?? (await getCurrentLocation());
      if (loc) {
        userLocationRef.current = loc;
      }
      cameraRef.current?.flyTo({
        center: loc ?? SEOUL,
        zoom: 15,
        duration: 600,
      });
    };

    // 진입 시 현위치를 확보해 중앙으로 이동 (거부/실패 시 기본값 유지). 웹 getCurrentPosition 대응.
    useEffect(() => {
      let cancelled = false;
      getCurrentLocation().then((loc) => {
        if (cancelled || !loc) {
          return;
        }
        userLocationRef.current = loc;
        // 그새 마커가 카메라를 잡았으면(사용자가 검색/코스로 이동) 덮어쓰지 않는다.
        if (cameraLockedRef.current) {
          return;
        }
        cameraRef.current?.flyTo({ center: loc, zoom: 15, duration: 600 });
      });
      return () => {
        cancelled = true;
      };
    }, []);

    // markers가 바뀌면 그 지점들로 카메라 이동 (autoFitMarkers=false면 이동 안 함:
    // 뷰포트 기반 카테고리 조회에서 카메라 자동 이동 → 재조회 루프를 막는다)
    useEffect(() => {
      if (markers.length === 0 || !autoFitMarkers) {
        return;
      }
      // 마커가 카메라를 잡았음을 표시 → 뒤늦게 도착한 초기 현위치 이동을 막는다.
      cameraLockedRef.current = true;
      if (markers.length === 1) {
        const m = markers[0]!;
        cameraRef.current?.flyTo({
          center: [m.lng, m.lat],
          zoom: 16,
          duration: 600,
        });
        return;
      }
      const lngs = markers.map((m) => m.lng);
      const lats = markers.map((m) => m.lat);
      cameraRef.current?.fitBounds(
        [
          Math.min(...lngs),
          Math.min(...lats),
          Math.max(...lngs),
          Math.max(...lats),
        ],
        { duration: 600 },
      );
    }, [markers, autoFitMarkers]);

    // 경로가 그려지면 전체 경로가 보이도록 카메라 이동(패딩 줘서 잘리지 않게).
    useEffect(() => {
      if (routeLines.length === 0) {
        return;
      }
      cameraLockedRef.current = true;
      const coords = routeLines.flatMap((line) => line.coordinates);
      if (coords.length === 0) {
        return;
      }
      const lngs = coords.map((c) => c[0]!);
      const lats = coords.map((c) => c[1]!);
      cameraRef.current?.fitBounds(
        [
          Math.min(...lngs),
          Math.min(...lats),
          Math.max(...lngs),
          Math.max(...lats),
        ],
        // 하단 상세 카드/범례에 가리지 않도록 아래쪽 패딩을 크게 준다.
        {
          padding: { top: 80, right: 60, bottom: 220, left: 60 },
          duration: 600,
        },
      );
    }, [routeLines]);

    return (
      <View style={StyleSheet.absoluteFill}>
        <Map
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          mapStyle={BASEMAP_STYLE_URL}
          // 웹의 attributionControl:false와 동일 — 정보(ⓘ) 버튼·로고 숨김
          attribution={false}
          logo={false}
          onPress={onMapPress}
          // 이동/줌 종료 시 그림자 재계산 + 뷰포트 경계 보고
          onRegionDidChange={() => {
            void updateShadows();
            void reportRegion();
          }}
          // 최초 타일 렌더 완료 시 1회 계산(정지 상태에서도 그림자가 뜨도록) + 초기 뷰포트 보고
          onDidFinishRenderingMapFully={() => {
            void reportRegion();
            if (didInitialShadowRef.current) {
              return;
            }
            didInitialShadowRef.current = true;
            void updateShadows();
          }}
        >
          <Camera
            ref={cameraRef}
            initialViewState={{ center: SEOUL, zoom: 15 }}
          />

          {/* 그림자를 건물보다 먼저 선언 → 건물이 그림자 위에 그려진다. */}
          {BUILDINGS_PMTILES_URL ? (
            <GeoJSONSource id="shadows" data={shadows}>
              <Layer
                id="buildings-shadow"
                type="fill"
                paint={{
                  "fill-color": SHADOW_COLOR,
                  "fill-opacity": 0.35,
                }}
              />
            </GeoJSONSource>
          ) : null}

          {BUILDINGS_PMTILES_URL ? (
            <VectorSource
              id="buildings"
              url={`pmtiles://${BUILDINGS_PMTILES_URL}`}
            >
              <Layer
                id="buildings-fill"
                type="fill"
                source-layer={BUILDINGS_SOURCE_LAYER}
                paint={{
                  "fill-color": colors["neutral-600"],
                  "fill-opacity": 0.55,
                  "fill-outline-color": colors["neutral-700"],
                }}
              />
            </VectorSource>
          ) : null}

          {routeLines.length > 0 && (
            <GeoJSONSource id="routes" data={routesGeoJSON}>
              <Layer
                id="routes-line"
                type="line"
                layout={{ "line-cap": "round", "line-join": "round" }}
                paint={{
                  // shady=초록(그늘길), 그 외=파랑(최단)
                  "line-color": [
                    "case",
                    ["get", "shady"],
                    ROUTE_COLORS.shady,
                    ROUTE_COLORS.shortest,
                  ],
                  "line-width": 5,
                  "line-opacity": 0.85,
                }}
              />
            </GeoJSONSource>
          )}

          {markers.length > 0 && (
            <GeoJSONSource
              id="place-markers"
              data={markersGeoJSON}
              onPress={handleMarkerPress}
            >
              <Layer
                id="place-markers-circle"
                type="circle"
                paint={{
                  "circle-radius": 6,
                  "circle-color": colors.primary,
                  "circle-stroke-width": 2,
                  "circle-stroke-color": colors["neutral-0"],
                }}
              />
            </GeoJSONSource>
          )}

          {/* 경로 시작/도착 핀 — 마커 위에 올려 잘 보이게. 시작=보라, 도착=빨강 */}
          {routePins.length > 0 && (
            <GeoJSONSource id="route-pins" data={routePinsGeoJSON}>
              <Layer
                id="route-pins-circle"
                type="circle"
                paint={{
                  "circle-radius": 9,
                  "circle-color": [
                    "case",
                    ["get", "start"],
                    ROUTE_PIN_START,
                    ROUTE_PIN_END,
                  ],
                  "circle-stroke-width": 3,
                  "circle-stroke-color": colors["neutral-0"],
                }}
              />
            </GeoJSONSource>
          )}
        </Map>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("map.recenter")}
          onPress={() => void recenter()}
          className="absolute bottom-24 left-5 size-14 items-center justify-center rounded-full bg-neutral-0 shadow-md active:bg-surface-muted"
        >
          <LocateFixed size={24} color={colors.text} />
        </Pressable>
      </View>
    );
  },
);
