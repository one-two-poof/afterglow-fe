import type { MapBounds } from "@/components/MapLibreMap/types";

/**
 * 뷰포트 기반 조회를 캐싱하기 위한 고정 격자 셀 크기(도 단위).
 * 0.04° ≈ 위도 4.4km × 경도 3.5km(서울 기준). 줌 14 폰 화면이 대략 2~6셀에 걸친다.
 */
export const GRID_CELL_SIZE_DEG = 0.04;

export interface GridCell {
  /** 쿼리 키로 쓰는 셀 식별자 ("행:열"). 같은 셀은 항상 같은 id를 가진다. */
  id: string;
  bounds: MapBounds;
}

// 부동소수 오차로 같은 셀의 경계가 요청마다 달라지지 않도록 반올림한다.
const toCoord = (index: number, size: number) =>
  Number((index * size).toFixed(6));

/**
 * 뷰포트를 덮는 고정 격자 셀 목록을 돌려준다.
 * 뷰포트가 조금 움직여도 셀 id는 그대로라, 이미 받은 셀은 캐시에서 재사용된다.
 */
export function getGridCells(
  bounds: MapBounds,
  size = GRID_CELL_SIZE_DEG,
): GridCell[] {
  const minRow = Math.floor(bounds.swLat / size);
  const maxRow = Math.floor(bounds.neLat / size);
  const minCol = Math.floor(bounds.swLng / size);
  const maxCol = Math.floor(bounds.neLng / size);

  const cells: GridCell[] = [];
  for (let row = minRow; row <= maxRow; row += 1) {
    for (let col = minCol; col <= maxCol; col += 1) {
      cells.push({
        id: `${row}:${col}`,
        bounds: {
          swLat: toCoord(row, size),
          neLat: toCoord(row + 1, size),
          swLng: toCoord(col, size),
          neLng: toCoord(col + 1, size),
        },
      });
    }
  }
  return cells;
}
