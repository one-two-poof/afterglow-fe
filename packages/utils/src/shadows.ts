import * as SunCalc from "suncalc";
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Polygon,
  Position,
} from "geojson";

// 그림자(그늘) 계산.
//
// 방위각/고도 규약(설치된 suncalc 실측으로 검증):
//   SunCalc.getPosition(date, lat, lng) → { altitude, azimuth } 모두 "도(degree)"
//   azimuth: 북쪽 기준 시계방향 (0=N, 90=E, 180=S, 270=W)
//   altitude: 지평선 0°, 천정 90°
// Source(규약): https://github.com/mourner/suncalc

const DEG2RAD = Math.PI / 180;
const METERS_PER_DEG_LAT = 110540;
const METERS_PER_DEG_LNG_EQ = 111320;

// 태양이 이 고도 이하이면 그림자를 그리지 않음(밤/저녁 → 그림자가 무한대로 발산)
const MIN_SUN_ALTITUDE_DEG = 3;
// 저고도에서 그림자 길이가 폭주하는 것을 막는 상한(m)
const MAX_SHADOW_M = 250;
export const MIN_SHADOW_ZOOM = 14;

export function shouldBuildShadows(enabled: boolean, zoom: number): boolean {
  return enabled && zoom >= MIN_SHADOW_ZOOM;
}

type BuildingFeature = { properties: GeoJsonProperties; geometry: Geometry };

const cross = (o: Position, a: Position, b: Position): number =>
  (a[0]! - o[0]!) * (b[1]! - o[1]!) - (a[1]! - o[1]!) * (b[0]! - o[0]!);

/** Andrew monotone chain 볼록껍질. CCW 순서로 반환(닫히지 않음). */
function convexHull(points: Position[]): Position[] {
  const pts = points.slice().sort((a, b) => a[0]! - b[0]! || a[1]! - b[1]!);
  if (pts.length < 3) {
    return pts;
  }

  const lower: Position[] = [];
  for (const p of pts) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: Position[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]!;
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/** Polygon/MultiPolygon에서 외곽 링(들)만 추출. */
function outerRings(geometry: Geometry): Position[][] {
  if (geometry.type === "Polygon") {
    return geometry.coordinates[0] ? [geometry.coordinates[0]] : [];
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .map((poly) => poly[0])
      .filter((ring): ring is Position[] => Boolean(ring));
  }
  return [];
}

/**
 * 뷰포트의 건물 벡터 피처 → 지면 그림자 폴리곤 FeatureCollection.
 *
 * 건물 발자국을 "태양 반대 방향"으로 (HEIGHT / tan(고도))만큼 투영해,
 * 원본 + 이동본 꼭짓점의 볼록껍질을 그림자로 근사한다.
 * (대부분 블록형 건물이라 볼록껍질 근사가 충분하며, union 없이 빠름)
 */
export function buildShadows(
  features: BuildingFeature[],
  center: { lat: number; lng: number },
  date: Date,
  options: { enabled?: boolean } = {},
): FeatureCollection<Polygon> {
  const empty: FeatureCollection<Polygon> = {
    type: "FeatureCollection",
    features: [],
  };

  if (options.enabled === false) {
    return empty;
  }

  const sun = SunCalc.getPosition(date, center.lat, center.lng);
  const altitudeDeg = sun.altitude;
  if (altitudeDeg <= MIN_SUN_ALTITUDE_DEG) {
    return empty;
  }

  const tanAltitude = Math.tan(altitudeDeg * DEG2RAD);
  const azimuthRad = sun.azimuth * DEG2RAD;
  // 그림자 방향 단위벡터(동, 북) = 태양 수평방향의 반대
  //   태양 수평방향 = (sin A, cos A) → 그림자 = (-sin A, -cos A)
  const shadowEast = -Math.sin(azimuthRad);
  const shadowNorth = -Math.cos(azimuthRad);
  const cosLat = Math.cos(center.lat * DEG2RAD);

  const shadowFeatures: Feature<Polygon>[] = [];
  const seen = new Set<number>();

  for (const f of features) {
    // 타일 경계에서 같은 건물이 중복 반환되므로 BLD_ID로 dedupe
    const bldId = f.properties?.BLD_ID;
    if (typeof bldId === "number") {
      if (seen.has(bldId)) {
        continue;
      }
      seen.add(bldId);
    }

    const height = Number(f.properties?.HEIGHT);
    if (!Number.isFinite(height) || height <= 0) {
      continue;
    }

    const length = Math.min(height / tanAltitude, MAX_SHADOW_M);
    const dLng = (length * shadowEast) / (METERS_PER_DEG_LNG_EQ * cosLat);
    const dLat = (length * shadowNorth) / METERS_PER_DEG_LAT;

    for (const ring of outerRings(f.geometry)) {
      const translated = ring.map((pos): Position => [
        pos[0]! + dLng,
        pos[1]! + dLat,
      ]);
      const hull = convexHull([...ring, ...translated]);
      if (hull.length < 3) {
        continue;
      }
      // GeoJSON 링은 첫 좌표로 닫아야 함
      const closed = [...hull, hull[0]!];
      shadowFeatures.push({
        type: "Feature",
        properties: null,
        geometry: { type: "Polygon", coordinates: [closed] },
      });
    }
  }

  return { type: "FeatureCollection", features: shadowFeatures };
}
