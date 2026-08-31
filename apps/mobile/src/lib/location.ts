/**
 * 기기 현위치 조회. 지도 초기 포커스·나침반·경로 안내(내 위치 → 장소)에서 공용으로 쓴다.
 */
import * as Location from "expo-location";

/**
 * 위치 권한을 요청하고 현재 좌표를 `[lng, lat]`(MapLibre 순서)로 반환한다.
 * 권한 거부·실패 시 null.
 */
export async function getCurrentLocation(): Promise<[number, number] | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return null;
  }
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return [pos.coords.longitude, pos.coords.latitude];
}
