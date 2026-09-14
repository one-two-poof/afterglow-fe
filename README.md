# afterglow

한국을 찾는 의료관광객을 위한 여행 코스 추천 앱.
시술 일정과 여행 취향을 입력하면 병원·관광지·숙소를 엮은 코스를 추천하고, 건물 그림자를 계산해 **그늘길** 경로까지 안내합니다.

- iOS 앱(Expo) — TestFlight 배포 중
- 지원 언어: 한국어 · English · 简体中文 · 日本語

## 주요 기능

| 화면 | 설명 |
| --- | --- |
| **홈(지도)** | MapLibre 지도 위에 병원·관광명소·숙소 마커 표시, 장소 검색·카테고리 필터, 장소 상세 시트(사진·소개·진료과목·진료 가능 언어 등), 외부 지도 앱(Apple/Google/네이버/카카오) 연결 |
| **그림자 · 경로 안내** | 3D 건물(PMTiles)과 태양 위치(suncalc)로 실시간 그림자 레이어 렌더, 출발지/도착지 지정 후 **최단 / 그늘길** 경로 탐색 |
| **여행 계획 짜기** | 단계형 바텀시트 — 일정 → 시술 → 시술 날짜 → 관광지 → 여행 목적 → 이동 범위 → 활동량 → 추천 결과. 마음에 드는 코스를 채택해 저장 |
| **내 코스** | 저장한 코스 목록과 날짜별 타임라인 상세, 추천 코스를 지도에서 바로 보기 |
| **관광 정보** | 한국관광공사 데이터 기반 관광지·숙소·의료관광 정보 탐색 |
| **내 정보** | 이메일 / Google / Apple 로그인, 언어 설정, 고객센터(FAQ·1:1 문의), 약관, 회원 탈퇴 |

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 앱 | Expo 57, React Native 0.86, React 19, expo-router |
| 스타일 | NativeWind(Tailwind CSS v3) + `@afterglow/tokens` 디자인 토큰 |
| 상태 | TanStack Query(서버 상태), zustand(클라이언트 상태) |
| 지도 | @maplibre/maplibre-react-native, PMTiles, suncalc |
| 인증 | OAuth 딥링크, expo-apple-authentication, expo-secure-store |
| 다국어 | i18next, react-i18next, expo-localization |
| 관측 | Sentry, GitHub Actions 헬스체크 + 상태 페이지 |
| 테스트 | node:test / tsx, Jest(utils), Maestro(E2E) |
| 모노레포 | pnpm workspace, Turborepo |
| 배포 | EAS Build / EAS Submit → TestFlight |

## 프로젝트 구조

```
afterglow-fe/
├── apps/
│   └── mobile/              # Expo 앱
│       ├── src/app/         #   expo-router 라우트 ((tabs), course, tourism, login …)
│       ├── src/components/  #   화면·기능 컴포넌트 (MapLibreMap, TripPlanPanel, MyCourse …)
│       ├── src/hooks/       #   react-query 훅
│       ├── src/lib/         #   API 호출·도메인 로직
│       ├── src/locales/     #   ko / en / ja / zh 번역 카탈로그
│       ├── .maestro/        #   Maestro E2E 플로우
│       └── tests/           #   단위 테스트
├── packages/
│   ├── api/                 # 공용 API 클라이언트
│   ├── stores/              # zustand 스토어 (toast 등)
│   ├── tokens/              # 디자인 토큰 (색·타이포)
│   ├── types/               # 공용 타입
│   ├── ui-native/           # RN 공용 컴포넌트 (Button, Input, Logo, StatusBadge, TagList)
│   ├── utils/               # 순수 TS 유틸 (날짜, 좌표, 지도 범위, 그림자 계산)
│   └── typescript-config/   # 공용 tsconfig
├── scripts/                 # 헬스체크·상태 페이지·E2E/Sentry 리포트 스크립트
└── docs/                    # 로드맵, 성능 조사, 운영 문서
```

## 시작하기

### 요구 사항

- Node.js 20 이상
- pnpm 10 (`corepack enable`)
- iOS 빌드: Xcode + CocoaPods / Android 빌드: Android Studio

> 지도·Apple 로그인 등 네이티브 모듈을 쓰기 때문에 Expo Go가 아닌 **dev-client 빌드**로 실행합니다.

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp apps/mobile/.env.example apps/mobile/.env
# .env에 API 주소 등을 채워 넣습니다

# 네이티브 앱 빌드 & 설치 (최초 1회 또는 네이티브 의존성 변경 시)
pnpm --filter mobile ios        # 또는 android

# Metro 개발 서버
pnpm --filter mobile dev
```

### 환경변수

`EXPO_PUBLIC_` 접두사가 붙은 값만 클라이언트 번들에 포함됩니다.

| 이름 | 설명 |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | 메인 백엔드 API |
| `EXPO_PUBLIC_AI_API_URL` | ML 코스 추천 서버 |
| `EXPO_PUBLIC_BUILDINGS_PMTILES_URL` | 건물 PMTiles 타일 URL |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry DSN (비워두면 리포팅 비활성) |

## 스크립트

루트에서 Turborepo로 모든 워크스페이스에 실행됩니다.

| 명령 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm lint` | ESLint |
| `pnpm type-check` | TypeScript 타입 검사 |
| `pnpm test` | 워크스페이스 단위 테스트 |
| `pnpm test:scripts` | 루트 `scripts/` 테스트 |
| `pnpm build` | 빌드 |

### E2E (Maestro)

iOS 시뮬레이터에서 dev-client + Metro가 떠 있는 상태로 실행합니다.

```bash
apps/mobile/.maestro/run.sh                         # 전체 플로우
apps/mobile/.maestro/run.sh login-validation.yaml   # 특정 플로우
```

### 배포

```bash
cd apps/mobile
eas build -p ios --profile production
eas submit -p ios --profile production
```

## CI / 운영

| 워크플로 | 트리거 | 역할 |
| --- | --- | --- |
| `ci.yml` | PR, main 푸시 | lint · type-check · test · build, 스크립트 테스트, Maestro 서브플로우 태그 검사 |
| `e2e.yml` | 야간, main 푸시, 수동 | Release 시뮬레이터 빌드로 Maestro E2E 실행 |
| `health.yml` | 30분 간격 | 백엔드 합성 헬스체크 |
| `sentry.yml` | 매시 | Sentry 이슈 요약 수집 |
| `status-page.yml` | 헬스체크 완료 시 | 기록을 정적 상태 페이지로 빌드해 GitHub Pages 배포 |

헬스체크·E2E·Sentry 결과는 `status-data` 브랜치에 쌓이고, 상태 페이지가 이를 한 화면에 보여줍니다. 자세한 내용은 [`docs/STATUS_PAGE.md`](docs/STATUS_PAGE.md)를 참고하세요.

## 기여 규칙

- 브랜치: `feature/*`, `fix/*` 등 작업 단위로 분리하고 PR로 main에 머지합니다.
- 커밋: `feat:` · `fix:` · `refactor:` · `chore:` · `style:` 등 Conventional Commits 접두사를 사용합니다.
- PR: [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) 양식을 따르며, 변경의 핵심 개념을 묻는 **학습 퀴즈 3문제**를 포함합니다.
- 머지 전 `pnpm turbo run lint type-check test build` 통과를 확인합니다.

## 문서

- [앱 전환 로드맵](docs/APP_MIGRATION_ROADMAP.md)
- [다국어 로드맵](docs/APP_I18N_ROADMAP.md)
- [지도 성능 조사](docs/MAP_PERFORMANCE_INVESTIGATION.md)
- [상태 페이지 운영](docs/STATUS_PAGE.md)
