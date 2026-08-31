import { colors } from "@afterglow/tokens";
import {
  Camera,
  type CameraRef,
  GeoJSONSource,
  Layer,
  Map,
  VectorSource,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { LocateFixed } from "lucide-react-native";
import { useEffect, useMemo, useRef } from "react";
import {
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { env } from "@/lib/env";

import { type MapLibreMapProps } from "./types";

// OpenFreeMap: 무료 OSM 벡터 배경지도(웹과 동일). 등록·API 키 불필요.
const BASEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// buildings.pmtiles: PMTiles v3 / MVT / zoom 0~14 / 단일 레이어 "buildings".
// ⚠️ 기본 fallback을 두지 않는다. EC2 원본(http://ec2-.../data/buildings.pmtiles)은
//    Cache-Control: no-store 라 MapLibre Native의 PMTilesFileSource가 SIGSEGV로
//    죽는다(백엔드 캐시헤더 수정 대기). 유효한 URL이 env로 주어질 때만 건물 레이어를
//    렌더하고, 없으면 basemap만 띄운다(크래시·404 에러 회피).
const BUILDINGS_PMTILES_URL = env.buildingsPmtilesUrl;
const BUILDINGS_SOURCE_LAYER = "buildings";

// [lng, lat] 서울시청 (기본값). MapLibre는 [lng, lat] 순서.
const SEOUL: [number, number] = [126.978, 37.5665];

/**
 * 지도 렌더 (RN). 배경지도 + 건물 PMTiles + 마커.
 * markers가 주어지면 그 지점들이 보이도록 카메라를 이동한다(웹 fitBounds와 동일 의도).
 *
 * ⚠️ 네이티브 전용(웹은 MapLibreMap.web.tsx). 건물 PMTiles 렌더 크래시(서버 no-store
 *    이슈)는 [[pmtiles-tile-caching]] 참고 — 백엔드 캐시헤더 수정 대기.
 */
export function MapLibreMap({ markers = [], onMarkerPress }: MapLibreMapProps) {
  const cameraRef = useRef<CameraRef>(null);

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
  // 확보한 현위치([lng, lat]). 최초 포커스 + 나침반 버튼에서 재사용. (웹의 userLocationRef 대응)
  const userLocationRef = useRef<[number, number] | null>(null);
  // 마커(검색/코스)로 카메라를 이미 옮겼는지. 진입 시 현위치 확보가 늦게 끝나면
  // 사용자가 검색으로 이동한 위치를 시뮬레이터 기본 위치(샌프란시스코) 등으로
  // 덮어쓰는 문제가 있어, 마커가 카메라를 잡은 뒤엔 초기 현위치 이동을 건너뛴다.
  const cameraLockedRef = useRef(false);

  // 위치 권한을 요청하고 현재 좌표를 [lng, lat]로 반환한다. 거부/실패 시 null.
  const getCurrentLocation = async (): Promise<[number, number] | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return null;
    }
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return [pos.coords.longitude, pos.coords.latitude];
  };

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
    cameraRef.current?.flyTo({ center: loc ?? SEOUL, zoom: 15, duration: 600 });
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

  // markers가 바뀌면 그 지점들로 카메라 이동
  useEffect(() => {
    if (markers.length === 0) {
      return;
    }
    // 마커가 카메라를 잡았음을 표시 → 뒤늦게 도착한 초기 현위치 이동을 막는다.
    cameraLockedRef.current = true;
    if (markers.length === 1) {
      const m = markers[0]!;
      cameraRef.current?.flyTo({ center: [m.lng, m.lat], zoom: 16, duration: 600 });
      return;
    }
    const lngs = markers.map((m) => m.lng);
    const lats = markers.map((m) => m.lat);
    cameraRef.current?.fitBounds(
      [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)],
      { duration: 600 },
    );
  }, [markers]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={BASEMAP_STYLE_URL}
        // 웹의 attributionControl:false와 동일 — 정보(ⓘ) 버튼·로고 숨김
        attribution={false}
        logo={false}
      >
        <Camera ref={cameraRef} initialViewState={{ center: SEOUL, zoom: 15 }} />

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
      </Map>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="기본 위치로 이동"
        onPress={() => void recenter()}
        className="absolute bottom-24 left-5 size-14 items-center justify-center rounded-full bg-neutral-0 shadow-md active:bg-surface-muted"
      >
        <LocateFixed size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}
