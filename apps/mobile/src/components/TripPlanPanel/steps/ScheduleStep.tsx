import { colors } from "@afterglow/tokens";
import { type DateRange } from "@afterglow/utils";
import { Lightbulb } from "lucide-react-native";
import { Text, View } from "react-native";

import { Calendar } from "@/components/Calendar";
import { TripSummaryCard } from "@/components/TripSummaryCard";

export interface ScheduleStepProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

/** 1단계: 여행 일정(시술일 포함 최대 4일) 선택. RN Calendar(PR 9) 연동. */
export function ScheduleStep({ value, onChange }: ScheduleStepProps) {
  return (
    <View className="gap-3 pt-2">
      <View className="flex-row items-start gap-2 rounded-[12px] bg-surface-accent px-4 py-3">
        <Lightbulb size={18} color={colors.primary} style={{ marginTop: 2 }} />
        <Text className="flex-1 text-body-sm text-text-secondary">
          시술 당일 또는 직후 가벼운 휴식을 포함한 최적의 맞춤형 관광 코스를
          추천해드립니다.
        </Text>
      </View>

      <TripSummaryCard range={value} />
      <Calendar value={value} onChange={onChange} startLabel="시작일" />
    </View>
  );
}
