import { colors } from "@afterglow/tokens";
import { cn } from "@afterglow/utils";
import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

type WalkPreferenceIconName =
  | "relaxed"
  | "light"
  | "standard"
  | "active"
  | "walking-tour";

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
  label: string;
  icon: WalkPreferenceIconName;
  description: string;
}

/** 도보 선호도 선택지. value(1~5)가 곧 제출 값(user_walk_preference) */
export const WALK_PREFERENCES: WalkPreferenceOption[] = [
  {
    value: 1,
    label: "여유형",
    icon: "relaxed",
    description: "도보 10분 미만, 택시/지하철 바로 앞 명소 위주",
  },
  {
    value: 2,
    label: "가벼운 활동형",
    icon: "light",
    description: "도보 10~30분, 가벼운 가로수길이나 쇼핑몰 산책",
  },
  {
    value: 3,
    label: "표준 활동형",
    icon: "standard",
    description: "도보 30분 이상, 활동적인 트레킹이나 광범위 탐방",
  },
  {
    value: 4,
    label: "적극 활동형",
    icon: "active",
    description: "도보 30분 이상, 활동적인 트레킹이나 광범위 탐방",
  },
  {
    value: 5,
    label: "도보 탐방형",
    icon: "walking-tour",
    description: "도보 30분 이상, 활동적인 트레킹이나 광범위 탐방",
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
  return (
    <View className="gap-3 pt-2">
      <Text className="text-body-sm text-text-secondary">
        시술 후 체력 및 회복 상태를 고려해 도보 정도를 알려주세요.
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
              <Text className="text-label-lg text-text">{option.label}</Text>
              <Text className="text-body-sm text-text-muted">
                {option.description}
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
