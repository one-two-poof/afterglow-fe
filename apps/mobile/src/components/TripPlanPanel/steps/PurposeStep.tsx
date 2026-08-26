import { colors } from "@afterglow/tokens";
import { cn } from "@afterglow/utils";
import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export interface PurposeOption {
  /** 제출 값(한글) 겸 표시 라벨 */
  value: string;
  emoji: string;
  description: string;
}

/** 여행 주요 목적 선택지. value가 곧 제출 값(user_purpose) */
export const PURPOSES: PurposeOption[] = [
  {
    value: "문화관광",
    emoji: "🛍️",
    description: "한국의 트렌디한 쇼핑몰과 도심 랜드마크 탐방",
  },
  {
    value: "뷰티쇼핑",
    emoji: "🍰",
    description: "핫플레이스 맛집투어와 감성 카페 거리",
  },
  {
    value: "휴식",
    emoji: "🌳",
    description: "도심 속 정원, 한강 공원, 고궁 산책을 통한 안정",
  },
];

export interface PurposeStepProps {
  value: string | null;
  onChange: (value: string) => void;
}

/** 여행 주요 목적 선택 (단일 선택). value 문자열을 그대로 제출 */
export function PurposeStep({ value, onChange }: PurposeStepProps) {
  return (
    <View className="gap-3 pt-2">
      <Text className="text-body-sm text-text-secondary">
        시술 외에 어떤 활동을 주로 원하시나요?
      </Text>

      {PURPOSES.map((option) => {
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
            <View className="size-16 items-center justify-center rounded-[10px] bg-surface-muted">
              <Text style={{ fontSize: 30 }}>{option.emoji}</Text>
            </View>

            <View className="flex-1">
              <Text className="text-label-lg text-text">{option.value}</Text>
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
