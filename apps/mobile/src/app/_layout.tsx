import "../../global.css";

import { Stack } from "expo-router";
import { View } from "react-native";

import { Toast } from "@/components/Toast";
import { AppProviders } from "@/providers/app-providers";

export default function RootLayout() {
  return (
    <AppProviders>
      {/* Toast가 화면 위에 겹치도록 flex 컨테이너로 감싼다(absolute 기준점) */}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </View>
    </AppProviders>
  );
}
