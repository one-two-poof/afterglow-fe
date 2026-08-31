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

export interface MapLibreMapProps {
  /** 지도에 표시할 마커들. 바뀌면 그 마커들이 보이도록 카메라가 이동한다. */
  markers?: MapMarker[];
  /** 마커 클릭 시 호출(상세 카드는 호출부에서 렌더). */
  onMarkerPress?: (marker: MapMarker) => void;
}
