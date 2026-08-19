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
 * 임시(경로 추천 디버깅용): 코스 전체를 "출발지 → 도착지" 단일 구간으로만 그린다.
 * - 출발지 = 코스의 맨 처음 지점(첫날 start_location)
 * - 도착지 = 코스의 맨 마지막 지점(마지막 방문 장소)
 * 중간 장소는 무시하고 두 점만 API로 이어 응답의 routes[](shortest·shady)를 그린다.
 */
export async function fetchCourseRouteLines(
  course: RecommendedCourse,
): Promise<RouteLine[]> {
  const points: MapPoint[] = course.daily_schedules.flatMap((day) => [
    day.start_location,
    ...day.places,
  ]);
  const from = points[0];
  const to = points[points.length - 1];
  if (!from || !to || from === to) {
    return [];
  }

  const res = await fetchRoute({
    from: toRoutePoint(from),
    to: toRoutePoint(to),
    at: new Date().toISOString(),
  });

  return res.routes
    .filter((route) => route.geometry)
    .map((route) => ({
      coordinates: route.geometry.coordinates,
      label: route.label,
      shadeRatio: route.avgShadeRatio,
      shady: isShady(route.label),
    }));
}
