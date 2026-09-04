import { colors } from "@afterglow/tokens";
import { cn } from "@afterglow/utils";
import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import type { TranslationKey } from "@/i18n/config";
import { useI18n } from "@/i18n/i18n-provider";

type WalkPreferenceIconName =
  "relaxed" | "light" | "standard" | "active" | "walking-tour";

const WALK_PREFERENCE_ICON_COLOR = "#0787d0";
const WALK_PREFERENCE_ICON_PATHS: Record<WalkPreferenceIconName, string[]> = {
  relaxed: [
    "M11 4 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0",
    "M7 21l3-4",
    "M16 21l-2-4-3-3 1-6",
    "M6 12l2-3 4-1 3 3 3 1",
  ],
  light: [
    "M14.007 5a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
    "M7 17l5 1 .75-2.5",
    "M18 21v-4l-4-3 1-6",
    "M10 12V9l5-1 3 3 3 1",
  ],
  standard: [
    "M14.007 5a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
    "M7 17l5 1 .75-2.5",
    "M18 21v-4l-4-3 1-6",
    "M10 12V9l5-1 3 3 3 1",
    "M7 7H3",
    "M7 13H3",
  ],
  active: [
    "M14.007 5a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
    "M7 17l5 1 .75-2.5",
    "M18 21v-4l-4-3 1-6",
    "M10 12V9l5-1 3 3 3 1",
    "M10 5H6",
    "M6 10H2",
    "M8 15H4",
  ],
  "walking-tour": [
    "M14.007 5a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
    "M7 17l5 1 .75-2.5",
    "M18 21v-4l-4-3 1-6",
    "M10 12V9l5-1 3 3 3 1",
    "M10 5H6",
    "M7 8H3",
    "M7 12H3",
    "M8 15H4",
  ],
};

function WalkPreferenceIcon({ name }: { name: WalkPreferenceIconName }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      {WALK_PREFERENCE_ICON_PATHS[name].map((path) => (
        <Path
          key={path}
          d={path}
          stroke={WALK_PREFERENCE_ICON_COLOR}
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

export interface WalkPreferenceOption {
  /** 제출 값 (1~5) */
  value: number;
  labelKey: TranslationKey;
  icon: WalkPreferenceIconName;
  descriptionKey: TranslationKey;
}

/** 도보 선호도 선택지. value(1~5)가 곧 제출 값(user_walk_preference) */
export const WALK_PREFERENCES: WalkPreferenceOption[] = [
  {
    value: 1,
    labelKey: "plan.walk.1",
    icon: "relaxed",
    descriptionKey: "plan.walk.1Desc",
  },
  {
    value: 2,
    labelKey: "plan.walk.2",
    icon: "light",
    descriptionKey: "plan.walk.2Desc",
  },
  {
    value: 3,
    labelKey: "plan.walk.3",
    icon: "standard",
    descriptionKey: "plan.walk.3Desc",
  },
  {
    value: 4,
    labelKey: "plan.walk.4",
    icon: "active",
    descriptionKey: "plan.walk.4Desc",
  },
  {
    value: 5,
    labelKey: "plan.walk.5",
    icon: "walking-tour",
    descriptionKey: "plan.walk.5Desc",
  },
];

export interface WalkPreferenceStepProps {
  value: number | null;
  onChange: (value: number) => void;
}

/** 도보 선호도 선택 (단일 선택). 1~5 숫자를 제출 */
export function WalkPreferenceStep({
  value,
  onChange,
}: WalkPreferenceStepProps) {
  const { t } = useI18n();
  return (
    <View className="gap-3 pt-2">
      <Text className="text-body-sm text-text-secondary">
        {t("plan.walk.prompt")}
      </Text>

      {WALK_PREFERENCES.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={cn(
              "flex-row items-center gap-3 rounded-[12px] border-2 bg-surface p-3",
              selected ? "border-primary" : "border-transparent",
            )}
          >
            <WalkPreferenceIcon name={option.icon} />

            <View className="flex-1">
              <Text className="text-label-lg text-text">
                {t(option.labelKey)}
              </Text>
              <Text className="text-body-sm text-text-muted">
                {t(option.descriptionKey)}
              </Text>
            </View>

            <View
              className={cn(
                "size-6 items-center justify-center rounded-full",
                selected ? "bg-primary" : "border-2 border-neutral-300",
              )}
            >
              {selected && (
                <Check size={14} strokeWidth={3} color={colors["neutral-0"]} />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
