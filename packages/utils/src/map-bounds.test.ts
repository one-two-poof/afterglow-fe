import { normalizeMapBounds } from "./map-bounds";

describe("normalizeMapBounds", () => {
  it("rounds viewport coordinates so tiny camera movements reuse one query", () => {
    expect(
      normalizeMapBounds({
        swLat: 37.500041,
        neLat: 37.600049,
        swLng: 126.900041,
        neLng: 127.000049,
      }),
    ).toEqual({
      swLat: 37.5,
      neLat: 37.6001,
      swLng: 126.9,
      neLng: 127.0001,
    });
  });

  it("preserves coordinate ordering after rounding", () => {
    const normalized = normalizeMapBounds({
      swLat: 37.50004,
      neLat: 37.500049,
      swLng: 126.90004,
      neLng: 126.900049,
    });

    expect(normalized.neLat).toBeGreaterThan(normalized.swLat);
    expect(normalized.neLng).toBeGreaterThan(normalized.swLng);
  });
});
