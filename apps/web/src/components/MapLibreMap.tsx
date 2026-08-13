"use client";

// maplibre-gl v5 사용: v6는 워커를 별도 ES 모듈(maplibre-gl-worker.mjs)로 분리하는데
// Next.js 번들러가 이 워커 청크를 서빙하지 못해 404 → 지도가 로드되지 않음
import * as maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { useEffect, useRef } from "react";

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

      map.addLayer({
        id: "buildings-fill",
        type: "fill",
        source: "buildings",
        "source-layer": BUILDINGS_SOURCE_LAYER,
        paint: {
          "fill-color": "#6b7280",
          "fill-opacity": 0.55,
          "fill-outline-color": "#374151",
        },
      });
    });

    return () => {
      map.remove();
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  return <div ref={mapEl} className="h-full w-full" />;
}
