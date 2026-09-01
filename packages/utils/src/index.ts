import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export { toLatLng, type MapPoint, type LatLng } from "./geo";
export { buildShadows } from "./shadows";
export * from "./date-utils";

/**
 * 조건부 클래스 합성(clsx) + Tailwind 클래스 충돌 병합(tailwind-merge).
 * 뒤에 온 클래스가 앞의 충돌 클래스를 덮어쓴다. (예: cn("w-full", "w-[80%]") → "w-[80%]")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
