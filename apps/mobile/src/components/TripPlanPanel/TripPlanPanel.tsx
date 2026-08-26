import { useToastStore } from "@afterglow/stores";
import { Button } from "@afterglow/ui-native";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRecommendCourses } from "./hooks/use-recommend-courses";
import { useTripPlanForm } from "./hooks/use-trip-plan-form";
import { ResultStep } from "./ResultStep";

export interface TripPlanPanelProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 여행 계획 폼 패널 (RN 바텀시트). 웹 TripPlanPanel의 앱 버전.
 *
 * 두 국면: 폼 작성(form) → 제출 후 추천 코스 브라우징(result). 폼 상태·단계는
 * useTripPlanForm 훅이 소유하고, 여기서는 단계 진행/제출/rank 브라우징만
 * 오케스트레이션한다.
 */
export const TripPlanPanel = ({ open, onClose }: TripPlanPanelProps) => {
  const { steps, reset: resetForm, buildPayload } = useTripPlanForm();
  const [step, setStep] = useState(0);

  // 국면: 폼 작성 → 제출 후 결과(rank 브라우징)
  const [phase, setPhase] = useState<"form" | "result">("form");
  // 현재 보고 있는 rank 인덱스 (건너뛰기로 증가)
  const [rankIndex, setRankIndex] = useState(0);

  const recommendMutation = useRecommendCourses();
  const recommendations = recommendMutation.data ?? [];
  const { reset: resetRecommend } = recommendMutation;

  const showToast = useToastStore((s) => s.show);

  const handleClose = useCallback(() => {
    setStep(0);
    setPhase("form");
    setRankIndex(0);
    resetForm();
    resetRecommend();
    onClose();
  }, [onClose, resetForm, resetRecommend]);

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

  // 결과 단계: 현재 코스 채택 → 저장(내 코스)은 PR 17에서 붙인다. 지금은 안내 후 종료.
  const handleAdopt = () => {
    if (!currentCourse) {
      return;
    }
    // TODO(PR 17): use-course-selection(POST /api/course-selection) + adopted-courses-store 저장
    showToast("코스를 저장했어요");
    handleClose();
  };

  // 결과 단계: 건너뛰기 → 다음 rank
  const handleSkip = () => setRankIndex((prev) => prev + 1);

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
          accessibilityLabel="닫기"
          onPress={handleClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.4)" }]}
        />

        {/* 시트: 전체화면(flex-1) 기준 88% 확정 높이 → 내부 ScrollView가 정상 스크롤 */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="h-[88%] rounded-t-[20px] bg-bg"
        >
          <SafeAreaView edges={["bottom"]} className="flex-1">
              <View className="flex-row items-center gap-2 px-4 py-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    phase === "result"
                      ? "이전으로"
                      : isFirst
                        ? "홈으로 닫기"
                        : "이전 단계"
                  }
                  onPress={handleBack}
                  className="-ml-1 rounded-full p-1 active:bg-surface-muted"
                >
                  <ArrowLeft size={22} />
                </Pressable>
                <Text className="text-heading-sm text-text">
                  {phase === "result" ? "추천 코스" : current.title}
                </Text>
                <View className="ml-auto size-8 items-center justify-center rounded-full bg-primary-100">
                  <Text className="text-label-sm text-primary-700">이</Text>
                </View>
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
                    />
                  ) : (
                    <View className="items-center justify-center gap-2 py-16">
                      <Text className="text-body-md text-text">
                        추천 코스를 모두 확인했어요
                      </Text>
                      <Text className="text-center text-body-sm text-text-muted">
                        마음에 드는 코스가 없으면 조건을 바꿔 다시 시도해보세요.
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
                    <View className="flex-row gap-2">
                      <Button
                        variant="secondary"
                        size="lg"
                        className="flex-1"
                        onPress={handleSkip}
                      >
                        건너뛰기
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        onPress={handleAdopt}
                      >
                        이 코스 채택
                      </Button>
                    </View>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onPress={handleClose}
                    >
                      닫기
                    </Button>
                  )
                ) : (
                  <>
                    {recommendMutation.isError && (
                      <Text className="mb-2 text-center text-body-sm text-error">
                        {recommendMutation.error instanceof Error
                          ? recommendMutation.error.message
                          : "코스 추천에 실패했어요. 잠시 후 다시 시도해주세요."}
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
                          ? "코스 추천 받는 중…"
                          : "코스 추천 받기"
                        : "다음 단계로"}
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
