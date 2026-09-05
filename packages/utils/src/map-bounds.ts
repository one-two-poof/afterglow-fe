export interface GeographicBounds {
  swLat: number;
  neLat: number;
  swLng: number;
  neLng: number;
}

/**
 * Expands viewport bounds to a stable coordinate grid.
 * Nearby camera positions then share one cache key without excluding edge data.
 */
export function normalizeMapBounds(
  bounds: GeographicBounds,
  precision = 4,
): GeographicBounds {
  const scale = 10 ** precision;
  return {
    swLat: Math.floor(bounds.swLat * scale) / scale,
    neLat: Math.ceil(bounds.neLat * scale) / scale,
    swLng: Math.floor(bounds.swLng * scale) / scale,
    neLng: Math.ceil(bounds.neLng * scale) / scale,
  };
}
