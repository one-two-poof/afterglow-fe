/**
 * 좌표 변환 유틸. ML·BE 두 서버 모두 좌표를 mapX/mapY로 내려주므로,
 * 서버 응답을 지도(위/경도)로 쓰기 전에 이 경계에서 한 번 변환한다.
 */

/** 서버(ML·BE 공통)가 내려주는 좌표 형태 */
export interface MapPoint {
  mapX: number;
  mapY: number;
}

/** 지도(MapLibre)에서 쓰는 좌표 형태 */
export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * 서버 좌표(mapX/mapY) → 지도 좌표(lat/lng) 변환.
 * 관례 확정: mapX = 경도(lng), mapY = 위도(lat). (ML·BE 공통)
 */
export function toLatLng(point: MapPoint): LatLng {
  return { lat: point.mapY, lng: point.mapX };
}
