"use client";

// maplibre-gl v5 사용: v6는 워커를 별도 ES 모듈(maplibre-gl-worker.mjs)로 분리하는데
// Next.js 번들러가 이 워커 청크를 서빙하지 못해 404 → 지도가 로드되지 않음
import * as maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { useEffect, useRef } from "react";

import { buildShadows } from "./shadows";

// MapLibre 스타일이 정상 렌더되려면 CSS를 먼저 로드해야 함
// Source: https://maplibre.org/maplibre-gl-js/docs/ (Quickstart)
import "maplibre-gl/dist/maplibre-gl.css";

// OpenFreeMap: 무료 OSM 벡터 배경지도. 등록·API 키·사용량 제한 없음
// Source: https://openfreemap.org/quick_start/
const BASEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// buildings.pmtiles: PMTiles v3 / MVT(벡터) / zoom 0~14 / 단일 레이어 "buildings"
// (fields: ADDR, BLD_ID, HEIGHT, USE_NAME) — HEIGHT는 추후 그림자 계산에 사용
const BUILDINGS_PMTILES_URL =
  process.env.NEXT_PUBLIC_BUILDINGS_PMTILES_URL ??
  "http://ec2-3-38-187-218.ap-northeast-2.compute.amazonaws.com:8080/data/buildings.pmtiles";

// pmtiles 소스가 참조하는 vector layer id (pmtiles 메타데이터의 vector_layers[].id)
const BUILDINGS_SOURCE_LAYER = "buildings";

// 디자인 토큰(@afterglow/tokens의 theme.css CSS 변수)을 런타임에 실제 색 문자열로 해석.
// MapLibre paint는 var(--...) 를 못 쓰므로 getComputedStyle로 값을 읽어 넘긴다.
function readColorToken(name: string, fallback: string): string {
  if (typeof document === "undefined") {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

export default function MapLibreMap() {
  const mapEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapEl.current) {
      return;
    }

    // pmtiles 프로토콜 등록 → 스타일의 "pmtiles://" 소스를 라이브러리가
    // HTTP Range 요청으로 알아서 조각 로드함 (직접 Range 헤더를 다룰 필요 없음)
    // Source: https://github.com/protomaps/PMTiles/tree/main/js
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    const map = new maplibregl.Map({
      container: mapEl.current,
      style: BASEMAP_STYLE_URL,
      center: [126.978, 37.5665], // [lng, lat] 서울시청
      zoom: 15,
    });

    // 배경 스타일 로드 완료 후 건물 소스/레이어를 추가
    // Source: https://maplibre.org/maplibre-gl-js/docs/ (addSource/addLayer)
    map.on("load", () => {
      map.addSource("buildings", {
        type: "vector",
        url: `pmtiles://${BUILDINGS_PMTILES_URL}`,
      });

      // 그림자는 프론트에서 계산 → 빈 GeoJSON 소스로 시작해 이동 시 갱신
      map.addSource("shadows", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // 디자인 토큰 기반 색상 (기존 하드코딩 색과 가장 유사한 토큰으로 매핑)
      const shadowColor = readColorToken("--color-secondary-900", "#1c2b45");
      const buildingColor = readColorToken("--color-neutral-600", "#5f6b78");
      const buildingOutlineColor = readColorToken(
        "--color-neutral-700",
        "#3f4b58",
      );

      // 그림자 레이어를 먼저 추가 → 건물 레이어가 그 위에 그려짐(건물이 그림자 위)
      map.addLayer({
        id: "buildings-shadow",
        type: "fill",
        source: "shadows",
        paint: {
          "fill-color": shadowColor,
          "fill-opacity": 0.35,
        },
      });

      map.addLayer({
        id: "buildings-fill",
        type: "fill",
        source: "buildings",
        "source-layer": BUILDINGS_SOURCE_LAYER,
        paint: {
          "fill-color": buildingColor,
          "fill-opacity": 0.55,
          "fill-outline-color": buildingOutlineColor,
        },
      });

      // 뷰포트의 건물로 그림자를 계산해 shadows 소스에 반영
      const updateShadows = () => {
        const features = map.querySourceFeatures("buildings", {
          sourceLayer: BUILDINGS_SOURCE_LAYER,
        });
        const center = map.getCenter();
        // 그림자는 항상 현재 시각의 태양 위치 기준으로 계산
        // (경로 요청의 at은 사용하지 않음 — "지금 이 시간의 그늘"이 핵심)
        const data = buildShadows(
          features,
          { lat: center.lat, lng: center.lng },
          new Date(),
        );
        map.getSource<maplibregl.GeoJSONSource>("shadows")?.setData(data);
      };

      // 이동/줌 종료 시 재계산. 최초 1회는 타일 로드가 끝난 idle 시점에 계산
      map.on("moveend", updateShadows);
      map.once("idle", updateShadows);
    });

    return () => {
      map.remove();
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  return <div ref={mapEl} className="h-full w-full" />;
}
