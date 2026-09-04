import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TOptions } from "i18next";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";

import {
  getDeviceLocale,
  i18n,
  initializeI18n,
  isLocale,
  type Locale,
  type TranslationKey,
} from "./config";

const LOCALE_STORAGE_KEY = "afterglow.locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(i18n.isInitialized);

  useEffect(() => {
    void AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      .then((storedLocale) =>
        initializeI18n(
          isLocale(storedLocale) ? storedLocale : getDeviceLocale(),
        ),
      )
      .catch(() => initializeI18n(getDeviceLocale()))
      .then(() => setIsReady(true));
  }, []);

  if (!isReady) return null;

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export function useI18n() {
  const { t: translate, i18n: instance } = useTranslation("common");
  const locale = isLocale(instance.resolvedLanguage)
    ? instance.resolvedLanguage
    : getDeviceLocale();

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      void instance.changeLanguage(nextLocale);
      void AsyncStorage.setItem(LOCALE_STORAGE_KEY, nextLocale).catch(() => {
        // 저장 실패 시에도 현재 앱 세션에서는 선택한 언어를 유지한다.
      });
    },
    [instance],
  );

  const t = useCallback(
    (key: TranslationKey, options?: TOptions) => translate(key, options),
    [translate],
  );

  return { locale, setLocale, t };
}
