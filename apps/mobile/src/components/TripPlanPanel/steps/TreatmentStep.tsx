import { colors } from "@afterglow/tokens";
import { cn } from "@afterglow/utils";
import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export interface TreatmentOption {
  /** 제출 값(한글) 겸 표시 라벨 */
  name: string;
  icon: string;
}

/** 선택 가능한 시술 종류. name이 곧 제출 값 */
export const TREATMENTS: TreatmentOption[] = [
  { name: "리프팅", icon: "✨" },
  { name: "보톡스", icon: "💉" },
  { name: "비만(약처방)", icon: "💊" },
  { name: "스킨부스터", icon: "💧" },
  { name: "윤곽/체형주사", icon: "📐" },
  { name: "제모", icon: "🪒" },
  { name: "피부관리", icon: "🧖" },
  { name: "피부레이저", icon: "⚡" },
  { name: "필러", icon: "🧴" },
  { name: "필링", icon: "🍃" },
];

export interface TreatmentStepProps {
  selected: string[];
  onToggle: (name: string) => void;
}

/** 시술 종류 선택 (다중 선택). name 문자열을 그대로 제출. 웹은 grid-cols-2 → RN은 2열 wrap */
export function TreatmentStep({ selected, onToggle }: TreatmentStepProps) {
  return (
    <View className="gap-3 pt-2">
      <Text className="text-body-sm text-text-secondary">
        받으실 시술 종류를 선택해주세요 (다중 선택 가능)
      </Text>

      <View className="flex-row flex-wrap justify-between">
        {TREATMENTS.map((option) => {
          const isSelected = selected.includes(option.name);
          return (
            <Pressable
              key={option.name}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onToggle(option.name)}
              className={cn(
                "mb-3 w-[48%] gap-3 rounded-[12px] border-2 bg-surface p-3",
                isSelected ? "border-primary" : "border-transparent",
              )}
            >
              <View className="flex-row items-start justify-between">
                <Text style={{ fontSize: 24 }}>{option.icon}</Text>
                <View
                  className={cn(
                    "size-5 items-center justify-center rounded-full",
                    isSelected
                      ? "bg-primary"
                      : "border-2 border-neutral-300",
                  )}
                >
                  {isSelected && (
                    <Check
                      size={12}
                      strokeWidth={3}
                      color={colors["neutral-0"]}
                    />
                  )}
                </View>
              </View>
              <Text className="text-label-lg text-text">{option.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
