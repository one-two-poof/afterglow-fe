import { useLocalSearchParams } from "expo-router";

import { CourseDetail } from "@/components/MyCourse";

/**
 * 저장된 코스 상세 라우트. `/course/{selectionId}` (탭 위에 스택으로 푸시).
 * SavedCourseCard 탭 시 진입한다.
 */
export default function CourseDetailScreen() {
  const { selectionId } = useLocalSearchParams<{ selectionId: string }>();
  return <CourseDetail selectionId={Number(selectionId)} />;
}
