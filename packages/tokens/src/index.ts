/**
 * 디자인 토큰 TS export.
 *
 * 웹은 theme.css의 CSS 변수를 그대로 쓰지만, React Native에는 CSS 변수도 전역
 * 스타일시트도 없다. 그래서 theme.css와 "같은 값"을 TS 객체로 한 번 더 정의해
 * NativeWind(tailwind.config)와 RN StyleSheet 양쪽에서 재사용한다.
 *
 * ⚠️ theme.css가 단일 진실 원천(source of truth). 이 파일은 그 값을 손으로 미러링한
 * 것이므로 theme.css를 바꾸면 여기도 함께 갱신해야 한다. 색의 `var()` 참조는 실제
 * hex 값으로 풀어서 적는다 — RN은 런타임 var 해석을 지원하지 않기 때문.
 */

/**
 * 색 팔레트. theme.css의 `--color-*` 를 flat 키로 미러링한다.
 *
 * 키 이름은 웹 클래스와 1:1로 맞춘다: `bg-primary-600`, `text-text-secondary`,
 * `border-border-accent` 등. tailwind.config의 `theme.extend.colors`에 그대로
 * 펼쳐 넣으면 웹과 동일한 유틸리티 클래스가 생성된다.
 */
export const colors = {
  // primary
  "primary-50": "#f0faff",
  "primary-100": "#dbf4ff",
  "primary-200": "#b6e8ff",
  "primary-300": "#86d8ff",
  "primary-400": "#43c8ff",
  "primary-500": "#0baeff",
  "primary-600": "#0787d0",
  "primary-700": "#00689a",
  "primary-800": "#004c73",
  "primary-900": "#00354b",
  primary: "#0787d0", // = primary-600

  // secondary
  "secondary-50": "#edf3fa",
  "secondary-100": "#dce4ef",
  "secondary-200": "#aec6da",
  "secondary-500": "#4b607d",
  "secondary-700": "#2f4054",
  "secondary-900": "#1c2b45",
  secondary: "#4b607d", // = secondary-500

  // neutral
  "neutral-0": "#ffffff",
  "neutral-50": "#f7f8f8",
  "neutral-100": "#f2f4f6",
  "neutral-200": "#e6eaf0",
  "neutral-300": "#d4dce5",
  "neutral-400": "#b8c4d0",
  "neutral-500": "#8894a6",
  "neutral-600": "#5f6b78",
  "neutral-700": "#3f4b58",
  "neutral-800": "#2b323b",
  "neutral-900": "#171c21",
  neutral: "#8894a6", // = neutral-500

  // status
  "error-50": "#fff1f1",
  "error-500": "#e53935",
  "error-700": "#c62828",
  error: "#e53935",
  "success-50": "#eefcf4",
  "success-500": "#2ecc71",
  "success-700": "#1f9d55",
  success: "#2ecc71",
  "warning-50": "#fff8e6",
  "warning-500": "#f4b400",
  "warning-700": "#b7791f",
  warning: "#f4b400",

  // 시맨틱 — 표면/배경
  bg: "#f7f8f8", // neutral-50
  surface: "#ffffff", // neutral-0
  "surface-muted": "#f2f4f6", // neutral-100
  "surface-accent": "#f0faff", // primary-50
  "surface-selected": "#b6e8ff", // primary-200

  // 시맨틱 — 테두리
  border: "#d4dce5", // neutral-300
  "border-strong": "#b8c4d0", // neutral-400
  "border-accent": "#b6e8ff", // primary-200
  "border-focus": "#0787d0", // primary-600
  "border-error": "#e53935", // error-500

  // 시맨틱 — 텍스트
  text: "#171c21", // neutral-900
  "text-secondary": "#3f4b58", // neutral-700
  "text-muted": "#8894a6", // neutral-500
  "text-disabled": "#b8c4d0", // neutral-400
  "text-inverse": "#ffffff", // neutral-0

  // 시맨틱 — 액션(버튼)
  "action-primary": "#0787d0", // primary-600
  "action-primary-hover": "#00689a", // primary-700
  "on-action-primary": "#ffffff", // neutral-0
  "action-secondary": "#f0faff", // primary-50
  "action-secondary-hover": "#dbf4ff", // primary-100
  "action-secondary-border": "#b6e8ff", // border-accent(primary-200)
  "on-action-secondary": "#00689a", // primary-700
  "action-ghost": "transparent",
  "action-ghost-hover": "#f0faff", // primary-50
  "on-action-ghost": "#00689a", // primary-700
  "action-disabled": "#e6eaf0", // neutral-200
  "on-action-disabled": "#b8c4d0", // text-disabled(neutral-400)
} as const;

/**
 * 폰트 두께. theme.css의 `--font-weight-*`.
 * RN의 `fontWeight`는 문자열 값을 받는다.
 */
export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

/**
 * 타이포그래피 — Tailwind `fontSize` 설정용 형식.
 *
 * `[fontSize, { lineHeight, fontWeight }]` 튜플이라 `text-body-md` 한 클래스로
 * 크기·행간·두께가 한꺼번에 적용된다. 웹의 `@utility text-body-md`와 동일한 의도.
 *
 * overline의 대문자 변환(text-transform)은 fontSize 설정에 담을 수 없으므로,
 * 사용처에서 `uppercase` 클래스를 함께 붙인다.
 */
export const fontSize = {
  "display-xl": ["64px", { lineHeight: "72px", fontWeight: fontWeight.bold }],
  "display-lg": ["56px", { lineHeight: "64px", fontWeight: fontWeight.bold }],
  "display-md": ["48px", { lineHeight: "56px", fontWeight: fontWeight.bold }],
  "heading-xl": ["40px", { lineHeight: "48px", fontWeight: fontWeight.bold }],
  "heading-lg": ["32px", { lineHeight: "40px", fontWeight: fontWeight.bold }],
  "heading-md": ["28px", { lineHeight: "36px", fontWeight: fontWeight.semibold }],
  "heading-sm": ["24px", { lineHeight: "32px", fontWeight: fontWeight.semibold }],
  "body-lg": ["18px", { lineHeight: "28px", fontWeight: fontWeight.regular }],
  "body-md": ["16px", { lineHeight: "24px", fontWeight: fontWeight.regular }],
  "body-sm": ["14px", { lineHeight: "20px", fontWeight: fontWeight.regular }],
  "body-xs": ["12px", { lineHeight: "18px", fontWeight: fontWeight.regular }],
  "label-lg": ["16px", { lineHeight: "24px", fontWeight: fontWeight.semibold }],
  "label-md": ["14px", { lineHeight: "20px", fontWeight: fontWeight.semibold }],
  "label-sm": ["12px", { lineHeight: "18px", fontWeight: fontWeight.semibold }],
  caption: ["12px", { lineHeight: "16px", fontWeight: fontWeight.regular }],
  overline: ["10px", { lineHeight: "14px", fontWeight: fontWeight.medium }],
} as const;

/**
 * 타이포그래피 — RN `StyleSheet`용 형식(숫자 값).
 *
 * className을 쓰지 않는 컴포넌트(예: 순수 StyleSheet를 쓰는 packages/ui-native
 * 컴포넌트)에서 `typography["body-md"]`처럼 바로 펼쳐 쓸 수 있게 제공한다.
 */
export const typography = {
  "display-xl": { fontSize: 64, lineHeight: 72, fontWeight: fontWeight.bold },
  "display-lg": { fontSize: 56, lineHeight: 64, fontWeight: fontWeight.bold },
  "display-md": { fontSize: 48, lineHeight: 56, fontWeight: fontWeight.bold },
  "heading-xl": { fontSize: 40, lineHeight: 48, fontWeight: fontWeight.bold },
  "heading-lg": { fontSize: 32, lineHeight: 40, fontWeight: fontWeight.bold },
  "heading-md": { fontSize: 28, lineHeight: 36, fontWeight: fontWeight.semibold },
  "heading-sm": { fontSize: 24, lineHeight: 32, fontWeight: fontWeight.semibold },
  "body-lg": { fontSize: 18, lineHeight: 28, fontWeight: fontWeight.regular },
  "body-md": { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular },
  "body-sm": { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.regular },
  "body-xs": { fontSize: 12, lineHeight: 18, fontWeight: fontWeight.regular },
  "label-lg": { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.semibold },
  "label-md": { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.semibold },
  "label-sm": { fontSize: 12, lineHeight: 18, fontWeight: fontWeight.semibold },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: fontWeight.regular },
  overline: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.8, // 0.08em @ 10px
    textTransform: "uppercase",
  },
} as const;

/**
 * 폰트 패밀리. 웹의 `--font-sans` / `--font-mono`.
 *
 * RN에서 `sans`는 expo-font로 Pretendard를 로드해야 실제 적용된다(로딩은 PR 20).
 * 그 전에는 시스템 기본 폰트로 폴백된다.
 */
export const fontFamily = {
  sans: ["Pretendard", "System"],
  mono: ["SFMono-Regular", "Menlo", "monospace"],
} as const;

export const tokens = {
  colors,
  fontSize,
  fontWeight,
  typography,
  fontFamily,
} as const;

export type Colors = typeof colors;
export type ColorToken = keyof Colors;
export type TypographyToken = keyof typeof typography;

export default tokens;
