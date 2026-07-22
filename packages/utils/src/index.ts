export type ClassValue = string | number | false | null | undefined;

/** 참인 클래스명만 합쳐 하나의 문자열로 반환한다. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/** 날짜를 YYYY.MM.DD 형식(ko-KR)으로 포맷한다. */
export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}
