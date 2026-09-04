import { colors } from "@afterglow/tokens";
import { cn } from "@afterglow/utils";
import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

type PurposeIconName = "beauty-shopping" | "culture-tour" | "rest";

const PURPOSE_ICON_COLOR = "#0787d0";
const PURPOSE_ICON_PATHS: Record<PurposeIconName, string[]> = {
  "beauty-shopping": [
    "M6.331 8h11.339a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1-2.966 2.544H8.574a3 3 0 0 1-2.965-2.544l-1.255-8.152A2 2 0 0 1 6.331 8",
    "M9 11V6a3 3 0 0 1 6 0v5",
  ],
  "culture-tour": [
    "M12 18.5 9 17l-6 3V7l6-3 6 3 6-3v7",
    "M9 4v13",
    "M15 7v5",
    "M21.121 20.121a3 3 0 1 0-4.242 0c.418.419 1.125 1.045 2.121 1.879 1.051-.89 1.759-1.516 2.121-1.879",
    "M19 18v.01",
  ],
  rest: [
    "m15 7.5-1.5-2.004 1.5-1.5 1-1.5h1.5l1.5 1.5h2l1.5 1.5L21 7.5zM.5 23.496h23m-10-3.996v3.996m6-3.996v3.996m-8-3.996h10m-16 3.996v-4m0 0-3.5-2.5L5.5.5 9 16.996z",
  ],
};

function PurposeIcon({ name }: { name: PurposeIconName }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      {PURPOSE_ICON_PATHS[name].map((path) => (
        <Path
          key={path}
          d={path}
          stroke={PURPOSE_ICON_COLOR}
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

export interface PurposeOption {
  /** 제출 값(한글) 겸 표시 라벨 */
  value: string;
  icon: PurposeIconName;
  description: string;
}

/** 여행 주요 목적 선택지. value가 곧 제출 값(user_purpose) */
export const PURPOSES: PurposeOption[] = [
  {
    value: "문화관광",
    icon: "culture-tour",
    description: "한국의 트렌디한 쇼핑몰과 도심 랜드마크 탐방",
  },
  {
    value: "뷰티쇼핑",
    icon: "beauty-shopping",
    description: "핫플레이스 맛집투어와 감성 카페 거리",
  },
  {
    value: "휴식",
    icon: "rest",
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
              <PurposeIcon name={option.icon} />
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
