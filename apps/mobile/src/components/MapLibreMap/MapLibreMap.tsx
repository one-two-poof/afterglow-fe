import { colors } from "@afterglow/tokens";
import {
  Camera,
  type CameraRef,
  Layer,
  Map,
  VectorSource,
} from "@maplibre/maplibre-react-native";
import { LocateFixed } from "lucide-react-native";
import { useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { env } from "@/lib/env";

// OpenFreeMap: 무료 OSM 벡터 배경지도(웹과 동일). 등록·API 키 불필요.
const BASEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// buildings.pmtiles: PMTiles v3 / MVT / zoom 0~14 / 단일 레이어 "buildings".
const BUILDINGS_PMTILES_URL =
  env.buildingsPmtilesUrl ??
  "http://ec2-3-38-187-218.ap-northeast-2.compute.amazonaws.com:8080/data/buildings.pmtiles";
const BUILDINGS_SOURCE_LAYER = "buildings";

// [lng, lat] 서울시청 (현위치 확보 전 기본값). MapLibre는 [lng, lat] 순서.
const SEOUL: [number, number] = [126.978, 37.5665];

/**
 * 지도 기본 렌더 (RN). 웹 MapLibreMap의 앱 버전 — 배경지도 + 건물 PMTiles.
 *
 * 웹은 `maplibre-gl` + `pmtiles` JS 라이브러리로 `pmtiles://` 프로토콜을 등록했지만,
 * 네이티브(@maplibre/maplibre-react-native = MapLibre Native)는 SDK가 `pmtiles://`를
 * **직접** 해석하므로 addProtocol이 필요 없다. VectorSource의 url에 전체 경로를 담은
 * `pmtiles://https://.../buildings.pmtiles` 를 주면 된다.
 *
 * ⚠️ 네이티브 전용: 이 파일은 iOS/Android에서만 쓰인다(웹은 MapLibreMap.web.tsx).
 *    실제 렌더/PMTiles 동작은 dev build(시뮬레이터·기기)에서 확인해야 한다.
 * ⚠️ 그림자(PR 15), 코스 마커/경로(PR 16)는 이후 PR에서 이 컴포넌트에 얹는다.
 */
export function MapLibreMap() {
  const cameraRef = useRef<CameraRef>(null);

  const recenter = () =>
    cameraRef.current?.flyTo({ center: SEOUL, zoom: 15, duration: 600 });

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
