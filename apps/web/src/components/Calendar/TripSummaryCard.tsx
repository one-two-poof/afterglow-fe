import { cn } from "@afterglow/utils";

import { formatDateWithWeekday, type DateRange } from "./date-utils";

export interface TripSummaryCardProps {
  range: DateRange;
  className?: string;
}

export const TripSummaryCard = ({ range, className }: TripSummaryCardProps) => (
  <div
    className={cn("flex items-stretch rounded-[20px] bg-surface p-5", className)}
  >
    <SummaryItem
      label="여행 시작일 (시술예정일)"
      value={range.start}
      emphasized
    />
    <div className="mx-4 w-px self-stretch bg-border" aria-hidden="true" />
    <SummaryItem label="여행 종료일" value={range.end} />
  </div>
);

interface SummaryItemProps {
  label: string;
  value: Date | null;
  emphasized?: boolean;
}

const SummaryItem = ({ label, value, emphasized }: SummaryItemProps) => (
  <div className="flex-1">
    <p className="text-label-sm text-text-muted">{label}</p>
    <p
      className={cn(
        "mt-1 text-heading-sm",
        emphasized ? "text-primary" : "text-text",
      )}
    >
      {value ? formatDateWithWeekday(value) : "-"}
    </p>
  </div>
);
