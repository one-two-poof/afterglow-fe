# 지도 성능 조사

> 조사일: 2026-09-05
> 작업 브랜치: `perf/map-shade-loading`

## 결론

가장 유력한 병목은 서울 전체 건물 파일을 한 번에 내려받는 것이 아니라, 지도 이동이 끝날 때마다 현재 화면의 모든 건물을 네이티브 지도에서 JavaScript로 복사하고 그림자 폴리곤을 다시 계산한 뒤 큰 GeoJSON을 네이티브 지도에 재주입하는 과정이다.

건물 원본은 32,416,651바이트 PMTiles 파일이며 서버가 byte range 요청에 `206 Partial Content`로 응답한다. PMTiles는 타일 아카이브이므로 MapLibre가 현재 뷰포트와 줌에 필요한 범위만 읽는다. 현재 그림자 계산도 `queryRenderedFeatures({ layers: ["buildings-fill"] })`를 사용하므로 이미 렌더된 뷰포트 건물을 대상으로 한다. 따라서 “서울 전역 대신 뷰포트만 로드”는 데이터 구조상 대부분 구현되어 있다.

다만 서버 응답에는 `Cache-Control`, `ETag`, `Expires`가 없고 `Last-Modified`만 있다. 네트워크 캐시 효율은 별도 개선 대상이다.

## 구현 현황

2026-09-05 기준 다음 항목을 `perf/map-shade-loading` 브랜치에 적용했다.

- 건물 그늘 오버레이를 기본 OFF인 사용자 토글로 변경
- OFF 상태에서는 건물 PMTiles와 그림자 GeoJSON 소스를 모두 마운트하지 않음
- 그늘 계산을 줌 14 이상으로 제한
- 이동 종료 후 계산을 200ms debounce
- OFF 전환 또는 새 계산 시작 시 오래된 비동기 결과를 무효화
- 지도 이벤트의 bounds를 직접 사용해 반복적인 `getBounds` 브리지 호출 제거
- bounds를 바깥 방향 소수점 4자리 격자로 정규화하고 같은 영역의 중복 보고 차단
- 개발 빌드에 `[map-perf] building shadows` 성능 표본 추가

개발 콘솔 표본에는 입력 건물 수, 생성된 그림자 수, 네이티브 피처 조회 시간, JS 그림자 계산 시간, 지도 렌더 완료까지의 총 시간이 기록된다. 같은 실제 기기에서 줌 14/15/16별로 5회 이상 이동한 중앙값을 비교한다. OFF 상태에서는 이 로그가 발생하지 않아야 한다.

## 성능 로그 수집과 보고서 생성

개발 빌드는 한 줄에 하나의 JSON 레코드를 출력한다. 정확한 위치 좌표는 포함하지 않는다.

```text
[map-perf] {"schemaVersion":1,"event":"building_shadows_rendered","recordedAt":"2026-09-05T08:00:00.000Z","zoom":15,"sourceFeatures":1240,"shadowFeatures":1187,"queryMs":86.4,"buildMs":41.2,"totalUntilRenderedMs":173.8}
```

PowerShell에서 Metro 로그를 파일로 함께 저장한다.

```powershell
New-Item -ItemType Directory -Force artifacts/map-performance
pnpm --filter mobile dev 2>&1 | Tee-Object -FilePath artifacts/map-performance/optimized.log
```

그늘을 켠 뒤 줌 14, 15, 16에서 각각 같은 이동을 최소 10회 반복한다. 첫 회는 콜드 캐시 표본으로 별도 취급하거나 제외하고, 나머지는 웜 캐시끼리 비교한다. 이후 최적화 후보를 적용하기 전 로그를 `baseline.log`, 적용 후 로그를 `optimized.log`로 수집한다. 이번 변경 이전 코드에는 같은 구조화 계측이 없으므로 과거 버전과 비교하려면 기준 브랜치에도 동일한 계측만 별도로 이식하거나 Instruments 같은 외부 프로파일러를 사용해야 한다.

두 로그에서 Markdown 보고서를 생성한다.

```powershell
pnpm perf:map:report -- `
  --input "baseline=artifacts/map-performance/baseline.log" `
  --input "optimized=artifacts/map-performance/optimized.log" `
  --output "docs/performance/results/2026-09-05-iphone.md" `
  --title "지도 성능 전후 비교" `
  --device "iPhone 모델 / iOS 버전"
```

보고서는 시나리오·줌별 표본 수, 렌더 완료 총시간 p50/p95, 피처 조회 p50, 그림자 계산 p50, 평균 입력 건물·그림자 수를 만든다. 원시 로그 디렉터리는 Git에서 제외하고 생성된 Markdown 결과만 검토 후 커밋한다.

집계기 단위 테스트는 다음 명령으로 실행한다.

```powershell
pnpm test:map-performance-report
```

## 확인된 비용 경로

지도 이동 종료마다 다음 작업이 한 번의 이벤트에서 연달아 실행된다.

1. `queryRenderedFeatures`로 화면 내 건물 도형 전체를 네이티브에서 JS로 전달한다.
2. `getCenter`로 JS/네이티브 브리지를 한 번 더 왕복한다.
3. 각 건물 외곽선의 좌표를 복제하고 정렬하여 볼록껍질 그림자를 만든다.
4. React state를 갱신하면서 화면 전체 지도 컴포넌트를 다시 렌더한다.
5. 새 FeatureCollection을 `GeoJSONSource`에 전달해 네이티브에서 다시 파싱·타일링·렌더한다.
6. 동시에 `getBounds`를 호출하고 홈 화면의 `viewport` state를 갱신한다.
7. 카테고리가 선택된 경우 실수 좌표 전체를 query key로 사용해 장소 API를 다시 요청한다.

초기 진입에서는 `onDidFinishRenderingMapFully`와 카메라 이동 완료 이벤트가 가까운 시점에 발생할 수 있어 그림자 계산과 뷰포트 보고가 중복 실행될 가능성도 있다. 현재는 진행 중 작업의 취소, 최신 요청만 반영하는 보호, 동일 뷰포트 판정, 최소 줌 제한이 없다.

그림자 계산은 건물별로 외곽선 좌표를 복사한 후 정렬하므로 대략 `O(Σ V log V)`이고, 실제 체감 비용에는 네이티브↔JS 직렬화와 GeoJSON 재파싱 비용이 더해진다. 줌 아웃할수록 화면에 포함되는 건물 수가 급증해 비용이 커질 수 있다.

## 해결안 우선순위

### P0 — 측정 장치 추가

최적화 전 동일한 시나리오를 실제 기기에서 5회 이상 측정한다.

- 첫 지도 표시 완료 시간
- 지도 드래그 종료부터 다음 프레임이 안정될 때까지의 시간
- `queryRenderedFeatures`, `buildShadows`, GeoJSON 적용 각각의 시간
- 조회된 건물 수, 입력/출력 좌표 수, 생성된 GeoJSON 바이트 수
- JS FPS/UI FPS와 이동 중 긴 작업
- PMTiles 요청 수·전송량(콜드/웜 캐시 분리)

대표 시나리오는 그늘 OFF/ON, 줌 12/14/16, 콜드/웜 캐시를 조합한다. 성능 목표는 측정 후 수치로 확정하되, 우선 “그늘 OFF일 때 그림자 관련 JS 작업 0회”와 “일반 드래그 종료 후 눈에 띄는 프리즈 없음”을 기능 조건으로 둔다.

### P1 — 그늘 표시 ON/OFF

사용자 제안대로 가장 먼저 적용할 가치가 크다.

- 기본값은 제품 결정을 거쳐 정하되 저사양 기기 대응을 위해 설정을 유지한다.
- OFF일 때 `queryRenderedFeatures`, `buildShadows`, shadow `GeoJSONSource`를 모두 실행/마운트하지 않는다.
- 건물 레이어 자체도 그늘 기능에만 필요하다면 함께 끄는 선택지를 둔다. 건물을 시각 요소로 유지해야 한다면 그림자 계산만 끈다.
- 경로의 “그늘 우선 경로”와 지도 위 “실시간 건물 그림자 오버레이”는 이름과 상태를 분리한다. 전자는 경로 API 기능이고 후자는 이번 성능 토글 대상이다.

### P1 — 계산량 상한

- 그림자·건물 레이어에 `minzoom`을 두어 넓은 지역을 보는 줌에서는 계산하지 않는다. 첫 실험값은 14 또는 15가 적절하며 측정으로 결정한다.
- 이동 완료 즉시 계산하지 말고 짧게 debounce한다. MapLibre React Native v11에서는 앱이 직접 debounce해야 한다.
- 이전 계산이 진행 중이면 다음 요청을 합치고, 오래된 결과가 최신 뷰포트 위에 적용되지 않도록 generation id를 둔다.
- 중심과 줌/경계 변화가 임계값보다 작으면 재계산하지 않는다.
- 시간 변화만으로 결과를 갱신할 때는 태양 위치가 체감상 달라지는 주기(예: 몇 분)로 양자화해 같은 뷰포트 결과를 재사용한다.

### P2 — GeoJSON 비용 축소

- `GeoJSONSource`의 `tolerance`를 높이고 `buffer`를 줄이는 실험을 각각 독립적으로 측정한다.
- 그림자 입력 전에 화면 가장자리 여유분을 명시적으로 정하고, 불필요한 속성·좌표 정밀도를 줄인다.
- 같은 건물의 그림자를 매번 새 객체로 만들지 않는 타일/건물 단위 캐시를 검토한다. 캐시 키에는 타일 또는 공간 버킷, 줌, 양자화한 태양 위치가 포함되어야 한다.
- JS 계산이 여전히 병목이면 JSI/네이티브 또는 서버에서 그림자 벡터 타일을 만드는 방안을 검토한다. 복잡도가 커지므로 P0/P1의 측정 결과가 이를 정당화할 때만 진행한다.

### P2 — PMTiles 전송과 캐시

- 서버에 강한 `ETag`와 적절한 `Cache-Control`을 추가한다. 파일명이 고정되어 내용을 교체할 수 있다면 짧은 TTL+재검증을 쓰고, 버전/해시 파일명으로 배포한다면 긴 TTL과 `immutable`을 쓸 수 있다.
- `Content-Type`을 `application/vnd.pmtiles`로 맞추는 것을 검토한다.
- CDN 또는 타일 전용 캐시 계층을 검토하고 콜드/웜 전송량으로 효과를 확인한다.
- 앱에서 오프라인 팩처럼 서울 전체 파일을 선다운로드하는 방식은 32.4MB 저장·갱신 비용이 있어 이번 문제의 1차 해법으로 권장하지 않는다.

### P2 — 뷰포트 기반 장소 조회 정리

그늘과 별개지만 지도 이동 시 함께 발생하는 부하이다.

- 이벤트가 제공하는 bounds를 직접 사용해 별도 `getBounds` 브리지 호출을 없앤다.
- bounds를 고정 공간 격자 또는 제한된 소수점으로 정규화해 작은 이동마다 새 React Query key와 API 요청이 생기지 않게 한다.
- 이전 장소 요청을 `AbortSignal`로 취소하고, 이전 데이터를 유지해 마커 소스가 비었다 다시 채워지는 일을 막는다.

## 권장 구현 순서

1. 진단용 타이밍·건물 수·GeoJSON 크기 계측
2. 건물 그림자 오버레이 토글과 OFF 경로 완전 차단
3. 최소 줌 + debounce + stale result 방지
4. 같은 기기·시나리오로 전후 재측정
5. 필요할 때만 GeoJSON 단순화/캐시 실험
6. 서버 캐시 헤더와 장소 조회 정규화는 별도 커밋으로 분리

각 최적화는 하나씩 적용하고 같은 조건으로 재측정한다. 측정 노이즈보다 작은 개선이나 회귀가 있는 변경은 유지하지 않는다.

## 조사 범위의 한계

이번 조사는 정적 코드 경로, Git 이력, 운영 PMTiles 서버의 HTTP 응답을 확인한 결과다. 실제 iOS 기기의 Instruments/React Native 성능 트레이스와 네트워크 캡처는 아직 수행하지 않았으므로 “그림자 파이프라인이 최종 원인”이라고 확정한 단계는 아니다. 위 P0 측정으로 가설을 검증해야 한다.
