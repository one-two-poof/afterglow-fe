import { useToastStore } from "@afterglow/stores";
import { Button } from "@afterglow/ui-native";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useCourseSelection } from "@/hooks/use-course-selection";
import { useMe } from "@/hooks/use-me";
import { useI18n } from "@/i18n/i18n-provider";
import { type CourseMarker } from "@/types/recommendation";

import { useRecommendCourses } from "./hooks/use-recommend-courses";
import { useTripPlanForm } from "./hooks/use-trip-plan-form";
import { ResultStep } from "./ResultStep";

export interface TripPlanPanelProps {
  open: boolean;
  onClose: () => void;
  /**
   * 결과 단계에서 코스의 장소를 탭했을 때 호출. 패널을 최소화하고 지도에서 해당
   * 지점의 상세 카드를 열도록 호출부가 처리한다(패널 상태는 유지 → 다시 열기 가능).
   */
  onViewPlace?: (marker: CourseMarker) => void;
}

/**
 * 여행 계획 폼 패널 (RN 바텀시트). 웹 TripPlanPanel의 앱 버전.
 *
 * 두 국면: 폼 작성(form) → 제출 후 추천 코스 브라우징(result). 폼 상태·단계는
 * useTripPlanForm 훅이 소유하고, 여기서는 단계 진행/제출/rank 브라우징만
 * 오케스트레이션한다.
 */
export const TripPlanPanel = ({
  open,
  onClose,
  onViewPlace,
}: TripPlanPanelProps) => {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { steps, reset: resetForm, buildPayload } = useTripPlanForm();
  const [step, setStep] = useState(0);

  // 국면: 폼 작성 → 제출 후 결과(rank 브라우징)
  const [phase, setPhase] = useState<"form" | "result">("form");
  // 현재 보고 있는 rank 인덱스 (건너뛰기로 증가)
  const [rankIndex, setRankIndex] = useState(0);

  // 헤더 아바타용 로그인 사용자. 패널은 로그인 상태에서만 열리므로 open일 때만 조회.
  const { data: me } = useMe(open);

  const recommendMutation = useRecommendCourses();
  const recommendations = recommendMutation.data ?? [];
  const { reset: resetRecommend } = recommendMutation;

  const courseSelection = useCourseSelection();

  const showToast = useToastStore((s) => s.show);

  // 닫아도 폼/추천/rank 상태는 보존한다(패널은 계속 마운트됨) → 다시 열면 이어서 진행.
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // 세션 종료(코스 채택 완료) 시에만 폼·추천 상태를 초기화한다.
  const resetPanel = useCallback(() => {
    setStep(0);
    setPhase("form");
    setRankIndex(0);
    resetForm();
    resetRecommend();
  }, [resetForm, resetRecommend]);

  const current = steps[step]!;
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  // 현재 결과 단계에서 보고 있는 코스 (모두 건너뛰면 undefined)
  const currentCourse = recommendations[rankIndex];

  const handleBack = () => {
    if (phase === "result") {
      // 결과 → 폼(마지막 단계)로 복귀
      setPhase("form");
      return;
    }
    if (isFirst) {
      handleClose();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (!isLast) {
      setStep((prev) => prev + 1);
      return;
    }
    if (recommendMutation.isPending) {
      return;
    }
    const payload = buildPayload();
    if (!payload) {
      return;
    }
    // ML ① 추천 API 호출 (POST /api/course → daily_recommendations)
    recommendMutation.mutate(payload, {
      onSuccess: () => {
        setRankIndex(0);
        setPhase("result");
      },
    });
  };

  // 결과 단계: 현재 코스 채택 → 서버에 저장(POST /api/course-selection).
  // 저장 성공 시 훅이 ["recommendations"] 쿼리를 무효화해 지도 태그·내 코스 목록이 최신화된다.
  const handleAdopt = () => {
    if (!currentCourse) {
      return;
    }
    courseSelection.mutate(Number(currentCourse.course_id), {
      onSuccess: () => showToast(t("plan.saved")),
      onError: () => showToast(t("plan.saveFailed")),
    });
    resetPanel();
    onClose();
  };

  // 추천을 모두 확인한 뒤 "닫기": 채택과 동일하게 세션을 종료(초기화)한다.
  // 다음에 열면 처음(폼)부터 새로 시작한다. (백드롭/뒤로가기는 저장 유지)
  const handleFinish = () => {
    resetPanel();
    onClose();
  };

  // 결과 단계: 건너뛰기 → 다음 rank
  const handleSkip = () => setRankIndex((prev) => prev + 1);
  // 결과 단계: 이전 → 앞서 건너뛴 rank로 되돌아간다(0에서 멈춤).
  const handlePrev = () => setRankIndex((prev) => Math.max(0, prev - 1));

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={handleBack}
      statusBarTranslucent
    >
      <View style={{ flex: 1 }} className="justify-end">
        {/* 배경(시트 위 영역) 탭 → 닫기 */}
        <Pressable
          accessibilityLabel={t("plan.close")}
          onPress={handleClose}
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.4)" },
          ]}
        />

        {/* 시트는 모달 뷰포트를 채우고 내부 ScrollView만 스크롤한다. */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 bg-bg"
          style={{ paddingTop: insets.top }}
        >
          <SafeAreaView edges={["bottom"]} className="flex-1">
            <View className="flex-row items-center gap-2 px-4 py-3">
              {/* 추천 코스(결과) 화면에서는 뒤로가기 화살표를 숨긴다. */}
              {phase === "result" ? null : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isFirst ? t("plan.closeHome") : t("plan.previousStep")
                  }
                  onPress={handleBack}
                  className="-ml-1 rounded-full p-1 active:bg-surface-muted"
                >
                  <ArrowLeft size={22} />
                </Pressable>
              )}
              <Text className="text-heading-sm text-text">
                {phase === "result" ? t("plan.result.title") : current.title}
              </Text>
              {/* 로그인 사용자 프로필 이미지. 이미지가 없으면 표시하지 않는다. */}
              {me?.profileImageUrl ? (
                <Image
                  source={{ uri: me.profileImageUrl }}
                  accessibilityIgnoresInvertColors
                  className="ml-auto size-8 rounded-full border border-border"
                />
              ) : null}
            </View>

            <ScrollView
              className="flex-1 px-4"
              contentContainerClassName="pb-4"
              keyboardShouldPersistTaps="handled"
            >
              {phase === "result" ? (
                currentCourse ? (
                  <ResultStep
                    course={currentCourse}
                    index={rankIndex}
                    total={recommendations.length}
                    onPlacePress={onViewPlace}
                  />
                ) : (
                  <View className="items-center justify-center gap-2 py-16">
                    <Text className="text-body-md text-text">
                      {t("plan.result.complete")}
                    </Text>
                    <Text className="text-center text-body-sm text-text-muted">
                      {t("plan.result.completeHint")}
                    </Text>
                  </View>
                )
              ) : (
                current.content
              )}
            </ScrollView>

            <View className="border-t border-border px-4 py-3">
              {phase === "result" ? (
                currentCourse ? (
                  <View className="gap-2">
                    {/* 이전/건너뛰기로 rank를 앞뒤로 브라우징. 이전은 첫 코스에서
                          비활성. 채택은 아래 전체폭 primary로 강조. */}
                    <View className="flex-row gap-2">
                      <Button
                        variant="secondary"
                        size="lg"
                        className="flex-1"
                        disabled={rankIndex === 0}
                        onPress={handlePrev}
                      >
                        {t("plan.previous")}
                      </Button>
                      <Button
                        variant="secondary"
                        size="lg"
                        className="flex-1"
                        onPress={handleSkip}
                      >
                        {t("plan.skip")}
                      </Button>
                    </View>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onPress={handleAdopt}
                    >
                      {t("plan.adopt")}
                    </Button>
                  </View>
                ) : (
                  // 모두 건너뛴 상태: 이전으로 되돌아가거나 닫는다.
                  // 각 버튼을 flex-1 컨테이너로 감싸 영역을 정확히 반반으로 맞춘다
                  // (Button 기본 너비 w-[320px] 영향 제거).
                  <View className="flex-row gap-2">
                    {rankIndex > 0 ? (
                      <View className="flex-1">
                        <Button
                          variant="secondary"
                          size="lg"
                          className="w-full"
                          onPress={handlePrev}
                        >
                          {t("plan.previous")}
                        </Button>
                      </View>
                    ) : null}
                    <View className="flex-1">
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onPress={handleFinish}
                      >
                        {t("plan.close")}
                      </Button>
                    </View>
                  </View>
                )
              ) : (
                <>
                  {recommendMutation.isError && (
                    <Text className="mb-2 text-center text-body-sm text-error">
                      {recommendMutation.error instanceof Error
                        ? recommendMutation.error.message
                        : t("plan.recommendFailed")}
                    </Text>
                  )}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={!current.canNext || recommendMutation.isPending}
                    onPress={handleNext}
                  >
                    {isLast
                      ? recommendMutation.isPending
                        ? t("plan.recommending")
                        : t("plan.recommend")
                      : t("plan.next")}
                  </Button>
                </>
              )}
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
