import { colors } from "@afterglow/tokens";
import {
  Camera,
  type CameraRef,
  Layer,
  Map,
  Marker,
  VectorSource,
} from "@maplibre/maplibre-react-native";
import { LocateFixed } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { env } from "@/lib/env";

import { type MapLibreMapProps } from "./types";

// OpenFreeMap: 무료 OSM 벡터 배경지도(웹과 동일). 등록·API 키 불필요.
const BASEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// buildings.pmtiles: PMTiles v3 / MVT / zoom 0~14 / 단일 레이어 "buildings".
const BUILDINGS_PMTILES_URL =
  env.buildingsPmtilesUrl ??
  "http://ec2-3-38-187-218.ap-northeast-2.compute.amazonaws.com:8080/data/buildings.pmtiles";
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
export function MapLibreMap({ markers = [] }: MapLibreMapProps) {
  const cameraRef = useRef<CameraRef>(null);

  const recenter = () =>
    cameraRef.current?.flyTo({ center: SEOUL, zoom: 15, duration: 600 });

  // markers가 바뀌면 그 지점들로 카메라 이동
  useEffect(() => {
    if (markers.length === 0) {
      return;
    }
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
      <Map style={StyleSheet.absoluteFill} mapStyle={BASEMAP_STYLE_URL}>
        <Camera ref={cameraRef} initialViewState={{ center: SEOUL, zoom: 15 }} />

        <VectorSource id="buildings" url={`pmtiles://${BUILDINGS_PMTILES_URL}`}>
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

        {markers.map((m, i) => (
          <Marker key={`${m.lng},${m.lat},${i}`} id={`marker-${i}`} lngLat={[m.lng, m.lat]}>
            <View className="size-4 rounded-full border-2 border-neutral-0 bg-primary" />
          </Marker>
        ))}
      </Map>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="기본 위치로 이동"
        onPress={recenter}
        className="absolute bottom-24 left-5 size-14 items-center justify-center rounded-full bg-neutral-0 shadow-md active:bg-surface-muted"
      >
        <LocateFixed size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}
