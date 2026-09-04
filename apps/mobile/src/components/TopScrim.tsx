import { useMemo } from "react";
import { View } from "react-native";

/**
 * 풀블리드 지도 위, 상태바(시계·배터리 등) 영역의 가독성을 위한 상단 스크림.
 * expo-linear-gradient(네이티브 모듈, 리빌드 필요)를 쓰지 않고, 불투명도가 단계적으로
 * 줄어드는 얇은 밴드를 쌓아 위→아래로 투명해지는 그라디언트를 근사한다.
 *
 * 상태바 텍스트가 어두운 색이므로 흰색 계열로 깔아 대비를 확보한다.
 * pointerEvents="none"으로 지도 제스처를 막지 않는다.
 */
export function TopScrim({
  height,
  steps = 10,
  maxOpacity = 0.5,
}: {
  /** 스크림 전체 높이(보통 safe-area top inset + 여유). */
  height: number;
  /** 그라디언트 근사에 쓸 밴드 수(많을수록 매끄러움). */
  steps?: number;
  /** 최상단(가장 진한 곳) 불투명도. */
  maxOpacity?: number;
}) {
  const bands = useMemo(
    () =>
      Array.from({ length: steps }, (_, i) => {
        // 위(i=0)에서 maxOpacity, 아래로 갈수록 0에 수렴.
        const opacity = (maxOpacity * (steps - i)) / steps;
        return `rgba(255,255,255,${opacity.toFixed(3)})`;
      }),
    [steps, maxOpacity],
  );

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, height }}
    >
      {bands.map((backgroundColor, i) => (
        <View key={i} style={{ flex: 1, backgroundColor }} />
      ))}
    </View>
  );
}
