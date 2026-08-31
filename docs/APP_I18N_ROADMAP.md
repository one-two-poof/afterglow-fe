# App(React Native/Expo) 다국어(i18n) 로드맵

> 2026-08-31 결정: 앱(`apps/mobile`)의 UI를 한국어/일본어/중국어(간체)로 렌더링 가능하게 만든다. **첫 App Store 출시 전에 포함한다.**
> 이 문서는 다국어 지원 작업의 범위, 순서, PR 단위를 정의한다. 각 PR이 머지될 때마다 진행 상황 체크박스를 갱신한다.
> 상위 전환 로드맵: [`APP_MIGRATION_ROADMAP.md`](./APP_MIGRATION_ROADMAP.md). 이 작업은 그 로드맵의 **Phase 3.5**(출시 준비 PR 20~22 직전)에 해당한다.

## 범위 (확정)

- **대상: 앱(`apps/mobile`)만.** 웹(`apps/web`)은 이번 범위 아님. 단, 문자열 카탈로그/설정 로직은 추후 웹과 공유할 수 있도록 구조를 잡아둔다(승격은 하지 않음).
- **언어: 한국어(ko, 기본) + 일본어(ja) + 중국어 간체(zh-CN).** 번체(zh-TW)는 이번 범위 아님(뼈대만 잡아두면 로케일 파일 추가로 확장 가능).
- **언어 결정 방식: 앱 내 사용자 선택.** 초기값은 기기 시스템 언어(device locale)로 잡되, 사용자가 "내 정보"에서 직접 바꾸면 저장되어 유지된다.
- **먼저 UI 문자열부터.** 프론트엔드가 렌더링하는 UI 텍스트(라벨/버튼/안내/토스트 등)를 다국어화한다.

### Out of scope (명시적 비범위)

- **서버에서 오는 데이터의 번역** (병원명·코스·장소 등). 추후 별도로 반영. 그 전까지는 "UI는 다국어, 데이터는 원문(한국어)" 혼재 상태를 허용한다(§리스크 참고).
- **웹(`apps/web`) 다국어**.
- **중국어 번체(zh-TW/HK)**.
- **실제 번역 문구를 처음부터 완성하는 것.** 뼈대(i18n 인프라)와 키 구조를 먼저 세우고, ja/zh 번역 채우기는 후반 PR에서 진행한다.

## 원칙

1. **출시 전에 완료한다.** 이 작업은 첫 App Store 출시(전환 로드맵 PR 20~22) **전에** 마친다. 전환 로드맵의 Phase 3.5로 위치한다.
2. **웹은 계속 돌아가야 한다.** 기존 웹 코드(`apps/web`, `packages/ui`)는 건드리지 않는다.
3. **기능/화면 하나 단위로 PR을 올린다.** 전환 로드맵과 동일하게 작게, 리뷰(학습) 가능하게.
4. **PR마다 퀴즈 3개.** 전환 로드맵과 동일 규칙. 해당 PR의 핵심 개념(i18n 개념, RN에서의 처리, 설계 선택 이유)을 묻는 퀴즈 3문제를 PR 본문에 포함(답은 `<details>`).
5. **공용 컴포넌트는 문자열을 주입받는다.** `packages/ui-native`는 앱 전용 카탈로그에 의존하면 안 된다. UI 문자열은 prop으로 주입하고, 번역(`t()`)은 앱(`apps/mobile`) 레이어에서 한다.

## 기술 스택 결정

| 영역 | 선택 | 비고 |
| --- | --- | --- |
| i18n 코어 | **i18next + react-i18next** | 프레임워크 중립(추후 웹 공유 여지), Expo/RN 실사용 검증됨, 복수형·보간·네임스페이스 지원 |
| 초기 로케일 감지 | **expo-localization** | 미설치 → PR 1에서 추가. 기기 언어를 초기 기본값으로만 사용 |
| 선택 언어 저장 | **AsyncStorage 또는 zustand persist** | 민감정보 아님 → `expo-secure-store`(토큰 전용)와 분리. `@afterglow/stores`(zustand) persist + AsyncStorage 조합을 PR 1에서 확정 |
| 카탈로그 위치 | `apps/mobile/src/locales/{ko,ja,zh}/*.json` | 앱 내부. 추후 웹 공유 필요 시 `packages/i18n`으로 승격 여지만 남김 |
| 폰트 | Pretendard(현재) | CJK(일본어 가나/한자, 중국어 간체) 글리프 커버 여부 확인 필요(§리스크) |

## PR 로드맵

각 단계 = PR 하나. 브랜치: `feat/mobile-i18n-<단위>`. 순서는 의존성 순.

### Phase A — 인프라

- [ ] **PR I-1. i18n 인프라 세팅**: `i18next`·`react-i18next`·`expo-localization` 설치. i18n 인스턴스 초기화(지원 언어 ko/ja/zh, fallback=ko), 루트 `_layout`에 `I18nextProvider`. `src/locales/` 폴더 구조 + 네임스페이스 분리 규칙. 초기 로케일 = device locale, 저장소(AsyncStorage/zustand persist) 결정 및 연결. 검증: 하드코딩 문자열 1개를 `t()`로 교체해 3언어 전환 확인.
- [ ] **PR I-2. 키 네이밍 컨벤션 + 추출 규칙**: 키 네임스페이스/네이밍 규칙 문서화(예: `common`, `home`, `tripPlan`, `myCourse`, `myPage`). ko 카탈로그 시드(첫 화면 기준). ja/zh는 키만 존재(빈 값/플레이스홀더 → fallback=ko로 노출). 이후 화면별 PR이 따를 템플릿 확정.

### Phase B — 화면별 문자열 교체 (컴포넌트 단위, 병렬 가능)

전환 로드맵의 화면 구분과 정렬. 각 PR은 해당 화면의 하드코딩 한국어를 `t()`로 교체하고 ko 값을 채운다(ja/zh는 Phase C).

- [ ] **PR I-3. 공통/네비게이션**: 탭 라벨, Toast 메시지, 공통 버튼/안내 문구, `packages/ui-native` 사용처의 문자열을 prop 주입으로 정리.
- [ ] **PR I-4. 홈 + 지도 검색 UI**: 홈 화면, 지도 위 검색 오버레이/드롭다운, 카테고리 태그 라벨.
- [ ] **PR I-5. TripPlanPanel**: 6개 스텝(일정/시술/시술날짜/관광지/목적/도보) + 결과(Result) 국면 문자열.
- [ ] **PR I-6. 내 코스(MyCourse)**: 리스트/스켈레톤/로그인 안내 문구.
- [ ] **PR I-7. 내 정보(MyPage) + 언어 선택 UI**: ProfileHeader/SettingsList/LoginPrompt 문자열 + **`SettingsList`에 "언어" 항목 추가** → 선택 화면/모달에서 ko/ja/zh 선택, 선택 시 저장 + 즉시 반영(리렌더).

### Phase C — 번역 채우기 & 마무리

- [ ] **PR I-8. 일본어(ja) 번역 채우기 + QA**: ja 카탈로그 완성. 레이아웃 QA(문자열 길이 차이로 깨짐/줄바꿈), 가나·한자 글리프 렌더 확인.
- [ ] **PR I-9. 중국어 간체(zh-CN) 번역 채우기 + QA**: zh 카탈로그 완성. 동일 QA.
- [ ] **PR I-10. 정리/문서화**: 남은 하드코딩 문자열 스윕(누락 키 점검), 로케일별 날짜/숫자 포맷 로케일화(Intl 또는 i18next formatting) 정리, 이 문서에 결과/결정 기록. 카탈로그 `packages/i18n` 승격 여부 판단.

## 리스크 / 미결 사항

- **CJK 폰트 글리프**: Pretendard가 일본어 가나/한자·중국어 간체 글리프를 충분히 커버하는지 미확인. 부족하면 로케일별 CJK 폰트(Noto Sans JP/SC 등) 추가 로딩 필요 → PR I-8/I-9의 QA에서 실측하고, 필요 시 폰트 로딩 PR 별도 분리.
- **UI/데이터 언어 혼재**: 서버 데이터 번역이 비범위라, 일/중 UI에서 병원명·코스 등은 한국어 원문으로 노출된다. 이 UX를 허용하는지(그대로/원문 병기/추후 서버 대응 안내) 결정 필요 — 우선 "그대로 노출" 가정.
- **선택 언어 저장소**: `expo-secure-store`(토큰 전용)와 분리. AsyncStorage 미설치 상태 → PR I-1에서 `@react-native-async-storage/async-storage` 추가 또는 zustand persist storage로 처리. 재시작 후 선택 언어 유지 검증 필요.
- **공용 컴포넌트 문자열 경계**: `packages/ui-native`가 앱 카탈로그에 의존하지 않도록, 문자열 주입(prop) 경계를 PR I-3에서 확정. 위반 시 웹 재사용성/패키지 독립성 훼손.
- **날짜/숫자/복수형 로케일화**: 일본어·중국어 날짜 표기, 숫자/거리 포맷, 복수형 규칙. i18next 보간/formatting 또는 `Intl`로 처리(PR I-10에서 마무리).

## PR 작성 규칙 요약

- 브랜치: `feat/mobile-i18n-<단위>` (예: `feat/mobile-i18n-infra`)
- PR 본문: 템플릿의 **학습 퀴즈 3문제** 섹션 필수(i18n/RN 개념·설계 선택 이유).
- 웹 영향 없음 확인: `pnpm turbo run lint type-check test build` 통과.
