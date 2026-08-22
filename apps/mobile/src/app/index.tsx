import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Hello afterglow 👋</Text>
        <Text style={styles.subtitle}>
          Expo 전환 작업 시작 — docs/APP_MIGRATION_ROADMAP.md 참고
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f8f8",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#171c21",
  },
  subtitle: {
    fontSize: 14,
    color: "#8894a6",
    textAlign: "center",
  },
});
