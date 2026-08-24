import { getUsers } from "@afterglow/api";
import { useQuery } from "@tanstack/react-query";

/**
 * PR 2 인프라 검증용 훅.
 *
 * `@afterglow/api`(공유 워크스페이스 패키지)의 함수를 react-query로 감싸서,
 * 워크스페이스 의존 연결 + Provider + 서버 상태 흐름이 앱에서 동작하는지 확인한다.
 * (실제 코스/장소 훅은 이후 기능 PR에서 추가)
 */
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
}
