/**
 * C0 — điều phối đầu luồng chụp, không có giao diện riêng (docs/screens.md §1).
 * Đã cấp quyền camera (đã qua C1 và không bị từ chối) → C2 Camera; chưa → C1 Xin quyền.
 * Redirect thay màn này (replace) nên Đóng/quay lại không quay về đây.
 */
import { Redirect } from 'expo-router';

import { useAppStore } from '@/store/appStore';
import { useDevFlags } from '@/store/devFlags';

export default function CaptureStart() {
  const introSeen = useAppStore((s) => s.user.cameraIntroSeen);
  const denied = useDevFlags((s) => s.cameraDenied);
  return <Redirect href={introSeen && !denied ? '/capture/camera' : '/capture/permission'} />;
}
