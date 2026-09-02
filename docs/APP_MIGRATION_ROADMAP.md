# App(React Native/Expo) 전환 로드맵

> 2026-08-20 결정: Expo 기반으로 App Store 출시를 목표로 한다.
> 이 문서는 전환 작업의 전략, 순서, PR 단위를 정의한다. 각 PR이 머지될 때마다 진행 상황 체크박스를 갱신한다.
>
> **최종 갱신: 2026-09-02** — Phase 0~3(기반·공용 UI·앱 골격·기능 이식) 완료. 남은 작업은 Phase 3.5(다국어)와 Phase 4(출시 준비·정리). 리스크였던 PMTiles·OAuth 딥링크 해소.

## 원칙

1. **웹은 계속 돌아가야 한다.** `apps/web`, `packages/ui` 등 기존 코드는 수정하지 않는다. RN용 코드는 새 워크스페이스(`apps/mobile`, `packages/ui-native` 등)에 새로 만든다. 전환 완료 후 정리 단계에서 중복을 제거한다.
2. **기능 하나·컴포넌트 하나 단위로 PR을 올린다.** PR은 작게, 리뷰(학습) 가능하게.
3. **PR마다 퀴즈 3개.** 리뷰어(=나)가 학습하며 검수할 수 있도록, 해당 PR의 핵심 개념을 묻는 퀴즈 3개를 PR 본문에 포함한다. (PR 템플릿에 섹션 있음)
4. **플랫폼 중립 코드는 재사용한다.** 순수 TS 로직(날짜 유틸, 그림자 계산, API 클라이언트, zustand 스토어, react-query 훅의 로직 부분)은 웹/앱이 공유한다. 재사용하려면 해당 코드를 `packages/*`로 옮기는 PR을 먼저 만든다(웹 쪽은 import 경로만 변경 — "그대로 놔둔다" 원칙의 유일한 예외).

## 기술 스택 결정

| 영역            | 웹 (현재)                                        | 앱 (전환)                                                 | 비고                                                                                               |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 프레임워크      | Next.js 16 (App Router)                          | **Expo + expo-router**                                    | 파일 기반 라우팅이라 App Router와 멘탈 모델이 같음                                                 |
| 스타일          | Tailwind CSS v4 + `@afterglow/tokens`(theme.css) | **NativeWind** + `@afterglow/tokens` TS export            | 기존 클래스 네이밍을 거의 그대로 이식 가능. NativeWind의 Tailwind 버전 호환은 스캐폴드 시점에 확인 |
| 서버 상태       | @tanstack/react-query                            | 동일 (그대로 동작)                                        |                                                                                                    |
| 클라이언트 상태 | zustand                                          | 동일 (그대로 동작)                                        | persist 미들웨어 사용 시 storage만 AsyncStorage로 교체                                             |
| HTTP            | axios                                            | 동일 (그대로 동작)                                        |                                                                                                    |
| 지도            | maplibre-gl + pmtiles                            | **@maplibre/maplibre-react-native**                       | PMTiles 네이티브 지원 여부 확인 필요(리스크 §참고)                                                 |
| 그림자 계산     | suncalc + shadows.ts (순수 TS)                   | 동일 (그대로 재사용)                                      |                                                                                                    |
| 아이콘          | lucide-react                                     | **lucide-react-native**                                   | 동일한 아이콘 셋                                                                                   |
| 인증            | OAuth 리다이렉트 + localStorage                  | **딥링크(expo-auth-session/Linking) + expo-secure-store** | 웹의 `window.location` 흐름은 앱에서 불가능 → 재설계 필요                                          |
| 폰트            | Pretendard (CSS)                                 | expo-font로 Pretendard 로드                               |                                                                                                    |

## 워크스페이스 구조 (전환 중)

```
apps/
  web/          # 기존 그대로 (건드리지 않음)
  admin/        # 기존 그대로
  mobile/       # 신규: Expo 앱
packages/
  api/          # 공유 (플랫폼 중립)
  types/        # 공유 (플랫폼 중립)
  utils/        # 공유 (플랫폼 중립)
  tokens/       # theme.css(웹용) + src/index.ts(TS export, 앱용) 추가
  ui/           # 웹 전용 (그대로 둠, 정리 단계에서 처분 결정)
  ui-native/    # 신규: RN용 공용 컴포넌트 (Button, Input, ...)
```

## PR 로드맵

각 단계 = PR 하나. 순서는 의존성 순. 체크박스로 진행 상황 추적.

### Phase 0 — 기반 세팅

- [x] **PR 0. 전환 기반**: 이 로드맵 문서 + PR 템플릿(퀴즈 섹션) + `apps/mobile` Expo 스캐폴드(expo-router, 빈 화면 3개 탭 없이 홈만). 시뮬레이터에서 "Hello afterglow" 부팅 확인.
- [x] **PR 1. 디자인 토큰 TS export**: `packages/tokens`에 `src/index.ts` 추가 — theme.css의 색/타이포 값을 TS 객체로 제공. NativeWind 설정을 mobile에 연결하고 토큰이 클래스로 동작하는지 확인.
- [x] **PR 2. 공통 인프라**: mobile에 axios 인스턴스, react-query Provider, 환경변수(EXPO_PUBLIC_*) 연결. `@afterglow/api`, `@afterglow/types`, `@afterglow/utils` 워크스페이스 의존 연결 확인.

### Phase 1 — 공용 UI 컴포넌트 (`packages/ui-native`)

`packages/ui`의 각 컴포넌트를 RN으로 이식. div→View, button→Pressable, 텍스트는 반드시 Text로.

- [x] **PR 3. Button**
- [x] **PR 4. Input** (TextInput, 포커스/에러 상태)
- [x] **PR 5. Logo + StatusBadge + TagList** (단순 컴포넌트 묶음)

### Phase 2 — 앱 골격

- [x] **PR 6. 탭 네비게이션**: expo-router의 Tabs로 홈/내 코스/내 정보 3탭 (웹 Footer에 해당). lucide-react-native 아이콘.
- [x] **PR 7. Toast**: toast-store(zustand)는 공유 가능하면 packages로 승격, RN Toast UI는 Animated로 구현.

### Phase 3 — 기능 이식 (화면 단위)

- [x] **PR 8. PlaceCard**
- [x] **PR 9. Calendar**: date-utils는 순수 TS → `packages/utils`로 승격 후 공유. 캘린더 UI는 RN으로 새로 구현.
- [x] **PR 10~13. TripPlanPanel**: 웹의 바텀시트 패널 → RN 바텀시트. 스텝별로 PR 분할:
  - [x] PR 10. 패널 골격 + use-trip-plan-form (스텝 상태 머신)
  - [x] PR 11. TreatmentStep + TreatmentDateStep + ScheduleStep
  - [x] PR 12. PurposeStep + PlaceStep + WalkPreferenceStep
  - [x] PR 13. ResultStep + use-recommend-courses 연동
- [x] **PR 14. 지도 (1) 기본 렌더**: @maplibre/maplibre-react-native로 지도 + 건물 PMTiles 렌더. 여기서 PMTiles 지원 리스크 해소.
- [x] **PR 15. 지도 (2) 그림자**: shadows.ts를 `packages/utils`로 승격, 네이티브 지도에 그림자 레이어 적용. (#80 — 경로 안내 최단·그늘길 포함, #79)
- [x] **PR 16. 지도 (3) 코스 렌더**: 홈 저장 코스 태그 → 지도에 좌표 마커 렌더. (#75)
- [x] **PR 17. 내 코스 화면**: MyCourse, SavedCourseCard, 스켈레톤. (#69)
  - [x] 코스 카드·상세(날짜별 타임라인) 개선 + 추천 결과(ResultStep)와 본문 공유 + 채택 저장(course-selection) 연동 및 목록/태그 최신화. (#82)
- [x] **PR 18. 인증**: Google OAuth 딥링크 로그인(웹 리다이렉트 + 커스텀 스킴) + expo-secure-store 토큰. (#74, #76)
- [x] **PR 19. 내 정보 화면**: MyPage, ProfileHeader, SettingsList, LoginPrompt. use-me 훅 공유화. (#70)
  - [x] 설정 항목 화면 연결 — 고객센터(FAQ·1:1 문의), 이용약관·개인정보처리방침. (#83)

### Phase 4 — 출시 준비 & 내부 배포(TestFlight)

**다국어보다 내부 배포를 먼저 한다.** TestFlight 내부 테스트는 App Store 심사가 없어 언어 하나(한국어)만으로도 실기기 검증이 가능하다. 다국어는 정식 출시 전(Phase 4.5)으로 미룬다.

- [ ] **PR 20. 앱 아이콘/스플래시/폰트(Pretendard)**: 아이콘·스플래시 완료, 폰트는 TestFlight 이후로 미룸.
  - [x] 앱 아이콘 — iOS 템플릿(`expo.icon`) 참조 제거하고 afterglow 로고(`icon.png`)로 통일 + App Store용 알파 채널 제거.
  - [x] 스플래시 — afterglow 로고 (#73).
  - [ ] 폰트(Pretendard) — 전역 기본 폰트 교체 + weight 매핑 필요. TestFlight 내부 배포 이후 별도 진행(현재 앱은 `font-sans` 미사용 = 시스템 폰트).
- [ ] **PR 21. EAS Build + TestFlight 내부 배포**: Apple Developer 가입($99/년) → App Store Connect 앱 등록(번들 ID) → `eas.json` + `eas build -p ios` → `eas submit` → TestFlight 내부 테스터. **선행: 서버 HTTPS 전환 완료(ATS 예외 불필요).**

### Phase 4.5 — 다국어(i18n) · **정식 출시 전 포함**

앱 UI를 한국어/일본어/중국어(간체)로 렌더링 가능하게 한다. **App Store 정식 출시 전에 포함한다(내부 배포 이후).** 상세 PR 분할은 별도 문서 참고: [`APP_I18N_ROADMAP.md`](./APP_I18N_ROADMAP.md).

- [ ] **다국어 지원 (PR I-1 ~ I-10)**: i18n 인프라(i18next + react-i18next + expo-localization) → 화면별 문자열 교체 → 내 정보에 언어 선택 UI → ja/zh 번역·QA. 서버 데이터 번역은 비범위(추후). 세부 순서/체크박스는 `APP_I18N_ROADMAP.md`에서 관리.

### Phase 5 — 정식 출시 & 정리

- [ ] **PR 22. 정리**: 웹/앱 중복 코드 정리 — 공유 가능한 로직의 packages 승격 마무리, `packages/ui`의 유지/폐기 결정, 이 문서에 결과 기록.

## 리스크 / 미결 사항

- ~~**PMTiles × MapLibre Native**~~: ✅ 해소 — PR 14~16에서 건물·그림자·코스 렌더까지 네이티브 PMTiles로 검증 완료. (단 buildings.pmtiles 서버가 no-store 헤더로 캐싱을 차단하는 이슈는 별개로 미결 — 백엔드 헤더 vs SW 미정)
- ~~**OAuth 딥링크**~~: ✅ 해소 — PR 18(#74, #76)에서 웹 리다이렉트 + 커스텀 스킴 딥링크 로그인 구현.
- **NativeWind 버전 호환**: 웹은 Tailwind v4, NativeWind의 지원 버전과 다를 수 있음. mobile 앱은 독립 워크스페이스라 Tailwind 버전을 따로 가져가도 무방.
- **suncalc/그림자 성능**: 네이티브 지도에서 대량 폴리곤 그림자 렌더 성능은 PR 15에서 실측.

## PR 작성 규칙 요약

- 브랜치: `feat/mobile-<단위>` (예: `feat/mobile-button`)
- PR 본문: 템플릿의 **학습 퀴즈 3문제** 섹션 필수 — 이 PR의 핵심 개념(RN/Expo 개념, 웹과의 차이, 설계 선택 이유)을 묻는 문제. 답은 `<details>`로 접어서 포함.
- 웹 영향 없음 확인: `pnpm turbo run lint type-check test build` 통과.
