"use client";

// maplibre-gl v5 사용: v6는 워커를 별도 ES 모듈(maplibre-gl-worker.mjs)로 분리하는데
// Next.js 번들러가 이 워커 청크를 서빙하지 못해 404 → 지도가 로드되지 않음
import { buildShadows, type LatLng } from "@afterglow/utils";
import { LocateFixed } from "lucide-react";
import * as maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { useEffect, useRef } from "react";

import type { RouteLine } from "@/lib/route";

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

// 마커로 찍을 장소. MapLibre는 [lng, lat] 순서를 쓰지만, 순서 혼동을 막기 위해
// 튜플이 아니라 명시적 { lat, lng } 객체(utils의 LatLng)로 받는다 (내부에서 [lng, lat]로 변환).
// toLatLng() 결과가 그대로 흘러들 수 있게 LatLng을 확장.
// Source: https://maplibre.org/maplibre-gl-js/docs/API/classes/Marker/ (setLngLat)
export type MapMarker = LatLng & {
  // 팝업에 표시할 장소명(선택). 예: "OO 백화점"
  label?: string;
};

type MapLibreMapProps = {
  markers?: MapMarker[];
  /**
   * 카테고리 장소처럼 수가 많은 지점들. DOM Marker 대신 GeoJSON 소스 +
   * circle 레이어(GPU 렌더)로 그리고 클러스터링해 수천 개도 렉 없이 표시한다.
   */
  places?: MapMarker[];
  /** 그릴 경로들 (shortest·shady 모두). shady는 빨강, 그 외 파랑 */
  routeLines?: RouteLine[];
};

/** 많은 장소를 클러스터 circle 레이어용 GeoJSON으로 변환 (label을 속성으로) */
function placesToFeatureCollection(
  places: MapMarker[],
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: places.map(({ lat, lng, label }) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: { label: label ?? "" },
    })),
  };
}

/** 경로들을 line 레이어용 GeoJSON FeatureCollection으로 변환 (shady를 속성으로) */
function linesToFeatureCollection(
  lines: RouteLine[],
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  return {
    type: "FeatureCollection",
    features: lines.map(({ coordinates, shady }) => ({
      type: "Feature",
      geometry: { type: "LineString", coordinates },
      properties: { shady },
    })),
  };
}

/** Point 지오메트리에서 [lng, lat] 튜플을 안전하게 뽑는다 (아니면 null). */
function pointCenter(
  geometry: GeoJSON.Geometry | undefined,
): [number, number] | null {
  if (geometry?.type !== "Point") {
    return null;
  }
  const [lng, lat] = geometry.coordinates;
  return lng == null || lat == null ? null : [lng, lat];
}

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

export default function MapLibreMap({
  markers = [],
  places = [],
  routeLines = [],
}: MapLibreMapProps) {
  const mapEl = useRef<HTMLDivElement>(null);
  // 마커 갱신 effect에서 지도 인스턴스에 접근하기 위해 ref로 보관
  const mapRef = useRef<maplibregl.Map | null>(null);
  // 현재 지도에 올라간 마커들 — markers prop이 바뀌면 걷어내고 다시 그린다
  const markerRefs = useRef<maplibregl.Marker[]>([]);
  // 최신 routeLines를 load 핸들러(클로저)에서 읽기 위한 ref
  const routeLinesRef = useRef<RouteLine[]>(routeLines);
  // 최신 places를 load 핸들러(클로저)에서 읽기 위한 ref
  const placesRef = useRef<MapMarker[]>(places);
  // 현위치(위/경도). 최초 포커스 + 나침반 버튼에서 재사용
  const userLocationRef = useRef<LatLng | null>(null);

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
      center: [126.978, 37.5665], // [lng, lat] 서울시청 (현위치 확보 전 기본값)
      zoom: 15,
      // 우측 하단 기본 attribution("MapLibre …") 숨김
      attributionControl: false,
    });
    mapRef.current = map;

    // 지도 진입 시 현위치를 확보해 중앙으로 이동 (거부/실패 시 기본값 유지)
    let cancelled = false;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) {
            return;
          }
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          userLocationRef.current = loc;
          map.flyTo({ center: [loc.lng, loc.lat], zoom: 15 });
        },
        undefined,
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }

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

      // 코스 경로 line — 빈 소스로 시작, routeLines prop이 바뀔 때 setData
      map.addSource("routes", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // 카테고리 장소 — 클러스터링 활성 GeoJSON 소스. 빈 소스로 시작해
      // places prop이 바뀔 때 setData. cluster로 가까운 점들을 뭉쳐 렌더 부담을 줄인다.
      // Source: https://maplibre.org/maplibre-gl-js/docs/examples/cluster/
      map.addSource("places", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
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

      // 경로 line 레이어 (건물 위에 그려짐)
      // shady 경로는 빨강, shortest 경로는 파랑
      const shadyColor = readColorToken("--color-danger-500", "#ef4444");
      const routeColor = readColorToken("--color-primary-500", "#3b82f6");
      map.addLayer({
        id: "routes-line",
        type: "line",
        source: "routes",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": [
            "case",
            ["get", "shady"],
            shadyColor,
            routeColor,
          ],
          "line-width": 4,
        },
      });

      // 장소 마커 색상 (검색·코스 DOM Marker와 구분되는 카테고리 지점 색)
      const placeColor = readColorToken("--color-primary-500", "#3b82f6");
      const clusterTextColor = readColorToken("--color-neutral-0", "#ffffff");

      // 클러스터(뭉친 점): 개수가 많을수록 원을 크게
      map.addLayer({
        id: "places-clusters",
        type: "circle",
        source: "places",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": placeColor,
          "circle-opacity": 0.85,
          "circle-radius": [
            "step",
            ["get", "point_count"],
            16,
            10,
            22,
            50,
            30,
          ],
        },
      });

      // 클러스터 개수 라벨
      map.addLayer({
        id: "places-cluster-count",
        type: "symbol",
        source: "places",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 12,
        },
        paint: { "text-color": clusterTextColor },
      });

      // 개별 지점(클러스터에 속하지 않은 점)
      map.addLayer({
        id: "places-point",
        type: "circle",
        source: "places",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": placeColor,
          "circle-radius": 7,
          "circle-stroke-width": 2,
          "circle-stroke-color": clusterTextColor,
        },
      });

      // 클러스터 클릭 → 해당 클러스터가 펼쳐지는 줌까지 확대
      map.on("click", "places-clusters", (e) => {
        const feature = e.features?.[0];
        const clusterId = feature?.properties?.cluster_id;
        const center = pointCenter(feature?.geometry);
        if (clusterId == null || !center) {
          return;
        }
        const source = map.getSource<maplibregl.GeoJSONSource>("places");
        source?.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.easeTo({ center, zoom });
        });
      });

      // 개별 지점 클릭 → 장소명 팝업
      map.on("click", "places-point", (e) => {
        const feature = e.features?.[0];
        const center = pointCenter(feature?.geometry);
        const label = feature?.properties?.label;
        if (!center || !label) {
          return;
        }
        new maplibregl.Popup()
          .setLngLat(center)
          .setText(String(label))
          .addTo(map);
      });

      // 커서 표시: 클러스터/지점 위에서 pointer로
      for (const layer of ["places-clusters", "places-point"]) {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      }

      // 최초 로드 시 이미 전달된 경로/장소가 있으면 반영
      map
        .getSource<maplibregl.GeoJSONSource>("routes")
        ?.setData(linesToFeatureCollection(routeLinesRef.current));
      map
        .getSource<maplibregl.GeoJSONSource>("places")
        ?.setData(placesToFeatureCollection(placesRef.current));

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
      cancelled = true;
      mapRef.current = null;
      map.remove();
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  // markers prop이 바뀔 때마다 기존 마커를 걷어내고 새로 그린다.
  // Marker는 DOM 오버레이라 스타일 로드 여부와 무관하게 Map 생성 직후 추가 가능.
  // Source: https://maplibre.org/maplibre-gl-js/docs/API/classes/Marker/ (addTo/remove)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    for (const marker of markerRefs.current) {
      marker.remove();
    }

    markerRefs.current = markers.map(({ lat, lng, label }) => {
      const marker = new maplibregl.Marker()
        // { lat, lng }를 MapLibre가 요구하는 [lng, lat] 순서로 변환
        .setLngLat([lng, lat])
        .addTo(map);
      if (label) {
        marker.setPopup(new maplibregl.Popup().setText(label));
      }
      return marker;
    });

    // 마커가 있으면 전부 보이도록 뷰포트를 맞춘다(코스 Tag 클릭 시 해당 코스로 이동).
    // Source: https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#fitbounds
    if (markers.length > 0) {
      const bounds = markers.reduce(
        (acc, { lat, lng }) => acc.extend([lng, lat]),
        new maplibregl.LngLatBounds(),
      );
      map.fitBounds(bounds, { padding: 64, maxZoom: 16, duration: 600 });
    }

    return () => {
      for (const marker of markerRefs.current) {
        marker.remove();
      }
      markerRefs.current = [];
    };
  }, [markers]);

  // routeLines가 바뀌면 line 소스를 갱신. 소스는 스타일 로드 후 생기므로,
  // 아직이면 idle 시점에 반영(또는 load 핸들러가 routeLinesRef로 최초 반영).
  useEffect(() => {
    routeLinesRef.current = routeLines;
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const apply = () => {
      map
        .getSource<maplibregl.GeoJSONSource>("routes")
        ?.setData(linesToFeatureCollection(routeLinesRef.current));
    };
    if (map.getSource("routes")) {
      apply();
    } else {
      map.once("idle", apply);
    }
  }, [routeLines]);

  // places가 바뀌면 클러스터 소스를 갱신하고, 지점이 있으면 모두 보이도록 이동.
  // 소스는 스타일 로드 후 생기므로, 아직이면 idle 시점에 반영.
  useEffect(() => {
    placesRef.current = places;
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const apply = () => {
      map
        .getSource<maplibregl.GeoJSONSource>("places")
        ?.setData(placesToFeatureCollection(placesRef.current));
      if (placesRef.current.length > 0) {
        const bounds = placesRef.current.reduce(
          (acc, { lat, lng }) => acc.extend([lng, lat]),
          new maplibregl.LngLatBounds(),
        );
        map.fitBounds(bounds, { padding: 64, maxZoom: 16, duration: 600 });
      }
    };
    if (map.getSource("places")) {
      apply();
    } else {
      map.once("idle", apply);
    }
  }, [places]);

  // 나침반 버튼: 현위치로 복귀 (아직 위치가 없으면 다시 요청)
  const handleRecenter = () => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const loc = userLocationRef.current;
    if (loc) {
      map.flyTo({ center: [loc.lng, loc.lat], zoom: 15 });
      return;
    }
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        userLocationRef.current = next;
        map.flyTo({ center: [next.lng, next.lat], zoom: 15 });
      });
    }
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mapEl} className="h-full w-full" />
      <button
        type="button"
        onClick={handleRecenter}
        aria-label="현위치로 이동"
        className="absolute bottom-24 left-5 z-10 flex size-14 items-center justify-center rounded-full bg-neutral-0 text-text shadow-md transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none"
      >
        <LocateFixed size={24} aria-hidden="true" />
      </button>
    </div>
  );
}
