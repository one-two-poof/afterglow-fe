import {
  diffInDays,
  getMonthMatrix,
  isInRange,
  nextRange,
  type DateRange,
} from "./date-utils";

const d = (day: number) => new Date(2026, 10, day); // 2026년 11월 x일

describe("getMonthMatrix (2026년 11월)", () => {
  const weeks = getMonthMatrix(2026, 10);

  it("11월 1일은 일요일이라 첫 주가 1~7이다", () => {
    expect(weeks[0]!.map((c) => c?.getDate() ?? null)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it("15~21이 한 주(3주차)에 들어온다 — 15일=일요일", () => {
    expect(weeks[2]!.map((c) => c?.getDate() ?? null)).toEqual([
      15, 16, 17, 18, 19, 20, 21,
    ]);
  });

  it("마지막 주는 29, 30 뒤로 null 패딩", () => {
    expect(weeks[weeks.length - 1]!.map((c) => c?.getDate() ?? null)).toEqual([
      29, 30, null, null, null, null, null,
    ]);
  });
});

describe("nextRange (최대 4일 규칙)", () => {
  const empty: DateRange = { start: null, end: null };

  it("빈 상태에서 탭하면 시작일이 된다", () => {
    expect(nextRange(empty, d(15), 4)).toEqual({ start: d(15), end: null });
  });

  it("시작일 + 4일 뒤까지는 종료일로 선택된다 (15→19)", () => {
    const started: DateRange = { start: d(15), end: null };
    expect(nextRange(started, d(19), 4)).toEqual({ start: d(15), end: d(19) });
  });

  it("시작일 + 5일(20일)은 범위 초과 → 새 시작점이 된다", () => {
    const started: DateRange = { start: d(15), end: null };
    expect(nextRange(started, d(20), 4)).toEqual({ start: d(20), end: null });
  });

  it("시작일 이전 날짜를 탭하면 새 시작점이 된다", () => {
    const started: DateRange = { start: d(15), end: null };
    expect(nextRange(started, d(10), 4)).toEqual({ start: d(10), end: null });
  });

  it("범위 완성 후 탭하면 선택이 초기화된다", () => {
    const full: DateRange = { start: d(15), end: d(19) };
    expect(nextRange(full, d(3), 4)).toEqual({ start: d(3), end: null });
  });
});

describe("isInRange / diffInDays", () => {
  it("양 끝은 제외, 사이 날짜만 true", () => {
    const range: DateRange = { start: d(15), end: d(19) };
    expect(isInRange(d(15), range)).toBe(false);
    expect(isInRange(d(17), range)).toBe(true);
    expect(isInRange(d(19), range)).toBe(false);
  });

  it("diffInDays는 날짜 차이를 반환", () => {
    expect(diffInDays(d(15), d(19))).toBe(4);
  });
});
