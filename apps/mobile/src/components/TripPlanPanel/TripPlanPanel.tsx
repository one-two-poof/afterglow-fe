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
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTripPlanForm } from "./hooks/use-trip-plan-form";

export interface TripPlanPanelProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 여행 계획 폼 패널 (RN 바텀시트). 웹 TripPlanPanel의 앱 버전.
 *
 * 웹은 프레임 오른쪽에서 슬라이드 인하는 dialog였지만, 앱에서는 하단에서 올라오는
 * 바텀시트(Modal + slide)로 만든다. 폼 상태·단계는 useTripPlanForm 훅이 소유하고
 * 여기서는 단계 진행만 오케스트레이션한다.
 *
 * PR 10 범위는 "폼 국면"까지. 제출 후 추천 코스(rank 브라우징) 국면과 use-recommend-
 * courses 연동은 PR 13에서 이 컴포넌트에 result 국면으로 추가한다. 지금은 마지막 단계
 * 제출 시 payload를 만들어 토스트로 안내만 한다(연동 seam).
 */
export const TripPlanPanel = ({ open, onClose }: TripPlanPanelProps) => {
  const { steps, reset: resetForm, buildPayload } = useTripPlanForm();
  const [step, setStep] = useState(0);
  const showToast = useToastStore((s) => s.show);

  const handleClose = useCallback(() => {
    setStep(0);
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const current = steps[step]!;
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  const handleBack = () => {
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
    // TODO(PR 13): use-recommend-courses 연동 + result 국면 전환
    const payload = buildPayload();
    if (!payload) {
      return;
    }
    showToast("폼 완료! 추천 코스 연동은 PR 13에서 붙습니다.");
    handleClose();
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={handleBack}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
        {/* 시트 위 영역 탭 → 닫기 */}
        <Pressable
          accessibilityLabel="닫기"
          onPress={handleClose}
          style={{ flex: 1 }}
        />

        <SafeAreaView edges={["bottom"]} className="rounded-t-[20px] bg-bg">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="max-h-[88%]"
          >
            <View className="h-[88%]">
              <View className="flex-row items-center gap-2 px-4 py-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isFirst ? "홈으로 닫기" : "이전 단계"}
                  onPress={handleBack}
                  className="-ml-1 rounded-full p-1 active:bg-surface-muted"
                >
                  <ArrowLeft size={22} />
                </Pressable>
                <Text className="text-heading-sm text-text">
                  {current.title}
                </Text>
                {/* TODO: 프로필 아바타 연결 (현재 placeholder) */}
                <View className="ml-auto size-8 items-center justify-center rounded-full bg-primary-100">
                  <Text className="text-label-sm text-primary-700">이</Text>
                </View>
              </View>

              <ScrollView
                className="flex-1 px-4"
                contentContainerClassName="pb-4"
                keyboardShouldPersistTaps="handled"
              >
                {current.content}
              </ScrollView>

              <View className="border-t border-border px-4 py-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!current.canNext}
                  onPress={handleNext}
                >
                  {isLast ? "코스 추천 받기" : "다음 단계로"}
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};
