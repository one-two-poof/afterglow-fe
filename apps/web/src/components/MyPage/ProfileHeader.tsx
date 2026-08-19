import type { AuthUser } from "@/lib/auth";

/** 이름에서 이니셜 한 글자 추출 (프로필 이미지가 없을 때 폴백 아바타용) */
const getInitial = (name: string) => {
  const first = Array.from(name.trim())[0];
  return first ? first.toUpperCase() : "?";
};

const Avatar = ({ name, src }: { name: string; src?: string }) => {
  if (src) {
    return (
      // 외부(Google) 이미지 — 호스트가 유동적이라 next/image 대신 img 사용
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        className="size-20 shrink-0 rounded-full border border-border object-cover"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex size-20 shrink-0 items-center justify-center rounded-full bg-surface-muted text-heading-md text-text-secondary"
    >
      {getInitial(name)}
    </div>
  );
};

export const ProfileHeader = ({ user }: { user: AuthUser }) => (
  <header className="flex items-center gap-4 bg-surface px-5 py-6">
    <Avatar name={user.name} src={user.profileImageUrl} />
    <div className="min-w-0">
      <h1 className="truncate text-heading-sm text-text">{user.name}</h1>
      <p className="truncate text-body-md text-text-muted">{user.email}</p>
    </div>
  </header>
);
