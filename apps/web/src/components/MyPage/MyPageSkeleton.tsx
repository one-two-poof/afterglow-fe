/** 인증 확인 / 내 정보 로딩 중 스켈레톤 */
export const MyPageSkeleton = () => (
  <div aria-busy="true" aria-label="내 정보 불러오는 중" className="animate-pulse">
    <div className="flex items-center gap-4 bg-surface px-5 py-6">
      <div className="size-20 shrink-0 rounded-full bg-surface-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-6 w-40 rounded bg-surface-muted" />
        <div className="h-4 w-56 rounded bg-surface-muted" />
      </div>
    </div>

    <div className="mt-2 bg-surface">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border-b border-border px-5 py-4 last:border-b-0">
          <div className="h-5 w-32 rounded bg-surface-muted" />
          <div className="mt-2 h-4 w-48 rounded bg-surface-muted" />
        </div>
      ))}
    </div>
  </div>
);
