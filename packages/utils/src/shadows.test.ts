import type { Feature, Geometry, Polygon } from "geojson";

import { buildShadows, shouldBuildShadows } from "./shadows";

// 서울시청 근처, 한 변 약 20m 정사각형 건물(높이 30m)
const SEOUL = { lat: 37.5665, lng: 126.978 };
const D = 0.0001; // 약 10m
const squareBuilding = (
  height: number,
): { properties: Record<string, number>; geometry: Geometry } => ({
  properties: { BLD_ID: 1, HEIGHT: height },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [SEOUL.lng - D, SEOUL.lat - D],
        [SEOUL.lng + D, SEOUL.lat - D],
        [SEOUL.lng + D, SEOUL.lat + D],
        [SEOUL.lng - D, SEOUL.lat + D],
        [SEOUL.lng - D, SEOUL.lat - D],
      ],
    ],
  },
});

const bounds = (f: Feature<Polygon>) => {
  const ring = f.geometry.coordinates[0]!;
  const lngs = ring.map((p) => p[0]!);
  const lats = ring.map((p) => p[1]!);
  return {
    maxLng: Math.max(...lngs),
    minLng: Math.min(...lngs),
    maxLat: Math.max(...lats),
    minLat: Math.min(...lats),
  };
};

describe("buildShadows", () => {
  it("returns no geometry when the shadow overlay is disabled", () => {
    const afternoon = new Date("2026-08-13T15:00:00+09:00");
    const fc = buildShadows([squareBuilding(30)], SEOUL, afternoon, {
      enabled: false,
    });

    expect(fc.features).toHaveLength(0);
  });

  it("오후(15시) 태양은 WSW → 그림자는 ENE(동+북)로 뻗는다", () => {
    const afternoon = new Date("2026-08-13T15:00:00+09:00");
    const fc = buildShadows([squareBuilding(30)], SEOUL, afternoon);

    expect(fc.features).toHaveLength(1);
    const b = bounds(fc.features[0]!);
    // 그림자가 건물 동/북쪽으로 확장 → 그림자 범위가 건물 경계보다 동/북으로 더 나감
    expect(b.maxLng).toBeGreaterThan(SEOUL.lng + D); // 동쪽으로 확장
    expect(b.maxLat).toBeGreaterThan(SEOUL.lat + D); // 북쪽으로 확장
    // 서/남쪽으로는 건물 경계에서 크게 벗어나지 않음
    expect(b.minLng).toBeCloseTo(SEOUL.lng - D, 5);
    expect(b.minLat).toBeCloseTo(SEOUL.lat - D, 5);
  });

  it("해가 지평선 아래(한밤)면 그림자를 만들지 않는다", () => {
    const midnight = new Date("2026-08-13T00:00:00+09:00");
    const fc = buildShadows([squareBuilding(30)], SEOUL, midnight);
    expect(fc.features).toHaveLength(0);
  });

  it("HEIGHT가 없거나 0 이하인 건물은 건너뛴다", () => {
    const afternoon = new Date("2026-08-13T15:00:00+09:00");
    const noHeight = squareBuilding(0);
    const fc = buildShadows([noHeight], SEOUL, afternoon);
    expect(fc.features).toHaveLength(0);
  });

  it("높은 건물일수록 그림자가 길다", () => {
    const afternoon = new Date("2026-08-13T15:00:00+09:00");
    const short = buildShadows([squareBuilding(10)], SEOUL, afternoon);
    const tall = buildShadows([squareBuilding(50)], SEOUL, afternoon);
    const shortReach = bounds(short.features[0]!).maxLng;
    const tallReach = bounds(tall.features[0]!).maxLng;
    expect(tallReach).toBeGreaterThan(shortReach);
  });
});

describe("shouldBuildShadows", () => {
  it("only enables expensive shadow work at the supported zoom", () => {
    expect(shouldBuildShadows(true, 14.99)).toBe(false);
    expect(shouldBuildShadows(true, 15)).toBe(true);
    expect(shouldBuildShadows(false, 16)).toBe(false);
  });
});
