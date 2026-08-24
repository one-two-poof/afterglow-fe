import { colors, fontFamily, fontSize } from "@afterglow/tokens";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nativewindPreset = require("nativewind/preset");

/**
 * NativeWind(= RN용 Tailwind) 설정.
 *
 * 색/타이포 값은 손으로 적지 않고 `@afterglow/tokens`(theme.css의 TS 미러)에서
 * 그대로 가져와 웹과 단일 진실 원천을 공유한다. 웹은 Tailwind v4(CSS-first),
 * 여기는 NativeWind가 요구하는 Tailwind v3 설정 형식이라 파일 모양은 다르지만
 * 생성되는 클래스 이름(bg-primary-600, text-body-md 등)은 동일하다.
 */
const config = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [nativewindPreset],
  theme: {
    extend: {
      colors,
      fontSize,
      fontFamily,
    },
  },
  plugins: [],
};

export default config;
