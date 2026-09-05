import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const LOG_MARKER = "[map-perf]";

export function parseMapPerformanceLog(text) {
  if (Buffer.isBuffer(text)) {
    const isUtf16Le =
      (text[0] === 0xff && text[1] === 0xfe) ||
      (text.length > 1 && text[1] === 0x00);
    text = text.subarray(isUtf16Le && text[0] === 0xff ? 2 : 0).toString(
      isUtf16Le ? "utf16le" : "utf8",
    );
  }
  const records = [];
  for (const line of text.split(/\r?\n/)) {
    const markerIndex = line.indexOf(LOG_MARKER);
    if (markerIndex < 0) continue;
    const json = line.slice(markerIndex + LOG_MARKER.length).trim();
    try {
      const record = JSON.parse(json);
      if (record.event === "building_shadows_measured") records.push(record);
    } catch {
      // DevTools probe 등 같은 marker를 쓴 비구조화 로그는 집계에서 제외한다.
    }
  }
  return records;
}

export function percentile(values, percentage) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil((percentage / 100) * sorted.length) - 1);
  return sorted[index];
}

const average = (values) =>
  values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
const format = (value) => value.toFixed(1);

export function buildMapPerformanceReport({ title, device, scenarios }) {
  const rows = [];
  for (const scenario of scenarios) {
    const byZoom = new Map();
    for (const record of scenario.records) {
      const zoom = Number(record.zoom).toFixed(1);
      byZoom.set(zoom, [...(byZoom.get(zoom) ?? []), record]);
    }
    for (const [zoom, records] of [...byZoom].sort(([a], [b]) => a - b)) {
      rows.push(
        `| ${scenario.label} | ${zoom} | ${records.length} | ${format(
          percentile(
            records.map((record) => record.totalUntilNextFrameMs),
            50,
          ),
        )} | ${format(
          percentile(
            records.map((record) => record.totalUntilNextFrameMs),
            95,
          ),
        )} | ${format(
          percentile(
            records.map((record) => record.queryMs),
            50,
          ),
        )} | ${format(
          percentile(
            records.map((record) => record.buildMs),
            50,
          ),
        )} | ${format(
          average(records.map((record) => record.sourceFeatures)),
        )} | ${format(
          average(records.map((record) => record.shadowFeatures)),
        )} |`,
      );
    }
  }

  return `# ${title}

> 생성일: ${new Date().toISOString()}
> 기기: ${device}

정확한 위치 좌표는 수집하지 않는다. 수치는 밀리초(ms), 피처 수는 표본 평균이다.

| 시나리오 | 줌 | 표본 | 총 p50 | 총 p95 | 조회 p50 | 계산 p50 | 입력 건물 | 그림자 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows.join("\n") || "| 표본 없음 | - | 0 | - | - | - | - | - | - |"}
`;
}

function parseArguments(argv) {
  const options = { inputs: [], title: "지도 성능 측정", device: "미기재" };
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!value) throw new Error(`${flag} 값이 필요합니다.`);
    if (flag === "--input") options.inputs.push(value);
    else if (flag === "--output") options.output = value;
    else if (flag === "--title") options.title = value;
    else if (flag === "--device") options.device = value;
    else throw new Error(`알 수 없는 옵션: ${flag}`);
  }
  if (options.inputs.length === 0 || !options.output) {
    throw new Error(
      "사용법: --input <시나리오=로그파일> [--input ...] --output <보고서.md>",
    );
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const scenarios = await Promise.all(
    options.inputs.map(async (input) => {
      const separator = input.indexOf("=");
      if (separator <= 0) throw new Error(`잘못된 input 형식: ${input}`);
      const label = input.slice(0, separator);
      const file = input.slice(separator + 1);
      return {
        label,
        records: parseMapPerformanceLog(await readFile(file)),
      };
    }),
  );
  const output = resolve(options.output);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(
    output,
    buildMapPerformanceReport({
      title: options.title,
      device: options.device,
      scenarios,
    }),
    "utf8",
  );
  console.log(`지도 성능 보고서 생성: ${output}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await main();
}
