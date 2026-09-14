import assert from "node:assert/strict";
import test from "node:test";

import { getGridCells } from "../src/lib/map-grid.ts";

test("covers the viewport with fixed grid cells", () => {
  const cells = getGridCells({
    swLat: 37.55,
    neLat: 37.59,
    swLng: 126.97,
    neLng: 126.99,
  });

  assert.deepEqual(
    cells.map((cell) => cell.id),
    ["938:3174", "939:3174"],
  );
  assert.deepEqual(cells[0].bounds, {
    swLat: 37.52,
    neLat: 37.56,
    swLng: 126.96,
    neLng: 127,
  });
});

test("keeps the same cell ids when the viewport moves slightly", () => {
  const before = getGridCells({
    swLat: 37.561,
    neLat: 37.579,
    swLng: 126.961,
    neLng: 126.979,
  });
  const after = getGridCells({
    swLat: 37.5612,
    neLat: 37.5793,
    swLng: 126.9608,
    neLng: 126.9795,
  });

  assert.deepEqual(
    after.map((cell) => cell.id),
    before.map((cell) => cell.id),
  );
});

test("only adds new cells for the newly visible area after panning", () => {
  const before = new Set(
    getGridCells({
      swLat: 37.53,
      neLat: 37.57,
      swLng: 126.97,
      neLng: 127.01,
    }).map((cell) => cell.id),
  );
  const after = getGridCells({
    swLat: 37.53,
    neLat: 37.57,
    swLng: 126.99,
    neLng: 127.05,
  }).map((cell) => cell.id);

  const reused = after.filter((id) => before.has(id));
  assert.ok(reused.length > 0);
  assert.ok(after.length > reused.length);
});
