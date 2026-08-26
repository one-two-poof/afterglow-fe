import { cn, formatDateWithWeekday, type DateRange } from "@afterglow/utils";
import { Text, View } from "react-native";

/** 선택한 여행 기간(시작·종료일) 요약 카드. 웹 Calendar/TripSummaryCard의 RN 버전. */
export interface TripSummaryCardProps {
  range: DateRange;
  className?: string;
}

export const TripSummaryCard = ({ range, className }: TripSummaryCardProps) => (
  <View
    className={cn("flex-row items-stretch rounded-[20px] bg-surface p-5", className)}
  >
    <SummaryItem
      label="여행 시작일 (시술예정일)"
      value={range.start}
      emphasized
    />
    <View className="mx-4 w-px self-stretch bg-border" />
    <SummaryItem label="여행 종료일" value={range.end} />
  </View>
);

interface SummaryItemProps {
  label: string;
  value: Date | null;
  emphasized?: boolean;
}

const SummaryItem = ({ label, value, emphasized }: SummaryItemProps) => (
  <View className="flex-1">
    <Text className="text-label-sm text-text-muted">{label}</Text>
    <Text
      className={cn(
        "mt-1 text-heading-sm",
        emphasized ? "text-primary" : "text-text",
      )}
    >
      {value ? formatDateWithWeekday(value) : "-"}
    </Text>
  </View>
);
