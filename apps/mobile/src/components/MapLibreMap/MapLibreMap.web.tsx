import { Text, View } from "react-native";

/**
 * 웹(react-native-web)용 MapLibreMap 대체.
 *
 * @maplibre/maplibre-react-native는 MapLibre Native(iOS/Android) 래퍼라 웹에서
 * 동작하지 않는다. 웹 미리보기가 깨지지 않도록 플레이스홀더만 렌더한다.
 * (Metro가 웹 번들에서 이 .web 파일을 자동 선택 → 웹 번들에 네이티브 지도 미포함)
 */
export function MapLibreMap() {
  return (
    <View className="flex-1 items-center justify-center bg-surface-muted">
      <Text className="text-body-sm text-text-muted">
        지도는 앱(iOS/Android)에서 표시됩니다
      </Text>
    </View>
  );
}
