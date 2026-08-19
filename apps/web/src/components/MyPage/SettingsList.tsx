"use client";

import { cn } from "@afterglow/utils";
import { ChevronRight } from "lucide-react";

interface SettingsItem {
  key: string;
  title: string;
  description: string;
  onClick?: () => void;
  destructive?: boolean;
}

// 라우트가 아직 없는 항목들은 onClick 미지정 placeholder — 화면 연결되면 채운다.
const MENU_GROUPS: SettingsItem[][] = [
  [
    {
      key: "language",
      title: "언어 설정 (Language)",
      description: "한국어 / English / 中文",
    },
    { key: "support", title: "고객센터", description: "자주 묻는 질문 및 1:1 문의" },
    {
      key: "terms",
      title: "이용약관 및 개인정보처리방침",
      description: "서비스 운영 규정 확인",
    },
  ],
];

const SettingsRow = ({ item }: { item: SettingsItem }) => (
  <li>
    <button
      type="button"
      onClick={item.onClick}
      className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
    >
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-label-lg",
            item.destructive ? "text-error" : "text-text",
          )}
        >
          {item.title}
        </span>
        <span className="mt-0.5 block text-body-sm text-text-muted">
          {item.description}
        </span>
      </span>
      <ChevronRight
        size={20}
        aria-hidden="true"
        className={cn(
          "shrink-0",
          item.destructive ? "text-error" : "text-text-muted",
        )}
      />
    </button>
  </li>
);

const Group = ({ items }: { items: SettingsItem[] }) => (
  <ul className="divide-y divide-border bg-surface">
    {items.map((item) => (
      <SettingsRow key={item.key} item={item} />
    ))}
  </ul>
);

export const SettingsList = ({ onLogout }: { onLogout: () => void }) => (
  <nav aria-label="설정" className="flex flex-col gap-2 bg-bg pb-8">
    {MENU_GROUPS.map((group, i) => (
      <Group key={i} items={group} />
    ))}
    <Group
      items={[
        {
          key: "logout",
          title: "로그아웃",
          description: "안전하게 계정 연결 해제",
          onClick: onLogout,
          destructive: true,
        },
      ]}
    />
  </nav>
);
