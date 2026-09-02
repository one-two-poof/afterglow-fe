import { colors } from "@afterglow/tokens";
import { cn } from "@afterglow/utils";
import { type Href, useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface SettingsItem {
  key: string;
  title: string;
  description: string;
  /** 이동할 라우트 (있으면 탭 시 push) */
  href?: Href;
  onPress?: () => void;
  destructive?: boolean;
}

// 라우트가 아직 없는 항목(언어 설정)은 href/onPress 미지정 placeholder — 연결되면 채운다.
const MENU_GROUPS: SettingsItem[][] = [
  [
    {
      key: "language",
      title: "언어 설정 (Language)",
      description: "한국어 / English / 中文",
    },
    {
      key: "support",
      title: "고객센터",
      description: "자주 묻는 질문 및 1:1 문의",
      href: "/support",
    },
    {
      key: "terms",
      title: "이용약관 및 개인정보처리방침",
      description: "서비스 운영 규정 확인",
      href: "/terms",
    },
  ],
];

function SettingsRow({ item, isLast }: { item: SettingsItem; isLast: boolean }) {
  const router = useRouter();
  const handlePress = item.href
    ? () => router.push(item.href!)
    : item.onPress;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!handlePress}
      onPress={handlePress}
      className={cn(
        "flex-row items-center gap-3 px-5 py-4 active:bg-surface-muted",
        !isLast && "border-b border-border",
      )}
    >
      <View className="flex-1">
        <Text
          className={cn(
            "text-label-lg",
            item.destructive ? "text-error" : "text-text",
          )}
        >
          {item.title}
        </Text>
        <Text className="mt-0.5 text-body-sm text-text-muted">
          {item.description}
        </Text>
      </View>
      <ChevronRight
        size={20}
        color={item.destructive ? colors.error : colors["text-muted"]}
      />
    </Pressable>
  );
}

function Group({ items }: { items: SettingsItem[] }) {
  return (
    <View className="bg-surface">
      {items.map((item, i) => (
        <SettingsRow
          key={item.key}
          item={item}
          isLast={i === items.length - 1}
        />
      ))}
    </View>
  );
}

/** 설정 목록 + 로그아웃. 웹 SettingsList의 RN 버전. */
export function SettingsList({ onLogout }: { onLogout: () => void }) {
  return (
    <View className="gap-2 bg-bg pb-8">
      {MENU_GROUPS.map((group, i) => (
        <Group key={i} items={group} />
      ))}
      <Group
        items={[
          {
            key: "logout",
            title: "로그아웃",
            description: "안전하게 계정 연결 해제",
            onPress: onLogout,
            destructive: true,
          },
        ]}
      />
    </View>
  );
}
