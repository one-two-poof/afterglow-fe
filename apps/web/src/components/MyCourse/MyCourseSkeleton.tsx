/** 인증 확인 / 코스 로딩 중 스켈레톤 */
export const MyCourseSkeleton = () => (
  <div
    aria-busy="true"
    aria-label="내 코스 불러오는 중"
    className="animate-pulse px-5 py-6"
  >
    <div className="h-7 w-24 rounded bg-surface-muted" />
    <div className="mt-4 flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[16px] border border-border bg-surface p-4"
        >
          <div className="h-5 w-32 rounded bg-surface-muted" />
          <div className="mt-3 h-24 rounded bg-surface-muted" />
        </div>
      ))}
    </div>
  </div>
);
