/**
 * 그늘 경로 API 클라이언트.
 * 코스의 연속한 두 지점(from→to)을 받아 실제 경로(GeoJSON LineString)를 돌려준다.
 * at은 항상 현재 시각(그림자/그늘 계산 기준).
 */
import { toLatLng, type MapPoint } from "@afterglow/utils";

import type { RecommendedCourse } from "@/types/recommendation";

// route API는 인증 BE와 동일 base(NEXT_PUBLIC_API_URL) 사용 (lib/auth.ts와 동일 패턴)
const routeApiUrl = () =>
  new URL("api/route", process.env.NEXT_PUBLIC_API_URL).toString();

/** 경로 API 요청/응답 (백엔드 계약) — 요청은 lat/lon 사용 */
export interface RoutePoint {
  lat: number;
  lon: number;
}

export interface RouteRequest {
  from: RoutePoint;
  to: RoutePoint;
  /** ISO 8601. 항상 현재 시각 */
  at: string;
}

export interface RouteResult {
  lambda: number;
  label: string;
  distanceM: number;
  avgShadeRatio: number;
  /** GeoJSON LineString (coordinates: [lng, lat][]) */
  geometry: {
    type: string;
    coordinates: number[][];
  };
}

export interface RouteResponse {
  at: string;
  from: RoutePoint & { snappedNodeId: number; snapDistanceM: number };
  to: RoutePoint & { snappedNodeId: number; snapDistanceM: number };
  routes: RouteResult[];
}

/** MapPoint(mapX=lng/mapY=lat) → 경로 API 요청 좌표({lat, lon}) */
const toRoutePoint = (p: MapPoint): RoutePoint => {
  const { lat, lng } = toLatLng(p);
  return { lat, lon: lng };
};

/** 한 구간(from→to)의 경로 조회 */
export async function fetchRoute(req: RouteRequest): Promise<RouteResponse> {
  const res = await fetch(routeApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`경로 요청 실패 (${res.status})`);
  }
  return res.json() as Promise<RouteResponse>;
}

/** 지도에 그릴 한 구간 경로 (좌표 + 그늘 정보) */
export interface RouteLine {
  /** LineString 좌표 ([lng, lat][]) */
  coordinates: number[][];
  /** 경로 라벨 (예: "shortest", "shady") */
  label: string;
  /** 이 구간 경로의 평균 그늘 비율 (0~1). 높을수록 그늘짐 */
  shadeRatio: number;
  /** 그늘 우선(shady) 경로인지. shortest 경로는 false */
  shady: boolean;
}

// TODO: label 실제 문자열 확인 후 조정. 지금은 label에 "shad" 포함 = shady로 판정.
const isShady = (label: string): boolean => /shad/i.test(label);

/**
 * 코스 전체를 구간별로 경로 조회 → RouteLine 배열로.
 * 하루 안에서 [출발지, ...방문 장소]를 순서대로 이어 구간을 만든다.
 * 응답의 routes[](shortest·shady)를 모두 그린다.
 */
export async function fetchCourseRouteLines(
  course: RecommendedCourse,
): Promise<RouteLine[]> {
  const at = new Date().toISOString();
  const lines: RouteLine[] = [];

  for (const day of course.daily_schedules) {
    const points: MapPoint[] = [day.start_location, ...day.places];
    for (let i = 0; i < points.length - 1; i += 1) {
      const res = await fetchRoute({
        from: toRoutePoint(points[i]!),
        to: toRoutePoint(points[i + 1]!),
        at,
      });
      for (const route of res.routes) {
        if (!route.geometry) {
          continue;
        }
        lines.push({
          coordinates: route.geometry.coordinates,
          label: route.label,
          shadeRatio: route.avgShadeRatio,
          shady: isShady(route.label),
        });
      }
    }
  }

  return lines;
}
