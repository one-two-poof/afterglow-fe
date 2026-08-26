/** 지도에 찍을 마커 (웹 MapMarker와 동일 개념). */
export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
}

export interface MapLibreMapProps {
  /** 지도에 표시할 마커들. 바뀌면 그 마커들이 보이도록 카메라가 이동한다. */
  markers?: MapMarker[];
}
