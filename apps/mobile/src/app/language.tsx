import { colors } from "@afterglow/tokens";
import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { ScreenHeader } from "@/components/ScreenHeader";
import { useI18n } from "@/i18n/i18n-provider";
import type { Locale, TranslationKey } from "@/i18n/config";

const LANGUAGE_OPTIONS: {
  locale: Locale;
  nativeName: string;
  labelKey: TranslationKey;
}[] = [
  { locale: "ko", nativeName: "한국어", labelKey: "language.korean" },
  { locale: "en", nativeName: "English", labelKey: "language.english" },
  { locale: "zh", nativeName: "简体中文", labelKey: "language.chinese" },
  { locale: "ja", nativeName: "日本語", labelKey: "language.japanese" },
];

export default function LanguageScreen() {
  const { locale, setLocale, t } = useI18n();

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader title={t("language.title")} />
      <View className="px-5 py-6">
        <Text className="mb-3 text-heading-sm text-text">
          {t("language.select")}
        </Text>
        <View className="overflow-hidden rounded-[12px] border border-border bg-surface">
          {LANGUAGE_OPTIONS.map((option, index) => {
            const selected = locale === option.locale;
            return (
              <Pressable
                key={option.locale}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={t(option.labelKey)}
                onPress={() => setLocale(option.locale)}
                className={`flex-row items-center px-4 py-4 active:bg-surface-muted ${
                  index < LANGUAGE_OPTIONS.length - 1
                    ? "border-b border-border"
                    : ""
                }`}
              >
                <Text className="flex-1 text-label-lg text-text">
                  {option.nativeName}
                </Text>
                {selected ? <Check size={20} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
