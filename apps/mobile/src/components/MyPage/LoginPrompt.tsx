import { useToastStore } from "@afterglow/stores";
import { Logo } from "@afterglow/ui-native";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

/** Google 브랜드 아이콘 (웹 인라인 SVG의 react-native-svg 포팅) */
function GoogleIcon() {
  return (
    <Svg viewBox="0 0 24 24" width={18} height={18}>
      <Path
        fill="#4285F4"
        d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.74Z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <Path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l3.99-3.1Z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.28 6.61l3.99 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </Svg>
  );
}

/**
 * 로그아웃 상태에서 보여줄 로그인 안내 화면. 웹 LoginPrompt의 RN 버전.
 * TODO(PR 18): Google 버튼을 딥링크 기반 OAuth(startGoogleLogin)로 연결.
 * 지금은 인증 미구현이라 안내 토스트만 띄운다.
 */
export function LoginPrompt() {
  const showToast = useToastStore((s) => s.show);

  return (
    <View className="flex-1 items-center justify-center gap-8 bg-bg px-6">
      <View className="items-center gap-4">
        <Logo />
        <View className="items-center">
          <Text className="text-heading-sm text-text">로그인이 필요해요</Text>
          <Text className="mt-2 text-center text-body-sm text-text-secondary">
            Google 계정으로 간편하게 로그인하고{"\n"}내 정보를 확인하세요.
          </Text>
        </View>
      </View>

      {/* 아이콘+텍스트라 ui-native Button(children을 Text로 감쌈) 대신 커스텀 Pressable.
          secondary 버튼 스타일을 그대로 맞춘다. */}
      <Pressable
        accessibilityRole="button"
        onPress={() => showToast("로그인은 PR 18에서 연결됩니다.")}
        className="h-[48px] w-full max-w-[320px] flex-row items-center justify-center gap-2 rounded-[8px] border border-action-secondary-border bg-action-secondary active:bg-action-secondary-hover"
      >
        <GoogleIcon />
        <Text className="text-label-lg text-on-action-secondary">
          Google로 계속하기
        </Text>
      </Pressable>
    </View>
  );
}
