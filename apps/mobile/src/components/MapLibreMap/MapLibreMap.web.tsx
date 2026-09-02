import { forwardRef, useImperativeHandle } from "react";
import { Text, View } from "react-native";

import { type MapLibreMapProps, type MapLibreMapRef } from "./types";

/**
 * 웹(react-native-web)용 MapLibreMap 대체. maplibre-react-native는 네이티브 전용이라
 * 웹에선 플레이스홀더만 렌더한다(props·ref 시그니처만 맞춤). Metro가 웹 번들에서 자동 선택.
 */
export const MapLibreMap = forwardRef<MapLibreMapRef, MapLibreMapProps>(
  function MapLibreMap(_props, ref) {
    useImperativeHandle(ref, () => ({ getCenter: async () => null }), []);
    return (
      <View className="flex-1 items-center justify-center bg-surface-muted">
        <Text className="text-body-sm text-text-muted">
          지도는 앱(iOS/Android)에서 표시됩니다
        </Text>
      </View>
    );
  },
);
