export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

const MS_PER_DAY = 86_400_000;

export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const addMonths = (date: Date, amount: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const diffInDays = (a: Date, b: Date): number =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY);

export const getMonthMatrix = (
  year: number,
  month: number,
): (Date | null)[][] => {
  const leadingBlanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
};

export const isInRange = (day: Date, range: DateRange): boolean => {
  if (!range.start || !range.end) {
    return false;
  }
  const time = startOfDay(day).getTime();
  return (
    time > startOfDay(range.start).getTime() &&
    time < startOfDay(range.end).getTime()
  );
};

/**
 * 날짜를 탭했을 때의 다음 선택 상태.
 *
 * 규칙: 시작일을 먼저 고르고, 시작일 포함 최대 `maxDays`개까지 선택 가능.
 * 예) maxDays=4 → 15일 선택 후 최대 18일까지(15·16·17·18).
 * 범위 초과/이전 날짜를 탭하면 그 날짜가 새 시작점이 된다.
 */
export const nextRange = (
  range: DateRange,
  day: Date,
  maxDays: number,
): DateRange => {
  const { start, end } = range;

  if (!start || end) {
    return { start: day, end: null };
  }
  if (isSameDay(day, start)) {
    return { start, end: null };
  }

  const diff = diffInDays(start, day);
  // 시작일 포함 maxDays개 → 시작일로부터 최대 (maxDays - 1)일 뒤까지
  if (diff > 0 && diff <= maxDays - 1) {
    return { start, end: day };
  }
  return { start: day, end: null };
};

export const formatMonthTitle = (date: Date): string =>
  `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

export const formatDateWithWeekday = (date: Date): string =>
  `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS_KO[date.getDay()]})`;
