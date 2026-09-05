import { colors } from "@afterglow/tokens";
import { Tabs } from "expo-router";
import { Home, User } from "lucide-react-native";
import type { ColorValue } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useI18n } from "@/i18n/i18n-provider";

function MapRouteIcon({ color, size }: { color: ColorValue; size: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13" />
      <Path d="M9 12v.01" />
      <Path d="M6 13v.01" />
      <Path d="M17 15l-4 -4" />
      <Path d="M13 15l4 -4" />
    </Svg>
  );
}

/**
 * 하단 탭 네비게이션. 웹의 Footer(홈/내 코스/내 정보)에 대응한다.
 *
 * expo-router의 파일 기반 라우팅: 이 `(tabs)` 그룹의 각 화면 파일(index/my-course/
 * my-page)이 탭 하나가 된다. `(tabs)` 괄호 그룹은 URL 경로에 포함되지 않으므로
 * 홈은 그대로 `/`가 된다.
 *
 * 탭 색은 웹과 동일하게 토큰에서 가져온다(활성=action-primary, 비활성=text-muted).
 * 아이콘도 웹 Footer와 같은 lucide 셋(react-native 버전).
 */
export default function TabsLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors["action-primary"],
        tabBarInactiveTintColor: colors["text-muted"],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="my-course"
        options={{
          title: t("tabs.courses"),
          tabBarIcon: ({ color, size }) => (
            <MapRouteIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-page"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
