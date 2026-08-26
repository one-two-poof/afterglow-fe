import { cn, formatISODate, WEEKDAYS_KO } from "@afterglow/utils";
import { Pressable, Text, View } from "react-native";

export interface TreatmentDateStepProps {
  /** 선택된 시술 종류 */
  treatments: string[];
  /** 여행 일자 목록(순서대로) */
  days: Date[];
  /** 시술 → 선택 날짜("YYYY-MM-DD") 매핑 */
  value: Record<string, string>;
  onAssign: (treatment: string, date: string) => void;
}

/** 선택한 시술별로 받을 날짜(Day)를 매칭. 웹 grid(repeat days) → RN flex-row flex-1 */
export function TreatmentDateStep({
  treatments,
  days,
  value,
  onAssign,
}: TreatmentDateStepProps) {
  return (
    <View className="gap-3 pt-2">
      <Text className="text-body-sm text-text-secondary">
        각 시술을 받을 날짜를 선택해주세요
      </Text>

      {treatments.map((treatment) => (
        <View key={treatment} className="gap-3 rounded-[16px] bg-surface p-4">
          <Text className="text-label-lg text-text">{treatment}</Text>
          <View className="flex-row gap-2">
            {days.map((day, i) => {
              const iso = formatISODate(day);
              const active = value[treatment] === iso;
              return (
                <Pressable
                  key={iso}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${treatment} ${i + 1}일차 ${day.getMonth() + 1}월 ${day.getDate()}일`}
                  onPress={() => onAssign(treatment, iso)}
                  className={cn(
                    "flex-1 items-center gap-0.5 rounded-[12px] border-2 py-3",
                    active
                      ? "border-primary bg-primary-100"
                      : "border-border bg-bg",
                  )}
                >
                  <Text
                    className={cn(
                      "text-label-md",
                      active ? "text-primary-700" : "text-text-secondary",
                    )}
                  >
                    Day {i + 1}
                  </Text>
                  <Text
                    className={cn(
                      "text-caption",
                      active ? "text-primary-700" : "text-text-secondary",
                    )}
                  >
                    {day.getMonth() + 1}/{day.getDate()} (
                    {WEEKDAYS_KO[day.getDay()]})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
