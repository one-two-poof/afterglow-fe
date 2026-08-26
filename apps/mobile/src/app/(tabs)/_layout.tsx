import { colors } from "@afterglow/tokens";
import { Tabs } from "expo-router";
import { Home, LineSquiggle, User } from "lucide-react-native";

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
          title: "홈",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="my-course"
        options={{
          title: "내 코스",
          tabBarIcon: ({ color, size }) => (
            <LineSquiggle color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-page"
        options={{
          title: "내 정보",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
