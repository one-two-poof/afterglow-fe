import type { RouteLine } from "@/lib/route";

/** 마커 클릭 시 하단 카드에 표시할 상세 정보. */
export interface MarkerDetail {
  title: string;
  /** 카테고리·방문순서 등 보조 라인 */
  subtitle?: string;
  /** 주소·거리·실내여부 등 설명 라인 */
  description?: string;
  /** 썸네일 이미지 URL */
  image?: string;
}

/** 지도에 찍을 마커 (웹 MapMarker와 동일 개념). */
export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  /** 마커 클릭 시 보여줄 상세(없으면 카드 미표시) */
  detail?: MarkerDetail;
}

/** 경로 시작/도착 지점 핀. 색으로 시작(start)·도착(end)을 구분한다. */
export interface RoutePin {
  lat: number;
  lng: number;
  kind: "start" | "end";
}

/** MapLibreMap 임퍼러티브 핸들. 지점 선택(중앙 십자선) 확정 등에 사용. */
export interface MapLibreMapRef {
  /** 현재 지도 중앙 좌표(없으면 null). */
  getCenter: () => Promise<{ lat: number; lng: number } | null>;
}

export interface MapLibreMapProps {
  /** 지도에 표시할 마커들. 바뀌면 그 마커들이 보이도록 카메라가 이동한다. */
  markers?: MapMarker[];
  /** 마커 클릭 시 호출(상세 카드는 호출부에서 렌더). */
  onMarkerPress?: (marker: MapMarker) => void;
  /** 그릴 경로들(최단·그늘). 색은 shady 여부로 구분. 바뀌면 경로가 보이도록 카메라 이동. */
  routeLines?: RouteLine[];
  /** 경로 시작·도착 지점 핀(경로 설정 중 표시). */
  routePins?: RoutePin[];
  /** 지점 선택 모드에서 지도를 탭하면 좌표([lng,lat] 아닌 {lat,lng})를 알린다. */
  onMapPress?: (coord: { lat: number; lng: number }) => void;
}
