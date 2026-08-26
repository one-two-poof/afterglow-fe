import { colors } from "@afterglow/tokens";
import { cn } from "@afterglow/utils";
import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export interface WalkPreferenceOption {
  /** 제출 값 (1~5) */
  value: number;
  label: string;
  emoji: string;
  description: string;
}

/** 도보 선호도 선택지. value(1~5)가 곧 제출 값(user_walk_preference) */
export const WALK_PREFERENCES: WalkPreferenceOption[] = [
  {
    value: 1,
    label: "여유형",
    emoji: "🚗",
    description: "도보 10분 미만, 택시/지하철 바로 앞 명소 위주",
  },
  {
    value: 2,
    label: "가벼운 활동형",
    emoji: "🚶",
    description: "도보 10~30분, 가벼운 가로수길이나 쇼핑몰 산책",
  },
  {
    value: 3,
    label: "표준 활동형",
    emoji: "🏃",
    description: "도보 30분 이상, 활동적인 트레킹이나 광범위 탐방",
  },
  {
    value: 4,
    label: "적극 활동형",
    emoji: "🏃",
    description: "도보 30분 이상, 활동적인 트레킹이나 광범위 탐방",
  },
  {
    value: 5,
    label: "도보 탐방형",
    emoji: "🏃",
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
            <Text style={{ fontSize: 24 }}>{option.emoji}</Text>

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
