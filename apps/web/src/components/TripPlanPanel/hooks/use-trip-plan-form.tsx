"use client";

import { type ReactNode, useCallback, useState } from "react";

import { addDays, formatISODate, type DateRange } from "@/components/Calendar";

import { buildTripPlanPayload } from "../payload";
import { MOCK_PLACES } from "../steps/mock-places";
import { PlaceStep } from "../steps/PlaceStep";
import { PurposeStep } from "../steps/PurposeStep";
import { ScheduleStep } from "../steps/ScheduleStep";
import { TreatmentDateStep } from "../steps/TreatmentDateStep";
import { TreatmentStep } from "../steps/TreatmentStep";
import { WalkPreferenceStep } from "../steps/WalkPreferenceStep";
import type { TripPlanPayload } from "../types";

const MS_PER_DAY = 86400000;

/** 선택한 여행 기간의 일수(시작·종료일 포함). 미선택 시 0 */
const getDayCount = ({ start, end }: DateRange) =>
  start && end
    ? Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1
    : 0;

export interface FormStep {
  title: string;
  /** 다음 단계로 진행 가능한지 */
  canNext: boolean;
  content: ReactNode;
}

export interface TripPlanForm {
  /** 순서대로 진행할 폼 단계들 */
  steps: FormStep[];
  /** 모든 선택 값 초기화 */
  reset: () => void;
  /** 현재 선택 값으로 제출 페이로드 조립 (미완성 시 null) */
  buildPayload: () => TripPlanPayload | null;
}

/**
 * 여행 계획 폼의 상태·핸들러·단계 구성을 소유한다.
 * 패널 컴포넌트는 이 훅이 준 steps/reset/buildPayload만 사용한다.
 */
export const useTripPlanForm = (): TripPlanForm => {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  // 선택한 시술 종류(한글)
  const [treatments, setTreatments] = useState<string[]>([]);
  // 시술 → 날짜("YYYY-MM-DD") 매칭 (같은 날짜에 여러 시술 가능)
  const [treatmentDates, setTreatmentDates] = useState<Record<string, string>>(
    {},
  );
  // 여행 주요 목적 (단일 선택)
  const [purpose, setPurpose] = useState<string | null>(null);
  // 도보 선호도 (1~5)
  const [walkPreference, setWalkPreference] = useState<number | null>(null);
  // 여행 일자별 선택 숙소 (인덱스 = n번째 날)
  const [placeIds, setPlaceIds] = useState<(number | null)[]>([]);

  // 여행 일수 및 일자 목록(시술 날짜 매칭 / 숙소 단계에서 사용)
  const dayCount = getDayCount(range);
  const tripDays = range.start
    ? Array.from({ length: dayCount }, (_, i) => addDays(range.start!, i))
    : [];
  const tripDayISO = tripDays.map(formatISODate);

  const toggleTreatment = (name: string) => {
    const isSelected = treatments.includes(name);
    setTreatments((prev) =>
      isSelected ? prev.filter((t) => t !== name) : [...prev, name],
    );
    // 해제 시 매칭된 날짜도 제거
    if (isSelected) {
      setTreatmentDates((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const assignTreatmentDate = (name: string, date: string) =>
    setTreatmentDates((prev) => ({ ...prev, [name]: date }));

  const selectPlace = (dayIndex: number, id: number) =>
    setPlaceIds((prev) => {
      const next = [...prev];
      next[dayIndex] = id;
      return next;
    });

  // 모든 선택 시술이 현재 여행 일자 내로 매칭되었는지
  const allTreatmentsDated =
    treatments.length > 0 &&
    treatments.every((t) => tripDayISO.includes(treatmentDates[t] ?? ""));

  const steps: FormStep[] = [
    {
      title: "여행 일정 선택",
      canNext: Boolean(range.start && range.end),
      content: <ScheduleStep value={range} onChange={setRange} />,
    },
    {
      title: "시술 종류 선택",
      canNext: treatments.length > 0,
      content: <TreatmentStep selected={treatments} onToggle={toggleTreatment} />,
    },
    {
      title: "시술 날짜 선택",
      canNext: allTreatmentsDated,
      content: (
        <TreatmentDateStep
          treatments={treatments}
          days={tripDays}
          value={treatmentDates}
          onAssign={assignTreatmentDate}
        />
      ),
    },
    ...Array.from({ length: dayCount }, (_, i) => ({
      title: `숙소 선택 (${i + 1}/${dayCount})`,
      canNext: Boolean(placeIds[i]),
      content: (
        <PlaceStep
          places={MOCK_PLACES}
          selectedId={placeIds[i] ?? null}
          onSelect={(id) => selectPlace(i, id)}
        />
      ),
    })),
    {
      title: "여행 주요 목적 선택",
      canNext: Boolean(purpose),
      content: <PurposeStep value={purpose} onChange={setPurpose} />,
    },
    {
      title: "도보 선호도 선택",
      canNext: walkPreference !== null,
      content: (
        <WalkPreferenceStep value={walkPreference} onChange={setWalkPreference} />
      ),
    },
  ];

  // setter들은 참조 안정적 → 빈 deps로 memoize (패널 handleClose 의존성 안정화)
  const reset = useCallback(() => {
    setRange({ start: null, end: null });
    setTreatments([]);
    setTreatmentDates({});
    setPurpose(null);
    setWalkPreference(null);
    setPlaceIds([]);
  }, []);

  const buildPayload = () =>
    buildTripPlanPayload(
      range,
      placeIds,
      treatments,
      treatmentDates,
      purpose ?? "",
      walkPreference ?? 3,
    );

  return { steps, reset, buildPayload };
};
