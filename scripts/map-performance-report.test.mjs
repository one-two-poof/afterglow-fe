import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMapPerformanceReport,
  parseMapPerformanceLog,
  percentile,
} from "./map-performance-report.mjs";

test("parses only structured map performance records", () => {
  const records = parseMapPerformanceLog(`
LOG unrelated message
LOG [map-perf] {"event":"building_shadows_rendered","zoom":15,"queryMs":10,"buildMs":20,"totalUntilRenderedMs":40,"sourceFeatures":100,"shadowFeatures":90}
WARN ignored
`);

  assert.equal(records.length, 1);
  assert.equal(records[0].zoom, 15);
  assert.equal(records[0].totalUntilRenderedMs, 40);
});

test("calculates nearest-rank percentiles", () => {
  assert.equal(percentile([10, 20, 30, 40], 50), 20);
  assert.equal(percentile([10, 20, 30, 40], 95), 40);
});

test("builds a markdown report grouped by scenario and zoom", () => {
  const markdown = buildMapPerformanceReport({
    title: "iPhone 15 map test",
    device: "iPhone 15",
    scenarios: [
      {
        label: "optimized",
        records: [
          {
            event: "building_shadows_rendered",
            zoom: 15,
            queryMs: 10,
            buildMs: 20,
            totalUntilRenderedMs: 40,
            sourceFeatures: 100,
            shadowFeatures: 90,
          },
          {
            event: "building_shadows_rendered",
            zoom: 15,
            queryMs: 30,
            buildMs: 40,
            totalUntilRenderedMs: 80,
            sourceFeatures: 120,
            shadowFeatures: 100,
          },
        ],
      },
    ],
  });

  assert.match(markdown, /\| optimized \| 15\.0 \| 2 \| 40\.0 \| 80\.0 \|/);
  assert.match(markdown, /기기: iPhone 15/);
  assert.doesNotMatch(markdown, /latitude|longitude/);
});
