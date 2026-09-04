import { getLocales } from "expo-localization";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en/common.json";
import ja from "@/locales/ja/common.json";
import ko from "@/locales/ko/common.json";
import zh from "@/locales/zh/common.json";

export const SUPPORTED_LOCALES = ["ko", "en", "ja", "zh"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type TranslationKey = keyof typeof ko;

export const DEFAULT_LOCALE: Locale = "ko";
export const i18n = createInstance();

export function isLocale(value: unknown): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function getDeviceLocale(): Locale {
  const languageCode = getLocales()[0]?.languageCode;
  return isLocale(languageCode) ? languageCode : DEFAULT_LOCALE;
}

export async function initializeI18n(locale: Locale) {
  if (i18n.isInitialized) {
    await i18n.changeLanguage(locale);
    return i18n;
  }

  await i18n.use(initReactI18next).init({
    resources: {
      ko: { common: ko },
      en: { common: en },
      ja: { common: ja },
      zh: { common: zh },
    },
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    defaultNS: "common",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

  return i18n;
}
