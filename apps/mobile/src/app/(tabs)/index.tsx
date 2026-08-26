import { colors } from "@afterglow/tokens";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { MapLibreMap } from "@/components/MapLibreMap";
import { TripPlanPanel } from "@/components/TripPlanPanel";

/**
 * 홈 = 전체화면 지도 + 여행 계획 패널 열기 버튼 (웹 홈과 동일 구조).
 * 지도는 네이티브에서만 렌더된다(웹은 플레이스홀더).
 */
export default function HomeScreen() {
  const [planOpen, setPlanOpen] = useState(false);

  return (
    <View className="flex-1 bg-bg">
      <MapLibreMap />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="여행 계획 짜기"
        onPress={() => setPlanOpen(true)}
        className="absolute bottom-24 right-5 size-14 items-center justify-center rounded-full bg-primary shadow-md active:bg-action-primary-hover"
      >
        <Plus size={28} color={colors["on-action-primary"]} />
      </Pressable>

      <TripPlanPanel open={planOpen} onClose={() => setPlanOpen(false)} />
    </View>
  );
}
