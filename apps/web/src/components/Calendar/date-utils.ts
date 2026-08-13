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

export const nextRange = (
  range: DateRange,
  day: Date,
  maxDaysFromStart: number,
): DateRange => {
  const { start, end } = range;

  if (!start || end) {
    return { start: day, end: null };
  }
  if (isSameDay(day, start)) {
    return { start, end: null };
  }

  const diff = diffInDays(start, day);
  if (diff > 0 && diff <= maxDaysFromStart) {
    return { start, end: day };
  }
  return { start: day, end: null };
};

export const formatMonthTitle = (date: Date): string =>
  `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

export const formatDateWithWeekday = (date: Date): string =>
  `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS_KO[date.getDay()]})`;
